import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import NewCustomerModal from './NewCustomerModal';

const emptyDraft = {
    item: '',
    grossWeight: '',
    sampleWeight: '',
    netWeight: 0,
    returned: false
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
    const gross = parseWeight(draft.grossWeight) || 0;
    const sample = parseWeight(draft.sampleWeight) || 0;
    const net = Math.max(0, toFixedNumber(gross - sample, 3));
    return { gross, sample, net };
};

const NewSilverTestModal = ({ show, onHide, onSuccess }) => {
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const dropdownRef = useRef(null);

    const [sampleDraft, setSampleDraft] = useState(emptyDraft);
    const [sampleItems, setSampleItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [errors, setErrors] = useState({});

    const currentDate = new Date().toLocaleDateString('en-US');

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await api.get('/customers');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setCustomers(data);
        } catch (_error) {
            addToast('Unable to load customers', 'error');
        }
    }, [addToast]);

    useEffect(() => {
        if (show) {
            fetchCustomers();
            resetForm();
        }
    }, [show, fetchCustomers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCustomers([]);
            return;
        }
        const term = searchTerm.toLowerCase();
        const matches = customers
            .filter((c) => (c.name && c.name.toLowerCase().includes(term)) || (c.phone && c.phone.includes(term)))
            .slice(0, 5);
        setFilteredCustomers(matches);
    }, [searchTerm, customers]);

    const resetForm = () => {
        setSearchTerm('');
        setShowSuggestions(false);
        setSelectedCustomer(null);
        setSampleDraft(emptyDraft);
        setSampleItems([]);
        setErrors({});
    };

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
        setShowCustomerModal(false);
    };

    const handleWeightFieldInput = (field, value) => {
        setSampleDraft((prev) => ({ ...prev, [field]: value }));
    };



    const addSampleToList = () => {
        const item = sampleDraft.item.trim();
        const { gross, sample, net } = deriveWeights(sampleDraft);

        let localErrors = {};
        if (!item) localErrors.item = true;
        if (gross <= 0) localErrors.grossWeight = true;

        if (Object.keys(localErrors).length > 0) {
            setErrors(prev => ({ ...prev, sample: localErrors }));
            addToast('Please enter Item Type and Gross Weight', 'error');
            return;
        }

        if (sample > gross) {
            setErrors(prev => ({ ...prev, sample: { ...prev.sample, sampleWeight: true } }));
            addToast('Sample weight cannot exceed gross weight', 'error');
            return;
        }

        setErrors(prev => ({ ...prev, sample: {} }));

        setSampleItems((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                seq: prev.length + 1,
                item,
                grossWeight: gross,
                sampleWeight: sample,
                netWeight: net,
                returned: sampleDraft.returned
            }
        ]);

        setSampleDraft(emptyDraft);
    };

    const removeSample = (id) => {
        setSampleItems((prev) => prev.filter((s) => s.id !== id).map((s, idx) => ({ ...s, seq: idx + 1 })));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        if (!selectedCustomer) {
            setErrors(prev => ({ ...prev, customer: true }));
            addToast('Please select a customer', 'error');
            return;
        }
        if (sampleItems.length === 0) {
            addToast('Add at least one sample item', 'error');
            return;
        }

        setErrors({});

        setLoading(true);
        try {
            const payload = {
                customer_id: selectedCustomer.id,
                items: sampleItems.map((s) => ({
                    item_name: s.item,
                    gross_weight: s.grossWeight,
                    test_weight: s.sampleWeight, // API expects test_weight
                    sample_weight: s.sampleWeight, // Backwards compatibility
                    returned: s.returned
                }))
            };

            await api.post('/silver-tests', payload);
            addToast('Silver Test Created Successfully', 'success');

            // Explicitly call onSuccess to reload board AND close modal
            if (onSuccess) onSuccess();
            onHide();
            resetForm();
        } catch (error) {
            addToast(error.response?.data?.error || 'Failed to create test', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered className="new-sample-modal">
            <Modal.Header closeButton className="new-sample-header">
                <Modal.Title className="fw-bold">New Sample Entry</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label className="field-label">Date <span className="required">*</span></Form.Label>
                    <Form.Control value={currentDate} readOnly />
                </Form.Group>

                <Form.Group className="mb-3" ref={dropdownRef}>
                    <Form.Label className="field-label">Customer Search <span className="required">*</span></Form.Label>
                    <InputGroup>
                        <InputGroup.Text><FaSearch /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name or phone"
                            value={searchTerm}
                            isInvalid={errors.customer}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                                if (!e.target.value.trim()) {
                                    setSelectedCustomer(null);
                                }
                                if (errors.customer) setErrors(prev => ({ ...prev, customer: false }));
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {errors.customer && <Form.Control.Feedback type="invalid">Customer Selection Required</Form.Control.Feedback>}
                    </InputGroup>

                    {showSuggestions && searchTerm && (
                        <ListGroup className="suggestion-list">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((c) => (
                                    <ListGroup.Item
                                        key={c.id}
                                        action
                                        onClick={() => handleCustomerSelect(c)}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <span>{customerDisplay(c)}</span>
                                        <Badge bg={c.deletedon ? 'danger' : 'success'}>{c.deletedon ? 'Inactive' : 'Active'}</Badge>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center text-muted">
                                    No customers found.{' '}
                                    <Button variant="link" size="sm" onClick={() => setShowCustomerModal(true)}>Create New?</Button>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="field-label">Customer Name <span className="required">*</span></Form.Label>
                    <Form.Control value={customerDisplay(selectedCustomer)} readOnly />
                </Form.Group>

                <Form.Label className="field-label mb-2">Sample Item Entry</Form.Label>
                <div className="item-entry-card p-3 mb-3 border rounded shadow-sm bg-light">
                    <Row className="g-2 mb-2">
                        <Col md={12}>
                            <Form.Label className="small fw-bold">Item Type</Form.Label>
                            <Form.Control
                                placeholder="eg., Ring, Necklace"
                                value={sampleDraft.item}
                                isInvalid={errors.sample?.item}
                                onChange={(e) => {
                                    setSampleDraft((prev) => ({ ...prev, item: e.target.value }));
                                    if (errors.sample?.item) setErrors(prev => ({ ...prev, sample: { ...prev.sample, item: false } }));
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="g-2">
                        <Col md={4}>
                            <Form.Label className="small fw-bold">Gross Wt</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={sampleDraft.grossWeight}
                                isInvalid={errors.sample?.grossWeight}
                                onChange={(e) => {
                                    handleWeightFieldInput('grossWeight', e.target.value);
                                    if (errors.sample?.grossWeight) setErrors(prev => ({ ...prev, sample: { ...prev.sample, grossWeight: false } }));
                                }}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label className="small fw-bold">Sample Wt</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={sampleDraft.sampleWeight}
                                isInvalid={errors.sample?.sampleWeight}
                                onChange={(e) => {
                                    handleWeightFieldInput('sampleWeight', e.target.value);
                                    if (errors.sample?.sampleWeight) setErrors(prev => ({ ...prev, sample: { ...prev.sample, sampleWeight: false } }));
                                }}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label className="small fw-bold">Net Wt</Form.Label>
                            <Form.Control
                                value={deriveWeights(sampleDraft).net}
                                readOnly
                                className="bg-white"
                            />
                        </Col>
                    </Row>
                    <div className="d-flex align-items-center gap-3 mt-2">
                        <Form.Check
                            type="switch"
                            id="returned-draft"
                            label="Returned (No Charge)"
                            checked={sampleDraft.returned}
                            onChange={(e) => setSampleDraft(prev => ({ ...prev, returned: e.target.checked }))}
                            className="fw-bold"
                        />
                    </div>
                    <Button className="add-sample-btn mt-3" onClick={addSampleToList}>
                        <FaPlus className="me-1" /> Add to List
                    </Button>
                </div>

                <div className="sample-list-panel mt-3">
                    <div className="sample-list-head">
                        <span>Items List</span>
                        <span className="count-pill">{sampleItems.length} items</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Item</th>
                                    <th>Gross</th>
                                    <th>Sample</th>
                                    <th>Net</th>
                                    <th className="text-center">Ret?</th>
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sampleItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted italic">No items added yet</td>
                                    </tr>
                                ) : (
                                    sampleItems.map((s) => (
                                        <tr key={s.id}>
                                            <td>{s.seq}</td>
                                            <td className="fw-bold">{s.item}</td>
                                            <td>{s.grossWeight}g</td>
                                            <td>{s.sampleWeight}g</td>
                                            <td className="text-primary fw-bold">{s.netWeight}g</td>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="switch"
                                                    checked={s.returned}
                                                    onChange={() => {
                                                        setSampleItems(prev => prev.map(item =>
                                                            item.id === s.id ? { ...item, returned: !item.returned } : item
                                                        ));
                                                    }}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Button variant="link" className="p-0 text-danger" onClick={() => removeSample(s.id)}>
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="new-sample-footer">
                <Button variant="primary" className="save-btn" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline-secondary" className="cancel-btn" onClick={onHide} disabled={loading}>
                    Cancel
                </Button>
            </Modal.Footer>

            <NewCustomerModal
                show={showCustomerModal}
                onHide={() => setShowCustomerModal(false)}
                onSuccess={handleCustomerCreated}
            />

            <style>{`
                .new-sample-modal .modal-content {
                    border-radius: 20px;
                    border: none;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                }
                .new-sample-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem 2rem;
                    border: none;
                }
                .new-sample-header .btn-close {
                    filter: brightness(0) invert(1);
                    opacity: 0.8;
                }
                .field-label {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #374151;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }
                .required {
                    color: #ef4444;
                }
                .form-control, .input-group-text {
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e5e7eb;
                    font-weight: 500;
                }
                .form-control:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                }
                .suggestion-list {
                    position: absolute;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    margin-top: 5px;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    border: 2px solid #667eea;
                }
                .returned-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f9fafb;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-top: 1rem;
                }
                .add-sample-btn {
                    width: 100%;
                    padding: 1rem;
                    border: none;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    font-weight: 800;
                    border-radius: 12px;
                    margin-top: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.3s ease;
                }
                .add-sample-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }
                .sample-list-panel {
                    margin-top: 2rem;
                    border: 2px solid #f3f4f6;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .sample-list-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    color: #ffffff;
                    font-weight: 800;
                    background: #1f2937;
                    font-size: 1rem;
                }
                .count-pill {
                    font-size: 0.8rem;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 30px;
                    padding: 4px 12px;
                    letter-spacing: 0.05em;
                }
                .sample-list-body {
                    background: #ffffff;
                    max-height: 350px;
                    overflow-y: auto;
                }
                .empty-list {
                    padding: 3rem 1rem;
                    text-align: center;
                    color: #9ca3af;
                    font-style: italic;
                    font-weight: 500;
                }
                .sample-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    border-bottom: 1px solid #f3f4f6;
                    transition: background 0.2s;
                }
                .sample-row:hover {
                    background: #f9fafb;
                }
                .sample-title {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #111827;
                    margin-bottom: 0.2rem;
                }
                .sample-meta {
                    font-size: 0.9rem;
                    color: #6b7280;
                    font-weight: 600;
                }
                .status-badge {
                    font-size: 0.7rem;
                    margin-left: 8px;
                    padding: 4px 10px;
                    border-radius: 30px;
                    vertical-align: middle;
                    text-transform: uppercase;
                }
                .new-sample-footer {
                    padding: 1.5rem 2rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                }
                .save-btn {
                    padding: 0.9rem;
                    border: none;
                    background: #10b981;
                    font-weight: 800;
                    border-radius: 12px;
                    color: white;
                }
                .save-btn:hover {
                    background: #059669;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                }
                .cancel-btn {
                    padding: 0.9rem;
                    font-weight: 700;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    color: #374151;
                }
            `}</style>
        </Modal>
    );
};

export default NewSilverTestModal;
