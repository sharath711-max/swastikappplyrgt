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
const PAYMENT_MODES_EXPENSE = ['cash', 'upi'];

export function CustomerCreditModal({ show, onHide, onSuccess }) {
    const { addToast } = useToast();
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount]         = useState('');
    const [mode, setMode]             = useState('Cash');
    const [transactionType, setTransactionType] = useState('DEPOSIT');
    const [type, setType]             = useState('CREDIT');
    const [description, setDescription] = useState('[DEPOSIT] ');
    const [submitting, setSubmitting] = useState(false);

    const resetTransientState = () => {
        setCustomerId('');
        setAmount('');
        setMode('Cash');
        setTransactionType('DEPOSIT');
        setType('CREDIT');
        setDescription('[DEPOSIT] ');
        setSubmitting(false);
    };

    const { safeClose, mountedRef } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose({ reset: resetTransientState });

    useEffect(() => {
        if (show) resetTransientState();
    }, [show]);

    const submit = async (e) => {
        e.preventDefault();
        if (!customerId) {
            addToast('Please select a customer', 'error');
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            addToast('Please enter a valid positive amount', 'error');
            return;
        }
        if (!description || !description.trim()) {
            addToast('Description is required', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/credit-history', {
                customer_id: customerId,
                amount: parsedAmount,
                mode_of_payment: mode,
                type,
                description: description.trim(),
            });
            if (!mountedRef.current) return;
            addToast('Transaction recorded successfully', 'success');
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
                <Modal.Title className="cam-title">New Financial Transaction</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={submit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="cam-label">Customer</Form.Label>
                        <CustomerCombobox value={customerId} onChange={setCustomerId} autoFocus />
                    </Form.Group>

                    <div className="cam-row">
                        <Form.Group className="mb-3 w-50">
                            <Form.Label className="cam-label">Transaction Type</Form.Label>
                            <Form.Select
                                value={transactionType}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setTransactionType(val);
                                    let mappedType = type;
                                    if (val === 'DEPOSIT' || val === 'SETTLEMENT' || val === 'DISCOUNT') {
                                        mappedType = 'CREDIT';
                                    }
                                    setType(mappedType);
                                    let desc = description;
                                    if (!description || (description.startsWith('[') && description.includes(']'))) {
                                        desc = `[${val}] `;
                                    }
                                    setDescription(desc);
                                }}
                                size="lg"
                            >
                                <option value="DEPOSIT">DEPOSIT (Payment Received / Jama)</option>
                                <option value="CORRECTION">CORRECTION (Adjustment)</option>
                                <option value="SETTLEMENT">SETTLEMENT (Account Settlement)</option>
                                <option value="DISCOUNT">DISCOUNT (Waiver / Discount)</option>
                            </Form.Select>
                        </Form.Group>

                        {transactionType === 'CORRECTION' ? (
                            <Form.Group className="mb-3 w-50">
                                <Form.Label className="cam-label">Adjustment Direction</Form.Label>
                                <div className="d-flex gap-3 mt-2">
                                    <Form.Check
                                        type="radio"
                                        label="CREDIT (Reduce Balance)"
                                        name="type"
                                        value="CREDIT"
                                        checked={type === 'CREDIT'}
                                        onChange={(e) => setType(e.target.value)}
                                        id="type-credit-dashboard"
                                        className="fw-medium text-success"
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="DEBIT (Increase Balance)"
                                        name="type"
                                        value="DEBIT"
                                        checked={type === 'DEBIT'}
                                        onChange={(e) => setType(e.target.value)}
                                        id="type-debit-dashboard"
                                        className="fw-medium text-danger"
                                    />
                                </div>
                            </Form.Group>
                        ) : null}
                    </div>

                    <div className="cam-row">
                        <Form.Group className="mb-3 w-50">
                            <Form.Label className="cam-label">Amount (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                size="lg"
                                placeholder="0.00"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3 w-50">
                            <Form.Label className="cam-label">Mode of Payment</Form.Label>
                            <Form.Select value={mode} onChange={(e) => setMode(e.target.value)} size="lg">
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="cam-label">Description / Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter details about this transaction..."
                            required
                        />
                    </Form.Group>

                    <div className="mt-3 mb-3 p-3 bg-light rounded border">
                        <small className="text-muted d-block mb-1">Impact Analysis:</small>
                        {type === 'CREDIT' ? (
                            <span className="text-success fw-bold">This will REDUCE the customer's outstanding balance.</span>
                        ) : (
                            <span className="text-danger fw-bold">This will INCREASE the customer's outstanding balance.</span>
                        )}
                    </div>

                    <div className="d-grid">
                        <Button type="submit" size="lg" variant="primary" disabled={submitting}>
                            {submitting ? <Spinner animation="border" size="sm" /> : 'Record Transaction'}
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
