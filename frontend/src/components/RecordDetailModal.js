import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaPrint, FaEye, FaArrowLeft, FaLock } from 'react-icons/fa';
import api from '../services/api';
import { usePrint } from '../contexts/PrintContext';
import { useToast } from '../contexts/ToastContext';
import useSafeModalClose from '../hooks/useSafeModalClose';

const PARENT_TYPES = ['gold-tests', 'silver-tests', 'gold-certificates', 'silver-certificates', 'photo-certificates'];
const PRINT_ROUTE = {
    'gold-tests': 'gold-test', 'silver-tests': 'silver-test',
    'gold-certificates': 'gold-certificate', 'silver-certificates': 'silver-certificate',
    'photo-certificates': 'photo-certificate',
};
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

    // Reset to the root record each time the modal (re)opens or target changes.
    useEffect(() => { if (show) setView({ type, id }); }, [show, type, id]);

    useEffect(() => {
        if (!show || !view.type || !view.id) return undefined;
        let active = true;
        setLoading(true); setError(''); setData(null);
        api.get(`/records/${view.type}/${view.id}`)
            .then(r => { if (active) setData(r.data?.data ?? null); })
            .catch(e => { if (active) setError(e.response?.data?.error || 'Failed to load record'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [show, view.type, view.id]);

    const atRoot     = view.type === type && view.id === id;
    const parentView = isParentType(view.type);
    const cert       = isCert(view.type);

    const printItem = async (item) => {
        const route = PRINT_ROUTE[view.type];
        if (!route || !data?.items) return;
        try { await triggerPrint(route, view.id, { itemIndex: data.items.indexOf(item) }); }
        catch { addToast('Print failed. Please try again.', 'error'); }
    };

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
                                        <tr><td colSpan={7} className="text-center text-muted py-4">No items.</td></tr>
                                    )}
                                </tbody>
                            </Table>
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
                <Button variant="secondary" size="sm" onClick={closeSafely}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
