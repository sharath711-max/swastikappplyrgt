import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Card, Row, Col, Badge, Button, Table,
    Spinner, Alert
} from 'react-bootstrap';
import {
    FaUser, FaDatabase, FaShieldAlt, FaExternalLinkAlt, FaFileInvoice, FaHistory, FaCheckCircle, FaPrint
} from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

import RecordPageHeader from '../components/layout/RecordPageHeader';
import SwastikTabs from '../components/core/SwastikTabs';
import FixedActionFooter from '../components/core/FixedActionFooter';

const RecordPage = () => {
    const { addToast } = useToast();
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        fetchRecord();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id]);

    const fetchRecord = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/records/${type}/${id}`);
            setData(response.data.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to fetch record details.');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (t) => {
        const map = {
            'gold-tests': 'Gold Test',
            'silver-tests': 'Silver Test',
            'gold-certificates': 'Gold Certificate',
            'silver-certificates': 'Silver Certificate',
            'photo-certificates': 'Photo Certificate',
            'gold-test-items': 'Gold Test Item',
            'silver-test-items': 'Silver Test Item',
            'gold-certificate-items': 'Gold Cert Item',
            'silver-certificate-items': 'Silver Cert Item',
            'photo-certificate-items': 'Photo Cert Item',
            'credit-history': 'Credit Transaction',
            'weight-loss-history': 'Weight Loss Record'
        };
        return map[t] || t;
    };

    const isParent = type.endsWith('tests') || type.endsWith('certificates');
    const isItem = type.includes('item');
    const isFinalized = data?.status === 'DONE';

    const handlePrint = () => {
        let printType = type;
        if (type === 'gold-tests') printType = 'gold-test';
        if (type === 'silver-tests') printType = 'silver-test';
        if (type.includes('certificate')) printType = 'certificate';

        // Assuming printing functionality remains the same
        navigate(`/print/${printType}/${data.auto_number || id}`);
    };

    const handleStatusChange = async (newStatus) => {
        try {
            // Determine endpoint based on type
            let endpoint = '';
            if (type.includes('test')) endpoint = `/${type}/${id}/status`;
            else if (type.includes('certificate')) endpoint = `/certificates/${id}/status`;

            if (!endpoint) return;

            await api.patch(endpoint, { status: newStatus });
            addToast(`Status updated to ${newStatus}`, 'success');
            fetchRecord();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to update status', 'error');
        }
    };

    if (loading) return <div className="text-center py-5 vh-100 d-flex align-items-center justify-content-center"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Container className="py-4"><Alert variant="danger" className="shadow-sm">{error}</Alert></Container>;
    if (!data) return <Container className="py-4"><Alert variant="warning">Record not found.</Alert></Container>;

    const DetailFieldArea = () => (
        <Row className="gy-4">
            <Col lg={8}>
                <h6 className="text-uppercase text-muted fw-bold mb-3 section-title">Key Information</h6>
                <Row xs={1} md={2} className="g-4">
                    <DetailField label="Customer" value={data.customer_name} icon={<FaUser />} />
                    <DetailField label="Date" value={new Date(data.created || data.created_at || data.createdon).toLocaleString()} />
                    <DetailField label="Status" value={data.status} />
                    <DetailField label="Auto Number" value={data.auto_number} />
                    {data.mode_of_payment && <DetailField label="Payment Mode" value={data.mode_of_payment} />}
                    {data.total !== undefined && <DetailField label="Total Charges" value={`₹${data.total_amount || data.total}`} highlighted />}
                </Row>

                {type.includes('certificate') && (
                    <>
                        <h6 className="text-uppercase text-muted fw-bold mt-5 mb-3 section-title">Totals</h6>
                        <Row xs={1} md={2} className="g-4">
                            <DetailField label="Total Net Weight" value={`${data.total_net_weight || 0} g`} />
                            <DetailField label="Total Fine Weight" value={`${data.total_fine_weight || 0} g`} />
                        </Row>
                    </>
                )}
            </Col>
            <Col lg={4} className="border-start-lg ps-lg-4">
                <div className="bg-light p-3 rounded text-center h-100 d-flex flex-column justify-content-center">
                    <FaShieldAlt className="text-primary mb-2 mx-auto" size={32} />
                    <h6>Record Status</h6>
                    {isFinalized ? (
                        <Alert variant="success" className="mb-0 py-2 small fw-bold">IMMUTABLE (DONE)</Alert>
                    ) : (
                        <Alert variant="info" className="mb-0 py-2 small">EDITABLE ({data.status})</Alert>
                    )}
                </div>
            </Col>
        </Row>
    );

    const ItemGroupArea = () => (
        <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light shadow-sm">
                <tr>
                    <th className="ps-4">Item No</th>
                    {type.includes('certificate') && <th>Cert No</th>}
                    <th>Description</th>
                    <th>Gross Weight</th>
                    {type.includes('certificate') ? <th>Fine Weight</th> : <th>Sample Weight</th>}
                    <th>Purity</th>
                    <th className="text-end pe-4">Total</th>
                </tr>
            </thead>
            <tbody>
                {data.items?.map((item) => (
                    <tr key={item.id} className="cursor-pointer" onClick={() => navigate(`/record/${type.replace('s', '-items')}/${item.id}`)}>
                        <td className="ps-4 fw-bold text-primary">{item.item_number || item.item_no}</td>
                        {type.includes('certificate') && <td><Badge bg="light" text="dark">{item.certificate_number || '-'}</Badge></td>}
                        <td>{item.item_type || item.item_name}</td>
                        <td>{item.gross_weight || item.total_weight} g</td>
                        <td>{item.fine_weight || item.sample_weight} g</td>
                        <td><span className="fw-600 text-primary">{item.purity}%</span></td>
                        <td className="text-end pe-4 fw-bold">
                            ₹{item.item_total || item.amount || 0}
                            {isParent && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="ms-3 p-0 text-secondary"
                                    title="Print Item only"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        let printType = type;
                                        if (type === 'gold-tests') printType = 'gold-test';
                                        if (type === 'silver-tests') printType = 'silver-test';
                                        if (type.includes('certificate')) printType = 'certificate';
                                        navigate(`/print/${printType}/${data.auto_number || id}?itemIndex=${data.items.indexOf(item)}`);
                                    }}
                                >
                                    <FaPrint />
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
                {(!data.items || data.items.length === 0) && (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No items found.</td></tr>
                )}
            </tbody>
        </Table>
    );

    const AuditLogArea = () => (
        <div className="p-2">
            <h6 className="text-uppercase text-muted fw-bold mb-3 section-title">Audit History</h6>
            <Table responsive size="sm" className="mb-0">
                <tbody>
                    <tr>
                        <td className="text-muted" style={{ width: '150px' }}>Created On</td>
                        <td className="fw-medium">{data.created || data.created_at || data.createdon ? new Date(data.created || data.created_at || data.createdon).toLocaleString() : '-'}</td>
                    </tr>
                    <tr>
                        <td className="text-muted">Last Modified</td>
                        <td className="fw-medium">{data.lastmodified ? new Date(data.lastmodified).toLocaleString() : '-'}</td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );

    const parentTabs = [
        { eventKey: 'details', label: 'Details', icon: <FaDatabase />, content: <DetailFieldArea /> },
        { eventKey: 'items', label: `Items (${data.items?.length || 0})`, icon: <FaFileInvoice />, content: <ItemGroupArea /> },
        { eventKey: 'audit', label: 'Audit Log', icon: <FaHistory />, content: <AuditLogArea /> }
    ];

    return (
        <div className="bg-light min-vh-100 pb-5 d-flex flex-column">

            <RecordPageHeader
                typeLabel={getTypeLabel(type)}
                id={data.id}
                autoNumber={data.auto_number || data.item_number}
                status={data.status}
                isFinalized={isFinalized}
                onFinalize={isParent && !isFinalized ? () => handleStatusChange('DONE') : undefined}
                onPrint={isParent ? handlePrint : undefined}
                parentRoute={isParent ? `/${type.replace('-', '')}` : -1}
            />

            <Container fluid className="mt-4 px-4 flex-grow-1">
                {isParent ? (
                    <SwastikTabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        tabs={parentTabs}
                    />
                ) : (
                    /* Non-parent Detail Layout */
                    <Card className="border-0 shadow-sm p-4 h-100">
                        <Row className="gy-4">
                            <Col md={8}>
                                <h6 className="text-uppercase text-muted fw-bold mb-3 section-title">Item Details</h6>
                                <Row xs={1} md={2} className="g-4">
                                    <DetailField label="Customer" value={data.customer_name} />
                                    <DetailField label="Item ID" value={data.id} />
                                    <DetailField label="Description" value={data.item_type || data.item_name} />
                                    <DetailField label="Purity" value={`${data.purity}%`} />
                                    <DetailField label="Gross Weight" value={`${data.gross_weight || data.total_weight} g`} />
                                    <DetailField label="Net Weight" value={`${data.net_weight} g`} />
                                    {data.fine_weight && <DetailField label="Fine Weight" value={`${data.fine_weight} g`} />}
                                    <DetailField label="Charge" value={`₹${data.item_total || data.amount}`} highlighted />
                                </Row>
                            </Col>
                            {isItem && data.parent_type && (
                                <Col md={4} className="border-start ps-4">
                                    <div className="bg-light p-3 rounded">
                                        <h6>Part Of</h6>
                                        <p className="small text-muted mb-3">This item belongs to a parent {getTypeLabel(data.parent_type)}.</p>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="w-100 rounded-pill"
                                            onClick={() => navigate(`/record/${data.parent_type}/${data.gold_test_id || data.silver_test_id || data.gold_certificate_id || data.silver_certificate_id || data.photo_certificate_id}`)}
                                        >
                                            <FaExternalLinkAlt className="me-2" /> View Parent
                                        </Button>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Card>
                )}
            </Container>

            {isParent && (
                <Container fluid className="px-4 mt-auto pt-4">
                    <FixedActionFooter align="end">
                        {!isFinalized && (
                            <Button variant="outline-success" className="me-3 fw-bold bg-white" onClick={() => handleStatusChange('DONE')}>
                                <FaCheckCircle className="me-2" /> Finalize Record
                            </Button>
                        )}
                        <Button variant="outline-primary" className="me-3 fw-bold bg-white" onClick={() => {
                            let printType = type;
                            if (type === 'gold-tests') printType = 'gold-test';
                            if (type === 'silver-tests') printType = 'silver-test';
                            if (type.includes('certificate')) printType = 'certificate';
                            navigate(`/print/${printType}/${data.auto_number || id}?itemLevel=true`);
                        }}>
                            <FaPrint className="me-2" /> Print Everything Item Level
                        </Button>
                        <Button variant="primary" className="fw-bold" style={{ backgroundColor: '#0176d3' }} onClick={handlePrint}>
                            <FaPrint className="me-2" /> Print Full Document
                        </Button>
                    </FixedActionFooter>
                </Container>
            )}

            <style>{`
                .section-title { font-size: 0.75rem; letter-spacing: 1px; }
                .cursor-pointer { cursor: pointer; }
                .cursor-pointer:hover { background-color: #f8f9fa; }
                .fw-600 { font-weight: 600; }
                @media (min-width: 992px) {
                    .border-start-lg { border-left: 1px solid #dee2e6 !important; }
                }
            `}</style>
        </div>
    );
};

const DetailField = ({ label, value, icon, highlighted }) => (
    <Col>
        <div className="mb-2">
            <div className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.7rem' }}>
                {icon && <span className="me-1">{icon}</span>}{label}
            </div>
            <div className={`fs-6 ${highlighted ? 'text-primary fw-bold' : 'text-dark fw-500'}`}>
                {value || '-'}
            </div>
        </div>
    </Col>
);

export default RecordPage;
