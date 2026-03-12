import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Container, Row, Col, Modal, Table } from 'react-bootstrap';
import { FaPlus, FaSync, FaCheckDouble, FaSave, FaCheckCircle, FaPrint, FaCopy } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import NewGoldTestModal from '../components/NewGoldTestModal';
import PaymentDeliveryModal from '../components/PaymentDeliveryModal';

const STATUS_COLUMNS = [
    {
        id: 'TODO',
        label: 'Ongoing',
        chipBg: 'rgba(245, 158, 11, 0.2)',
        chipColor: '#92400e',
        accent: '#f59e0b',
        headingColor: '#7c2d12'
    },
    {
        id: 'IN_PROGRESS',
        label: 'Tested',
        chipBg: 'rgba(139, 92, 246, 0.2)',
        chipColor: '#5b21b6',
        accent: '#8b5cf6',
        headingColor: '#4c1d95'
    },
    {
        id: 'DONE',
        label: 'Completed',
        chipBg: 'rgba(16, 185, 129, 0.2)',
        chipColor: '#065f46',
        accent: '#10b981',
        headingColor: '#064e3b'
    }
];

const boardStyles = {
    page: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '2.5rem 2rem',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    },
    headerWrap: {
        textAlign: 'center',
        color: '#ffffff',
        marginBottom: '3rem',
        position: 'relative'
    },
    headerTitle: {
        fontSize: '3rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        textShadow: '0 4px 12px rgba(0,0,0,0.2)',
        letterSpacing: '-0.02em'
    },
    headerSub: {
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        maxWidth: '700px',
        margin: '0 auto'
    },
    columnWrap: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        minHeight: '75vh',
        border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    columnHeader: (accent, headingColor) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1.25rem',
        borderBottom: `2px solid ${accent}22`,
        position: 'relative'
    }),
    columnTitle: (color) => ({
        color: color,
        fontSize: '1.4rem',
        fontWeight: 800,
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    }),
    badgePill: (bg, color) => ({
        backgroundColor: bg,
        color: color,
        padding: '0.5rem 1.2rem',
        borderRadius: '30px',
        fontSize: '0.9rem',
        fontWeight: 800,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }),
    cardsArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        minHeight: '60vh'
    },
    card: (accent) => ({
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderLeft: `6px solid ${accent}`,
        borderRadius: '16px',
        padding: '1.25rem',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
        cursor: 'pointer',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
            borderColor: accent
        }
    }),
    cardTitle: {
        fontSize: '1.15rem',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '0.25rem'
    },
    cardMeta: {
        fontSize: '0.85rem',
        color: '#6b7280',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    cardSummary: {
        marginTop: '0.75rem',
        padding: '0.75rem',
        background: '#f9fafb',
        borderRadius: '12px',
        fontSize: '0.95rem',
        color: '#374151',
        fontWeight: 600,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardStatusBadge: (statusClass) => ({
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    }),
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#9ca3af',
        fontSize: '1.1rem',
        fontWeight: 500,
        fontStyle: 'italic'
    }
};

const modalStyles = {
    content: {
        borderRadius: '24px',
        border: 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
    },
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        border: 'none',
        padding: '1.75rem 2rem'
    },
    body: {
        padding: '2rem'
    },
    footer: {
        padding: '1.5rem 2rem',
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb'
    }
};

const shortId = (id) => (id ? `${id.substring(0, 8)}` : 'N/A');

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const formatCardDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const formatMoney = (value) => {
    const numeric = Number(value || 0);
    return numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isTestedCardReady = (item) => {
    const amount = Number(item?.total || 0);
    const mode = String(item?.mode_of_payment || '').trim();
    return Number.isFinite(amount) && amount > 0 && mode.length > 0;
};


const getWeights = (item) => {
    const gross = Number(item.gross_weight || item.sample_weight || item.total_weight || 0);
    const test = Number(item.test_weight || 0);
    const net = item.net_weight !== undefined ? Number(item.net_weight) : Math.max(0, gross - test);
    return { sample: test, total: gross, net };
};

const buildResultsItems = (items) => items.map((i) => ({
    id: i.id,
    purity: Number(i.purity),
    returned: !!i.returned,
    certificate_required: !!i.certificate_required
}));

const UpdatePurityModal = ({ show, onHide, testId, onUpdate }) => {
    const [test, setTest] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/gold-tests/${testId}`);
            if (res.data.success) {
                const nextTest = res.data.data;
                setTest(nextTest);
                setItems(nextTest.items || []);
            }
        } catch (_error) {
            addToast('Failed to load test details', 'error');
            onHide();
        } finally {
            setLoading(false);
        }
    }, [testId, onHide, addToast]);

    useEffect(() => {
        if (show && testId) {
            fetchDetails();
        }
    }, [show, testId, fetchDetails]);

    const handleFieldChange = (index, field, value) => {
        const next = [...items];
        next[index][field] = value;
        setItems(next);
    };

    const hasValidPurity = () => items.every((item) => {
        const purity = Number(item.purity);
        return Number.isFinite(purity) && purity > 0 && purity <= 100;
    });

    const saveResultsOnly = async () => {
        if (!hasValidPurity()) {
            addToast('Please enter valid purity for all items (0-100).', 'error');
            return false;
        }

        await api.post(`/gold-tests/${test.id}/results`, {
            items: buildResultsItems(items),
            mode_of_payment: test.mode_of_payment || 'Cash',
            total: Number(test.total || 0)
        });

        return true;
    };

    const handleSave = async () => {
        if (!test) return;
        setSaving(true);
        try {
            const ok = await saveResultsOnly();
            if (!ok) return;
            addToast('Test result details saved. Card remains in Ongoing status.', 'success');
            if (onUpdate) onUpdate();
            onHide();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to save test details', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!test) return;
        setSubmitting(true);
        try {
            const ok = await saveResultsOnly();
            if (!ok) return;
            await api.patch(`/gold-tests/${test.id}/status`, { status: 'IN_PROGRESS' });
            addToast('Success: Sample validated and moved to Tested status.', 'success');
            if (onUpdate) onUpdate();
            onHide();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to submit test details', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!test) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="gt-results-modal" contentClassName="shadow-lg" style={{ backdropFilter: 'blur(5px)' }}>
            <Modal.Header closeButton style={modalStyles.header}>
                <Modal.Title className="fw-bold">
                    Add Test Results
                    <span className="ms-2 opacity-75 h6 mb-0">({test.id})</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={modalStyles.body}>
                {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                    <div>
                        <div className="d-flex justify-content-between mb-4 p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <span className="h6 mb-0"><strong>Customer:</strong> {test.customer_name}</span>
                            <span className="h6 mb-0"><strong>Date:</strong> {new Date(test.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="table-responsive rounded-4 overflow-hidden" style={{ border: '2px solid #f1f5f9' }}>
                            <table className="table align-middle mb-0 gt-results-table">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-3 py-3">Seq</th>
                                        <th className="px-3 py-3">Item Details</th>
                                        <th className="px-3 py-3">Sample Wt</th>
                                        <th className="px-3 py-3">Total Wt</th>
                                        <th className="px-3 py-3">Net Wt</th>
                                        <th className="px-3 py-3">Purity (%)</th>
                                        <th className="px-3 py-3 text-center">Returned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-3">{index + 1}</td>
                                            <td className="px-3">
                                                <div className="fw-bold text-dark">{item.item_type}</div>
                                                <div className="text-muted small">{item.item_no || item.item_number || '-'}</div>
                                            </td>
                                            <td className="px-3">{getWeights(item).sample}g</td>
                                            <td className="px-3">{getWeights(item).total}g</td>
                                            <td className="px-3">{getWeights(item).net}g</td>
                                            <td className="px-3">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm gt-purity-input"
                                                    value={item.purity}
                                                    onChange={(e) => handleFieldChange(index, 'purity', e.target.value)}
                                                    step="0.01"
                                                    min="0.01"
                                                    max="100"
                                                    style={{ borderRadius: '8px', fontWeight: 700, borderColor: '#d1d5db' }}
                                                />
                                            </td>
                                            <td className="text-center px-3">
                                                <div className="form-check d-flex justify-content-center">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={!!item.returned}
                                                        onChange={(e) => handleFieldChange(index, 'returned', e.target.checked)}
                                                        style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer style={modalStyles.footer}>
                <Button variant="outline-secondary" onClick={onHide} className="px-4 fw-bold" style={{ borderRadius: '12px' }}>Close</Button>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={handleSave} disabled={saving || submitting || loading} className="px-3 fw-bold" style={{ borderRadius: '12px' }}>
                        {saving ? <Spinner size="sm" animation="border" /> : <><FaSave className="me-2" />Draft Save</>}
                    </Button>
                    <Button variant="success" onClick={handleSubmit} disabled={saving || submitting || loading} className="px-4 fw-bold" style={{ borderRadius: '12px' }}>
                        {submitting ? <Spinner size="sm" animation="border" /> : <><FaCheckCircle className="me-2" />Submit Results</>}
                    </Button>
                </div>
            </Modal.Footer>
            <style>{`
                .gt-results-modal .modal-content {
                    border-radius: 24px;
                    border: none;
                    overflow: hidden;
                }
                .gt-results-table thead th {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    font-weight: 800;
                }
                .gt-results-table td {
                    padding: 1rem 0.5rem;
                    color: #475569;
                    font-weight: 600;
                }
            `}</style>
        </Modal>
    );
};

const CompletedDetailsModal = ({ show, onHide, testId }) => {
    const { addToast } = useToast();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/gold-tests/${testId}`);
            if (res.data.success) {
                setTest(res.data.data);
            }
        } catch (_err) {
            addToast('Failed to load completed details', 'error');
            onHide();
        } finally {
            setLoading(false);
        }
    }, [testId, onHide, addToast]);

    useEffect(() => {
        if (show && testId) {
            fetchDetails();
        }
    }, [show, testId, fetchDetails]);

    const handleCopy = async () => {
        if (!test) return;
        try {
            const lines = [
                'Completed Details',
                `Customer: ${test.customer_name || '-'}`,
                `Date: ${formatDate(test.created_at)}`,
                `Sample Count: ${(test.items || []).length}`,
                `Amount: Rs ${formatMoney(test.total)}`,
                `Mode: ${test.mode_of_payment || '-'}`,
                '',
                'Items:'
            ];

            (test.items || []).forEach((item, idx) => {
                const w = getWeights(item);
                lines.push(
                    `${idx + 1}. ${item.item_type || '-'} (${item.item_no || item.item_number || '-'}) | ` +
                    `Sample: ${w.sample}g | Total: ${w.total}g | Net: ${w.net}g | ` +
                    `Purity: ${item.purity || 0}% | Returned: ${item.returned ? 'Yes' : 'No'}`
                );
            });

            const text = lines.join('\n');

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            addToast('Completed details copied to clipboard', 'success');
        } catch (_err) {
            addToast('Unable to copy completed details', 'error');
        }
    };
    const printSingle = (item) => {
        if (!test || !item) return;
        const win = window.open('', '_blank', 'width=420,height=600');
        if (!win) return;
        const weights = getWeights(item);

        // Format weights
        const grossStr = `${weights.total}g`;
        const sampleStr = weights.sample > 0 ? `${weights.sample}g` : '—';
        const netStr = weights.net > 0 ? `${weights.net}g` : grossStr;

        const purityVal = Number(item.purity || 0);
        const dateStr = test.created_at
            ? new Date(test.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
            : new Date().toLocaleString('en-IN');

        const tokenNo = item.item_no || item.item_number || test.auto_number || '—';
        const itemType = item.item_type || item.item_name || '—';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Gold Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Arial', sans-serif;
            background: #fff;
            display: flex;
            justify-content: flex-end;
            padding: 10px;
        }
        .slip {
            width: 280px;
            border: 1.5px solid #1f2937;
            border-radius: 12px;
            overflow: hidden;
            font-size: 12px;
        }
        .slip-header {
            background: #1f2937;
            color: white;
            padding: 10px 14px;
            text-align: center;
        }
        .slip-header .lab-name {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .slip-header .lab-sub {
            font-size: 10px;
            opacity: 0.75;
            margin-top: 2px;
            letter-spacing: 0.5px;
        }
        .slip-body {
            padding: 12px 14px;
        }
        .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 0;
            border-bottom: 1px dashed #e5e7eb;
        }
        .row:last-child { border-bottom: none; }
        .row .label {
            color: #6b7280;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .row .value {
            font-weight: 700;
            color: #111827;
            font-size: 12px;
            text-align: right;
        }
        .row .value.gold { color: #b45309; }
        .purity-block {
            margin: 12px 14px;
            background: #f9fafb;
            border: 2px solid #1f2937;
            border-radius: 10px;
            padding: 12px;
            text-align: center;
        }
        .purity-label {
            font-size: 10px;
            color: #6b7280;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .purity-value {
            font-size: 28px;
            font-weight: 900;
            color: #111827;
            line-height: 1;
        }
        .purity-value .pct { font-size: 16px; }
        .slip-footer {
            background: #f3f4f6;
            padding: 8px 14px;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
        @media print {
            body { padding: 0; justify-content: flex-end; }
            .slip { border: 1.5px solid #000; page-break-inside: avoid; }
            @page { margin: 5mm; size: 80mm auto; }
        }
    </style>
</head>
<body>
    <div class="slip">
        <div class="slip-header">
            <div class="lab-name">Swastik Lab</div>
            <div class="lab-sub">Gold Testing Report</div>
        </div>
        <div class="slip-body">
            <div class="row">
                <span class="label">Token No</span>
                <span class="value gold">${escapeHtml(tokenNo)}</span>
            </div>
            <div class="row">
                <span class="label">Date</span>
                <span class="value">${dateStr}</span>
            </div>
            <div class="row">
                <span class="label">Customer</span>
                <span class="value">${escapeHtml(test.customer_name || '—')}</span>
            </div>
            <div class="row">
                <span class="label">Item</span>
                <span class="value">${escapeHtml(itemType)}</span>
            </div>
            <div class="row">
                <span class="label">Gross Wt</span>
                <span class="value">${grossStr}</span>
            </div>
            <div class="row">
                <span class="label">Sample Wt</span>
                <span class="value">${sampleStr}</span>
            </div>
            <div class="row">
                <span class="label">Net Wt</span>
                <span class="value">${netStr}</span>
            </div>
            ${item.returned ? `<div class="row"><span class="label">Returned</span><span class="value">Yes (No Charge)</span></div>` : ''}
        </div>
        <div class="purity-block">
            <div class="purity-label">Gold Purity</div>
            <div class="purity-value">${purityVal}<span class="pct">%</span></div>
        </div>
        <div class="slip-footer">
            Swastik Gold &amp; Silver Lab &bull; Testing Receipt
        </div>
    </div>
    <script>
        window.onload = function () {
            setTimeout(function () {
                window.print();
                window.onafterprint = function () { window.close(); };
            }, 150);
        };
    </script>
</body>
</html>`;
        win.document.open();
        win.document.write(html);
        win.document.close();
    };


    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="payment-delivery-modal">
            <Modal.Header closeButton className="modal-soft-header">
                <Modal.Title className="d-flex align-items-center justify-content-between w-100">
                    <span>Completed Details</span>
                    <Button variant="outline-primary" size="sm" onClick={handleCopy}>
                        <FaCopy className="me-1" /> Copy
                    </Button>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading || !test ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                ) : (
                    <div>
                        <div className="mb-3" style={modalStyles.metaStrip}>
                            <div><strong>Customer:</strong> {test.customer_name || '-'}</div>
                            <div><strong>Date:</strong> {formatDate(test.created_at)}</div>
                            <div><strong>Sample Count:</strong> {(test.items || []).length}</div>
                            <div><strong>Amount:</strong> Rs {formatMoney(test.total)}</div>
                            <div><strong>Mode:</strong> {test.mode_of_payment || '-'}</div>
                        </div>

                        <Table bordered hover size="sm" className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Seq</th>
                                    <th>Item</th>
                                    <th>Sample Wt</th>
                                    <th>Total Wt</th>
                                    <th>Net Wt</th>
                                    <th>Purity</th>
                                    <th>Returned</th>
                                    <th className="print-col">Print</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(test.items || []).map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div>{item.item_type || '-'}</div>
                                            <small className="text-muted">{item.item_no || item.item_number || '-'}</small>
                                        </td>
                                        <td>{getWeights(item).sample} g</td>
                                        <td>{getWeights(item).total} g</td>
                                        <td>{getWeights(item).net} g</td>
                                        <td>{item.purity || 0}%</td>
                                        <td>{item.returned ? 'Yes' : 'No'}</td>
                                        <td className="print-col">
                                            <Button variant="outline-secondary" size="sm" onClick={() => printSingle(item)}>
                                                <FaPrint />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

const GoldTest = () => {
    const { addToast } = useToast();
    const [columns, setColumns] = useState({
        TODO: [],
        IN_PROGRESS: [],
        DONE: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [batchMoving, setBatchMoving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [paymentModalTestId, setPaymentModalTestId] = useState(null);
    const [completedModalTestId, setCompletedModalTestId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);

    const fetchColumnData = useCallback(async (status) => {
        try {
            const res = await api.get(`/ gold - tests ? status = ${status}& limit=100 & search=${searchTerm} `);
            return res.data.success ? res.data.data : [];
        } catch (error) {
            console.error(`Error fetching ${status}: `, error);
            addToast(`Failed to load ${status} items`, 'error');
            return [];
        }
    }, [searchTerm, addToast]);

    const loadBoard = useCallback(async () => {
        setLoading(true);
        try {
            const [todo, inProgress, done] = await Promise.all([
                fetchColumnData('TODO'),
                fetchColumnData('IN_PROGRESS'),
                fetchColumnData('DONE')
            ]);
            setColumns({
                TODO: todo,
                IN_PROGRESS: inProgress,
                DONE: done
            });
        } finally {
            setLoading(false);
        }
    }, [fetchColumnData]);

    useEffect(() => {
        loadBoard();
    }, [loadBoard]);

    const handleCardOpen = (item) => {
        if (item.status === 'TODO') {
            setSelectedTestId(item.id);
            return;
        }
        if (item.status === 'IN_PROGRESS') {
            setPaymentModalTestId(item.id);
            return;
        }
        setCompletedModalTestId(item.id);
    };

    const handleDropToColumn = async (targetStatus) => {
        if (!draggedItem || draggedItem.status === targetStatus) return;

        try {
            if (targetStatus === 'IN_PROGRESS' && draggedItem.status === 'TODO') {
                const detailRes = await api.get(`/ gold - tests / ${draggedItem.id} `);
                const detail = detailRes.data?.data;
                const items = detail?.items || [];
                const hasPurity = items.length > 0 && items.every((item) => {
                    const p = Number(item.purity);
                    return Number.isFinite(p) && p > 0 && p <= 100;
                });
                if (!hasPurity) {
                    addToast('Add test results before moving to Tested.', 'info');
                    setSelectedTestId(draggedItem.id);
                    return;
                }
            }

            if (targetStatus === 'DONE') {
                const amount = Number(draggedItem.total || 0);
                const mode = (draggedItem.mode_of_payment || '').trim();
                if (!(Number.isFinite(amount) && amount > 0 && mode)) {
                    addToast('Add payment details in Tested status before moving to Completed.', 'info');
                    setPaymentModalTestId(draggedItem.id);
                    return;
                }

                const detailRes = await api.get(`/ gold - tests / ${draggedItem.id} `);
                const detail = detailRes.data?.data;
                await api.post(`/ gold - tests / ${draggedItem.id}/finalize`, {
                    items: buildResultsItems(detail?.items || []),
                    mode_of_payment: mode,
                    weight_loss: 0
                });
                addToast('Moved to Completed', 'success');
            } else {
                await api.patch(`/gold-tests/${draggedItem.id}/status`, { status: targetStatus });
                addToast(`Moved to ${STATUS_COLUMNS.find((x) => x.id === targetStatus)?.label || targetStatus}`, 'success');
            }

            await loadBoard();
        } catch (err) {
            addToast(err.response?.data?.error || 'Move failed', 'error');
        } finally {
            setDraggedItem(null);
        }
    };

    const handleBatchTransferTested = async () => {
        const testedCards = columns.IN_PROGRESS || [];
        if (testedCards.length === 0) {
            addToast('No samples in Tested status to transfer', 'info');
            return;
        }

        const eligible = testedCards.filter((card) => {
            const amount = Number(card.total || 0);
            return Number.isFinite(amount) && amount > 0 && !!card.mode_of_payment;
        });

        if (eligible.length === 0) {
            addToast('No eligible samples ready for completion. Add payment details first.', 'info');
            return;
        }

        const pendingCount = testedCards.length - eligible.length;
        const confirmed = window.confirm(`Transfer ${eligible.length} eligible tested sample(s) to Completed?\n(${pendingCount} sample(s) will remain in Tested)`);
        if (!confirmed) return;

        setBatchMoving(true);
        let successCount = 0;

        for (const card of eligible) {
            try {
                const detailRes = await api.get(`/gold-tests/${card.id}`);
                const detail = detailRes.data?.data;
                const items = detail?.items || [];
                await api.post(`/gold-tests/${card.id}/finalize`, {
                    items: buildResultsItems(items),
                    mode_of_payment: card.mode_of_payment,
                    weight_loss: 0
                });
                successCount += 1;
            } catch (_err) {
                // Continue with other cards
            }
        }

        await loadBoard();
        setBatchMoving(false);

        addToast(`${successCount} sample(s) moved to Completed${pendingCount > 0 ? `, ${pendingCount} remain in Tested` : ''}`, 'success');
    };

    return (
        <Container fluid style={boardStyles.page}>
            <div style={boardStyles.headerWrap}>
                <h1 style={boardStyles.headerTitle}>Gold Testing Kanban</h1>
                <p style={boardStyles.headerSub}>
                    Streamline your laboratory workflow with real-time tracking of gold samples from intake to final analysis.
                </p>

                <div className="d-flex justify-content-center gap-3 mt-4">
                    <Button
                        variant="light"
                        className="btn-glass d-flex align-items-center gap-2"
                        onClick={handleBatchTransferTested}
                        disabled={batchMoving}
                        style={{ border: '2px solid white', borderRadius: '12px', padding: '0.8rem 1.5rem', fontWeight: 700 }}
                    >
                        {batchMoving ? <Spinner animation="border" size="sm" /> : <FaCheckDouble />}
                        Batch Move Tested
                    </Button>
                    <Button
                        variant="light"
                        className="btn-glass d-flex align-items-center gap-2"
                        onClick={loadBoard}
                        disabled={loading}
                        style={{ border: '2px solid white', borderRadius: '12px', padding: '0.8rem 1.5rem', fontWeight: 700 }}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : <FaSync />}
                        Refresh Board
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowModal(true)}
                        style={{ background: '#ffffff', color: '#667eea', border: 'none', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    >
                        <FaPlus className="me-2" /> New Sample Entry
                    </Button>
                </div>

                <div className="mt-4 mx-auto" style={{ maxWidth: '600px' }}>
                    <div className="input-group input-group-lg shadow-lg overflow-hidden" style={{ borderRadius: '16px' }}>
                        <span className="input-group-text border-0 bg-white"><FaSync className={loading ? "fa-spin" : ""} /></span>
                        <input
                            type="text"
                            className="form-control border-0 py-3"
                            placeholder="Search by ID, Customer Name or Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ fontSize: '1.1rem', fontWeight: 500 }}
                        />
                        {searchTerm && (
                            <button className="btn btn-white border-0 text-danger" onClick={() => setSearchTerm('')}>×</button>
                        )}
                    </div>
                </div>
            </div>

            <Row className="g-4">
                {STATUS_COLUMNS.map((col) => {
                    const items = columns[col.id] || [];
                    return (
                        <Col key={col.id} lg={4}>
                            <div style={boardStyles.columnWrap}>
                                <div style={boardStyles.columnHeader(col.accent, col.headingColor)}>
                                    <h3 style={boardStyles.columnTitle(col.headingColor)}>{col.label}</h3>
                                    <div style={boardStyles.badgePill(col.chipBg, col.chipColor)}>
                                        {items.length} SAMPLES
                                    </div>
                                </div>

                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDropToColumn(col.id)}
                                    style={boardStyles.cardsArea}
                                >
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            style={boardStyles.card(col.accent)}
                                            onClick={() => handleCardOpen(item)}
                                            draggable
                                            onDragStart={() => setDraggedItem(item)}
                                            className="kanban-card-hover"
                                        >
                                            {item.status === 'IN_PROGRESS' && isTestedCardReady(item) && (
                                                <div
                                                    title="Pass / Ready for Completion"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '1rem',
                                                        right: '1rem',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: '#10b981',
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.9rem',
                                                        boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
                                                    }}
                                                >
                                                    ✓
                                                </div>
                                            )}

                                            <div style={boardStyles.cardTitle}>
                                                {item.customer_name || 'Anonymous Customer'}
                                            </div>

                                            <div style={boardStyles.cardMeta}>
                                                <span style={{ color: '#94a3b8' }}>ID:</span> {item.auto_number || shortId(item.id)}
                                                <span style={{ margin: '0 0.5rem', color: '#e2e8f0' }}>|</span>
                                                <span style={{ color: '#94a3b8' }}>DATE:</span> {formatCardDate(item.created_at)}
                                            </div>

                                            <div style={boardStyles.cardSummary}>
                                                <span>{item.item_count || 0} ITEMS</span>
                                                <span style={{ color: col.accent }}>TOTAL: {item.total_weight || '0.00'}g</span>
                                            </div>
                                        </div>
                                    ))}

                                    {items.length === 0 && !loading && (
                                        <div style={boardStyles.emptyState}>
                                            No samples currently in {col.label.toLowerCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>

            <style>{`
                .btn-glass {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: white !important;
                    backdrop-filter: blur(5px);
                    transition: all 0.3s ease;
                }
                .btn-glass:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                    transform: translateY(-2px);
                }
                .kanban-card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }
            `}</style>

            <NewGoldTestModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSuccess={loadBoard}
            />

            <UpdatePurityModal
                show={!!selectedTestId}
                testId={selectedTestId}
                onHide={() => setSelectedTestId(null)}
                onUpdate={loadBoard}
            />

            <PaymentDeliveryModal
                show={!!paymentModalTestId}
                testId={paymentModalTestId}
                onHide={() => setPaymentModalTestId(null)}
                onSuccess={loadBoard}
            />

            <CompletedDetailsModal
                show={!!completedModalTestId}
                testId={completedModalTestId}
                onHide={() => setCompletedModalTestId(null)}
            />
        </Container>
    );
};

export default GoldTest;


