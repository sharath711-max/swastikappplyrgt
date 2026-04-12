import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import CertificateForm from '../components/CertificateForm';
import GoldCertificateItemForm from '../components/GoldCertificateItemForm';

const CERT_CONFIG = {
    gold: { title: 'Gold Certificates', print: 'certificate', hasItems: true },
    silver: { title: 'Silver Certificates', print: 'certificate', hasItems: false },
    photo: { title: 'Photo Certificates', print: 'certificate', hasItems: false }
};

export default function CertificatePage({ type }) {
    const config = CERT_CONFIG[type];
    const [certs, setCerts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [itemId, setItemId] = useState(null);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const load = () => {
        if (!config) return;
        api.get(`/certificates?type=${type}`)
            .then(res => setCerts(res.data?.data ?? res.data ?? []))
            .catch(e => addToast(e.message || 'Failed to load certificates', 'error'));
    };
    
    useEffect(() => { load(); }, [type]);

    if (!config) return <Alert variant="danger">Invalid certificate type configuration.</Alert>;

    const handleCreate = async (fd) => {
        const popup = window.open('', '_blank');
        try {
            const res = await api.post('/certificates/with-photo', fd);
            const data = res.data?.data ?? res.data;
            
            if (data?.certificate_no) {
                popup.location.href = `/print/${config.print}/${data.certificate_no}`;
                setShowForm(false);
                addToast('Certificate issued successfully', 'success');
                load();
            } else {
                popup.close();
                addToast('Invalid response from server', 'error');
            }
        } catch (e) {
            popup.close();
            addToast(`[${e.code || e.type || 'SYSTEM'}] ${e.message}`, 'error');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between mb-3">
                <h2>{config.title}</h2>
                <Button onClick={() => setShowForm(true)}>New Certificate</Button>
            </div>
            
            <Table hover responsive className="bg-white shadow-sm">
                <thead><tr><th>Cert No</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {certs.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-muted">No certificates found.</td></tr>
                    ) : certs.map(c => (
                        <tr key={c.id}>
                            <td>
                                <Badge bg={type === 'gold' ? 'warning' : 'secondary'} className="me-2 text-uppercase">
                                    {c.certificate_type || type}
                                </Badge>
                                {c.certificate_no}
                            </td>
                            <td>{c.customer_name}</td>
                            <td>{formatDate(c.issue_date || c.created || c.created_at)}</td>
                            <td>₹{c.total || c.total_amount || 0}</td>
                            <td>
                                <Badge bg={c.status === 'DONE' ? 'success' : c.status === 'IN_PROGRESS' ? 'info' : 'warning'}>
                                    {c.status || 'DONE'}
                                </Badge>
                            </td>
                            <td>
                                {c.status !== 'DONE' && (
                                    <Button size="sm" className="me-2" variant="primary" onClick={() => navigate(`/workflow?tab=${type}_cert`)}>Process</Button>
                                )}
                                <Button size="sm" className="me-2" variant="outline-primary" onClick={() => window.open(`/print/${config.print}/${c.certificate_no || c.auto_number}`, '_blank')}>Print</Button>
                                <Button size="sm" className="me-2" variant="outline-info" onClick={() => navigate(`/record/${type}s/${c.id}`)}>Details</Button>
                                {config.hasItems && (
                                    <Button size="sm" variant="success" onClick={() => setItemId(c.id)}>Items</Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>Issue Certificate</Modal.Title></Modal.Header>
                <Modal.Body><CertificateForm isOpen={showForm} onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></Modal.Body>
            </Modal>

            <Modal show={!!itemId} onHide={() => setItemId(null)} size="md" centered>
                <Modal.Header closeButton><Modal.Title>Manage Items</Modal.Title></Modal.Header>
                <Modal.Body>{itemId && <GoldCertificateItemForm certificateId={itemId} onItemAdded={load} />}</Modal.Body>
            </Modal>
        </Container>
    );
}
