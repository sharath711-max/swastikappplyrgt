import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { preventDuplicateCreate } from '../utils/certificateGuard';
import runModalSubmit from '../utils/handleSubmit';
import DraftStateFooter from './core/DraftStateFooter';
import useEnterAdvance from '../hooks/useEnterAdvance';
import useFocusWhen from '../hooks/useFocusWhen';
import { validateItem, OPERATIONS, ACTORS } from '../shared/domain/validation';
import useSafeModalClose from '../hooks/useSafeModalClose';
import CustomerCombobox from './customer/CustomerCombobox';

const MAX_ITEMS = 20;
const WORKFLOW_TYPE = 'ST';

const emptyRow = () => ({
    id:          (window.crypto?.randomUUID?.() || `r${Date.now()}${Math.random().toString(36).slice(2)}`),
    name:        '',
    item:        '',
    totalWeight: '',
    testWeight:  '0',
    returned:    false,
    errors:      {},
});

const emptyNewCustomer = { name: '', phone: '', balance: '0', notes: '' };

const formatDate = (d) =>
    d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });

const toValidationData = (row) => ({
    item_type:     row.item,
    description:   row.name || row.item,
    gross_weight:  row.totalWeight,
    sample_weight: row.testWeight,
    returned:      row.returned,
});

const NewSilverTestModal = ({ show, onHide, onSuccess }) => {
    const { addToast } = useToast();

    // Customer state — combobox manages its own search input + result list.
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [showNewCust, setShowNewCust] = useState(true);
    const [newCustData, setNewCustData] = useState(emptyNewCustomer);
    const [savingCust,  setSavingCust]  = useState(false);

    const [sampleRows, setSampleRows] = useState([emptyRow()]);
    const [loading,    setLoading]    = useState(false);

    const submitReqRef = useRef(null);

    const dateDisplay = formatDate(new Date());

    // Draft-dirty derivation — any user-provided content counts. Balance
    // defaults to '0'; not treated as draft.
    const hasDraftEntries = (
        !!selectedCustomer
        || (newCustData.name && newCustData.name.trim() !== '')
        || (newCustData.phone && newCustData.phone.trim() !== '')
        || (newCustData.notes && newCustData.notes.trim() !== '')
        || sampleRows.some(r => r.name || r.item || r.totalWeight || r.returned || (r.testWeight && r.testWeight !== '0'))
    );

    const resetTransientState = () => { setLoading(false); };
    const { safeClose, mountedRef } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose({ reset: resetTransientState });

    // Enter-rhythm: Enter advances to the next focusable element instead of
    // submitting. Restores the legacy Python intake cadence.
    const onEnterAdvance = useEnterAdvance();

    useEffect(() => {
        if (show) {
            setSelectedCustomer(null);
            setShowNewCust(true);
            setNewCustData(emptyNewCustomer);
            setSampleRows([emptyRow()]);
            submitReqRef.current = null;
        }
    }, [show]);

    const handleCustomerSelect = (c) => {
        setSelectedCustomer(c);
        setShowNewCust(false);
    };

    const handleAddCustomerLinkClick = (e) => {
        e.preventDefault();
        setShowNewCust(true);
        setSelectedCustomer(null);
    };

    const saveNewCustomer = async (e) => {
        e.preventDefault();
        if (!newCustData.name.trim()) { addToast('Name is required', 'error'); return; }
        if (newCustData.phone && newCustData.phone.length !== 10) {
            addToast('Phone must be 10 digits', 'error'); return;
        }
        setSavingCust(true);
        try {
            await runModalSubmit({
                action: async () => {
                    const res = await api.post('/customers', {
                        name:    newCustData.name.trim(),
                        phone:   newCustData.phone.trim() || undefined,
                        balance: parseFloat(newCustData.balance) || 0,
                        notes:   newCustData.notes.trim() || undefined,
                    });
                    addToast('Customer created', 'success');
                    return res.data?.data ?? res.data;
                },
                close: () => { setNewCustData(emptyNewCustomer); },
                reload: async (created) => {
                    if (created) handleCustomerSelect(created);
                },
            });
        } catch (err) {
            addToast(err?.response?.data?.error || err.message, 'error');
        } finally {
            setSavingCust(false);
        }
    };

    const updateRow = (idx, field, value) => {
        setSampleRows(rows => rows.map((r, i) =>
            i === idx ? { ...r, [field]: value, errors: { ...r.errors, [field]: undefined } } : r
        ));
    };

    const addRow = () => {
        if (sampleRows.length >= MAX_ITEMS) {
            addToast(`A test cannot have more than ${MAX_ITEMS} items`, 'error');
            return;
        }
        setSampleRows(rows => [...rows, emptyRow()]);
    };

    const removeRow = (idx) => {
        setSampleRows(rows => rows.length === 1 ? rows : rows.filter((_, i) => i !== idx));
    };

    const validateRows = () => {
        let firstErrorMsg = null;
        const validated = sampleRows.map(row => {
            const errors = {};

            if (!row.item.trim()) errors.item = 'Item type is required';

            const total = parseFloat(row.totalWeight);
            if (!Number.isFinite(total) || total <= 0) {
                errors.totalWeight = 'Total weight must be greater than 0';
            }

            const test = parseFloat(row.testWeight);
            if (Number.isFinite(test) && test < 0) {
                errors.testWeight = 'Test weight cannot be negative';
            }
            if (Number.isFinite(total) && Number.isFinite(test) && test > total) {
                errors.testWeight = `Test weight (${test}g) cannot exceed total weight (${total}g)`;
            }

            if (Object.keys(errors).length === 0) {
                const result = validateItem({
                    workflow_type: WORKFLOW_TYPE,
                    context: { operation: OPERATIONS.CREATE, actor: ACTORS.USER },
                    data: toValidationData(row),
                });
                if (!result.valid) {
                    const fieldMap = {
                        item_type:     'item',
                        description:   'item',
                        gross_weight:  'totalWeight',
                        sample_weight: 'testWeight',
                    };
                    result.errors.forEach(err => {
                        const uiField = fieldMap[err.field] || err.field;
                        if (!errors[uiField]) errors[uiField] = err.message;
                    });
                }
            }

            if (!firstErrorMsg) {
                const k = Object.keys(errors)[0];
                if (k) firstErrorMsg = errors[k];
            }
            return { ...row, errors };
        });

        setSampleRows(validated);
        return { valid: !firstErrorMsg, firstErrorMsg };
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedCustomer) { addToast('Please select a customer', 'error'); return; }

        const { valid, firstErrorMsg } = validateRows();
        if (!valid) { addToast(firstErrorMsg || 'Please fix validation errors', 'error'); return; }

        setLoading(true);
        try {
            await runModalSubmit({
                action: async () => {
                    if (!preventDuplicateCreate('ST', selectedCustomer.id))
                        throw new Error('Duplicate silver test submission blocked');

                    if (!submitReqRef.current)
                        submitReqRef.current = window.crypto?.randomUUID?.() || Date.now().toString();

                    await api.post('/silver-tests', {
                        customer_id: selectedCustomer.id,
                        items: sampleRows.map(r => ({
                            item_name:    r.name || r.item,
                            item_type:    r.item,
                            description:  r.name || '',
                            gross_weight: parseFloat(r.totalWeight),
                            total_weight: parseFloat(r.totalWeight),
                            test_weight:  parseFloat(r.testWeight) || 0,
                            sample_weight:parseFloat(r.testWeight) || 0,
                            returned:     r.returned,
                        })),
                    }, { headers: { 'X-Request-Id': submitReqRef.current } });

                    addToast(`Silver Test created — ${sampleRows.length} item(s)`, 'success');
                },
                reload: onSuccess,
                close: () => { submitReqRef.current = null; closeSafely(); },
            });
        } catch (err) {
            if (!mountedRef.current) return;
            if (err.message === 'Duplicate silver test submission blocked') {
                addToast('Silver Test creation is already in progress', 'warning');
                return;
            }
            addToast(err?.response?.data?.error || 'Failed to create test', 'error');
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const firstItemRef = useRef(null);
    const sampleBlockVisible = selectedCustomer && !showNewCust;
    useFocusWhen(firstItemRef, sampleBlockVisible);

    return (
        <>
        <Modal show={show} onHide={closeSafely} backdrop="static" centered dialogClassName="modal-xxl">
            <Modal.Header closeButton>
                <Modal.Title as="h3" id="newTestModalTitle">New Silver Test</Modal.Title>
            </Modal.Header>

            <Modal.Body className="m-3 mb-0" onKeyDown={onEnterAdvance}>
                {/* Customer search — server-side combobox (Wave A2) */}
                <div className="mb-3">
                    <CustomerCombobox
                        value={selectedCustomer?.id}
                        onChange={(_id, c) => c ? handleCustomerSelect(c) : setSelectedCustomer(null)}
                        autoFocus
                    />
                </div>

                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#" id="addCustomerBtn" onClick={handleAddCustomerLinkClick}>
                    Add New Customer?
                </a>

                {showNewCust && (
                    <div id="addCustomerBlock">
                        <hr />
                        <Form id="addCustomerForm" onSubmit={saveNewCustomer} autoComplete="off" noValidate>
                            <Row>
                                <Col lg={6}>
                                    <InputGroup size="lg" className="mb-3">
                                        <InputGroup.Text className="fw-bold">Name</InputGroup.Text>
                                        <Form.Control
                                            name="name" type="text"
                                            value={newCustData.name}
                                            onChange={(e) => setNewCustData(p => ({ ...p, name: e.target.value }))}
                                            required
                                        />
                                    </InputGroup>
                                </Col>
                                <Col lg={6}>
                                    <InputGroup size="lg" className="mb-3">
                                        <InputGroup.Text className="fw-bold">Phone</InputGroup.Text>
                                        <InputGroup.Text>+91</InputGroup.Text>
                                        <Form.Control
                                            name="phone" type="tel" inputMode="numeric"
                                            pattern="[0-9]{10}" minLength={10} maxLength={10}
                                            value={newCustData.phone}
                                            onChange={(e) => setNewCustData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col lg={6}>
                                    <InputGroup size="lg" className="mb-3">
                                        <InputGroup.Text className="fw-bold">Initial Balance</InputGroup.Text>
                                        <Form.Control
                                            name="balance" type="number"
                                            value={newCustData.balance}
                                            onChange={(e) => setNewCustData(p => ({ ...p, balance: e.target.value }))}
                                        />
                                    </InputGroup>
                                </Col>
                                <InputGroup size="lg" className="mb-3">
                                    <InputGroup.Text className="fw-bold">Notes</InputGroup.Text>
                                    <Form.Control
                                        name="notes" as="textarea"
                                        value={newCustData.notes}
                                        onChange={(e) => setNewCustData(p => ({ ...p, notes: e.target.value }))}
                                    />
                                </InputGroup>
                            </Row>
                            <div className="d-flex justify-content-end">
                                <Button id="addCustomerSubmitBtn" type="submit" variant="primary" className="m-1" disabled={savingCust}>
                                    {savingCust && (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    )}
                                    Add
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}

                {sampleBlockVisible && (
                    <div id="sampleDetailsBlock">
                        <hr />
                        <div className="d-flex justify-content-between align-items-center my-4">
                            <h4 className="m-0">Sample Details</h4>
                            <InputGroup style={{ width: '25%' }}>
                                <InputGroup.Text className="fw-bold">Date</InputGroup.Text>
                                <Form.Control id="dateTimePicker" value={dateDisplay} readOnly />
                            </InputGroup>
                        </div>

                        <div id="sampleDetailsContainer">
                            {sampleRows.map((row, idx) => (
                                <div className="sampleDetails input-group input-group-lg mb-4" key={row.id}>
                                    <div className="input-group input-group-lg mb-1">
                                        <span className="input-group-text fw-bold">Name</span>
                                        <Form.Control
                                            ref={idx === 0 ? firstItemRef : undefined}
                                            type="text" name="name" placeholder="Name" maxLength={32}
                                            value={row.name}
                                            onChange={(e) => updateRow(idx, 'name', e.target.value)}
                                        />
                                        <span className="input-group-text fw-bold">Item</span>
                                        <Form.Control
                                            type="text" name="item" placeholder="Item type" maxLength={32}
                                            value={row.item}
                                            onChange={(e) => updateRow(idx, 'item', e.target.value)}
                                            isInvalid={!!row.errors?.item}
                                            required
                                        />
                                        <span className="input-group-text fw-bold">Weight</span>
                                        <Form.Control
                                            type="number" name="total_weight" placeholder="Total weight"
                                            min={0} step="any"
                                            value={row.totalWeight}
                                            onChange={(e) => updateRow(idx, 'totalWeight', e.target.value)}
                                            isInvalid={!!row.errors?.totalWeight}
                                            required
                                        />
                                        <span className="input-group-text">/</span>
                                        <Form.Control
                                            type="number" name="test_weight" placeholder="Test weight"
                                            min={0} step="any"
                                            value={row.testWeight}
                                            onChange={(e) => updateRow(idx, 'testWeight', e.target.value)}
                                            isInvalid={!!row.errors?.testWeight}
                                            required
                                        />
                                        <span className="input-group-text">
                                            <Form.Check
                                                type="checkbox" name="returned"
                                                checked={row.returned}
                                                onChange={(e) => updateRow(idx, 'returned', e.target.checked)}
                                                className="mt-0"
                                                label={<span className="ms-1 fw-bold">Sample Returned</span>}
                                            />
                                        </span>
                                        <Button
                                            type="button" variant="danger"
                                            className={`deleteSampleDetailsBtn ${sampleRows.length === 1 ? 'invisible' : ''}`}
                                            onClick={() => removeRow(idx)}
                                            aria-label="Delete sample row"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="d-flex justify-content-center">
                            <Button
                                id="addSampleBtn" type="button" variant="outline-info" className="w-50"
                                onClick={addRow}
                                disabled={sampleRows.length >= MAX_ITEMS}
                                aria-label="Add sample row"
                            >
                                <FaPlus />
                            </Button>
                        </div>

                        <div className="d-flex justify-content-end">
                            <Button
                                id="sampleDetailsSubmitBtn" type="button"
                                variant="primary" size="lg"
                                className="d-flex align-items-center m-1"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading && (
                                    <span className="spinner-border spinner-border-sm text-light me-3" role="status" />
                                )}
                                Submit
                            </Button>
                        </div>
                    </div>
                )}
                <DraftStateFooter isDirty={hasDraftEntries} />
            </Modal.Body>
        </Modal>
        <style>{`
            .modal-xxl { max-width: 90vw; }
            @media (min-width: 1400px) { .modal-xxl { max-width: 1320px; } }
            #sampleDetailsContainer .sampleDetails .form-control.is-invalid {
                border-color: #dc3545;
            }
        `}</style>
        </>
    );
};

export default NewSilverTestModal;
