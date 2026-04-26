import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Nav, Tab, Badge, Button, Accordion, Table, Spinner } from 'react-bootstrap';
import { FaPhone, FaArrowLeft, FaEdit, FaCheckCircle, FaTimesCircle, FaPlus } from 'react-icons/fa';
import api from '../services/api';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import { usePrint } from '../contexts/PrintContext';
import NewCreditHistoryModal from '../components/NewCreditHistoryModal';
import NewWeightLossHistoryModal from '../components/NewWeightLossHistoryModal';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

const getBalanceClass = (balance) => {
    if (balance > 0) return 'text-danger';
    if (balance < 0) return 'text-success';
    return 'text-secondary';
};

const getBalanceLabel = (balance) => {
    if (balance > 0) return 'DR';
    if (balance < 0) return 'CR';
    return 'Settled';
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
};

const RelatedList = ({ title, data, columns, emptyMessage }) => (
    <div className="mb-4">
        <h5 className="fw-bold mb-3 text-secondary">
            {title} <Badge bg="secondary" pill>{data.length}</Badge>
        </h5>
        {data.length === 0 ? (
            <div className="text-muted fst-italic py-2 border rounded text-center bg-light">{emptyMessage}</div>
        ) : (
            <div className="table-responsive border rounded">
                <Table hover size="sm" className="mb-0">
                    <thead className="bg-light">
                        <tr>{columns.map((col, idx) => <th key={idx}>{col.header}</th>)}</tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx}>{col.render ? col.render(row) : row[col.field]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )}
    </div>
);

const eventMeta = (ev) => {
    const map = {
        gold_test:   { bg: 'warning',   label: 'Gold Test' },
        silver_test: { bg: 'secondary', label: 'Silver Test' },
        gold_cert:   { bg: 'warning',   label: 'Gold Cert' },
        silver_cert: { bg: 'secondary', label: 'Silver Cert' },
        photo_cert:  { bg: 'info',      label: 'Photo Cert' },
        payment:     { bg: ev.status === 'DEBIT' ? 'danger' : 'success', label: ev.status === 'DEBIT' ? 'Charged' : 'Credited' },
        weight_loss: { bg: 'dark',      label: 'Weight Loss' },
    };
    return map[ev.event_type] || { bg: 'primary', label: ev.event_type };
};

const CustomerProfile = () => {
    const { addToast } = useToast();
    const { openModal } = useModal();
    const { id } = useParams();
    const navigate = useNavigate();
    const { triggerPrint } = usePrint();

    const [activeTab, setActiveTab] = useState('details');
    const [customer, setCustomer] = useState(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [timeline, setTimeline] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [relatedData, setRelatedData] = useState({
        goldTests: [], silverTests: [], goldCerts: [], silverCerts: [],
        photoCerts: [], creditHistory: [], weightLoss: [], loaded: false
    });
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [showCHModal, setShowCHModal] = useState(false);
    const [showWLHModal, setShowWLHModal] = useState(false);

    const fetchCustomer = useCallback(async () => {
        setLoadingCustomer(true);
        try {
            const res = await api.get(`/customers/${id}`);
            setCustomer(res.data);
        } catch {
            addToast('Failed to load customer profile', 'error');
        } finally {
            setLoadingCustomer(false);
        }
    }, [id, addToast]);

    const fetchTimeline = useCallback(async () => {
        if (timelineLoading) return;
        setTimelineLoading(true);
        try {
            const res = await api.get(`/customers/${id}/timeline`);
            setTimeline(res.data?.data?.events || []);
        } catch {
            // non-fatal — details tab just shows empty recent activity
        } finally {
            setTimelineLoading(false);
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchRelatedData = useCallback(async (force = false) => {
        if (relatedData.loaded && !force) return;
        setLoadingRelated(true);
        try {
            const [gt, st, gc, sc, pc, ch, wlh] = await Promise.all([
                api.get(`/gold-tests?customer_id=${id}`),
                api.get(`/silver-tests?customer_id=${id}`),
                api.get(`/certificates?type=gold&customer_id=${id}`),
                api.get(`/certificates?type=silver&customer_id=${id}`),
                api.get(`/certificates?type=photo&customer_id=${id}`),
                api.get(`/credit-history?customer_id=${id}`),
                api.get(`/weight-loss?customer_id=${id}`)
            ]);
            setRelatedData({
                goldTests: gt.data.data || [],
                silverTests: st.data.data || [],
                goldCerts: gc.data.data || [],
                silverCerts: sc.data.data || [],
                photoCerts: pc.data.data || [],
                creditHistory: ch.data.data || [],
                weightLoss: wlh.data.data || [],
                loaded: true
            });
        } catch {
            addToast('Failed to load related records', 'error');
        } finally {
            setLoadingRelated(false);
        }
    }, [id, relatedData.loaded, addToast]);

    useEffect(() => { fetchCustomer(); }, [fetchCustomer]);
    useEffect(() => { fetchTimeline(); }, [fetchTimeline]);
    useEffect(() => {
        if (activeTab === 'related') fetchRelatedData();
    }, [activeTab, fetchRelatedData]);

    if (loadingCustomer) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
    if (!customer) return <div className="text-center py-5 text-danger">Customer not found</div>;

    const isActive = !customer.deletedon;
    const lastEvent = timeline[0];

    const openEditModal = () => openModal('customer', {
        customer,
        reload: async (updated) => {
            if (updated) setCustomer(updated);
            await fetchCustomer();
        }
    });

    return (
        <Container fluid className="py-4">

            {/* Back link */}
            <Button variant="link" className="text-secondary mb-3 p-0 text-decoration-none" onClick={() => navigate('/customers')}>
                <FaArrowLeft className="me-2" /> Back to Customers
            </Button>

            {/* ── HEADER CARD ─────────────────────────────────────────────── */}
            <Card className="border-0 shadow-sm mb-3">
                <Card.Body className="p-3">

                    {/* Name / phone / badge | Balance */}
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h5 className="mb-0 fw-bold">{customer.name}</h5>
                                <Badge bg={isActive ? 'success' : 'secondary'} className="d-flex align-items-center gap-1">
                                    {isActive ? <><FaCheckCircle size={10} /> Active</> : <><FaTimesCircle size={10} /> Inactive</>}
                                </Badge>
                            </div>
                            <small className="text-muted d-flex align-items-center gap-1 mt-1">
                                <FaPhone size={10} /> +91 {customer.phone}
                            </small>
                        </div>

                        <div className="text-end">
                            <div className="balance-label">Net Balance</div>
                            <div className={`fw-bold fs-4 ${getBalanceClass(customer.balance)}`}>
                                {formatCurrency(Math.abs(customer.balance || 0))}
                                <span className="ms-1 fs-6 opacity-75">{getBalanceLabel(customer.balance)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 d-flex gap-2 flex-wrap">
                        <Button variant="outline-primary" size="sm" onClick={openEditModal}>
                            <FaEdit className="me-1" /> Edit
                        </Button>
                    </div>

                </Card.Body>
            </Card>

            {/* ── TABS ────────────────────────────────────────────────────── */}
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom pt-3 px-3">
                        <Nav variant="tabs" className="mb-0 border-0">
                            <Nav.Item><Nav.Link eventKey="details" className="fw-bold px-4 py-3">OVERVIEW</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="related" className="fw-bold px-4 py-3">RECORDS</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="timeline" className="fw-bold px-4 py-3">TIMELINE</Nav.Link></Nav.Item>
                        </Nav>
                    </Card.Header>

                    <Card.Body className="p-4">
                        <Tab.Content>

                            {/* ── TAB 1: OVERVIEW ─────────────────────────────────────── */}
                            <Tab.Pane eventKey="details">

                                {/* Summary stat cards */}
                                <div className="row g-3 mb-4">
                                    <div className="col-6 col-md-4">
                                        <div className="card border-0 shadow-sm bg-white text-center p-3 h-100">
                                            <small className="text-muted mb-1">Total Activity</small>
                                            {timelineLoading
                                                ? <Spinner animation="border" size="sm" />
                                                : <h5 className="mb-0 fw-bold text-dark">{timeline.length}</h5>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <div className="card border-0 shadow-sm bg-white text-center p-3 h-100">
                                            <small className="text-muted mb-1">Last Activity</small>
                                            <h6 className="mb-0 fw-bold text-dark">
                                                {timelineLoading ? <Spinner animation="border" size="sm" /> : timeAgo(lastEvent?.event_date)}
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="card border-0 shadow-sm bg-white text-center p-3 h-100">
                                            <small className="text-muted mb-1">Balance State</small>
                                            <h6 className={`mb-0 fw-bold ${getBalanceClass(customer.balance)}`}>
                                                {customer.balance > 0 ? 'Amount Due' : customer.balance < 0 ? 'Advance Paid' : 'Settled'}
                                            </h6>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer info — secondary, at bottom */}
                                <h6 className="fw-bold text-muted mb-2 border-top pt-3">Customer Information</h6>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <table className="table table-sm table-borderless align-middle">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: 140 }}>Full Name</td>
                                                    <td>{customer.name}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">Phone</td>
                                                    <td>{customer.phone}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">Notes</td>
                                                    <td className="fst-italic text-secondary">{customer.notes || 'No notes'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-sm-6">
                                        <table className="table table-sm table-borderless align-middle">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: 140 }}>Created On</td>
                                                    <td>{new Date(customer.created).toLocaleDateString('en-IN')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">Last Modified</td>
                                                    <td>{customer.lastmodified ? new Date(customer.lastmodified).toLocaleDateString('en-IN') : '—'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </Tab.Pane>

                            {/* ── TAB 2: RECORDS ──────────────────────────────────────── */}
                            <Tab.Pane eventKey="related">
                                {loadingRelated ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Loading records...</p>
                                    </div>
                                ) : (
                                    <Accordion defaultActiveKey={['0']} alwaysOpen>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>Gold Certificates ({relatedData.goldCerts.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList title="Gold Certificates" data={relatedData.goldCerts}
                                                    emptyMessage="No Gold Certificates found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() },
                                                        { header: 'Total', render: r => formatCurrency(r.total) },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={async () => {
                                                            try {
                                                                await triggerPrint('gold-certificate', r.id);
                                                            } catch (err) {
                                                                addToast('Print failed. Please try again.', 'error');
                                                            }
                                                        }}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>Silver Certificates ({relatedData.silverCerts.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList title="Silver Certificates" data={relatedData.silverCerts}
                                                    emptyMessage="No Silver Certificates found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={async () => {
                                                            try {
                                                                await triggerPrint('silver-certificate', r.id);
                                                            } catch (err) {
                                                                addToast('Print failed. Please try again.', 'error');
                                                            }
                                                        }}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="2">
                                            <Accordion.Header>Gold Tests ({relatedData.goldTests.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList title="Gold Tests" data={relatedData.goldTests}
                                                    emptyMessage="No Gold Tests found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Status', render: r => <Badge bg={r.status === 'DONE' ? 'success' : 'warning'}>{r.status}</Badge> },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={() => navigate(`/record/gold-tests/${r.id}`)}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="3">
                                            <Accordion.Header>Silver Tests ({relatedData.silverTests.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList title="Silver Tests" data={relatedData.silverTests}
                                                    emptyMessage="No Silver Tests found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Status', render: r => <Badge bg={r.status === 'DONE' ? 'success' : 'warning'}>{r.status}</Badge> },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={() => navigate(`/record/silver-tests/${r.id}`)}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="4">
                                            <Accordion.Header>Photo Certificates ({relatedData.photoCerts.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList title="Photo Certificates" data={relatedData.photoCerts}
                                                    emptyMessage="No Photo Certificates found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={async () => {
                                                            try {
                                                                await triggerPrint('photo-certificate', r.id);
                                                            } catch (err) {
                                                                addToast('Print failed. Please try again.', 'error');
                                                            }
                                                        }}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="5">
                                            <Accordion.Header>
                                                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                                    <span>Credit History ({relatedData.creditHistory.length})</span>
                                                    <Button as="span" size="sm" variant="primary" className="py-0 px-2"
                                                        onClick={(e) => { e.stopPropagation(); setShowCHModal(true); }}>
                                                        <FaPlus size={10} className="me-1" /> Add
                                                    </Button>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList title="Credit History" data={relatedData.creditHistory}
                                                    emptyMessage="No Credit History records found."
                                                    columns={[
                                                        { header: 'Date', render: r => new Date(r.createdon).toLocaleDateString() },
                                                        { header: 'Type', render: r => <Badge bg={r.type === 'debit' ? 'danger' : 'success'}>{r.type.toUpperCase()}</Badge> },
                                                        { header: 'Amount', render: r => formatCurrency(r.amount) },
                                                        { header: 'Description', field: 'description' }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="6">
                                            <Accordion.Header>
                                                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                                    <span>Weight Loss History ({relatedData.weightLoss.length})</span>
                                                    <Button as="span" size="sm" variant="primary" className="py-0 px-2"
                                                        onClick={(e) => { e.stopPropagation(); setShowWLHModal(true); }}>
                                                        <FaPlus size={10} className="me-1" /> Add
                                                    </Button>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList title="Weight Loss History" data={relatedData.weightLoss}
                                                    emptyMessage="No Weight Loss records found."
                                                    columns={[
                                                        { header: 'Date', render: r => new Date(r.createdon).toLocaleDateString() },
                                                        { header: 'Amount', render: r => formatCurrency(r.amount) },
                                                        { header: 'Reason', field: 'reason' }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                )}
                            </Tab.Pane>

                            {/* ── TAB 3: TIMELINE ─────────────────────────────────────── */}
                            <Tab.Pane eventKey="timeline">
                                {timelineLoading ? (
                                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                                ) : timeline.length === 0 ? (
                                    <div className="text-center text-muted py-5 fst-italic">No events found for this customer.</div>
                                ) : (
                                    <div className="timeline-feed">
                                        {timeline.map((ev, idx) => {
                                            const meta = eventMeta(ev);
                                            return (
                                                <div key={ev.id + idx} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                                                    <div className="flex-shrink-0 pt-1">
                                                        <Badge bg={meta.bg} style={{ minWidth: 90, textAlign: 'center' }}>{meta.label}</Badge>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <span className="fw-semibold">
                                                                {ev.reference || '—'}
                                                                {ev.status && <Badge bg="light" text="dark" className="ms-2 fw-normal">{ev.status}</Badge>}
                                                            </span>
                                                            <small className="text-muted ms-3 text-nowrap">
                                                                {new Date(ev.event_date).toLocaleString('en-IN')}
                                                            </small>
                                                        </div>
                                                        {ev.description && <div className="text-muted small mt-1">{ev.description}</div>}
                                                        {ev.amount > 0 && (
                                                            <div className="small mt-1">
                                                                {formatCurrency(ev.amount)}
                                                                {ev.mode_of_payment && <span className="text-muted ms-2">via {ev.mode_of_payment}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Tab.Pane>

                        </Tab.Content>
                    </Card.Body>
                </Card>
            </Tab.Container>

            <NewCreditHistoryModal
                show={showCHModal}
                onHide={() => setShowCHModal(false)}
                customerId={id}
                onSuccess={() => {
                    fetchCustomer();
                    setRelatedData(prev => ({ ...prev, loaded: false }));
                    setActiveTab('related');
                    fetchRelatedData(true);
                }}
            />
            <NewWeightLossHistoryModal
                show={showWLHModal}
                onHide={() => setShowWLHModal(false)}
                customerId={id}
                onSuccess={() => {
                    setRelatedData(prev => ({ ...prev, loaded: false }));
                    setActiveTab('related');
                    fetchRelatedData(true);
                }}
            />

        </Container>
    );
};

export default CustomerProfile;
