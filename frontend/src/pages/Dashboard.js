import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Alert, Modal, Form, Button } from 'react-bootstrap';
import api from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../contexts/ToastContext';

const fmt   = (val) => Number(val || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const fmtN  = (val) => Number(val || 0).toLocaleString('en-IN');
const fmtD  = (d)   => d ? new Date(d).toLocaleDateString() : 'N/A';
const getVariant = (s) => ({ DONE: 'success', IN_PROGRESS: 'info', TODO: 'secondary' }[s] || 'primary');

// ── Clickable stat card ───────────────────────────────────────────────────────
function StatCard({ title, value, color, onClick }) {
    return (
        <Card
            className="shadow-sm border-0 mb-4"
            style={{ borderLeft: `4px solid var(--bs-${color})`, cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        >
            <Card.Body>
                <h6 className="text-muted text-uppercase mb-2 fw-bold" style={{ fontSize: '0.72rem' }}>{title}</h6>
                <h3 className={`fw-bold text-${color} mb-0`} style={{ fontSize: '1.3rem' }}>{value}</h3>
                {onClick && <small className="text-muted" style={{ fontSize: '0.68rem' }}>Click for breakdown</small>}
            </Card.Body>
        </Card>
    );
}

// ── Revenue breakdown modal ───────────────────────────────────────────────────
function RevenueBreakdownModal({ show, onHide, scope }) {
    const { addToast } = useToast();
    const fetchBreakdown = useCallback(() => api.get('/analytics/revenue-breakdown').then(r => r.data?.data), []);
    const { data, loading } = useFetch(fetchBreakdown);

    const d = data?.[scope];
    const title = scope === 'today' ? 'Today\'s Revenue Breakdown' : 'All-Time Revenue Breakdown';

    return (
        <Modal show={show} onHide={onHide} centered size="sm">
            <Modal.Header closeButton><Modal.Title style={{ fontSize: '1rem' }}>{title}</Modal.Title></Modal.Header>
            <Modal.Body>
                {loading ? <div className="text-center py-3"><Spinner animation="border" size="sm" /></div> : d && (
                    <>
                        <h6 className="text-success fw-bold mb-2">Revenue</h6>
                        <Table size="sm" className="mb-3">
                            <tbody>
                                <tr><td>Cash</td><td className="text-end fw-semibold">{fmt(d.revenue.cash)}</td></tr>
                                <tr><td>UPI</td><td className="text-end fw-semibold">{fmt(d.revenue.upi)}</td></tr>
                                <tr><td>Balance</td><td className="text-end fw-semibold">{fmt(d.revenue.balance)}</td></tr>
                                <tr className="table-success"><td><strong>Total</strong></td><td className="text-end fw-bold">{fmt(d.revenue.total)}</td></tr>
                            </tbody>
                        </Table>
                        <h6 className="text-danger fw-bold mb-2">Expense</h6>
                        <Table size="sm" className="mb-3">
                            <tbody>
                                <tr><td>Weight Loss</td><td className="text-end fw-semibold">{fmt(d.expense.weight_loss)}</td></tr>
                                <tr><td>Other</td><td className="text-end fw-semibold">{fmt(d.expense.total - d.expense.weight_loss)}</td></tr>
                                <tr className="table-danger"><td><strong>Total</strong></td><td className="text-end fw-bold">{fmt(d.expense.total)}</td></tr>
                            </tbody>
                        </Table>
                        {scope === 'allTime' && (
                            <div className="mb-2">
                                <span className="text-muted small">Cash in Hand: </span>
                                <strong>{fmt(d.cashInHand)}</strong>
                            </div>
                        )}
                        <div className={`p-2 rounded text-center fw-bold ${d.pnl >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                            P&L: {fmt(d.pnl)}
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}

// ── Customer credit quick-action modal ────────────────────────────────────────
function CustomerActionModal({ show, onHide, actionType }) {
    const { addToast } = useToast();
    const [customers,   setCustomers]   = useState([]);
    const [customerId,  setCustomerId]  = useState('');
    const [amount,      setAmount]      = useState('');
    const [mode,        setMode]        = useState('cash');
    const [reason,      setReason]      = useState('');
    const [submitting,  setSubmitting]  = useState(false);

    useEffect(() => {
        if (!show) return;
        api.get('/customers').then(r => setCustomers(r.data?.data ?? r.data ?? [])).catch(() => {});
        setCustomerId(''); setAmount(''); setMode('cash'); setReason('');
    }, [show]);

    const isCredit = actionType === 'credit';
    const title    = isCredit ? 'Customer Credit' : 'Weight Loss Entry';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerId || !amount) { addToast('Customer and amount are required', 'error'); return; }
        setSubmitting(true);
        try {
            if (isCredit) {
                await api.post('/credit-history', {
                    customer_id: customerId, amount: parseFloat(amount),
                    mode_of_payment: mode, type: 'CREDIT', description: 'Manual credit from dashboard',
                });
            } else {
                await api.post('/weight-loss', {
                    customer_id: customerId, amount: parseFloat(amount),
                    mode_of_payment: mode, reason: reason || 'Weight loss',
                });
            }
            addToast(`${title} recorded successfully`, 'success');
            onHide();
        } catch (err) {
            addToast(err?.response?.data?.error || err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const selected = customers.find(c => c.id === customerId);

    return (
        <Modal show={show} onHide={onHide} centered size="sm">
            <Modal.Header closeButton><Modal.Title style={{ fontSize: '1rem' }}>{title}</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">Customer</Form.Label>
                        <Form.Select size="sm" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                            <option value="">Select customer…</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} — ₹{c.balance}</option>)}
                        </Form.Select>
                        {selected && <small className="text-muted">Balance: {fmt(selected.balance)}</small>}
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">Amount (₹)</Form.Label>
                        <Form.Control size="sm" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">Mode</Form.Label>
                        <Form.Select size="sm" value={mode} onChange={e => setMode(e.target.value)}>
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                            <option value="balance">Balance</option>
                        </Form.Select>
                    </Form.Group>
                    {!isCredit && (
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-semibold">Reason</Form.Label>
                            <Form.Control size="sm" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Gold test weight loss" />
                        </Form.Group>
                    )}
                    <div className="d-grid mt-3">
                        <Button size="sm" type="submit" variant="primary" disabled={submitting}>
                            {submitting ? <Spinner size="sm" animation="border" /> : `Save ${title}`}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

// ── Recent table ──────────────────────────────────────────────────────────────
function RecentTable({ title, data, columns }) {
    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-0 pt-3 pb-0"><h6 className="fw-bold">{title}</h6></Card.Header>
            <Card.Body className="p-0">
                <Table responsive hover className="mb-0 small">
                    <thead className="text-muted">
                        <tr>{columns.map(c => <th key={c.key} className="px-3 py-2">{c.label}</th>)}</tr>
                    </thead>
                    <tbody>
                        {!data?.length
                            ? <tr><td colSpan={columns.length} className="text-center text-muted py-3">No data</td></tr>
                            : data.map((r, i) => (
                                <tr key={r.id || i}>
                                    {columns.map(c => (
                                        <td key={c.key} className="px-3 py-2">
                                            {c.isDate ? fmtD(r[c.key])
                                            : c.isCurr ? fmt(r[c.key])
                                            : c.key === 'status' ? <Badge bg={getVariant(r[c.key])} style={{ fontSize: '0.65rem' }}>{r[c.key]}</Badge>
                                            : r[c.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}

const POLL = 30_000;

export default function Dashboard() {
    const fetchSummary = useCallback(() => api.get('/analytics/summary').then(r => r.data?.data ?? r.data), []);
    const { data, loading, error, reload } = useFetch(fetchSummary);

    useEffect(() => { const id = setInterval(reload, POLL); return () => clearInterval(id); }, [reload]);

    // Breakdown modal state
    const [breakdown, setBreakdown] = useState(null); // 'today' | 'allTime'

    // Quick-action modal state
    const [actionModal, setActionModal] = useState(null); // 'credit' | 'weightloss'

    if (loading && !data) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

    const testCols = [
        { key: 'created_at', label: 'Date', isDate: true },
        { key: 'auto_number', label: 'ID' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'status', label: 'Status' },
        { key: 'total', label: 'Amount', isCurr: true },
    ];
    const certCols = [
        { key: 'issue_date', label: 'Date', isDate: true },
        { key: 'certificate_no', label: 'Cert No' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'total_amount', label: 'Amount', isCurr: true },
    ];

    const stats = [
        { title: 'Today Revenue',    value: fmt(data?.todayRevenue),    color: 'success', onClick: () => setBreakdown('today')   },
        { title: 'Today Expense',    value: fmt(data?.todayExpense),     color: 'danger',  onClick: () => setBreakdown('today')   },
        { title: 'Total Revenue',    value: fmt(data?.totalRevenue),     color: 'primary', onClick: () => setBreakdown('allTime') },
        { title: 'Cash In Hand',     value: fmt(data?.cashInHand),       color: 'info',    onClick: () => setBreakdown('allTime') },
        { title: 'Active Tests',     value: fmtN(data?.activeTests),     color: 'warning'  },
        { title: 'Completed Today',  value: fmtN(data?.completedToday),  color: 'success'  },
    ];

    const quickActions = [
        { title: 'Customer Credit',  color: 'primary', action: 'credit',     desc: 'Add credit for a customer' },
        { title: 'Weight Loss',      color: 'danger',  action: 'weightloss', desc: 'Record weight loss expense' },
    ];

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4 fw-bold">Dashboard</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {data && (
                <>
                    {/* Stat cards */}
                    <Row className="mb-2">
                        {stats.map(s => (
                            <Col md={4} sm={6} key={s.title}>
                                <StatCard title={s.title} value={s.value} color={s.color} onClick={s.onClick} />
                            </Col>
                        ))}
                    </Row>

                    {/* Quick-action cards */}
                    <Row className="mb-4">
                        {quickActions.map(qa => (
                            <Col md={3} sm={6} key={qa.title}>
                                <Card
                                    className="shadow-sm border-0 mb-3"
                                    style={{ borderLeft: `4px solid var(--bs-${qa.color})`, cursor: 'pointer' }}
                                    onClick={() => setActionModal(qa.action)}
                                >
                                    <Card.Body className="py-3">
                                        <h6 className="fw-bold mb-1" style={{ fontSize: '0.85rem' }}>{qa.title}</h6>
                                        <small className="text-muted">{qa.desc}</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Recent tables */}
                    <Row>
                        <Col lg={6}><RecentTable title="Recent Tests"        data={data.recentTests}        columns={testCols} /></Col>
                        <Col lg={6}><RecentTable title="Recent Certificates" data={data.recentCertificates} columns={certCols} /></Col>
                    </Row>
                </>
            )}

            <RevenueBreakdownModal
                show={!!breakdown}
                onHide={() => setBreakdown(null)}
                scope={breakdown || 'today'}
            />

            <CustomerActionModal
                show={!!actionModal}
                onHide={() => setActionModal(null)}
                actionType={actionModal}
            />
        </Container>
    );
}
