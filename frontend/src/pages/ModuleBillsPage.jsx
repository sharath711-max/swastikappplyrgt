import React, { useState, useCallback, useEffect } from 'react';
import {
    Container, Row, Col, Card, Table, Badge, Spinner, Alert,
    Form, Button,
} from 'react-bootstrap';
import api from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../contexts/ToastContext';

const fmt     = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const isIncoming = (t) => { const s = String(t).toLowerCase().trim(); return s.startsWith('in') || s === 'credit'; };
const isCredit   = (t) => String(t).toLowerCase().trim() === 'credit';

const MODULES = [
    // Cert/test bills — served by /bills (fixed shape, optional GST).
    { key: 'gold_cert',   label: 'Gold Certs',   kind: 'bills', hasGst: true  },
    { key: 'silver_cert', label: 'Silver Certs', kind: 'bills', hasGst: true  },
    { key: 'photo_cert',  label: 'Photo Certs',  kind: 'bills', hasGst: true  },
    { key: 'gold_test',   label: 'Gold Tests',   kind: 'bills', hasGst: false },
    { key: 'silver_test', label: 'Silver Tests', kind: 'bills', hasGst: false },

    // Financial ledgers — own endpoints + columns. Date filter is client-side
    // (the /list endpoints don't take date params); total is a signed net.
    {
        key: 'credit_history', label: 'Credit History', kind: 'ledger',
        endpoint: '/list/credit-history',
        dateOf:   r => r.created || r.createdon,
        amountOf: r => (isCredit(r.type) ? 1 : -1) * Number(r.amount || 0),
        columns: [
            { header: 'Date',        get: r => fmtDate(r.created || r.createdon) },
            { header: 'Customer',    get: r => r.customer_name || '—', className: 'fw-semibold' },
            { header: 'Type',        get: r => <Badge bg={isCredit(r.type) ? 'success' : 'danger'}>{String(r.type).toUpperCase()}</Badge> },
            { header: 'Amount',      get: r => fmt(r.amount), className: 'fw-semibold', align: 'end' },
            { header: 'Mode',        get: r => r.mode_of_payment || '—' },
            { header: 'Description', get: r => r.description || '—' },
        ],
        csv: {
            header: 'Date,Customer,Type,Amount,Mode,Description',
            row: r => [fmtDate(r.created || r.createdon), r.customer_name, r.type, r.amount, r.mode_of_payment || '', String(r.description || '').replace(/,/g, ';')],
        },
    },
    {
        key: 'weight_loss', label: 'Weight Loss', kind: 'ledger',
        endpoint: '/list/weight-loss-history',
        dateOf:   r => r.created || r.createdon,
        amountOf: r => Number(r.amount || 0),
        columns: [
            { header: 'Date',     get: r => fmtDate(r.created || r.createdon) },
            { header: 'Customer', get: r => r.customer_name || '—', className: 'fw-semibold' },
            { header: 'Amount',   get: r => fmt(r.amount), className: 'fw-semibold', align: 'end' },
            { header: 'Reason',   get: r => r.reason || '—' },
            { header: 'Mode',     get: r => r.mode_of_payment || '—' },
        ],
        csv: {
            header: 'Date,Customer,Amount,Reason,Mode',
            row: r => [fmtDate(r.created || r.createdon), r.customer_name, r.amount, String(r.reason || '').replace(/,/g, ';'), r.mode_of_payment || ''],
        },
    },
    {
        key: 'cash_register', label: 'Cash In Hand', kind: 'ledger',
        endpoint: '/cash-register',
        dateOf:   r => r.date || r.created_at,
        amountOf: r => (isIncoming(r.type) ? 1 : -1) * Number(r.amount || 0),
        columns: [
            { header: 'Date',        get: r => fmtDate(r.date || r.created_at) },
            { header: 'Type',        get: r => <Badge bg={isIncoming(r.type) ? 'success' : 'danger'} className="text-capitalize">{r.type}</Badge> },
            { header: 'Amount',      get: r => fmt(r.amount), className: 'fw-semibold', align: 'end' },
            { header: 'Description', get: r => r.description || '—' },
        ],
        csv: {
            header: 'Date,Type,Amount,Description',
            row: r => [fmtDate(r.date || r.created_at), r.type, r.amount, String(r.description || '').replace(/,/g, ';')],
        },
    },
];

function ModuleBills({ mod }) {
    const { addToast } = useToast();
    const [gstTab,    setGstTab]    = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate,   setEndDate]   = useState('');
    const [applied,   setApplied]   = useState({ start: '', end: '', gst: 'all' });

    const fetchBills = useCallback(() => {
        const p = new URLSearchParams({ module: mod.key });
        if (mod.hasGst && applied.gst !== 'all') p.set('gst', applied.gst === 'gst' ? '1' : '0');
        if (applied.start) p.set('start_date', applied.start);
        if (applied.end)   p.set('end_date',   applied.end);
        return api.get('/bills?' + p.toString()).then(r => r.data);
    }, [mod.key, mod.hasGst, applied]);

    const { data, loading, error } = useFetch(fetchBills, {
        onError: msg => addToast(msg, 'error'),
    });

    const rows       = data?.data             ?? [];
    const grandTotal = data?.meta?.grandTotal ?? 0;

    const apply = (gst) => setApplied({ start: startDate, end: endDate, gst: gst ?? gstTab });

    const exportCsv = () => {
        if (!rows.length) return;
        const header = mod.hasGst
            ? 'Bill No,Customer,Phone,GST,Mode,Amount,Tax,Date'
            : 'Bill No,Customer,Phone,Mode,Amount,Date';
        const lines = rows.map(r => {
            const base = [r.bill_number, r.customer_name, r.phone || '', r.mode_of_payment || '', r.total, fmtDate(r.date)];
            if (mod.hasGst) base.splice(3, 0, r.gst ? 'Yes' : 'No', r.total_tax);
            return base.join(',');
        });
        const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'bills_' + mod.key + '.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="mb-3" style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px' }}>
            <Row className="g-2 align-items-end">
                <Col xs="auto">
                    <Form.Label className="small fw-semibold mb-1">From</Form.Label>
                    <Form.Control size="sm" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </Col>
                <Col xs="auto">
                    <Form.Label className="small fw-semibold mb-1">To</Form.Label>
                    <Form.Control size="sm" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </Col>
                <Col xs="auto" className="d-flex gap-2 align-items-end">
                    <Button size="sm" variant="primary" onClick={() => apply()}>Apply</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => {
                        setStartDate(''); setEndDate('');
                        setApplied({ start: '', end: '', gst: 'all' });
                    }}>Reset</Button>
                    <Button size="sm" variant="outline-success" onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
                </Col>
                <Col xs="auto" className="ms-auto d-flex align-items-center">
                    <span
                        className="fw-bold text-success px-3 py-2"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                    >
                        Total: {fmt(grandTotal)}
                    </span>
                </Col>
            </Row>
            </div>

            {mod.hasGst && (
                <div className="d-flex gap-2 mb-3">
                    {[['all', 'All'], ['gst', 'GST'], ['non-gst', 'Non-GST']].map(([k, label]) => (
                        <Button
                            key={k}
                            size="sm"
                            variant={gstTab === k ? 'primary' : 'outline-secondary'}
                            className="px-3"
                            onClick={() => { setGstTab(k); apply(k); }}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            )}

            {error   && <Alert variant="danger" className="small">{error}</Alert>}
            {loading && <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>}

            {!loading && (
                <>
                    <Table hover striped responsive size="sm" className="bg-white shadow-sm mb-1 small align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Bill No</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                {mod.hasGst && <th>GST</th>}
                                <th>Mode</th>
                                <th>Amount</th>
                                {mod.hasGst && <th>Tax</th>}
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0
                                ? <tr><td colSpan={mod.hasGst ? 9 : 7} className="text-center text-muted py-4">No bills found</td></tr>
                                : rows.map((r, i) => (
                                    <tr key={r.id}>
                                        <td className="text-muted small">{i + 1}</td>
                                        <td className="fw-semibold">{r.bill_number}</td>
                                        <td>{r.customer_name}</td>
                                        <td className="text-muted">{r.phone || '—'}</td>
                                        {mod.hasGst && (
                                            <td>
                                                <Badge bg={r.gst ? 'success' : 'secondary'} style={{ fontSize: '0.62rem' }}>
                                                    {r.gst ? 'GST' : 'Non-GST'}
                                                </Badge>
                                            </td>
                                        )}
                                        <td className="text-capitalize">{r.mode_of_payment || '—'}</td>
                                        <td className="fw-semibold">{fmt(r.total)}</td>
                                        {mod.hasGst && <td className="text-muted">{fmt(r.total_tax)}</td>}
                                        <td className="text-muted">{fmtDate(r.date)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot className="table-light">
                                <tr>
                                    <td colSpan={mod.hasGst ? 6 : 5} className="text-end fw-bold">Grand Total</td>
                                    <td className="fw-bold text-success">{fmt(grandTotal)}</td>
                                    {mod.hasGst && <td colSpan={2} />}
                                </tr>
                            </tfoot>
                        )}
                    </Table>
                    <small className="text-muted">{rows.length} record{rows.length !== 1 ? 's' : ''}</small>
                </>
            )}
        </div>
    );
}

// Read-only viewer for the financial-ledger modules (credit history, weight
// loss, cash register). Own columns per module; date filter is applied
// client-side since the /list endpoints don't take date params.
function LedgerView({ mod }) {
    const { addToast } = useToast();
    const [startDate, setStartDate] = useState('');
    const [endDate,   setEndDate]   = useState('');
    const [applied,   setApplied]   = useState({ start: '', end: '' });

    const fetchRows = useCallback(
        () => api.get(`${mod.endpoint}?limit=500`).then(r => r.data),
        [mod.endpoint],
    );
    const { data, loading, error } = useFetch(fetchRows, { onError: msg => addToast(msg, 'error') });
    const allRows = data?.data ?? [];

    const rows = allRows.filter(r => {
        const d = mod.dateOf(r);
        if (!d) return true;
        const day = new Date(d).toISOString().slice(0, 10);
        if (applied.start && day < applied.start) return false;
        if (applied.end   && day > applied.end)   return false;
        return true;
    });
    const total = rows.reduce((s, r) => s + mod.amountOf(r), 0);

    const exportCsv = () => {
        if (!rows.length) return;
        const lines = rows.map(r => mod.csv.row(r).join(','));
        const blob  = new Blob([[mod.csv.header, ...lines].join('\n')], { type: 'text/csv' });
        const url   = URL.createObjectURL(blob);
        const a     = document.createElement('a');
        a.href = url; a.download = mod.key + '.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="mb-3" style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px' }}>
                <Row className="g-2 align-items-end">
                    <Col xs="auto">
                        <Form.Label className="small fw-semibold mb-1">From</Form.Label>
                        <Form.Control size="sm" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </Col>
                    <Col xs="auto">
                        <Form.Label className="small fw-semibold mb-1">To</Form.Label>
                        <Form.Control size="sm" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </Col>
                    <Col xs="auto" className="d-flex gap-2 align-items-end">
                        <Button size="sm" variant="primary" onClick={() => setApplied({ start: startDate, end: endDate })}>Apply</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => { setStartDate(''); setEndDate(''); setApplied({ start: '', end: '' }); }}>Reset</Button>
                        <Button size="sm" variant="outline-success" onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
                    </Col>
                    <Col xs="auto" className="ms-auto d-flex align-items-center">
                        <span
                            className="fw-bold text-success px-3 py-2"
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                        >
                            Total: {fmt(total)}
                        </span>
                    </Col>
                </Row>
            </div>

            {error   && <Alert variant="danger" className="small">{error}</Alert>}
            {loading && <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>}

            {!loading && (
                <>
                    <Table hover striped responsive size="sm" className="bg-white shadow-sm mb-1 small align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                {mod.columns.map(c => (
                                    <th key={c.header} className={c.align === 'end' ? 'text-end' : ''}>{c.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0
                                ? <tr><td colSpan={mod.columns.length + 1} className="text-center text-muted py-4">No records found</td></tr>
                                : rows.map((r, i) => (
                                    <tr key={r.id ?? i}>
                                        <td className="text-muted small">{i + 1}</td>
                                        {mod.columns.map(c => (
                                            <td key={c.header} className={`${c.className || ''}${c.align === 'end' ? ' text-end' : ''}`.trim()}>
                                                {c.get(r)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                    <small className="text-muted">
                        {rows.length} record{rows.length !== 1 ? 's' : ''}
                        {allRows.length >= 500 ? ' (showing first 500)' : ''}
                    </small>
                </>
            )}
        </div>
    );
}

// ── KPI summary cards ────────────────────────────────────────────────────────
// Salesforce-style headline metrics across the top of Reports. Frontend-only:
// every value is read from endpoints the app already exposes (no new backend).
//   /analytics/summary          → cashInHand, customerBalance, todayRevenue
//   /analytics/revenue-breakdown → allTime revenue / weight-loss / P&L
//   /list/<type> pagination.total → absolute record counts (limit=1, cheap)
const KPI_CARD = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
    height: '100%',
};
const KPI_VALUE = { fontSize: '28px', fontWeight: 700, lineHeight: 1.15, color: '#0f172a' };
const KPI_LABEL = {
    fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: '#64748b', marginTop: '6px',
};
const fmtCount = (v) => Number(v || 0).toLocaleString('en-IN');

function KpiCard({ label, value, accent, loading }) {
    return (
        <Col xs={6} lg={3}>
            <div style={KPI_CARD}>
                <div style={{ ...KPI_VALUE, color: accent || KPI_VALUE.color }}>
                    {loading ? <span className="text-muted">—</span> : value}
                </div>
                <div style={KPI_LABEL}>{label}</div>
            </div>
        </Col>
    );
}

function KpiSummary() {
    const [kpi, setKpi] = useState(null);

    useEffect(() => {
        let alive = true;
        const unwrap = (p) => (p.status === 'fulfilled' ? (p.value?.data?.data ?? p.value?.data ?? {}) : {});
        const totalOf = (p) => (p.status === 'fulfilled' ? (p.value?.data?.pagination?.total ?? 0) : 0);
        (async () => {
            const [summary, revenue, gt, st, gc, sc, pc] = await Promise.allSettled([
                api.get('/analytics/summary'),
                api.get('/analytics/revenue-breakdown'),
                api.get('/list/gold-tests?limit=1'),
                api.get('/list/silver-tests?limit=1'),
                api.get('/list/gold-certificates?limit=1'),
                api.get('/list/silver-certificates?limit=1'),
                api.get('/list/photo-certificates?limit=1'),
            ]);
            if (!alive) return;
            const s = unwrap(summary);
            const allTime = unwrap(revenue).allTime || {};
            setKpi({
                totalRevenue:      allTime?.revenue?.total ?? 0,
                totalTests:        totalOf(gt) + totalOf(st),
                certificates:      totalOf(gc) + totalOf(sc) + totalOf(pc),
                cashInHand:        s.cashInHand ?? allTime?.cashInHand ?? 0,
                creditOutstanding: s.customerBalance ?? 0,
                todayRevenue:      s.todayRevenue ?? 0,
                netPnl:            allTime?.pnl ?? 0,
                weightLoss:        allTime?.expense?.weight_loss ?? 0,
            });
        })();
        return () => { alive = false; };
    }, []);

    const loading = kpi === null;
    const k = kpi || {};

    return (
        <>
            <Row className="g-3 mb-3">
                <KpiCard loading={loading} label="Total Revenue"  value={fmt(k.totalRevenue)}      accent="#15803d" />
                <KpiCard loading={loading} label="Total Tests"    value={fmtCount(k.totalTests)} />
                <KpiCard loading={loading} label="Certificates"   value={fmtCount(k.certificates)} />
                <KpiCard loading={loading} label="Cash In Hand"   value={fmt(k.cashInHand)}        accent={k.cashInHand < 0 ? '#b91c1c' : '#0f172a'} />
            </Row>
            <Row className="g-3 mb-4">
                <KpiCard loading={loading} label="Credit Outstanding" value={fmt(k.creditOutstanding)} accent={k.creditOutstanding > 0 ? '#b45309' : '#0f172a'} />
                <KpiCard loading={loading} label="Today's Revenue"    value={fmt(k.todayRevenue)} />
                <KpiCard loading={loading} label="Net P&L"            value={fmt(k.netPnl)}            accent={k.netPnl < 0 ? '#b91c1c' : '#15803d'} />
                <KpiCard loading={loading} label="Weight Loss"        value={fmt(k.weightLoss)} />
            </Row>
        </>
    );
}

export default function ModuleBillsPage() {
    const [active, setActive] = useState('gold_cert');
    const activeMod = MODULES.find(m => m.key === active) || MODULES[0];

    return (
        <Container fluid className="py-4">
            <h2 className="fw-bold mb-4">Reports</h2>
            <KpiSummary />
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        {MODULES.map(m => (
                            <Button
                                key={m.key}
                                size="sm"
                                variant={active === m.key ? 'primary' : 'outline-secondary'}
                                className="fw-semibold px-3"
                                onClick={() => setActive(m.key)}
                            >
                                {m.label}
                            </Button>
                        ))}
                    </div>
                    {/* key forces a fresh mount per module so filters reset on switch */}
                    {activeMod.kind === 'ledger'
                        ? <LedgerView key={active} mod={activeMod} />
                        : <ModuleBills key={active} mod={activeMod} />}
                </Card.Body>
            </Card>
        </Container>
    );
}
