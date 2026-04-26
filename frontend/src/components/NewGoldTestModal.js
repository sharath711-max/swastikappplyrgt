import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCustomerSearch } from '../hooks/useCustomerSearch';
import { Modal, Button, Form, Row, Col, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSearch, FaCopy } from 'react-icons/fa';
import api from '../services/api';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import { preventDuplicateCreate } from '../utils/certificateGuard';
import runModalSubmit from '../utils/handleSubmit';

const MAX_ITEMS = 20;

const emptyDraft = {
    item: '',
    grossWeight: '',
    sampleWeight: '',
    returned: false,
};

const parseWeight = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : null;
};

const toFixedNumber = (value, digits) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    return Number(num.toFixed(digits));
};

const deriveWeights = (draft) => {
    const gross  = parseWeight(draft.grossWeight)  || 0;
    const sample = parseWeight(draft.sampleWeight) || 0;
    const net    = Math.max(0, toFixedNumber(gross - sample, 3));
    return { gross, sample, net };
};

const emptyNewCustomer = { name: '', phone: '', balance: '', notes: '' };

const NewGoldTestModal = ({ show, onHide, onSuccess }) => {
    const { addToast }  = useToast();
    const { openModal } = useModal();

    // Customer state
    const [searchTerm,        setSearchTerm]        = useState('');
    const [showSuggestions,   setShowSuggestions]   = useState(false);
    const [selectedCustomer,  setSelectedCustomer]  = useState(null);

    const { filteredCustomers, reload: reloadCustomers } = useCustomerSearch({
        show, searchTerm, addToast, limit: 6,
    });

    // Inline new-customer form
    const [showNewCust,  setShowNewCust]  = useState(false);
    const [newCustData,  setNewCustData]  = useState(emptyNewCustomer);
    const [savingCust,   setSavingCust]   = useState(false);

    // Item entry state
    const [sampleDraft,  setSampleDraft]  = useState(emptyDraft);
    const [sampleItems,  setSampleItems]  = useState([]);
    const [errors,       setErrors]       = useState({});
    const [loading,      setLoading]      = useState(false);

    const dropdownRef   = useRef(null);
    const itemTypeRef   = useRef(null);     // auto-focus after each add
    const submitReqRef  = useRef(null);

    const currentDate = new Date().toLocaleDateString('en-US');

    // ── Data loading ──────────────────────────────────────────────────────────
    const resetForm = useCallback(() => {
        setSearchTerm('');
        setShowSuggestions(false);
        setSelectedCustomer(null);
        setSampleDraft(emptyDraft);
        setSampleItems([]);
        setErrors({});
    }, []);

    useEffect(() => {
        if (show) resetForm();
    }, [show, resetForm]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Customer helpers ──────────────────────────────────────────────────────
    const customerDisplay = (c) =>
        c ? `${c.name}${c.phone ? ` (+91 ${c.phone})` : ''}` : '';

    const handleCustomerSelect = (c) => {
        setSelectedCustomer(c);
        setSearchTerm(customerDisplay(c));
        setShowSuggestions(false);
        setErrors(prev => ({ ...prev, customer: false }));
        // Move focus to item entry
        setTimeout(() => itemTypeRef.current?.focus(), 50);
    };


    const saveNewCustomer = async (e) => {
        e.preventDefault();
        if (!newCustData.name.trim()) { addToast('Name is required', 'error'); return; }
        setSavingCust(true);
        try {
            const res = await api.post('/customers', {
                name   : newCustData.name.trim(),
                phone  : newCustData.phone.trim() || undefined,
                balance: parseFloat(newCustData.balance) || 0,
                notes  : newCustData.notes.trim() || undefined,
            });
            const created = res.data?.data ?? res.data;
            addToast('Customer created', 'success');
            setShowNewCust(false);
            setNewCustData(emptyNewCustomer);
            await reloadCustomers();
            if (created) handleCustomerSelect(created);
        } catch (err) {
            addToast(err?.response?.data?.error || err.message, 'error');
        } finally {
            setSavingCust(false);
        }
    };

    // ── Item entry ────────────────────────────────────────────────────────────
    const addSampleToList = () => {
        if (sampleItems.length >= MAX_ITEMS) {
            addToast(`A test cannot have more than ${MAX_ITEMS} items`, 'error');
            return;
        }

        const item = sampleDraft.item.trim();
        const { gross, sample, net } = deriveWeights(sampleDraft);

        const localErrors = {};
        if (!item)       localErrors.item = true;
        if (gross <= 0)  localErrors.grossWeight = true;

        if (Object.keys(localErrors).length > 0) {
            setErrors(prev => ({ ...prev, sample: localErrors }));
            addToast('Item Type and Gross Weight are required', 'error');
            return;
        }
        if (sample > gross) {
            setErrors(prev => ({ ...prev, sample: { ...prev.sample, sampleWeight: true } }));
            addToast('Sample weight cannot exceed gross weight', 'error');
            return;
        }

        setErrors(prev => ({ ...prev, sample: {} }));
        setSampleItems(prev => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                seq: prev.length + 1,
                item,
                grossWeight:  gross,
                sampleWeight: sample,
                netWeight:    net,
                returned:     sampleDraft.returned,
            },
        ]);

        // Reset draft but keep item type for fast same-type multi-entry
        setSampleDraft(prev => ({ ...emptyDraft, item: prev.item }));
        setTimeout(() => itemTypeRef.current?.focus(), 30);
    };

    // Enter key inside item form → add to list
    const handleItemFormKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addSampleToList(); }
    };

    const removeSample = (id) =>
        setSampleItems(prev =>
            prev.filter(s => s.id !== id).map((s, i) => ({ ...s, seq: i + 1 }))
        );

    // Duplicate last item: keep type, gross, sample — clear only purity/returned
    const duplicateLast = () => {
        const last = sampleItems[sampleItems.length - 1];
        if (!last) return;
        setSampleDraft({
            item:         last.item,
            grossWeight:  String(last.grossWeight),
            sampleWeight: String(last.sampleWeight),
            returned:     false,
        });
        setTimeout(() => itemTypeRef.current?.focus(), 30);
    };

    const toggleReturned = (id) =>
        setSampleItems(prev =>
            prev.map(s => s.id === id ? { ...s, returned: !s.returned } : s)
        );

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSave = async (e) => {
        if (e) e.preventDefault();

        if (!selectedCustomer) {
            setErrors(prev => ({ ...prev, customer: true }));
            addToast('Please select a customer', 'error');
            return;
        }
        if (sampleItems.length === 0) {
            addToast('Add at least one sample item before saving', 'error');
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            await runModalSubmit({
                action: async () => {
                    if (!preventDuplicateCreate('GT', selectedCustomer.id))
                        throw new Error('Duplicate gold test submission blocked');

                    if (!submitReqRef.current)
                        submitReqRef.current = window.crypto?.randomUUID?.() || Date.now().toString();

                    await api.post('/gold-tests', {
                        customer_id: selectedCustomer.id,
                        items: sampleItems.map(s => ({
                            item_name:     s.item,
                            gross_weight:  s.grossWeight,
                            test_weight:   s.sampleWeight,
                            sample_weight: s.sampleWeight,
                            returned:      s.returned,
                        })),
                    }, { headers: { 'X-Request-Id': submitReqRef.current } });

                    addToast(`Gold Test created — ${sampleItems.length} item(s)`, 'success');
                },
                reload: onSuccess,
                close: () => {
                    submitReqRef.current = null;
                    resetForm();
                    onHide();
                },
            });
        } catch (error) {
            if (error.message === 'Duplicate gold test submission blocked') {
                addToast('Gold Test creation is already in progress', 'warning');
                return;
            }
            addToast(error.response?.data?.error || 'Failed to create test', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const { net: draftNet } = deriveWeights(sampleDraft);
    const itemsRemaining    = MAX_ITEMS - sampleItems.length;
    const canAddMore        = sampleItems.length < MAX_ITEMS;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            backdrop="static"
            className="gt-modal"
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <Modal.Header closeButton className="gt-header">
                <div>
                    <Modal.Title className="fw-bold fs-5">New Gold Test</Modal.Title>
                    <div className="gt-subtitle">
                        Fill one item at a time → Add → repeat → Save when done
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-0">

                {/* ── Customer strip ──────────────────────────────────────── */}
                <div className="gt-section" ref={dropdownRef}>
                    <div className="gt-section-label">Customer</div>
                    <InputGroup>
                        <InputGroup.Text className="gt-input-icon"><FaSearch /></InputGroup.Text>
                        <Form.Control
                            className={`gt-input ${errors.customer ? 'is-invalid' : ''}`}
                            placeholder="Search by name or phone…"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                                if (!e.target.value.trim()) setSelectedCustomer(null);
                                setErrors(prev => ({ ...prev, customer: false }));
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {selectedCustomer && (
                            <InputGroup.Text className="gt-selected-badge">
                                ✓ Selected
                            </InputGroup.Text>
                        )}
                    </InputGroup>
                    {errors.customer && (
                        <div className="gt-error-text">Customer selection is required</div>
                    )}

                    {showSuggestions && searchTerm && (
                        <ListGroup className="gt-suggestion-list">
                            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                <ListGroup.Item
                                    key={c.id}
                                    action
                                    onClick={() => handleCustomerSelect(c)}
                                    className="d-flex justify-content-between align-items-center py-2"
                                >
                                    <div>
                                        <div className="fw-bold">{c.name}</div>
                                        {c.phone && <small className="text-muted">+91 {c.phone}</small>}
                                    </div>
                                    <Badge bg={c.deletedon ? 'danger' : 'success'} className="ms-2">
                                        {c.deletedon ? 'Inactive' : 'Active'}
                                    </Badge>
                                </ListGroup.Item>
                            )) : (
                                <ListGroup.Item className="py-2">
                                    <div className="text-center text-muted mb-1 small">No match found.</div>
                                    {!showNewCust ? (
                                        <div className="text-center">
                                            <Button variant="link" size="sm" className="p-0"
                                                onClick={() => { setShowNewCust(true); setShowSuggestions(false); }}>
                                                + Add new customer?
                                            </Button>
                                        </div>
                                    ) : null}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    )}
                </div>

                {/* ── Inline new-customer form ────────────────────────────── */}
                {showNewCust && (
                    <div className="gt-section" style={{ background: '#f0fdf4', borderTop: '2px solid #198754' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="gt-section-label mb-0 text-success">New Customer</div>
                            <Button variant="link" size="sm" className="p-0 text-muted"
                                onClick={() => { setShowNewCust(false); setNewCustData(emptyNewCustomer); }}>
                                Cancel
                            </Button>
                        </div>
                        <Form onSubmit={saveNewCustomer}>
                            <Row className="g-2">
                                <Col xs={12} sm={6}>
                                    <Form.Control size="sm" placeholder="Name *" required
                                        value={newCustData.name}
                                        onChange={e => setNewCustData(p => ({ ...p, name: e.target.value }))} />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Form.Control size="sm" placeholder="Phone"
                                        value={newCustData.phone}
                                        onChange={e => setNewCustData(p => ({ ...p, phone: e.target.value }))} />
                                </Col>
                                <Col xs={6}>
                                    <Form.Control size="sm" type="number" placeholder="Initial Balance (₹)" min="0"
                                        value={newCustData.balance}
                                        onChange={e => setNewCustData(p => ({ ...p, balance: e.target.value }))} />
                                </Col>
                                <Col xs={6} className="d-flex align-items-end">
                                    <Button size="sm" type="submit" variant="success" className="w-100" disabled={savingCust}>
                                        {savingCust ? 'Saving…' : 'Create & Select'}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                )}

                {/* ── Item entry form ─────────────────────────────────────── */}
                <div className="gt-section gt-item-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="gt-section-label mb-0">
                            Sample Item Entry
                            <span className="gt-hint ms-2">Press Enter to add</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            {sampleItems.length > 0 && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="gt-dup-btn"
                                    onClick={duplicateLast}
                                    title="Copy last item's type & weights into the form"
                                >
                                    <FaCopy className="me-1" />Duplicate last
                                </Button>
                            )}
                            <span className={`gt-count-badge ${!canAddMore ? 'gt-count-full' : ''}`}>
                                {sampleItems.length} / {MAX_ITEMS}
                            </span>
                        </div>
                    </div>

                    <div className="gt-entry-card" onKeyDown={handleItemFormKeyDown}>
                        {/* Item type */}
                        <Form.Group className="mb-3">
                            <Form.Label className="gt-field-label">Item Type <span className="gt-required">*</span></Form.Label>
                            <Form.Control
                                ref={itemTypeRef}
                                className={`gt-input ${errors.sample?.item ? 'is-invalid' : ''}`}
                                placeholder="e.g. Ring, Necklace, Bangle…"
                                value={sampleDraft.item}
                                onChange={(e) => {
                                    setSampleDraft(prev => ({ ...prev, item: e.target.value }));
                                    setErrors(prev => ({ ...prev, sample: { ...prev.sample, item: false } }));
                                }}
                            />
                            {errors.sample?.item && <div className="gt-error-text">Item type is required</div>}
                        </Form.Group>

                        {/* Weights row */}
                        <Row className="g-2 mb-2">
                            <Col xs={4}>
                                <Form.Label className="gt-field-label">Gross Wt (g) <span className="gt-required">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    className={`gt-input gt-weight ${errors.sample?.grossWeight ? 'is-invalid' : ''}`}
                                    placeholder="0.000"
                                    value={sampleDraft.grossWeight}
                                    onChange={(e) => {
                                        setSampleDraft(prev => ({ ...prev, grossWeight: e.target.value }));
                                        setErrors(prev => ({ ...prev, sample: { ...prev.sample, grossWeight: false } }));
                                    }}
                                />
                                {errors.sample?.grossWeight && <div className="gt-error-text">Required, &gt; 0</div>}
                            </Col>
                            <Col xs={4}>
                                <Form.Label className="gt-field-label">Sample Wt (g)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    className={`gt-input gt-weight ${errors.sample?.sampleWeight ? 'is-invalid' : ''}`}
                                    placeholder="0.000"
                                    value={sampleDraft.sampleWeight}
                                    onChange={(e) => {
                                        setSampleDraft(prev => ({ ...prev, sampleWeight: e.target.value }));
                                        setErrors(prev => ({ ...prev, sample: { ...prev.sample, sampleWeight: false } }));
                                    }}
                                />
                                {errors.sample?.sampleWeight && <div className="gt-error-text">Cannot exceed gross</div>}
                            </Col>
                            <Col xs={4}>
                                <Form.Label className="gt-field-label">Net Wt (g)</Form.Label>
                                <Form.Control
                                    className="gt-input gt-weight gt-net"
                                    value={draftNet}
                                    readOnly
                                    tabIndex={-1}
                                />
                            </Col>
                        </Row>

                        {/* Returned toggle + Add button */}
                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <Form.Check
                                type="switch"
                                id="gt-returned-switch"
                                label="Returned (No Charge)"
                                checked={sampleDraft.returned}
                                onChange={(e) => setSampleDraft(prev => ({ ...prev, returned: e.target.checked }))}
                                className="gt-returned-switch"
                            />
                            <Button
                                className="gt-add-btn"
                                onClick={addSampleToList}
                                disabled={!canAddMore}
                                title={canAddMore ? 'Add this item (Enter)' : `Max ${MAX_ITEMS} items reached`}
                            >
                                <FaPlus className="me-2" />
                                Add Item
                                {sampleItems.length > 0 && (
                                    <span className="gt-add-count ms-2">#{sampleItems.length + 1}</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Items list ───────────────────────────────────────────── */}
                <div className="gt-list-section">
                    <div className="gt-list-header">
                        <span>Items Added</span>
                        <span className="gt-list-count">
                            {sampleItems.length === 0
                                ? 'None yet'
                                : `${sampleItems.length} item${sampleItems.length > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {sampleItems.length === 0 ? (
                        <div className="gt-empty-state">
                            <div className="gt-empty-icon">⬆</div>
                            <div className="gt-empty-text">Fill the form above and click <strong>Add Item</strong></div>
                            <div className="gt-empty-sub">You can add up to {MAX_ITEMS} items per test</div>
                        </div>
                    ) : (
                        <div className="gt-table-wrap">
                            <table className="gt-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 32 }}>#</th>
                                        <th>Item Type</th>
                                        <th style={{ width: 80 }}>Gross</th>
                                        <th style={{ width: 80 }}>Sample</th>
                                        <th style={{ width: 80 }}>Net</th>
                                        <th style={{ width: 64 }}>Ret?</th>
                                        <th style={{ width: 40 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sampleItems.map(s => (
                                        <tr key={s.id} className={s.returned ? 'gt-row-returned' : ''}>
                                            <td className="gt-seq">{s.seq}</td>
                                            <td className="gt-item-name">
                                                {s.item}
                                                {s.returned && (
                                                    <Badge bg="warning" text="dark" className="ms-2 gt-ret-badge">RET</Badge>
                                                )}
                                            </td>
                                            <td className="gt-wt">{s.grossWeight}g</td>
                                            <td className="gt-wt">{s.sampleWeight}g</td>
                                            <td className="gt-wt gt-net-wt">{s.netWeight}g</td>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="switch"
                                                    checked={s.returned}
                                                    onChange={() => toggleReturned(s.id)}
                                                    className="gt-row-switch"
                                                />
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="gt-remove-btn"
                                                    onClick={() => removeSample(s.id)}
                                                    title="Remove item"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </Modal.Body>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <Modal.Footer className="gt-footer">
                <div className="gt-footer-meta">
                    {sampleItems.length > 0
                        ? <span className="gt-save-hint">Ready to save — {sampleItems.length} item(s)</span>
                        : <span className="gt-save-hint gt-save-hint-warn">Add at least one item to save</span>
                    }
                    <span className="gt-date-display">{currentDate}</span>
                </div>
                <div className="gt-footer-actions">
                    <Button
                        className="gt-save-btn"
                        onClick={handleSave}
                        disabled={loading || sampleItems.length === 0}
                    >
                        {loading ? 'Saving…' : `Save Test (${sampleItems.length} item${sampleItems.length !== 1 ? 's' : ''})`}
                    </Button>
                    <Button variant="outline-secondary" className="gt-cancel-btn" onClick={onHide} disabled={loading}>
                        Cancel
                    </Button>
                </div>
            </Modal.Footer>

            {/* ── Scoped styles ────────────────────────────────────────────── */}
            <style>{`
                .gt-modal .modal-content {
                    border-radius: 16px;
                    overflow: hidden;
                    border: none;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }
                .gt-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.25rem 1.5rem;
                    border: none;
                }
                .gt-header .btn-close { filter: brightness(0) invert(1); opacity: .8; }
                .gt-subtitle {
                    font-size: .75rem;
                    opacity: .8;
                    margin-top: .2rem;
                    letter-spacing: .02em;
                }

                /* Sections */
                .gt-section {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                    position: relative;
                }
                .gt-item-section { background: #fafbff; }
                .gt-section-label {
                    font-size: .75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: .08em;
                    color: #6b7280;
                    margin-bottom: .6rem;
                    display: flex;
                    align-items: center;
                }
                .gt-hint {
                    font-size: .7rem;
                    font-weight: 600;
                    background: #e0e7ff;
                    color: #4f46e5;
                    border-radius: 4px;
                    padding: 2px 6px;
                    text-transform: none;
                    letter-spacing: 0;
                }

                /* Inputs */
                .gt-input {
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    padding: .5rem .75rem;
                    font-size: .9rem;
                    transition: border-color .15s;
                }
                .gt-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.12); }
                .gt-input.is-invalid { border-color: #ef4444; }
                .gt-input-icon { background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 8px 0 0 8px; }
                .gt-selected-badge {
                    background: #d1fae5;
                    color: #065f46;
                    font-size: .75rem;
                    font-weight: 700;
                    border: 1.5px solid #a7f3d0;
                    border-radius: 0 8px 8px 0;
                    padding: .5rem .75rem;
                }
                .gt-weight { font-variant-numeric: tabular-nums; }
                .gt-net { background: #f0fdf4; color: #166534; font-weight: 700; }
                .gt-field-label {
                    font-size: .78rem;
                    font-weight: 700;
                    color: #374151;
                    margin-bottom: .3rem;
                }
                .gt-required { color: #ef4444; }
                .gt-error-text { font-size: .72rem; color: #ef4444; margin-top: .2rem; }

                /* Customer dropdown */
                .gt-suggestion-list {
                    position: absolute;
                    left: 1.5rem; right: 1.5rem;
                    z-index: 1050;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(0,0,0,.12);
                    border: 1.5px solid #667eea;
                    max-height: 260px;
                    overflow-y: auto;
                }

                /* Item entry card */
                .gt-entry-card {
                    background: white;
                    border: 1.5px solid #e0e7ff;
                    border-radius: 12px;
                    padding: 1rem;
                }

                /* Count badge */
                .gt-count-badge {
                    font-size: .75rem;
                    font-weight: 700;
                    background: #e0e7ff;
                    color: #3730a3;
                    border-radius: 20px;
                    padding: 3px 10px;
                }
                .gt-count-full {
                    background: #fee2e2;
                    color: #991b1b;
                }

                /* Duplicate button */
                .gt-dup-btn {
                    font-size: .75rem;
                    padding: .25rem .65rem;
                    border-radius: 6px;
                    font-weight: 600;
                }

                /* Returned switch */
                .gt-returned-switch { font-size: .85rem; font-weight: 600; color: #374151; }

                /* Add button */
                .gt-add-btn {
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: .85rem;
                    padding: .5rem 1.1rem;
                    color: white;
                    display: flex;
                    align-items: center;
                    transition: opacity .15s, transform .1s;
                }
                .gt-add-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
                .gt-add-btn:disabled { opacity: .45; }
                .gt-add-count {
                    background: rgba(255,255,255,.25);
                    border-radius: 20px;
                    padding: 1px 7px;
                    font-size: .72rem;
                }

                /* Items list */
                .gt-list-section { border-bottom: 1px solid #f0f0f0; }
                .gt-list-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: .75rem 1.5rem;
                    background: #1f2937;
                    color: white;
                    font-weight: 700;
                    font-size: .85rem;
                }
                .gt-list-count {
                    font-size: .75rem;
                    background: rgba(255,255,255,.15);
                    border-radius: 20px;
                    padding: 2px 10px;
                }
                .gt-empty-state {
                    padding: 2rem 1.5rem;
                    text-align: center;
                    background: white;
                }
                .gt-empty-icon { font-size: 1.8rem; margin-bottom: .5rem; opacity: .4; }
                .gt-empty-text { font-weight: 600; color: #374151; font-size: .9rem; }
                .gt-empty-sub { color: #9ca3af; font-size: .8rem; margin-top: .25rem; }

                .gt-table-wrap {
                    max-height: 240px;
                    overflow-y: auto;
                    background: white;
                }
                .gt-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: .83rem;
                }
                .gt-table thead th {
                    background: #f3f4f6;
                    padding: .45rem .75rem;
                    font-size: .72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: .04em;
                    color: #6b7280;
                    border-bottom: 1px solid #e5e7eb;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
                .gt-table tbody td {
                    padding: .5rem .75rem;
                    border-bottom: 1px solid #f3f4f6;
                    vertical-align: middle;
                }
                .gt-table tbody tr:hover { background: #f9fafb; }
                .gt-row-returned { opacity: .7; }
                .gt-seq { color: #9ca3af; font-size: .75rem; }
                .gt-item-name { font-weight: 700; color: #111827; }
                .gt-ret-badge { font-size: .6rem; padding: 1px 5px; }
                .gt-wt { font-variant-numeric: tabular-nums; color: #374151; }
                .gt-net-wt { color: #059669; font-weight: 700; }
                .gt-row-switch .form-check-input { cursor: pointer; }
                .gt-remove-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    padding: .2rem .35rem;
                    border-radius: 4px;
                    opacity: .6;
                    transition: opacity .15s;
                }
                .gt-remove-btn:hover { opacity: 1; background: #fee2e2; }

                /* Footer */
                .gt-footer {
                    padding: 1rem 1.5rem;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    gap: .75rem;
                }
                .gt-footer-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: .78rem;
                }
                .gt-save-hint { font-weight: 600; color: #059669; }
                .gt-save-hint-warn { color: #9ca3af; }
                .gt-date-display { color: #9ca3af; }
                .gt-footer-actions {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: .75rem;
                }
                .gt-save-btn {
                    background: #10b981;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    padding: .6rem 1.25rem;
                    font-size: .9rem;
                    color: white;
                    transition: background .15s;
                }
                .gt-save-btn:hover:not(:disabled) { background: #059669; }
                .gt-save-btn:disabled { opacity: .45; }
                .gt-cancel-btn {
                    border-radius: 8px;
                    font-weight: 600;
                    padding: .6rem 1rem;
                    font-size: .9rem;
                }
            `}</style>
        </Modal>
    );
};

export default NewGoldTestModal;
