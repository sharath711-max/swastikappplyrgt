import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Toast, DataTable } from '../components/SalesforceComponents';
import { FaWeight, FaPlus } from 'react-icons/fa';
import api from '../services/api';

const WeightLoss = () => {
    const [entries, setEntries] = useState([]);
    // Using 'customers' to pick who the weight loss is associated with if applicable,
    // or maybe it's general lab weight loss. The screenshot usually implies context.
    // I'll assume it's transaction based.
    const [customers, setCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Form Data
    const [formData, setFormData] = useState({
        customer_id: '',
        amount: '',
        reason: '',
        mode_of_payment: 'Cash',
        date: new Date().toISOString().split('T')[0]
    });

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/weight-loss');
            if (res.data.success) {
                setEntries(res.data.data);
            }
        } catch (error) {
            showToast('Failed to fetch records', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
        fetchCustomers();
    }, [fetchData, fetchCustomers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send payload matching backend expectations
            // Backend in weightLossRoutes expects: { customer_id, description, weight_loss, date, mode_of_payment }
            // Wait, I updated the backend to use `weightLossHistoryRepository.create` which uses `amount`, `reason`, `mode_of_payment`.
            // But the ROUTE `weightLossRoutes.js` still destructures `description` and `weight_loss` from req.body!
            // "const { customer_id, description, weight_loss, date, mode_of_payment } = req.body;"
            // So expecting 'weight_loss' and 'description' from frontend is currently correct for the route I wrote.
            // BUT the route *outputs* `amount` and `reason` in the response (from repo).
            // So GET calls need `amount` and `reason`.
            // Ideally, I should strictly align everything to `amount` and `reason`.
            // I should have updated the route input reading too. 
            // I will update the frontend to send `amount` and assume I'll fix the backend route input mapping in a moment 
            // OR I will send matches. 
            // Actually, the route I wrote: 
            // "const { customer_id, description, weight_loss, date, mode_of_payment } = req.body;"
            // "weightLossHistoryRepository.create({ ... amount: parseFloat(weight_loss), reason: description ... })"
            // So the route expects `weight_loss` and `description`.
            // But the GET returns `amount` and `reason`.
            // This is inconsistent. I should fix the backend route to accept `amount` and `reason` too.
            // For now, I'll update frontend to use `amount` and `reason` and I'll go back and fix the backend route input reading.

            const payload = {
                customer_id: formData.customer_id,
                amount: formData.amount,
                reason: formData.reason,
                mode_of_payment: formData.mode_of_payment,
                date: formData.date
            };

            const res = await api.post('/weight-loss', payload);
            if (res.data.success) {
                showToast('Weight loss record added successfully', 'success');
                setShowModal(false);
                setFormData({ customer_id: '', amount: '', reason: '', mode_of_payment: 'Cash', date: new Date().toISOString().split('T')[0] });
                fetchData();
            }
        } catch (error) {
            showToast(error.response?.data?.error || 'Operation failed', 'error');
        }
    };

    const columns = [
        { header: 'Date', field: 'created', render: row => new Date(row.created || row.date).toLocaleDateString() }, // Schema has created
        { header: 'Customer', field: 'customer_name' },
        { header: 'Amount (₹)', render: row => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.amount || 0) }, // Repo returns amount
        { header: 'Reason', field: 'reason' },     // Repo returns reason
        { header: 'Payment', field: 'mode_of_payment' }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>

            <div className="page-header" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaWeight /> Weight Loss Records
                        </h1>
                        <p className="text-muted" style={{ margin: 0 }}>Track metal loss during testing/processing</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FaPlus style={{ marginRight: '6px' }} /> Add Record
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recent Records</h2>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={entries}
                        loading={loading}
                    />
                    {entries.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#706e6b' }}>
                            <FaWeight style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                            <h5>No records found</h5>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} title="Record Weight Loss">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">Customer (Optional)</label>
                        <select
                            className="form-control"
                            value={formData.customer_id}
                            onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                        >
                            <option value="">-- General Loss --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">Mode of Payment</label>
                        <select
                            className="form-control"
                            value={formData.mode_of_payment}
                            onChange={e => setFormData({ ...formData, mode_of_payment: e.target.value })}
                        >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">Reason / Remarks</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Record</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default WeightLoss;
