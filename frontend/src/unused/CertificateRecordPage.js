import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Card, Row, Col, Badge, Button, Table,
    Spinner, Alert, Tabs, Tab, Breadcrumb
} from 'react-bootstrap';
import {
    FaArrowLeft, FaPrint, FaHistory, FaUser,
    FaDatabase, FaShieldAlt, FaTrash, FaCheckCircle, FaFileInvoice, FaCamera
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import api from '../services/api';

const CertificateRecordPage = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    const isPCR = id.startsWith('PCR');
    const isGCR = id.startsWith('GCR');
    const isSCR = id.startsWith('SCR');

    useEffect(() => {
        fetchRecord();
    }, [id]);

    const fetchRecord = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/records/${type}/${id}`);
            setData(response.data.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to fetch certificate details.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const certType = isGCR ? 'gold' : isSCR ? 'silver' : 'photo';
            await api.patch(`/certificates/${id}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchRecord();
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error(error.response.data.error || 'Record is immutable');
            } else {
                toast.error(error.response?.data?.error || 'Failed to update status');
            }
        }
    };

    const handlePrint = (printType = 'standard') => {
        const path = printType === 'small' ? 'small-certificate' : 'certificate';
        navigate(`/print/${path}/${data.auto_number || id}`);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (error) return (
        <Container className="py-5">
            <Alert variant="danger" className="shadow-sm">
                <h4 className="alert-heading">Connection Error</h4>
                <p>{error}</p>
                <hr />
                <Button variant="outline-danger" onClick={fetchRecord}>Retry</Button>
            </Alert>
        </Container>
    );

    if (!data) return (
        <Container className="py-5">
            <Alert variant="warning">Record not found.</Alert>
        </Container>
    );

    const isDone = data.status === 'DONE';
    const certTitle = isGCR ? 'Gold Certificate' : isSCR ? 'Silver Certificate' : 'Photo Certificate';

    return (
        <div className="bg-light min-vh-100 pb-5">
            <ToastContainer />
            <div className="bg-white border-bottom py-2 px-4 sticky-top shadow-sm z-index-1050">
                <Breadcrumb className="m-0 mb-1" style={{ fontSize: '0.85rem' }}>
                    <Breadcrumb.Item onClick={() => navigate('/certificates')}>Certificates</Breadcrumb.Item>
                    <Breadcrumb.Item active>{data.auto_number}</Breadcrumb.Item>
                </Breadcrumb>
                <Row className="align-items-center">
                    <Col>
                        <div className="d-flex align-items-center">
                            <Button variant="link" className="text-dark p-0 me-3" onClick={() => navigate(-1)}>
                                <FaArrowLeft size={18} />
                            </Button>
                            <div>
                                <h4 className="fw-bold mb-0">{data.auto_number}</h4>
                                <small className="text-muted">
                                    {certTitle} • {new Date(data.created || data.created_at).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                    </Col>
                    <Col xs="auto" className="d-flex gap-2">
                        <Badge bg={isDone ? 'success' : 'warning'} className="d-flex align-items-center px-3 fs-6 rounded-pill">
                            {data.status}
                        </Badge>
                        {!isDone && (
                            <Button variant="outline-success" size="sm" className="fw-bold rounded-pill" onClick={() => handleStatusChange('DONE')}>
                                <FaCheckCircle className="me-1" /> Finish
                            </Button>
                        )}
                        <Button variant="outline-primary" size="sm" className="fw-bold rounded-pill" onClick={() => handlePrint('standard')}>
                            <FaPrint className="me-1" /> Print
                        </Button>
                    </Col>
                </Row>
            </div>

            <Container className="mt-4">
                <Card className="border-0 shadow-sm overflow-hidden mb-4">
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="custom-tabs bg-white px-3"
                    >
                        <Tab eventKey="details" title={<span><FaDatabase className="me-2" />Details</span>} className="p-4">
                            <Row className="gy-4">
                                <Col md={8}>
                                    <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        General Information
                                    </h6>
                                    <Row xs={1} md={2} className="g-4">
                                        <DetailField label="Customer" value={data.customer_name} icon={<FaUser />} />
                                        <DetailField label="Phone" value={data.customer_phone || '-'} />
                                        <DetailField label="Status" value={data.status} />
                                        <DetailField label="Auto Number" value={data.auto_number} />
                                        <DetailField label="Payment Mode" value={data.mode_of_payment || 'N/A'} />
                                        <DetailField label="Created On" value={new Date(data.created || data.created_at).toLocaleString()} />
                                    </Row>

                                    <h6 className="text-uppercase text-muted fw-bold mt-5 mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        Measurements & Financials
                                    </h6>
                                    <Row xs={1} md={2} className="g-4">
                                        {isGCR || isSCR ? (
                                            <>
                                                <DetailField label="Total Net Weight" value={`${data.total_net_weight || 0} g`} />
                                                <DetailField label="Total Fine Weight" value={`${data.total_fine_weight || 0} g`} />
                                            </>
                                        ) : (
                                            <DetailField label="Sub-Items" value={data.items?.length || 0} />
                                        )}
                                        <DetailField label="Total Sub-Items" value={data.items?.length || 0} />
                                        <DetailField label="Total Charge" value={`₹${data.total_amount || data.total || 0}`} highlighted />
                                    </Row>
                                </Col>
                                <Col md={4} className="border-start ps-4">
                                    <div className="bg-light p-3 rounded text-center mb-3">
                                        <FaShieldAlt className="text-primary mb-2" size={32} />
                                        <h6>Immutability Status</h6>
                                        {isDone ? (
                                            <Alert variant="success" className="mb-0 py-2 small fw-bold">
                                                Locked (DONE)
                                            </Alert>
                                        ) : (
                                            <Alert variant="warning" className="mb-0 py-2 small">
                                                Active (Editable)
                                            </Alert>
                                        )}
                                    </div>
                                    <p className="small text-muted italic">
                                        {isDone
                                            ? "This certificate has been finalized and cannot be modified. Contact administrator for corrections."
                                            : "You can add items and update payment details while in TODO or IN_PROGRESS status."}
                                    </p>
                                    {isPCR && data.items?.length > 0 && data.items.some(i => i.media) && (
                                        <div className="mt-4">
                                            <h6 className="small fw-bold text-muted text-uppercase mb-2">Sample Preview</h6>
                                            <div className="border rounded overflow-hidden shadow-sm" style={{ maxHeight: '200px' }}>
                                                <img
                                                    src={`${api.defaults.baseURL}/${data.items.find(i => i.media).media}`}
                                                    alt="Preview"
                                                    className="img-fluid w-100"
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="related" title={<span><FaFileInvoice className="me-2" />Related Items ({data.items?.length || 0})</span>} className="p-0">
                            <Table responsive hover className="mb-0 align-middle border-top-0">
                                <thead className="bg-light shadow-sm">
                                    <tr>
                                        <th className="ps-4">Item No</th>
                                        <th>Cert No</th>
                                        {isPCR && <th>Photo</th>}
                                        <th>Description</th>
                                        <th>Net Weight</th>
                                        {isGCR && <th>Fine Weight</th>}
                                        <th>Purity</th>
                                        <th className="text-end pe-4">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items?.map((item) => (
                                        <tr key={item.id} className="cursor-pointer" onClick={() => navigate(`/record/${type.replace('s', '-items')}/${item.id}`)}>
                                            <td className="ps-4 fw-bold">{item.item_number}</td>
                                            <td><Badge bg="light" text="dark">{item.certificate_number || '-'}</Badge></td>
                                            {isPCR && (
                                                <td>
                                                    {item.media ? (
                                                        <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                                                            <img src={`${api.defaults.baseURL}/${item.media}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    ) : (
                                                        <FaCamera className="text-muted" />
                                                    )}
                                                </td>
                                            )}
                                            <td>{item.item_type || item.item_name}</td>
                                            <td>{item.net_weight || item.gross_weight} g</td>
                                            {isGCR && <td>{item.fine_weight} g</td>}
                                            <td><span className="fw-600 text-primary">{item.purity}%</span></td>
                                            <td className="text-end pe-4 fw-bold">₹{item.item_total}</td>
                                        </tr>
                                    ))}
                                    {(!data.items || data.items.length === 0) && (
                                        <tr>
                                            <td colSpan={isPCR ? 8 : 7} className="text-center py-5 text-muted">
                                                <FaHistory size={32} className="mb-2 d-block mx-auto opacity-50" />
                                                No items found for this certificate.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                </Card>
            </Container>

            <style>{`
                .custom-tabs .nav-link {
                    padding: 1rem 1.5rem;
                    color: #6c757d;
                    font-weight: 500;
                    border: none;
                    border-bottom: 3px solid transparent;
                }
                .custom-tabs .nav-link.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                    font-weight: 700;
                }
                .detail-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #adb5bd;
                    font-weight: 700;
                }
                .detail-value {
                    font-size: 1rem;
                    color: #212529;
                    font-weight: 500;
                }
                .fw-600 { font-weight: 600; }
                .cursor-pointer { cursor: pointer; }
                .cursor-pointer:hover { background-color: rgba(var(--primary-rgb), 0.05); }
            `}</style>
        </div>
    );
};

const DetailField = ({ label, value, icon, highlighted }) => (
    <Col>
        <div className="detail-item">
            <div className="detail-label mb-1">
                {icon && <span className="me-1">{icon}</span>}
                {label}
            </div>
            <div className={`detail-value ${highlighted ? 'text-primary fw-bold fs-5' : ''}`}>
                {value || '-'}
            </div>
        </div>
    </Col>
);

export default CertificateRecordPage;
