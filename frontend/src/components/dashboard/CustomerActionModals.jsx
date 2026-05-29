import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useSafeModalClose from '../../hooks/useSafeModalClose';
import CustomerCombobox from '../customer/CustomerCombobox';

// Operator-supplied audit-type taxonomy. Per spec, dashboard captures
// the operator's intent rather than hardcoding 'CREDIT'. Backend schema
// expansion is a separate ticket — until it lands, posts with values
// other than CREDIT will return 400 and the toast will display the
// backend's error. Intentional: the dashboard ships ready, the backend
// ticket can land independently.
const CREDIT_TYPES = [
    { value: 'CREDIT',            label: 'Customer Advance / Credit' },
    { value: 'ADJUSTMENT',        label: 'Adjustment' },
    { value: 'SETTLEMENT',        label: 'Settlement' },
    { value: 'REFUND',            label: 'Refund' },
    { value: 'MANUAL_CORRECTION', label: 'Manual Correction' },
];

const PAYMENT_MODES_CREDIT  = ['cash', 'upi', 'balance'];
const PAYMENT_MODES_EXPENSE = ['cash', 'upi'];

export function CustomerCreditModal({ show, onHide, onSuccess }) {
    const { addToast } = useToast();
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount]         = useState('');
    const [mode, setMode]             = useState('cash');
    const [type, setType]             = useState('CREDIT');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const resetTransientState = () => {
        setCustomerId(''); setAmount(''); setMode('cash');
        setType('CREDIT'); setDescription(''); setSubmitting(false);
    };

    const { safeClose, mountedRef } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose({ reset: resetTransientState });

    useEffect(() => {
        if (show) resetTransientState();
    }, [show]);

    const submit = async (e) => {
        e.preventDefault();
        if (!customerId || !amount) {
            addToast('Customer and amount are required', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/credit-history', {
                customer_id: customerId,
                amount: parseFloat(amount),
                mode_of_payment: mode,
                type,
                description: description.trim() || CREDIT_TYPES.find((t) => t.value === type)?.label,
            });
            if (!mountedRef.current) return;
            addToast('Credit recorded', 'success');
            onSuccess?.();
            closeSafely();
        } catch (err) {
            if (!mountedRef.current) return;
            addToast(err?.response?.data?.error || err.message, 'error');
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={closeSafely} centered size="lg" contentClassName="cam-modal">
            <Modal.Header closeButton>
                <Modal.Title className="cam-title">Customer Credit</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={submit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="cam-label">Customer</Form.Label>
                        <CustomerCombobox value={customerId} onChange={setCustomerId} autoFocus />
                    </Form.Group>

                    <div className="cam-row">
                        <Form.Group className="mb-3">
                            <Form.Label className="cam-label">Amount (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                size="lg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="cam-label">Mode of Payment</Form.Label>
                            <Form.Select value={mode} onChange={(e) => setMode(e.target.value)} size="lg">
                                {PAYMENT_MODES_CREDIT.map((m) => (
                                    <option key={m} value={m}>{m.toUpperCase()}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="cam-label">Audit Type</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)} size="lg">
                            {CREDIT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Choose the operator intent. Recorded to the audit ledger; cannot be edited later.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="cam-label">Description (optional)</Form.Label>
                        <Form.Control
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Free-text note for the audit entry"
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button type="submit" size="lg" variant="primary" disabled={submitting}>
                            {submitting ? <Spinner animation="border" size="sm" /> : 'Record Credit'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export function WeightLossModal({ show, onHide, onSuccess }) {
    const { addToast } = useToast();
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount]         = useState('');
    const [mode, setMode]             = useState('cash');
    const [reason, setReason]         = useState('');
    const [submitting, setSubmitting] = useState(false);

    const resetTransientState = () => {
        setCustomerId(''); setAmount(''); setMode('cash'); setReason(''); setSubmitting(false);
    };

    const { safeClose, mountedRef } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose({ reset: resetTransientState });

    useEffect(() => {
        if (show) resetTransientState();
    }, [show]);

    const submit = async (e) => {
        e.preventDefault();
        if (!customerId || !amount) {
            addToast('Customer and amount are required', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/weight-loss', {
                customer_id: customerId,
                amount: parseFloat(amount),
                mode_of_payment: mode,
                reason: reason.trim() || 'Weight loss',
            });
            if (!mountedRef.current) return;
            addToast('Weight loss recorded', 'success');
            onSuccess?.();
            closeSafely();
        } catch (err) {
            if (!mountedRef.current) return;
            addToast(err?.response?.data?.error || err.message, 'error');
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={closeSafely} centered size="lg" contentClassName="cam-modal">
            <Modal.Header closeButton>
                <Modal.Title className="cam-title">Weight Loss</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={submit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="cam-label">Customer</Form.Label>
                        <CustomerCombobox value={customerId} onChange={setCustomerId} autoFocus />
                    </Form.Group>

                    <div className="cam-row">
                        <Form.Group className="mb-3">
                            <Form.Label className="cam-label">Amount (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                size="lg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="cam-label">Mode of Payment</Form.Label>
                            <Form.Select value={mode} onChange={(e) => setMode(e.target.value)} size="lg">
                                {PAYMENT_MODES_EXPENSE.map((m) => (
                                    <option key={m} value={m}>{m.toUpperCase()}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="cam-label">Reason</Form.Label>
                        <Form.Control
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Gold test weight loss"
                            size="lg"
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button type="submit" size="lg" variant="danger" disabled={submitting}>
                            {submitting ? <Spinner animation="border" size="sm" /> : 'Record Weight Loss'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
