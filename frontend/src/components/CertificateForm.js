import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Row, Col, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { calculateGoldItem } from '../utils/calculations';
import NewCustomerModal from './NewCustomerModal';

const emptyDraft = {
    name: '',
    item_name: '',
    weight: '',
    gross_weight: '',
    test_weight: '0',
    purity: '91.6',
    carat: '',
    rate: '',
    amount: '',
    sub_certificate_number: ''
};

const CertificateForm = ({ onSubmit, onCancel, initialData = null, forcedType = null, loading = false }) => {
    const { addToast } = useToast();
    const initialType = forcedType || (initialData?.id?.startsWith('GTS') ? 'gold' : initialData?.id?.startsWith('STS') ? 'silver' : initialData?.certificate_type || 'gold');

    const [type] = useState(initialType);
    const [includeGst] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const dropdownRef = useRef(null);

    const [sampleDraft, setSampleDraft] = useState(emptyDraft);
    const [items, setItems] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
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
        if (initialData?.customer_id && initialData.customer) {
            setSelectedCustomer({
                id: initialData.customer_id,
                name: initialData.customer.name,
                phone: initialData.customer.phone
            });
            setSearchTerm(initialData.customer.name);
        }
    }, [initialData, fetchCustomers]);

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
        setSampleDraft(prev => ({ ...prev, name: customer.name }));
    };

    const handleCustomerCreated = async (newCustomer) => {
        await fetchCustomers();
        if (newCustomer) {
            handleCustomerSelect(newCustomer);
        }
        setShowCustomerModal(false);
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
        let valid = true;
        if (type === 'gold') {
            if (!sampleDraft.item_name || !sampleDraft.gross_weight) valid = false;
        } else if (type === 'silver') {
            if (!sampleDraft.item_name || !(sampleDraft.gross_weight || sampleDraft.weight)) valid = false;
        } else {
            if (!sampleDraft.weight) valid = false;
        }

        if (!valid) {
            alert('Please fill mandatory fields for draft (Item Description and Weight).');
            return;
        }

        setItems(prev => [...prev, { ...sampleDraft, id: `${Date.now()}-${Math.random()}`, seq: prev.length + 1 }]);
        setSampleDraft({ ...emptyDraft, name: selectedCustomer?.name || '' });
    };

    const removeSample = (id) => {
        setItems(prev => prev.filter(s => s.id !== id).map((s, idx) => ({ ...s, seq: idx + 1 })));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCustomer) {
            alert('Please select a customer.');
            return;
        }
        if (items.length === 0) {
            alert('Add at least one item to list.');
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
                    item_no: item.sub_certificate_number || null,
                    item_type: item.item_name,
                    name: item.name,
                };

                if (type === 'silver') {
                    mappedItem.gross_weight = parseFloat(item.gross_weight || item.weight || 0);
                    mappedItem.test_weight = parseFloat(item.test_weight || 0);
                    mappedItem.purity = parseFloat(item.purity || 0);
                    mappedItem.item_total = parseFloat(item.amount || 0);
                } else if (type === 'photo') {
                    mappedItem.gross_weight = parseFloat(item.weight || 0);
                } else {
                    mappedItem.gross_weight = parseFloat(item.gross_weight || 0);
                    mappedItem.test_weight = parseFloat(item.test_weight || 0);
                    mappedItem.rate_per_gram = parseFloat(item.rate || 0);
                    const calc = calculateGoldItem({
                        gross_weight: mappedItem.gross_weight,
                        test_weight: mappedItem.test_weight,
                        purity: parseFloat(item.purity || 0),
                        rate_per_gram: mappedItem.rate_per_gram,
                        is_returned: false
                    });
                    mappedItem.net_weight = calc.net_weight;
                    mappedItem.fine_weight = calc.fine_weight;
                    mappedItem.item_total = calc.item_total;
                    mappedItem.purity = calc.purity;
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
        <Form onSubmit={handleSubmit} className="new-sample-modal" style={{ textAlign: 'left' }}>
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
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                            if (!e.target.value.trim()) setSelectedCustomer(null);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                    />
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
                                No customers found.{' '}<Button variant="link" size="sm" onClick={() => setShowCustomerModal(true)}>Create New?</Button>
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                )}
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="field-label">Customer Name <span className="required">*</span></Form.Label>
                <Form.Control value={customerDisplay(selectedCustomer)} readOnly />
            </Form.Group>

            <Form.Label className="field-label mb-2">Certificate Draft Entry</Form.Label>
            <div className="item-entry-card p-3 mb-3 border rounded shadow-sm bg-light">
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

                {type === 'gold' && (
                    <Row className="g-2">
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Gross Wt</Form.Label>
                            <Form.Control type="number" step="0.001" placeholder="0.000" value={sampleDraft.gross_weight} onChange={(e) => handleDraftChange('gross_weight', e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Test Wt</Form.Label>
                            <Form.Control type="number" step="0.001" placeholder="0.000" value={sampleDraft.test_weight} onChange={(e) => handleDraftChange('test_weight', e.target.value)} />
                        </Col>
                    </Row>
                )}

                {type === 'silver' && (
                    <Row className="g-2">
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Gross Wt</Form.Label>
                            <Form.Control type="number" step="0.001" placeholder="0.000" value={sampleDraft.gross_weight || sampleDraft.weight} onChange={(e) => handleDraftChange('gross_weight', e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Test Wt</Form.Label>
                            <Form.Control type="number" step="0.001" placeholder="0.000" value={sampleDraft.test_weight} onChange={(e) => handleDraftChange('test_weight', e.target.value)} />
                        </Col>
                    </Row>
                )}

                {type === 'photo' && (
                    <Row className="g-2">
                        <Col md={4}>
                            <Form.Label className="small fw-bold">Weight (g)</Form.Label>
                            <Form.Control type="number" step="0.001" placeholder="0.000" value={sampleDraft.weight} onChange={(e) => handleDraftChange('weight', e.target.value)} />
                        </Col>
                        <Col md={8}>
                            <Form.Label className="small fw-bold">Upload Item Photo (Optional)</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
                        </Col>
                    </Row>
                )}

                <Button className="add-sample-btn mt-3" onClick={addSampleToList}>
                    <FaPlus className="me-1" /> Add to List
                </Button>
            </div>

            <div className="sample-list-panel mt-3 mb-4">
                <div className="sample-list-head">
                    <span>Certificate Entries List</span>
                    <span className="count-pill">{items.length} items</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Item</th>
                                <th>Gross Wt</th>
                                {type !== 'photo' && <th>Test Wt</th>}
                                {type === 'gold' && <th>Net Wt</th>}
                                <th className="text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted italic">No items added yet</td>
                                </tr>
                            ) : (
                                items.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.seq}</td>
                                        <td className="fw-bold">{s.item_name}</td>
                                        <td>{s.gross_weight || s.weight}g</td>
                                        {type !== 'photo' && <td>{s.test_weight}g</td>}
                                        {type === 'gold' && <td>{s.net_weight || (s.gross_weight - s.test_weight).toFixed(3)}g</td>}
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

            <Row className="new-sample-footer mt-4 mx-0 pb-0 pt-3 border-top justify-content-end">
                <Col xs="auto">
                    <Button variant="outline-secondary" className="cancel-btn me-2" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" className="save-btn px-5" disabled={loading}>
                        {loading ? 'Issuing...' : 'Issue Certificate'}
                    </Button>
                </Col>
            </Row>

            <NewCustomerModal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} onSuccess={handleCustomerCreated} />

            <style>{`
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
                .field-label { font-size: 0.9rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.025em; }
                .required { color: #ef4444; }
                .form-control, .input-group-text, .form-select { border-radius: 10px; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; font-weight: 500; }
                .form-control:focus, .form-select:focus { border-color: #667eea; box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1); }
                .suggestion-list { position: absolute; left: 0; right: 0; z-index: 1000; margin-top: 5px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); border: 2px solid #667eea; }
                .add-sample-btn { width: 100%; padding: 1rem; border: none; background: linear-gradient(90deg, #667eea, #764ba2); font-weight: 800; border-radius: 12px; margin-top: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s ease; color: white;}
                .add-sample-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3); color: white; }
                .sample-list-panel { border: 2px solid #f3f4f6; border-radius: 16px; overflow: hidden; }
                .sample-list-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; color: #ffffff; font-weight: 800; background: #1f2937; font-size: 1rem; }
                .count-pill { font-size: 0.8rem; background: rgba(255, 255, 255, 0.15); border-radius: 30px; padding: 4px 12px; letter-spacing: 0.05em; }
                .save-btn { padding: 0.9rem; border: none; background: #10b981; font-weight: 800; border-radius: 12px; color: white; }
                .save-btn:hover { background: #059669; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                .cancel-btn { padding: 0.9rem; font-weight: 700; border-radius: 12px; border: 2px solid #e5e7eb; color: #374151; }
            `}</style>
        </Form>
    );
};

export default CertificateForm;
