import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Button, Table, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaTruck, FaSave, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const getWeights = (item) => {
    const total = Number(item.sample_weight || 0);
    const sample = Number(item.test_weight || 0);
    const normalizedSample = Number.isFinite(sample) && sample > 0 ? sample : total;
    const net = Math.max(0, total - normalizedSample);
    return { sample: normalizedSample, total, net };
};

const PaymentDeliveryModal = ({ show, onHide, testId, onSuccess }) => {
    const { addToast } = useToast();
    const [test, setTest] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [modeOfPayment, setModeOfPayment] = useState('Cash');
    const [paymentAmount, setPaymentAmount] = useState('');

    const fetchDetails = useCallback(async () => {
        if (!testId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/gold-tests/${testId}`);
            if (res.data.success) {
                const nextTest = res.data.data;
                setTest(nextTest);
                setItems(nextTest.items || []);
                setModeOfPayment(nextTest.mode_of_payment || 'Cash');
                setPaymentAmount(String(Number(nextTest.total || 0).toFixed(2)));
            }
        } catch (_error) {
            setError('Failed to load test details.');
        } finally {
            setLoading(false);
        }
    }, [testId]);

    useEffect(() => {
        if (show && testId) {
            fetchDetails();
        }
    }, [show, testId, fetchDetails]);

    const itemWeights = useMemo(() => items.map(getWeights), [items]);

    const itemsValid = useMemo(() => items.every((item) => {
        const p = Number(item.purity);
        return Number.isFinite(p) && p > 0 && p <= 100;
    }), [items]);

    const paymentValid = useMemo(() => {
        const amountNum = Number(paymentAmount);
        return Number.isFinite(amountNum) && !!modeOfPayment;
    }, [paymentAmount, modeOfPayment]);

    const payloadItems = useMemo(() => items.map((i) => ({
        id: i.id,
        purity: Number(i.purity),
        returned: !!i.returned,
        certificate_required: !!i.certificate_required
    })), [items]);

    const buildResultsPayload = useCallback(() => ({
        items: payloadItems,
        mode_of_payment: modeOfPayment,
        total: Number(paymentAmount)
    }), [payloadItems, modeOfPayment, paymentAmount]);

    const handleItemChange = useCallback((index, field, value) => {
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }, []);

    const normalizeAmountOnBlur = useCallback(() => {
        const amountNum = Number(paymentAmount);
        if (!Number.isFinite(amountNum)) return;
        setPaymentAmount(amountNum.toFixed(2));
    }, [paymentAmount]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        if (!itemsValid) {
            addToast('Please ensure all items have valid purity (0-100%).', 'error');
            return;
        }
        if (!paymentValid) {
            addToast('Please enter valid payment details.', 'error');
            return;
        }


        setSaving(true);
        try {
            await api.post(`/gold-tests/${testId}/results`, buildResultsPayload());
            addToast('Payment details saved in Tested status.', 'success');
            if (onSuccess) onSuccess();
            onHide();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to save payment details', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!itemsValid) {
            addToast('Please ensure all items have valid purity (0-100%).', 'error');
            return;
        }
        if (!paymentValid) {
            addToast('Please enter valid payment details.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/gold-tests/${testId}/results`, buildResultsPayload());
            await api.post(`/gold-tests/${testId}/finalize`, {
                items: payloadItems,
                mode_of_payment: modeOfPayment,
                weight_loss: 0
            });
            addToast('Payment submitted. Card moved to Completed.', 'success');
            if (onSuccess) onSuccess();
            onHide();
        } catch (err) {
            addToast(err.response?.data?.error || 'Delivery failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} className="payment-delivery-modal" centered>
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '1.5rem 2rem' }}>
                <Modal.Title className="fw-bold">
                    <FaTruck className="me-2 text-white" />
                    Finalize & Payment
                    <span className="ms-2 opacity-75 h6 mb-0">({test.id})</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {loading || !test ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : (
                    <>
                        <div className="p-4 border-bottom" style={{ background: '#f8fafc' }}>
                            <Row className="g-4">
                                <Col md={4}>
                                    <div className="text-muted fw-bold small mb-1">CUSTOMER</div>
                                    <div className="h5 fw-bold text-dark mb-0">{test.customer_name}</div>
                                </Col>
                                <Col md={4}>
                                    <div className="text-muted fw-bold small mb-1">DATE</div>
                                    <div className="fw-bold text-dark">{new Date(test.created_at).toLocaleDateString()}</div>
                                </Col>
                                <Col md={4} className="text-md-end">
                                    <div className="text-muted fw-bold small mb-1">SAMPLE COUNT</div>
                                    <div className="h4 fw-bold text-primary mb-0">{items.length}</div>
                                </Col>
                            </Row>
                        </div>

                        {error && (
                            <Alert variant="danger" className="m-4 py-3 rounded-4">
                                {error}
                            </Alert>
                        )}

                        <div className="p-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            <h6 className="mb-3 text-secondary border-bottom pb-2 fw-bold uppercase">Item Purity Verification</h6>
                            <Table borderless hover className="align-middle mb-0">
                                <thead>
                                    <tr className="text-muted small uppercase fw-bold" style={{ letterSpacing: '0.05em' }}>
                                        <th style={{ width: '8%' }}>Seq</th>
                                        <th style={{ width: '30%' }}>Item</th>
                                        <th>Weights (g)</th>
                                        <th style={{ width: '18%' }}>Purity %</th>
                                        <th className="text-center">Return</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-bottom">
                                            <td className="py-3 fw-bold text-muted">{idx + 1}</td>
                                            <td className="py-3">
                                                <div className="fw-bold text-dark">{item.item_type}</div>
                                                <small className="text-muted fw-semibold">{item.item_no || item.item_number || '-'}</small>
                                            </td>
                                            <td className="py-3">
                                                <div className="small fw-semibold text-muted">S: {itemWeights[idx].sample} | T: {itemWeights[idx].total}</div>
                                                <div className="fw-bold text-dark">NET: {itemWeights[idx].net}g</div>
                                            </td>
                                            <td className="py-3">
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    value={item.purity}
                                                    onChange={(e) => handleItemChange(idx, 'purity', e.target.value)}
                                                    isInvalid={Number(item.purity) <= 0 || Number(item.purity) > 100}
                                                    step="0.01"
                                                    style={{ borderRadius: '8px', fontWeight: 700 }}
                                                />
                                            </td>
                                            <td className="text-center py-3">
                                                <Form.Check
                                                    checked={!!item.returned}
                                                    onChange={(e) => handleItemChange(idx, 'returned', e.target.checked)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light p-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                <Row className="w-100 align-items-center g-3">
                    <Col md={3}>
                        <Form.Label className="small fw-bold text-muted uppercase">Final Amount</Form.Label>
                        <Form.Control
                            size="lg"
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            onBlur={normalizeAmountOnBlur}
                            style={{ borderRadius: '12px', fontWeight: 800, border: '2px solid #e2e8f0' }}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label className="small fw-bold text-muted uppercase">Payment Mode</Form.Label>
                        <Form.Select
                            size="lg"
                            value={modeOfPayment}
                            onChange={(e) => setModeOfPayment(e.target.value)}
                            style={{ borderRadius: '12px', fontWeight: 700, border: '2px solid #e2e8f0' }}
                        >
                            <option value="Cash">Cash Payment</option>
                            <option value="UPI">UPI / Online</option>
                            <option value="Balance">Bank Balance</option>
                        </Form.Select>
                    </Col>
                    <Col md={6} className="text-end d-flex justify-content-end gap-3 mt-4 mt-md-0">
                        <Button
                            variant="secondary"
                            onClick={handleSave}
                            disabled={loading || saving || submitting || !itemsValid}
                            className="px-4 py-2 fw-bold"
                            style={{ borderRadius: '12px' }}
                        >
                            {saving ? <Spinner size="sm" animation="border" /> : <><FaSave className="me-2" />Save Draft</>}
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleSubmit}
                            disabled={loading || submitting || saving || !itemsValid}
                            className="px-5 py-2 fw-bold"
                            style={{ borderRadius: '12px', background: '#10b981', border: 'none' }}
                        >
                            {submitting ? <Spinner size="sm" animation="border" /> : <><FaCheckCircle className="me-2" />Finalize & Move</>}
                        </Button>
                    </Col>
                </Row>
            </Modal.Footer>
            <style>{`
                .payment-delivery-modal .modal-content {
                    border-radius: 24px;
                    border: none;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                }
                .payment-delivery-modal .modal-header .btn-close {
                    filter: brightness(0) invert(1);
                    opacity: 0.8;
                }
            `}</style>
        </Modal>
    );
};

export default React.memo(PaymentDeliveryModal);
