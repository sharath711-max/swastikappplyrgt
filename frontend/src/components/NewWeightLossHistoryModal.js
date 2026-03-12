import React from 'react';
import { Modal, Button, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { FaBalanceScale } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const NewWeightLossHistoryModal = ({ show, onHide, customerId, onSuccess, initialAmount = '', initialReason = '' }) => {
    const { addToast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState({});
    const [formData, setFormData] = React.useState({
        amount: initialAmount,
        reason: initialReason
    });

    React.useEffect(() => {
        if (show) {
            setFormData({
                amount: initialAmount,
                reason: initialReason
            });
        }
    }, [show, initialAmount, initialReason]);

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
        if (!formData.reason) {
            localErrors.reason = true;
        }

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            addToast('Please correct the highlighted fields', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/weight-loss', {
                ...formData,
                customer_id: customerId
            });
            addToast('Weight loss recorded successfully', 'success');
            onSuccess();
            onHide();
            // Reset form
            setFormData({
                amount: '',
                reason: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error recording weight loss:', error);
            addToast(error.response?.data?.error || 'Failed to record weight loss', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" className="wlh-audit-modal shadow-lg">
            <Modal.Header closeButton className="bg-gradient border-0" style={{ backgroundColor: '#2c3e50', color: '#f39c12' }}>
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <FaBalanceScale size={24} />
                    Weight Loss Equivalent Audit
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit} noValidate>
                <Modal.Body className="p-4 bg-light">
                    <div className="mb-4">
                        <p className="text-muted mb-0">Record the monetary equivalent for material loss. This charge will be appended to the customer's history.</p>
                    </div>
                    <Row className="g-4">
                        <Col md={12}>
                            <Form.Group controlId="amount">
                                <Form.Label className="fw-bold small text-secondary text-uppercase mb-2">Equivalent Charge Amount</Form.Label>
                                <InputGroup size="lg" className="shadow-sm">
                                    <InputGroup.Text className="bg-white border-end-0 text-success fw-bold">₹</InputGroup.Text>
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
                                        className="fw-bold text-dark border-start-0 ps-0 form-control-lg"
                                        style={{ fontSize: '1.25rem' }}
                                    />
                                    <Form.Control.Feedback type="invalid">Valid amount required</Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group controlId="reason">
                                <Form.Label className="fw-bold small text-secondary text-uppercase mb-2">Loss Description / Remarks</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    placeholder="E.g., Handling loss during refining, Spillage compensation"
                                    required
                                    isInvalid={errors.reason}
                                    className="shadow-sm border-light"
                                />
                                <Form.Control.Feedback type="invalid">A descriptive reason is required</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
                        <small className="text-dark d-block">
                            <i className="fas fa-info-circle me-1"></i>
                            Recorded amounts are strictly <strong>append-only</strong> and serve as a permanent financial audit trail for material discrepancies.
                        </small>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 bg-white px-4 py-3">
                    <Button variant="light" onClick={onHide} className="px-4 fw-semibold text-secondary shadow-sm">
                        Cancel
                    </Button>
                    <Button variant="warning" type="submit" disabled={loading} className="px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                        {loading && <Spinner animation="border" size="sm" />}
                        Confirm Charge
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default NewWeightLossHistoryModal;
