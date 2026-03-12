
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Nav, Tab, Row, Col, Badge, Button, Accordion, Table, Spinner } from 'react-bootstrap';
import { FaPhone, FaArrowLeft, FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import NewCustomerModal from '../components/NewCustomerModal';
import NewCreditHistoryModal from '../components/NewCreditHistoryModal';
import NewWeightLossHistoryModal from '../components/NewWeightLossHistoryModal';
import { FaPlus } from 'react-icons/fa';

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

// Generic Related List Component - NO INTERNAL IDs
const RelatedList = ({ title, data, columns, emptyMessage }) => {
    return (
        <div className="mb-4">
            <h5 className="fw-bold mb-3 text-secondary">{title} <Badge bg="secondary" pill>{data.length}</Badge></h5>
            {data.length === 0 ? (
                <div className="text-muted fst-italic py-2 border rounded text-center bg-light">{emptyMessage}</div>
            ) : (
                <div className="table-responsive border rounded">
                    <Table hover size="sm" className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                {columns.map((col, idx) => <th key={idx}>{col.header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx}>
                                            {col.render ? col.render(row) : row[col.field]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

const CustomerProfile = () => {
    const { addToast } = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [customer, setCustomer] = useState(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [relatedData, setRelatedData] = useState({
        goldTests: [],
        silverTests: [],
        goldCerts: [],
        silverCerts: [],
        photoCerts: [],
        creditHistory: [],
        weightLoss: [],
        loaded: false
    });
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCHModal, setShowCHModal] = useState(false);
    const [showWLHModal, setShowWLHModal] = useState(false);

    const fetchCustomer = useCallback(async () => {
        setLoadingCustomer(true);
        try {
            const res = await api.get(`/customers/${id}`);
            setCustomer(res.data);
        } catch (error) {
            console.error('Error fetching customer:', error);
            addToast('Failed to load customer profile', 'error');
        } finally {
            setLoadingCustomer(false);
        }
    }, [id, addToast]);

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
        } catch (error) {
            console.error('Error fetching related data:', error);
            addToast('Failed to load related records', 'error');
        } finally {
            setLoadingRelated(false);
        }
    }, [id, relatedData.loaded, addToast]);

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    useEffect(() => {
        if (activeTab === 'related') {
            fetchRelatedData();
        }
    }, [activeTab, fetchRelatedData]);

    if (loadingCustomer) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
    if (!customer) return <div className="text-center py-5 text-danger">Customer not found</div>;

    const isActive = !customer.deletedon;

    return (
        <Container fluid className="py-4">
            <Button variant="link" className="text-secondary mb-3 p-0 text-decoration-none" onClick={() => navigate('/customers')}>
                <FaArrowLeft className="me-2" /> Back to Customers
            </Button>

            {/* Header Section */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h2 className="fw-bold mb-2">{customer.name}</h2>
                            <div className="d-flex align-items-center gap-3 text-muted">
                                <span className="d-flex align-items-center gap-1">
                                    <FaPhone className="text-primary" /> {customer.phone}
                                </span>
                                <Badge bg={isActive ? 'success' : 'danger'} className="d-flex align-items-center gap-1">
                                    {isActive ? <><FaCheckCircle size={10} /> ACTIVE</> : <><FaTimesCircle size={10} /> INACTIVE</>}
                                </Badge>
                            </div>
                        </Col>
                        <Col md={6} className="text-md-end mt-3 mt-md-0">
                            <div className="mb-2 text-muted fw-semibold">Current Balance (Read-Only)</div>
                            <h3 className={`fw-bold ${customer.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                {formatCurrency(customer.balance)}
                            </h3>
                            <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => setShowEditModal(true)}>
                                <FaEdit className="me-1" /> Edit Customer
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabs Section */}
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom pt-3 px-3">
                        <Nav variant="tabs" className="mb-0 border-0">
                            <Nav.Item>
                                <Nav.Link eventKey="details" className="fw-bold px-4 py-3">DETAILS</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="related" className="fw-bold px-4 py-3">RELATED</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body className="p-4">
                        <Tab.Content>
                            {/* TAB 1: DETAILS - NO IDS */}
                            <Tab.Pane eventKey="details">
                                <h5 className="mb-4 text-primary fw-bold">Customer Information</h5>
                                <Row>
                                    <Col md={6}>
                                        <Table borderedless="true" className="align-middle">
                                            <tbody>
                                                {/* Customer ID Removed */}
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: '150px' }}>Full Name</td>
                                                    <td>{customer.name}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">Phone Number</td>
                                                    <td>{customer.phone}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">Notes</td>
                                                    <td className="fst-italic text-secondary">{customer.notes || 'No notes available'}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col md={6}>
                                        <Table borderedless="true" className="align-middle">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted fw-semibold" style={{ width: '150px' }}>Created On</td>
                                                    <td>{new Date(customer.created).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted fw-semibold">Last Modified</td>
                                                    <td>{customer.lastmodified ? new Date(customer.lastmodified).toLocaleString() : '-'}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* TAB 2: RELATED - NO INTERNAL IDS */}
                            <Tab.Pane eventKey="related">
                                {loadingRelated ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Loading related records...</p>
                                    </div>
                                ) : (
                                    <Accordion defaultActiveKey={['0']} alwaysOpen>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>Gold Certificates ({relatedData.goldCerts.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList
                                                    title="Gold Certificates"
                                                    data={relatedData.goldCerts}
                                                    emptyMessage="No Gold Certificates found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() }, // Changed from issue_date to created which is standard
                                                        { header: 'Total', render: r => formatCurrency(r.total) },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={() => navigate(`/print/certificate/${r.id}`)}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>Silver Certificates ({relatedData.silverCerts.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList
                                                    title="Silver Certificates"
                                                    data={relatedData.silverCerts}
                                                    emptyMessage="No Silver Certificates found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={() => navigate(`/print/certificate/${r.id}`)}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="2">
                                            <Accordion.Header>Gold Tests ({relatedData.goldTests.length})</Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList
                                                    title="Gold Tests"
                                                    data={relatedData.goldTests}
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
                                                <RelatedList
                                                    title="Silver Tests"
                                                    data={relatedData.silverTests}
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
                                                <RelatedList
                                                    title="Photo Certificates"
                                                    data={relatedData.photoCerts}
                                                    emptyMessage="No Photo Certificates found."
                                                    columns={[
                                                        { header: 'Record No', field: 'auto_number' },
                                                        { header: 'Date', render: r => new Date(r.created).toLocaleDateString() },
                                                        { header: 'Action', render: r => <Button size="sm" variant="link" onClick={() => navigate(`/print/certificate/${r.id}`)}>View</Button> }
                                                    ]}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        <Accordion.Item eventKey="5">
                                            <Accordion.Header>
                                                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                                    <span>Credit History ({relatedData.creditHistory.length})</span>
                                                    <Button
                                                        as="span"
                                                        size="sm"
                                                        variant="primary"
                                                        className="py-0 px-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowCHModal(true);
                                                        }}
                                                    >
                                                        <FaPlus size={10} className="me-1" /> Add
                                                    </Button>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList
                                                    title="Credit History"
                                                    data={relatedData.creditHistory}
                                                    emptyMessage="No Credit History records found."
                                                    columns={[
                                                        // Removed ID column entirely
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
                                                    <Button
                                                        as="span"
                                                        size="sm"
                                                        variant="primary"
                                                        className="py-0 px-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowWLHModal(true);
                                                        }}
                                                    >
                                                        <FaPlus size={10} className="me-1" /> Add
                                                    </Button>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <RelatedList
                                                    title="Weight Loss History"
                                                    data={relatedData.weightLoss}
                                                    emptyMessage="No Weight Loss records found."
                                                    columns={[
                                                        // Removed ID column entirely
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
                        </Tab.Content>
                    </Card.Body>
                </Card>
            </Tab.Container>

            {/* Edit Customer Modal */}
            <NewCustomerModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                customer={customer}
                onSuccess={(updatedCustomer) => {
                    setCustomer(updatedCustomer);
                    fetchCustomer();
                }}
            />
            {/* Credit History Modal */}
            <NewCreditHistoryModal
                show={showCHModal}
                onHide={() => setShowCHModal(false)}
                customerId={id}
                onSuccess={() => {
                    fetchCustomer(); // Update balance
                    setRelatedData(prev => ({ ...prev, loaded: false })); // Force reload history
                    setActiveTab('related');
                    fetchRelatedData(true);
                }}
            />
            {/* Weight Loss History Modal */}
            <NewWeightLossHistoryModal
                show={showWLHModal}
                onHide={() => setShowWLHModal(false)}
                customerId={id}
                onSuccess={() => {
                    setRelatedData(prev => ({ ...prev, loaded: false })); // Force reload history
                    setActiveTab('related');
                    fetchRelatedData(true);
                }}
            />
        </Container>
    );
};

export default CustomerProfile;
