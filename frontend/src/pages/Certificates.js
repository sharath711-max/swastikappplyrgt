import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Row, Col, Card, Button, Badge, Modal, InputGroup, FormControl
} from 'react-bootstrap';
import {
    FaPlus, FaSearch, FaPrint, FaCertificate, FaHistory
} from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import CertificateForm from '../components/CertificateForm';
import GoldCertificateItemForm from '../components/GoldCertificateItemForm';

const Certificates = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showItemForm, setShowItemForm] = useState(false);
    const [activeCertId, setActiveCertId] = useState(null);
    const [promoteData, setPromoteData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (location.state?.promoteData) {
            setPromoteData(location.state.promoteData);
            setShowForm(true);
            // Clear state so it doesn't reopen on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const [goldRes, silverRes, photoRes] = await Promise.allSettled([
                api.get('/certificates?type=gold'),
                api.get('/certificates?type=silver'),
                api.get('/certificates?type=photo')
            ]);
            const extract = (r) => {
                if (r.status !== 'fulfilled') return [];
                const d = r.value.data;
                return Array.isArray(d) ? d : (d?.data || []);
            };
            setCertificates([...extract(goldRes), ...extract(silverRes), ...extract(photoRes)]);
        } catch (error) {
            addToast('Failed to fetch certificates', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const handleCreate = async (formData) => {
        try {
            const res = await api.post('/certificates/with-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data) {
                addToast('Certificate issued successfully', 'success');
                setShowForm(false);
                fetchCertificates();
                // Optionally auto-open print view
                navigate(`/print/certificate/${res.data.certificate_no}`);
            }
        } catch (error) {
            addToast('Failed to issue certificate', 'error');
        }
    };

    const filteredCertificates = certificates.filter(c =>
        c.certificate_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container fluid className="py-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h2 style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        <FaCertificate className="me-2" /> Certificates
                    </h2>
                    <p className="text-muted">Issue and manage professional lab certificates</p>
                </Col>
                <Col md={4}>
                    <InputGroup className="shadow-sm">
                        <InputGroup.Text className="bg-white border-end-0">
                            <FaSearch className="text-muted" />
                        </InputGroup.Text>
                        <FormControl
                            placeholder="Search by Cert No or Customer..."
                            className="border-start-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" style={{ background: 'var(--primary)', border: 'none', fontWeight: 600 }} onClick={() => setShowForm(true)}>
                        <FaPlus className="me-1" /> New Certificate
                    </Button>
                </Col>
            </Row>

            <div className="grid-certificates">
                <Row>
                    {filteredCertificates.map(cert => (
                        <Col md={6} lg={4} key={cert.id} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 premium-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-3">
                                        <Badge bg={cert.certificate_type === 'gold' ? 'warning' : 'secondary'} className="px-3 py-2">
                                            {cert.certificate_type.toUpperCase()}
                                        </Badge>
                                        <small className="text-muted">{new Date(cert.issue_date).toLocaleDateString()}</small>
                                    </div>
                                    <h5 className="fw-bold mb-1">{cert.certificate_no}</h5>
                                    <p className="mb-3 text-primary fw-600">{cert.customer_name}</p>

                                    <div className="d-flex gap-3 mb-3 small">
                                        <div><span className="text-muted">Weight:</span> <b>{cert.total_weight}g</b></div>
                                        <div><span className="text-muted">Amount:</span> <b>₹{cert.total_amount}</b></div>
                                    </div>

                                    {cert.photo_path && (
                                        <div className="mb-3 rounded overflow-hidden" style={{ height: '100px', background: '#f8f9fa' }}>
                                            <img
                                                src={`${process.env.REACT_APP_API_URL || ''}${cert.photo_path}`}
                                                alt="Sample"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Photo'; }}
                                            />
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 mb-2">
                                        <Button variant="outline-primary" size="sm" className="flex-grow-1" onClick={() => navigate(`/print/certificate/${cert.certificate_no}`)}>
                                            <FaPrint className="me-1" /> Standard
                                        </Button>
                                        <Button variant="outline-info" size="sm" className="flex-grow-1" onClick={() => navigate(`/print/small-certificate/${cert.certificate_no}`)}>
                                            <FaPrint className="me-1" /> Small
                                        </Button>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="w-100 text-decoration-none fw-bold"
                                        onClick={() => navigate(`/record/${cert.certificate_type}s/${cert.id}`)}
                                    >
                                        View Details
                                    </Button>

                                    {cert.certificate_type === 'gold' && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="w-100 mt-2 fw-bold"
                                            onClick={() => {
                                                setActiveCertId(cert.id);
                                                setShowItemForm(true);
                                            }}
                                        >
                                            <FaPlus className="me-1" /> Manage Items
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {filteredCertificates.length === 0 && !loading && (
                <div className="text-center py-5 bg-white rounded shadow-sm">
                    <FaHistory size={48} className="text-muted mb-3" />
                    <h5>No certificates found</h5>
                    <p className="text-muted">Try a different search or create a new certificate.</p>
                </div>
            )}

            {/* Existing Modal for New Certificate */}
            <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold" style={{ color: 'var(--primary)' }}>Issue New Certificate</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    <CertificateForm
                        initialData={promoteData}
                        onSubmit={handleCreate}
                        onCancel={() => { setShowForm(false); setPromoteData(null); }}
                    />
                </Modal.Body>
            </Modal>

            {/* New Modal for Managing Individual Items (Gold) */}
            <Modal show={showItemForm} onHide={() => { setShowItemForm(false); setActiveCertId(null); }} size="md" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold" style={{ color: '#198754' }}>
                        Add Gold Item to Certificate
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    <GoldCertificateItemForm
                        certificateId={activeCertId}
                        onItemAdded={() => {
                            fetchCertificates(); // Refresh to show updated weights/counts
                        }}
                    />
                </Modal.Body>
            </Modal>

            <style>{`
                .premium-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                    border-left: 4px solid var(--primary) !important;
                }
                .premium-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                .fw-600 { font-weight: 600; }
            `}</style>
        </Container>
    );
};

export default Certificates;
