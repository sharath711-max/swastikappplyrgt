import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import { FaTrashRestore, FaTrash, FaSync } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const RecycleBinPage = () => {
    const { addToast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // ID of item being restored

    const fetchDeletedItems = useCallback(async () => {
        setLoading(true);
        try {
            // Placeholder endpoint — we'll need to implement this in backend
            const response = await api.get('/audit/recycle-bin');
            setItems(response.data.data || []);
        } catch (error) {
            addToast('Failed to load deleted items', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchDeletedItems();
    }, [fetchDeletedItems]);

    const handleRestore = async (item) => {
        if (!window.confirm(`Restore ${item.type} ${item.auto_number}?`)) return;
        
        setProcessing(item.id);
        try {
            await api.post(`/audit/restore/${item.type}/${item.id}`);
            addToast('Item restored successfully', 'success');
            fetchDeletedItems();
        } catch (error) {
            addToast(error.response?.data?.error || 'Failed to restore item', 'error');
        } finally {
            setProcessing(null);
        }
    };

    const getTypeColor = (type) => {
        if (type.includes('gold')) return 'warning';
        if (type.includes('silver')) return 'secondary';
        return 'info';
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Recycle Bin</h2>
                    <p className="text-muted">Restore records deleted within the last 30 days.</p>
                </div>
                <Button variant="outline-primary" onClick={fetchDeletedItems}>
                    <FaSync className="me-2" /> Refresh
                </Button>
            </div>

            {items.length === 0 ? (
                <Alert variant="info" className="text-center py-5">
                    <FaTrash className="fs-1 mb-3 opacity-25" />
                    <h4>Recycle Bin is Empty</h4>
                    <p className="mb-0">No deleted records found.</p>
                </Alert>
            ) : (
                <div className="table-responsive shadow-sm rounded bg-white">
                    <Table hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Type</th>
                                <th>Ref Number</th>
                                <th>Customer</th>
                                <th>Deleted On</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={`${item.type}-${item.id}-${idx}`}>
                                    <td className="align-middle">
                                        <Badge bg={getTypeColor(item.type)} className="text-uppercase">
                                            {item.type.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="align-middle fw-bold">{item.auto_number}</td>
                                    <td className="align-middle">{item.customer_name}</td>
                                    <td className="align-middle text-muted">
                                        {new Date(item.deletedon).toLocaleString()}
                                    </td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => handleRestore(item)}
                                            disabled={processing === item.id}
                                        >
                                            {processing === item.id ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <><FaTrashRestore className="me-1" /> Restore</>
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default RecycleBinPage;
