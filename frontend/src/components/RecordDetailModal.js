import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Spinner, Alert, Row, Col, Form } from 'react-bootstrap';
import { FaPrint, FaEye, FaArrowLeft, FaLock, FaFileInvoice } from 'react-icons/fa';
import api from '../services/api';
import { usePrint } from '../contexts/PrintContext';
import { useToast } from '../contexts/ToastContext';
import useSafeModalClose from '../hooks/useSafeModalClose';

const PARENT_TYPES = ['gold-tests', 'silver-tests', 'gold-certificates', 'silver-certificates', 'photo-certificates'];
const TEST_PARENT_TYPES = new Set(['gold-tests', 'silver-tests']);
const PRINT_ROUTE = {
    'gold-tests': 'gold-test', 'silver-tests': 'silver-test',
    'gold-certificates': 'gold-certificate', 'silver-certificates': 'silver-certificate',
    'photo-certificates': 'photo-certificate',
};
const PAYMENT_MODES = ['Cash', 'UPI', 'Balance'];

const isParentType = (t) => PARENT_TYPES.includes(t);
const isCert  = (t) => String(t).includes('certificate');
const itemTypeOf = (t) => String(t).replace(/s$/, '-items');   // gold-tests → gold-test-items

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dt    = (d) => d ? new Date(d).toLocaleString('en-IN') : '—';

const Field = ({ label, value }) => (
    <div className="mb-3">
        <div className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>{label}</div>
        <div className="fw-semibold">{value ?? '—'}</div>
    </div>
);

/**
 * Record Detail Modal — replaces the full-page /record view in-context.
 * Parent record fields (left) + related items table (right). Clicking a
 * row's View drills into that item within the same modal (Back returns).
 *
 * Convert-to-certificate (DONE gold/silver tests only): operator selects
 * items via checkboxes and confirms; backend at POST /{gold|silver}-tests/
 * :id/convert-to-certificate soft-deletes the selected items from the
 * test and creates a new cert in one atomic transaction. Test status is
 * not touched; remaining items stay on the test. Closes Python parity
 * gap for PUT /<uid>/to-gold-certificate/.
 */
export default function RecordDetailModal({ show, onHide, type, id }) {
    const { triggerPrint } = usePrint();
    const { addToast } = useToast();
    const { safeClose } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose({});

    const [view, setView] = useState({ type, id });   // current drill level
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reloadCounter, setReloadCounter] = useState(0);

    // Convert-to-certificate state — only meaningful for DONE gold/silver tests.
    const [selectedItemIds, setSelectedItemIds] = useState(() => new Set());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [paymentLocked, setPaymentLocked] = useState(true);
    const [chosenPayment, setChosenPayment] = useState('Cash');
    const [converting, setConverting] = useState(false);

    // Reset to the root record each time the modal (re)opens or target changes.
    useEffect(() => { if (show) setView({ type, id }); }, [show, type, id]);

    // Reset convert-flow state whenever the view changes (drill-in, back, reopen).
    useEffect(() => {
        setSelectedItemIds(new Set());
        setConfirmOpen(false);
        setPaymentLocked(true);
        setConverting(false);
    }, [show, view.type, view.id]);

    useEffect(() => {
        if (!show || !view.type || !view.id) return undefined;
        let active = true;
        setLoading(true); setError(''); setData(null);
        api.get(`/records/${view.type}/${view.id}`)
            .then(r => { if (active) setData(r.data?.data ?? null); })
            .catch(e => { if (active) setError(e.response?.data?.error || 'Failed to load record'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [show, view.type, view.id, reloadCounter]);

    // Seed the convert flow's chosenPayment from the test's existing mode.
    // Fall back to 'Cash' if the test's mode isn't one of the canonical three
    // (handles legacy values like 'Card' that the cert endpoint doesn't take).
    useEffect(() => {
        if (!data?.mode_of_payment) return;
        setChosenPayment(PAYMENT_MODES.includes(data.mode_of_payment) ? data.mode_of_payment : 'Cash');
    }, [data?.mode_of_payment]);

    const atRoot     = view.type === type && view.id === id;
    const parentView = isParentType(view.type);
    const cert       = isCert(view.type);

    // Convert-to-certificate gating: DONE gold/silver test with at least one item.
    const isTestParent = parentView && TEST_PARENT_TYPES.has(view.type);
    const isDoneTest   = isTestParent && data?.status === 'DONE';
    const canConvert   = isDoneTest && (data?.items?.length || 0) > 0;
    const metalLabel   = view.type === 'silver-tests' ? 'Silver' : 'Gold';

    const printItem = async (item) => {
        const route = PRINT_ROUTE[view.type];
        if (!route || !data?.items) return;
        try { await triggerPrint(route, view.id, { itemIndex: data.items.indexOf(item) }); }
        catch { addToast('Print failed. Please try again.', 'error'); }
    };

    const toggleSelect = (itemId) => {
        setSelectedItemIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    };

    const cancelConfirm = () => {
        setConfirmOpen(false);
        setPaymentLocked(true);
    };

    const submitConvert = async () => {
        if (selectedItemIds.size === 0 || converting) return;
        setConverting(true);
        try {
            const r = await api.post(`/${view.type}/${view.id}/convert-to-certificate`, {
                item_ids       : Array.from(selectedItemIds),
                mode_of_payment: chosenPayment,
                gst            : data.gst ?? false,
                gst_bill_number: data.gst_bill_number ?? '',
                total_tax      : data.total_tax ?? 0,
            });
            const certPayload = r.data?.data?.certificate;
            const billNo = certPayload?.bill_number || certPayload?.auto_number || '—';
            const n = selectedItemIds.size;
            addToast(`Certificate ${billNo} created from ${n} item${n === 1 ? '' : 's'}.`, 'success');
            setSelectedItemIds(new Set());
            setConfirmOpen(false);
            setPaymentLocked(true);
            // If the test has no remaining items, the modal's underlying record
            // is gone — close so the parent list can pick up the cert via socket.
            if ((r.data?.data?.remaining_item_count ?? 0) === 0) {
                closeSafely();
            } else {
                // Refetch the test record — converted items will disappear.
                setReloadCounter(c => c + 1);
            }
        } catch (e) {
            const msg = e.response?.data?.error || 'Failed to generate certificate. Please try again.';
            addToast(msg, 'error');
        } finally {
            setConverting(false);
        }
    };

    const itemsColSpan = canConvert ? 8 : 7;

    return (
        <Modal show={show} onHide={closeSafely} size="xl" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="fs-6 d-flex align-items-center gap-2">
                    {!atRoot && (
                        <Button variant="link" size="sm" className="p-0 me-1 text-decoration-none"
                            onClick={() => setView({ type, id })} title="Back to record">
                            <FaArrowLeft /> Back
                        </Button>
                    )}
                    Record Detail{(data?.bill_no || data?.auto_number) ? ` — ${data.bill_no || data.auto_number}` : ''}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && <Alert variant="danger" className="small">{error}</Alert>}
                {loading && <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>}

                {!loading && !error && data && parentView && (
                    <Row className="g-4">
                        {/* ── Parent fields (left) ── */}
                        <Col lg={4} className="border-end-lg">
                            <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.72rem' }}>Record</h6>
                            <Field label="Bill No" value={data.bill_no || data.auto_number} />
                            <Field label="Customer" value={data.customer_name} />
                            <Field label="Phone" value={data.customer_phone || '—'} />
                            <Field label="Date" value={dt(data.created || data.created_at || data.createdon)} />
                            <Field label="Status" value={
                                <Badge bg={data.status === 'DONE' ? 'success' : data.status === 'IN_PROGRESS' ? 'info' : 'warning'}>
                                    {data.status === 'DONE' && <FaLock className="me-1" size={10} />}{data.status}
                                </Badge>
                            } />
                            {data.mode_of_payment && <Field label="Payment Mode" value={data.mode_of_payment} />}
                            {data.total !== undefined && <Field label="Total" value={money(data.total)} />}
                            {cert && <Field label="Total Net Weight" value={`${data.total_net_weight || 0} g`} />}
                            {cert && <Field label="Total Fine Weight" value={`${data.total_fine_weight || 0} g`} />}
                            {data.auto_number && (
                                <Field label="Auto Number" value={<span className="text-muted small font-monospace">{data.auto_number}</span>} />
                            )}
                        </Col>

                        {/* ── Related items (right) ── */}
                        <Col lg={8}>
                            <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.72rem' }}>
                                Related Items ({data.items?.length || 0})
                            </h6>
                            <Table hover striped responsive size="sm" className="align-middle small mb-0">
                                <thead className="table-light">
                                    <tr>
                                        {canConvert && <th style={{ width: 32 }} className="text-center" title="Select for cert conversion"></th>}
                                        <th>Item No</th>
                                        <th>Item</th>
                                        <th className="text-end">Gross</th>
                                        <th className="text-end">{cert ? 'Fine' : 'Sample'}</th>
                                        <th className="text-end">Purity</th>
                                        <th className="text-end">Total</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data.items || []).map((item) => (
                                        <tr key={item.id}>
                                            {canConvert && (
                                                <td className="text-center">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={selectedItemIds.has(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                        disabled={!!item.returned || converting}
                                                        title={item.returned ? 'Returned item — cannot be certified' : 'Select for certificate'}
                                                    />
                                                </td>
                                            )}
                                            <td className="fw-semibold text-primary">{item.item_number || item.item_no || '—'}</td>
                                            <td>{item.item_type || item.item_name || item.name || '—'}</td>
                                            <td className="text-end">{item.gross_weight ?? item.total_weight ?? 0} g</td>
                                            <td className="text-end">{(cert ? item.fine_weight : item.sample_weight) ?? 0} g</td>
                                            <td className="text-end fw-semibold text-primary">{item.purity ?? 0}%</td>
                                            <td className="text-end fw-semibold">{money(item.item_total ?? item.amount ?? 0)}</td>
                                            <td className="text-center text-nowrap">
                                                <Button variant="link" size="sm" className="p-1 text-secondary" title="View item"
                                                    onClick={() => setView({ type: itemTypeOf(view.type), id: item.id })}>
                                                    <FaEye />
                                                </Button>
                                                <Button variant="link" size="sm" className="p-1 text-secondary" title="Print item"
                                                    onClick={() => printItem(item)}>
                                                    <FaPrint />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!data.items || data.items.length === 0) && (
                                        <tr><td colSpan={itemsColSpan} className="text-center text-muted py-4">No items.</td></tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Convert-to-certificate confirm row */}
                            {canConvert && confirmOpen && (
                                <div className="mt-3 p-3" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                                    <div className="fw-semibold mb-2">
                                        Convert {selectedItemIds.size} item{selectedItemIds.size === 1 ? '' : 's'} from {data.bill_no || data.auto_number} into a new {metalLabel} Certificate.
                                    </div>
                                    <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                                        <span className="small text-muted">Mode of payment:</span>
                                        {paymentLocked ? (
                                            <>
                                                <span className="fw-semibold">{chosenPayment}</span>
                                                <Button variant="link" size="sm" className="p-0 text-decoration-none"
                                                    onClick={() => setPaymentLocked(false)} disabled={converting}>
                                                    Change
                                                </Button>
                                            </>
                                        ) : (
                                            <Form.Select size="sm" style={{ width: 140 }}
                                                value={chosenPayment}
                                                onChange={(e) => setChosenPayment(e.target.value)}
                                                disabled={converting}>
                                                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                            </Form.Select>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button variant="primary" size="sm" onClick={submitConvert} disabled={converting || selectedItemIds.size === 0}>
                                            {converting ? <><Spinner animation="border" size="sm" className="me-1" />Generating…</> : 'Confirm'}
                                        </Button>
                                        <Button variant="outline-secondary" size="sm" onClick={cancelConfirm} disabled={converting}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                )}

                {/* ── Item drill-in view ── */}
                {!loading && !error && data && !parentView && (
                    <Row xs={1} md={2} className="g-3">
                        <Col><Field label="Item No" value={data.item_number || data.item_no} /></Col>
                        <Col><Field label="Customer" value={data.customer_name} /></Col>
                        <Col><Field label="Item" value={data.item_type || data.item_name || data.name} /></Col>
                        <Col><Field label="Gross Weight" value={`${data.gross_weight ?? data.total_weight ?? 0} g`} /></Col>
                        <Col><Field label={cert ? 'Fine Weight' : 'Sample Weight'} value={`${(cert ? data.fine_weight : data.sample_weight) ?? 0} g`} /></Col>
                        <Col><Field label="Purity" value={`${data.purity ?? 0}%`} /></Col>
                        <Col><Field label="Total" value={money(data.item_total ?? data.amount ?? 0)} /></Col>
                        {data.certificate_number && <Col><Field label="Cert No" value={data.certificate_number} /></Col>}
                    </Row>
                )}
            </Modal.Body>

            <Modal.Footer>
                {canConvert && !confirmOpen && (
                    <Button variant="primary" size="sm" className="me-auto"
                        onClick={() => setConfirmOpen(true)}
                        disabled={selectedItemIds.size === 0 || converting}>
                        <FaFileInvoice className="me-1" />
                        Generate Certificate ({selectedItemIds.size})
                    </Button>
                )}
                <Button variant="secondary" size="sm" onClick={closeSafely} disabled={converting}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
