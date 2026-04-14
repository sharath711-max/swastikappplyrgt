import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Alert } from 'react-bootstrap';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import NewGoldTestModal from '../components/NewGoldTestModal';
import NewSilverTestModal from '../components/NewSilverTestModal';

export default function TestPage({ endpoint, title, print, modalType }) {
    const [tests, setTests] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [active, setActive] = useState({});
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    const load = () => {
        setError(null);
        api.get(`/${endpoint}`)
            .then(res => setTests(res.data.data))
            .catch(e => setError(e.message));
    };
    
    useEffect(() => { load(); }, [endpoint]);

    const finalize = async (id) => {
        if (active[id]) return;
        setActive(p => ({ ...p, [id]: true }));
        const popup = window.open('', '_blank');
        try {
            const { data: { data: detail } } = await api.get(`/${endpoint}/${id}`);
            const items = (detail.items || []).map(i => ({
                id: i.id,
                purity: Number(i.purity) || 0,
                returned: i.returned
            }));
            
            const res = await api.post(`/${endpoint}/${id}/finalize`, { 
                items, 
                mode_of_payment: detail.mode_of_payment, 
                weight_loss: 0 
            });
            
            if (res.data?.meta?.idempotent || res.data?.data?.idempotent) {
                addToast('Already processed', 'info');
            } else {
                addToast('Finalized successfully', 'success');
            }
            
            const cert = res.data?.data?.certificate;
            if (cert && cert.id) {
                popup.location.href = `/print/${print}/${cert.id}`;
            } else {
                popup.close();
            }
            
            load();
        } catch (e) {
            popup.close();
            addToast(`[${e.code || e.type || 'SYSTEM'}] ${e.message}`, e.type === 'SYSTEM' ? 'error' : 'warning');
        } finally {
            setActive(p => ({ ...p, [id]: false }));
        }
    };

    const getVariant = (status) => ({ DONE: 'success', IN_PROGRESS: 'info' }[status] || 'warning');

    const ModalComponent = modalType === 'gold' ? NewGoldTestModal : NewSilverTestModal;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between mb-3">
                <h2>{title}</h2>
                <Button onClick={() => setShowNew(true)}>New Entry</Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {tests.length === 0 && !error ? (
                <Alert variant="info" className="text-center">No tests found.</Alert>
            ) : (
                <Table hover responsive className="bg-white">
                    <thead><tr><th>ID</th><th>Customer</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {tests.map(t => (
                            <tr key={t.id}>
                                <td>{t.auto_number}</td><td>{t.customer_name}</td>
                                <td><Badge bg={getVariant(t.status)}>{t.status}</Badge></td>
                                <td>
                                    {t.status !== 'DONE' && (
                                        <Button size="sm" disabled={active[t.id]} onClick={() => finalize(t.id)}>
                                            {active[t.id] ? 'Processing...' : 'Finalize'}
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <ModalComponent show={showNew} onHide={() => setShowNew(false)} onSuccess={load} />
        </Container>
    );
}
