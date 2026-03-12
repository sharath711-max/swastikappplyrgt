import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import api from '../services/api';
import { calculateGoldItem } from '../utils/calculations';

const GoldCertificateItemForm = ({ certificateId, onItemAdded }) => {
    const [formData, setFormData] = useState({
        gross_weight: '',
        test_weight: '',
        purity: '91.6', // Default 22K purity
        rate_per_gram: '',
        item_name: '',
        sub_certificate_number: '',
        certificate_required: true,
        is_returned: false
    });

    const [preview, setPreview] = useState({
        net_weight: 0,
        fine_weight: 0,
        item_total: 0,
        isValid: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverResponse, setServerResponse] = useState(null);

    // Real-time preview effect
    useEffect(() => {
        const result = calculateGoldItem({
            gross_weight: formData.gross_weight,
            test_weight: formData.test_weight,
            purity: formData.purity,
            rate_per_gram: formData.rate_per_gram,
            is_returned: formData.is_returned
        });
        setPreview(result);
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setServerResponse(null);

        try {
            // Prepare payload - ONLY raw inputs as backend is authoritative
            const payload = {
                gross_weight: parseFloat(formData.gross_weight),
                test_weight: parseFloat(formData.test_weight || 0),
                purity: parseFloat(formData.purity),
                rate_per_gram: parseFloat(formData.rate_per_gram),
                item_name: formData.item_name.trim(),
                sub_certificate_number: formData.sub_certificate_number.trim() || null,
                certificate_required: formData.certificate_required,
                is_returned: formData.is_returned
            };

            const response = await api.post(`/certificates/${certificateId}/items`, payload);

            if (response.data.success) {
                setServerResponse({
                    type: 'success',
                    message: 'Item added successfully!',
                    data: response.data.data
                });

                // Reset form (except rate if they are adding multiple items)
                setFormData(prev => ({
                    ...prev,
                    gross_weight: '',
                    test_weight: '',
                    item_name: '',
                    sub_certificate_number: '',
                    is_returned: false
                }));

                if (onItemAdded) {
                    onItemAdded(response.data.data);
                }
            } else {
                setServerResponse({
                    type: 'danger',
                    message: response.data.message || 'Failed to add item',
                    details: response.data.details
                });
            }
        } catch (error) {
            setServerResponse({
                type: 'danger',
                message: error.response?.data?.message || 'Network error. Please try again.',
                details: error.response?.data?.details
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-sm border-0 mb-4" style={{ borderTop: '4px solid #0176d3' }}>
            <Card.Body>
                <Card.Title className="mb-3 d-flex justify-content-between align-items-center" style={{ color: '#0176d3' }}>
                    <span>Add Gold Item</span>
                    <Badge bg="info" className="fw-normal" style={{ fontSize: '0.7rem' }}>Authorized Calculation</Badge>
                </Card.Title>

                {/* Real-time Preview Panel */}
                <div className="bg-light p-3 rounded mb-4 border d-flex justify-content-between align-items-center">
                    <div className="text-center px-2">
                        <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Net Wt</div>
                        <div className="fw-bold fs-5 text-primary">{preview.net_weight.toFixed(3)}g</div>
                    </div>
                    <div className="text-center px-2 border-start border-end">
                        <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Fine Wt</div>
                        <div className="fw-bold fs-5 text-success">{preview.fine_weight.toFixed(3)}g</div>
                    </div>
                    <div className="text-center px-2">
                        <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Item Total</div>
                        <div className="fw-bold fs-5 text-dark">₹{preview.item_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                {serverResponse && (
                    <Alert variant={serverResponse.type} dismissible onClose={() => setServerResponse(null)} className="py-2">
                        <div className="small fw-bold">{serverResponse.message}</div>
                        {serverResponse.details && (
                            <div className="x-small mt-1">{Array.isArray(serverResponse.details) ? serverResponse.details.join(', ') : serverResponse.details}</div>
                        )}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-uppercase text-muted">Item Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    value={formData.item_name}
                                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                                    placeholder="e.g., Ring, Chain"
                                    required
                                    disabled={isSubmitting}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-uppercase text-muted">Gross Wt (g) *</Form.Label>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    step="0.001"
                                    min="0.001"
                                    value={formData.gross_weight}
                                    onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                                    placeholder="0.000"
                                    required
                                    disabled={isSubmitting}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-uppercase text-muted">Test Wt (g)</Form.Label>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    step="0.001"
                                    min="0"
                                    value={formData.test_weight}
                                    onChange={(e) => setFormData({ ...formData, test_weight: e.target.value })}
                                    placeholder="0.000"
                                    disabled={isSubmitting}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-uppercase text-muted">Purity (%) *</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={formData.purity}
                                    onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                                    disabled={isSubmitting}
                                >
                                    <option value="91.6">22K - 91.6%</option>
                                    <option value="99.9">24K - 99.9%</option>
                                    <option value="75">18K - 75%</option>
                                    <option value="58.3">14K - 58.3%</option>
                                    <option value="41.7">10K - 41.7%</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-uppercase text-muted">Rate (₹/g) *</Form.Label>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.rate_per_gram}
                                    onChange={(e) => setFormData({ ...formData, rate_per_gram: e.target.value })}
                                    placeholder="0.00"
                                    required
                                    disabled={isSubmitting}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12} className="d-flex justify-content-between align-items-center pt-2">
                            <Form.Check
                                type="checkbox"
                                id="cert-req"
                                label={<span className="x-small fw-bold text-uppercase text-muted">Cert Required</span>}
                                checked={formData.certificate_required}
                                onChange={(e) => setFormData({ ...formData, certificate_required: e.target.checked })}
                                disabled={isSubmitting}
                            />

                            <Form.Check
                                type="switch"
                                id="is-returned"
                                label={<span className="x-small fw-bold text-uppercase text-muted">Returned</span>}
                                checked={formData.is_returned}
                                onChange={(e) => setFormData({ ...formData, is_returned: e.target.checked })}
                                disabled={isSubmitting}
                                className="text-danger"
                            />
                        </Col>
                    </Row>
                    <Button
                        variant="primary"
                        type="submit"
                        size="sm"
                        className="w-100 mt-4 py-2 fw-bold text-uppercase"
                        disabled={isSubmitting || !preview.isValid}
                        style={{ backgroundColor: '#0176d3', borderColor: '#0176d3', letterSpacing: '0.5px' }}
                    >
                        {isSubmitting ? 'Processing...' : 'Add Gold Item'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default GoldCertificateItemForm;
