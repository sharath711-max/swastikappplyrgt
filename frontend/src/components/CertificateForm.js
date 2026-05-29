import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Row, Col, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import { useItemList } from '../hooks/useItemList';
import { calculateGoldItem } from '../utils/calculations';
import {
    validateItem,
    normalizeWeight,
    subtractWeights,
    OPERATIONS,
    ACTORS,
} from '../shared/domain/validation';

const TYPE_TO_WORKFLOW = { gold: 'GC', silver: 'SC', photo: 'PC' };

// TODO(PHASE-UI-SPLIT): CertificateForm uses a single "Description / Tag" input
// (sampleDraft.item_name) that serves as BOTH item_type and description.
// A future UI-split phase should add a dedicated Item Type field.
// TODO(PHASE-FIELD-NAMING): UI still uses `test_weight` as the state key for
// what the domain calls `sample_weight`. Label has been migrated to "Sample Wt";
// state key rename is a follow-up phase to avoid churn elsewhere.
// TODO(PHASE-4-ATTACHMENTS): PC inline photo upload removed from this form;
// per-item photo attachment will arrive via the PCI attachment subsystem.
const buildValidationData = (draft) => ({
    item_type:     draft.item_name,
    description:   draft.item_name,
    gross_weight:  draft.gross_weight,
    sample_weight: draft.test_weight,
    returned:      draft.returned,
});

const computeDisplayNet = (draft) => {
    const gross = normalizeWeight(draft.gross_weight);
    if (gross === null) return 0;
    const sample = normalizeWeight(draft.test_weight);
    if (sample === null) return gross;
    const net = subtractWeights(gross, sample);
    return net === null || net < 0 ? 0 : net;
};

const emptyDraft = {
    item_name: '',
    weight: '',
    gross_weight: '',
    test_weight: '0',
    purity: '',
    carat: '',
    rate: '',
    sub_certificate_number: '',
    returned: false
};

const getCertificateType = (initialData, forcedType) => (
    forcedType || (
        initialData?.id?.startsWith('GTS')
            ? 'gold'
            : initialData?.id?.startsWith('STS')
                ? 'silver'
                : initialData?.certificate_type || 'gold'
    )
);

const CertificateForm = ({ onSubmit, onCancel, initialData = null, forcedType = null, loading = false, isOpen = true }) => {
    const { addToast } = useToast();
    const { openModal } = useModal();
    const initialType = getCertificateType(initialData, forcedType);

    const [type, setType] = useState(initialType);
    const [includeGst] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const dropdownRef = useRef(null);

    const [sampleDraft, setSampleDraft] = useState(emptyDraft);
    const [defaultRate, setDefaultRate] = useState('');
    const {
        items,
        addItem,
        removeItem,
        resetItems,
    } = useItemList();
    const [photo, setPhoto] = useState(null);
    const currentDate = new Date().toLocaleDateString('en-US');

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data.data || res.data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            addToast('Unable to load customers', 'error');
        }
    }, [addToast]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        if (!isOpen) return;

        setType(initialType);
        setSampleDraft({ ...emptyDraft });
        // Pre-fill rate from globals on every open
        api.get('/analytics/rates').then(res => {
            const rate = initialType === 'silver'
                ? res.data?.data?.silver_rate_per_gram
                : res.data?.data?.gold_rate_per_gram;
            if (rate) {
                setDefaultRate(String(rate));
                setSampleDraft(d => ({ ...d, rate: String(rate) }));
            }
        }).catch(() => {}); // silent — staff can type manually
        resetItems();
        setPhoto(null);
        setShowSuggestions(false);

        if (initialData?.customer_id && initialData.customer) {
            setSelectedCustomer({
                id: initialData.customer_id,
                name: initialData.customer.name,
                phone: initialData.customer.phone
            });
            setSearchTerm(initialData.customer.name);
        } else {
            setSelectedCustomer(null);
            setSearchTerm('');
        }
    }, [initialData, initialType, isOpen]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCustomers([]);
            return;
        }
        const term = searchTerm.toLowerCase();
        const matches = customers.filter(c => (c.name && c.name.toLowerCase().includes(term)) || (c.phone && c.phone.includes(term))).slice(0, 5);
        setFilteredCustomers(matches);
    }, [searchTerm, customers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const customerDisplay = (customer) => {
        if (!customer) return '';
        return `${customer.name}${customer.phone ? `(${customer.phone})` : ''}`;
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setSearchTerm(customerDisplay(customer));
        setShowSuggestions(false);
    };

    const handleCustomerCreated = async (newCustomer) => {
        await fetchCustomers();
        if (newCustomer) {
            handleCustomerSelect(newCustomer);
        }
    };

    const handleDraftChange = (field, value) => {
        const d = { ...sampleDraft, [field]: value };
        if (type === 'gold' && ['gross_weight', 'test_weight', 'purity', 'rate'].includes(field)) {
            const calc = calculateGoldItem({
                gross_weight: parseFloat(d.gross_weight || 0),
                test_weight: parseFloat(d.test_weight || 0),
                purity: parseFloat(d.purity || 0),
                rate_per_gram: parseFloat(d.rate || 0),
                is_returned: false
            });
            d.amount = calc.item_total || 0;
            d.net_weight = calc.net_weight || 0;
            d.fine_weight = calc.fine_weight || 0;
        }
        setSampleDraft(d);
    };

    const addSampleToList = () => {
        const workflowType = TYPE_TO_WORKFLOW[type];
        if (!workflowType) {
            addToast(`Unsupported certificate type: ${type}`, 'error');
            return;
        }

        const result = validateItem({
            workflow_type: workflowType,
            context: { operation: OPERATIONS.CREATE, actor: ACTORS.USER },
            data: buildValidationData(sampleDraft),
        });

        if (!result.valid) {
            addToast(result.errors[0].message, 'error');
            return;
        }

        addItem({ ...sampleDraft });
        setSampleDraft({ ...emptyDraft });
    };

    const removeSample = (id) => removeItem(id);

    const handleSubmit = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (!selectedCustomer) {
            addToast('Please select a customer', 'error');
            return;
        }
        if (items.length === 0) {
            addToast('Add at least one item to list', 'error');
            return;
        }

        const data = {
            customer_id: selectedCustomer.id,
            customer: { name: selectedCustomer.name, phone: selectedCustomer.phone },
            type,
            includeGst,
            items: items.map(item => {
                const mappedItem = {
                    ...item,
                    certificate_number: item.sub_certificate_number || null,
                    item_type: item.item_name,
                    name: item.name,
                    returned: item.returned || false,
                };

                if (type === 'silver') {
                    mappedItem.gross_weight = parseFloat(item.gross_weight || item.weight || 0);
                    mappedItem.test_weight = parseFloat(item.test_weight || 0);
                    mappedItem.purity = parseFloat(item.purity || 0);
                    mappedItem.item_total = parseFloat(item.amount || 0);
                } else if (type === 'photo') {
                    // PC now uses gross_weight + test_weight (unified with GC/SC).
                    // Legacy `weight` field retained as fallback for any external
                    // callers still posting the old shape.
                    mappedItem.gross_weight = parseFloat(item.gross_weight || item.weight || 0);
                    mappedItem.test_weight  = parseFloat(item.test_weight || 0);
                } else {
                    mappedItem.gross_weight = parseFloat(item.gross_weight || 0);
                    mappedItem.test_weight = parseFloat(item.test_weight || 0);
                    mappedItem.rate_per_gram = parseFloat(item.rate || 0);
                    const calc = calculateGoldItem({
                        gross_weight: mappedItem.gross_weight,
                        test_weight: mappedItem.test_weight,
                        purity: parseFloat(item.purity || 0),
                        rate_per_gram: mappedItem.rate_per_gram,
                        is_returned: item.returned || false
                    });
                    mappedItem.net_weight = calc.net_weight;
                    mappedItem.fine_weight = calc.fine_weight;
                    mappedItem.item_total = parseFloat(item.amount) || calc.item_total || 0;
                    mappedItem.purity = parseFloat(item.purity || 0);
                }
                return mappedItem;
            })
        };

        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (photo) {
            formData.append('photo', photo);
        }
        onSubmit(formData);
    };

    return (
        <Form
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') {
                    e.preventDefault();
                }
            }}
            className="new-sample-modal"
            style={{ textAlign: 'left' }}
        >
            <Form.Group className="mb-2" ref={dropdownRef}>
                <div className="fw-bold text-dark fs-6 mb-2">Customer</div>
                <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0"><FaSearch /></InputGroup.Text>
                    <Form.Control
                        className="border-start-0"
                        placeholder="Search by name or phone"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                            if (!e.target.value.trim()) setSelectedCustomer(null);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                    />
                    {selectedCustomer && (
                        <InputGroup.Text className="bg-success text-white fw-bold">
                            ✓ Selected
                        </InputGroup.Text>
                    )}
                </InputGroup>

                {showSuggestions && searchTerm && (
                    <ListGroup className="suggestion-list">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((c) => (
                                <ListGroup.Item key={c.id} action onClick={() => handleCustomerSelect(c)} className="d-flex justify-content-between align-items-center">
                                    <span>{customerDisplay(c)}</span>
                                    <Badge bg={c.deletedon ? 'danger' : 'success'}>{c.deletedon ? 'Inactive' : 'Active'}</Badge>
                                </ListGroup.Item>
                            ))
                        ) : (
                            <ListGroup.Item className="text-center text-muted">
                                No customers found.{' '}
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => openModal('customer', { reload: handleCustomerCreated })}
                                >
                                    Create New?
                                </Button>
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                )}
            </Form.Group>

            <div className="fw-bold text-dark fs-6 mb-2 mt-3">Item Entry</div>
            <div
                className="item-entry-card mb-3"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') {
                        e.preventDefault();
                        addSampleToList();
                    }
                }}
            >
                <Row className="g-2 mb-2">
                    <Col md={12}>
                        <Form.Label className="small fw-bold">Description / Tag</Form.Label>
                        <Form.Control
                            placeholder="e.g. RING, NECK"
                            value={sampleDraft.item_name}
                            onChange={(e) => handleDraftChange('item_name', e.target.value)}
                        />
                    </Col>
                </Row>
                <Row className="g-2 mb-2">
                    <Col md={6}>
                        <Form.Label className="small fw-bold">Cert No.</Form.Label>
                        <Form.Control placeholder="Auto" value={sampleDraft.sub_certificate_number} onChange={(e) => handleDraftChange('sub_certificate_number', e.target.value)} />
                    </Col>
                    <Col md={6} className="d-flex align-items-center mt-4">
                        <Form.Check type="checkbox" label="Returned" checked={sampleDraft.returned || false} onChange={(e) => handleDraftChange('returned', e.target.checked)} />
                    </Col>
                </Row>

                <Row className="g-2">
                    <Col md={4}>
                        <Form.Label className="small fw-bold">Gross Wt (g)</Form.Label>
                        <Form.Control
                            type="number" step="0.001" min="0" placeholder="0.000"
                            value={sampleDraft.gross_weight}
                            onChange={(e) => handleDraftChange('gross_weight', e.target.value)}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="small fw-bold">Sample Wt (g)</Form.Label>
                        <Form.Control
                            type="number" step="0.001" min="0" placeholder="0.000"
                            value={sampleDraft.test_weight}
                            onChange={(e) => handleDraftChange('test_weight', e.target.value)}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="small fw-bold">Net Wt (g)</Form.Label>
                        <Form.Control
                            className="bg-light"
                            value={computeDisplayNet(sampleDraft)}
                            readOnly
                            tabIndex={-1}
                        />
                    </Col>
                </Row>

                <div className="d-flex justify-content-end mt-2">
                    <Button size="sm" className="add-sample-btn px-4" onClick={addSampleToList}>
                        <FaPlus className="me-1" /> Add
                    </Button>
                </div>
            </div>

            <div className="sample-list-panel mb-2">
                <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="table table-bordered table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                <th>#</th>
                                <th>Cert No.</th>
                                <th>Item</th>
                                <th>Gross Wt</th>
                                <th>Sample Wt</th>
                                <th>Net Wt</th>
                                <th>Returned</th>
                                <th className="text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted italic">No items added yet</td>
                                </tr>
                            ) : (
                                items.map((s) => {
                                    const gross  = parseFloat(s.gross_weight || s.weight || 0) || 0;
                                    const sample = parseFloat(s.test_weight || 0) || 0;
                                    const net    = Math.max(0, Number((gross - sample).toFixed(3)));
                                    return (
                                        <tr key={s.id}>
                                            <td>{s.seq}</td>
                                            <td>{s.sub_certificate_number || 'Auto'}</td>
                                            <td className="fw-bold">{s.item_name}</td>
                                            <td>{gross}g</td>
                                            <td>{sample}g</td>
                                            <td>{net}g</td>
                                            <td>{s.returned ? 'Yes' : 'No'}</td>
                                            <td className="text-center">
                                                <Button variant="link" className="p-0 text-danger" onClick={() => removeSample(s.id)}>
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Row className="new-sample-footer mt-2 mx-0 pb-0 pt-2 border-top justify-content-between align-items-center">
                <Col xs="auto">
                    <span className="fw-bold text-dark">{currentDate}</span>
                </Col>
                <Col xs="auto" className="d-flex gap-2">
                    <Button variant="success" size="sm" type="button" onClick={handleSubmit} className="save-btn" disabled={loading}>
                        {loading ? 'Issuing...' : `Issue Certificate (${items.length})`}
                    </Button>
                    <Button variant="outline-secondary" size="sm" className="cancel-btn" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                </Col>
            </Row>

            <style>{`
                .form-control, .form-select, .input-group-text { border-radius: 6px; padding: 0.4rem 0.75rem; font-size: 0.85rem; border: 1px solid #ced4da; }
                .form-control:focus, .form-select:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }
                .suggestion-list { position: absolute; left: 0; right: 0; z-index: 1000; margin-top: 2px; border-radius: 6px; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 1px solid #dee2e6; }
                .add-sample-btn { font-weight: 700; border-radius: 6px; }
                .sample-list-panel { border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden; }
                .save-btn { font-weight: 700; border-radius: 6px; }
                .cancel-btn { font-weight: 600; border-radius: 6px; }
                .item-entry-card { padding: 0; border: none; background: transparent; }
            `}</style>
        </Form>
    );
};

export default CertificateForm;
