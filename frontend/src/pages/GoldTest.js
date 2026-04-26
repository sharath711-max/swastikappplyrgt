import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { usePrint } from '../contexts/PrintContext';
import NewGoldTestModal from '../components/NewGoldTestModal';

export default function GoldTest() {
    const [tests, setTests] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [active, setActive] = useState({});
    const { addToast } = useToast();
    const { triggerPrint } = usePrint();

    const load = () => api.get('/gold-tests').then(res => setTests(res.data.data)).catch(e => addToast(e.message, 'error'));
    useEffect(() => { load(); }, []);

    const finalize = async (id) => {
        if (active[id]) return;
        setActive(p => ({ ...p, [id]: true }));
        try {
            const { data: { data: detail } } = await api.get(`/gold-tests/${id}`);
            const items = (detail.items || []).map(i => ({ id: i.id, purity: Number(i.purity) || 0, returned: !!i.returned }));
            const res = await api.post(`/gold-tests/${id}/finalize`, { 
                items, 
                mode_of_payment: detail.mode_of_payment || 'Cash', 
                weight_loss: 0 
            });
            
            if (res.data?.data?.idempotent) addToast('Already processed', 'info');
            else addToast('Finalized successfully', 'success');
            
            const cert = res.data?.data?.certificate;
            if (cert) triggerPrint('gold-certificate', cert.id);
            else if (res.data?.data?.id) triggerPrint('gold-certificate', res.data.data.id);
            
            load();
        } catch (e) {
            addToast(`[${e.type || 'SYSTEM'}] ${e.message}`, e.type === 'SYSTEM' ? 'error' : 'warning');
        } finally {
            setActive(p => ({ ...p, [id]: false }));
        }
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between mb-3">
                <h2>Gold Tests</h2>
                <Button onClick={() => setShowNew(true)}>New Entry</Button>
            </div>
            <Table hover responsive className="bg-white">
                <thead><tr><th>ID</th><th>Customer</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {tests.map(t => (
                        <tr key={t.id}>
                            <td>{t.auto_number}</td><td>{t.customer_name}</td>
                            <td><Badge bg={t.status === 'DONE' ? 'success' : 'warning'}>{t.status}</Badge></td>
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
            <NewGoldTestModal show={showNew} onHide={() => setShowNew(false)} onSuccess={load} />
        </Container>
    );
}
