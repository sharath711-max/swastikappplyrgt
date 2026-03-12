import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FaSave, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const NewCreditHistoryModal = ({ show, onHide, customerId, onSuccess }) => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        amount: '',
        type: 'CREDIT',
        mode_of_payment: 'Cash',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let localErrors = {};
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            localErrors.amount = true;
        }
        if (!formData.description) {
            localErrors.description = true;
        }

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            addToast('Please correct the highlighted fields', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/credit-history', {
                ...formData,
                customer_id: customerId
            });
            addToast('Transaction recorded successfully', 'success');
            onSuccess();
            onHide();
            // Reset form
            setFormData({
                amount: '',
                type: 'CREDIT',
                mode_of_payment: 'Cash',
                description: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error recording transaction:', error);
            addToast(error.response?.data?.error || 'Failed to record transaction', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="fw-bold text-primary">
                    <FaMoneyBillWave className="me-2" /> New Financial Transaction
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold small text-muted text-uppercase">Transaction Type</Form.Label>
                                <div className="d-flex gap-3 mt-1">
                                    <Form.Check
                                        type="radio"
                                        label="CREDIT (Payment Received / Jama)"
                                        name="type"
                                        value="CREDIT"
                                        checked={formData.type === 'CREDIT'}
                                        onChange={handleChange}
                                        id="type-credit"
                                        className="fw-medium text-success"
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="DEBIT (Billed / Udhaar)"
                                        name="type"
                                        value="DEBIT"
                                        checked={formData.type === 'DEBIT'}
                                        onChange={handleChange}
                                        id="type-debit"
                                        className="fw-medium text-danger"
                                    />
                                </div>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="amount">
                                <Form.Label className="fw-semibold small text-muted text-uppercase">Amount (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    isInvalid={errors.amount}
                                    className="form-control-lg fw-bold"
                                />
                                <Form.Control.Feedback type="invalid">Valid amount required</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="mode_of_payment">
                                <Form.Label className="fw-semibold small text-muted text-uppercase">Payment Mode</Form.Label>
                                <Form.Select
                                    name="mode_of_payment"
                                    value={formData.mode_of_payment}
                                    onChange={handleChange}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI / GPay</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group controlId="description">
                                <Form.Label className="fw-semibold small text-muted text-uppercase">Description / Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter details about this transaction..."
                                    required
                                    isInvalid={errors.description}
                                />
                                <Form.Control.Feedback type="invalid">Description is required</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="mt-4 p-3 bg-light rounded border">
                        <small className="text-muted d-block mb-1">Impact Analysis:</small>
                        {formData.type === 'CREDIT' ? (
                            <span className="text-success fw-bold">This will REDUCE the customer's outstanding balance.</span>
                        ) : (
                            <span className="text-danger fw-bold">This will INCREASE the customer's outstanding balance.</span>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light border-top-0">
                    <Button variant="link" className="text-muted text-decoration-none" onClick={onHide} disabled={loading}>
                        <FaTimes className="me-1" /> Cancel
                    </Button>
                    <Button variant="primary" type="submit" className="px-4 fw-bold shadow-sm" disabled={loading}>
                        {loading ? <><Spinner size="sm" className="me-2" /> Saving...</> : <><FaSave className="me-1" /> Save Transaction</>}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default NewCreditHistoryModal;
