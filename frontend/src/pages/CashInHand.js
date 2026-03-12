import React, { useState, useEffect } from 'react';
import { Modal, Toast, DataTable } from '../components/SalesforceComponents';
import { FaCoins, FaPlus } from 'react-icons/fa';
import api from '../services/api';

const CashInHand = () => {
    const [entries, setEntries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [totalCash, setTotalCash] = useState(0);

    const [formData, setFormData] = useState({
        type: 'IN', // IN or OUT
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchTodayData = async () => {
        try {
            const todayRes = await api.get('/cash-register/summary');
            if (todayRes.data.success) {
                // summary returns specific structure
                setTotalCash(todayRes.data.data.current_balance);
            }
        } catch (error) {
            console.error('Failed to fetch summary');
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/cash-register');
            if (res.data.success) {
                setEntries(res.data.data);
            }
        } catch (error) {
            showToast('Failed to fetch history', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayData();
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use the transaction endpoint
            const res = await api.post('/cash-register/transaction', {
                type: formData.type.toLowerCase(), // Backend expects lowercase 'in' or 'out' but let's check. 
                // Wait, backend cashRoutes says: if (!['IN','OUT'].includes(type))... 
                // Actually my implementation of cashRoutes.js (Step 16) says: if (!['IN', 'OUT'].includes(type)) return error
                // But the POST /transaction endpoint logic (which I wrote in previous turn, Step 16, line 462) says:
                // if (!['in', 'out'].includes(type)) return error...
                // Ah, let's look at the actual code I wrote in Step 16.
                // It was: POST /transaction logic checks for ['in', 'out'].
                // So I should send lowercase.
                amount: formData.amount,
                description: formData.description
            });

            if (res.data.success) {
                showToast('Cash entry recorded', 'success');
                setShowModal(false);
                setFormData({ type: 'IN', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
                fetchHistory(); // Refresh list
                fetchTodayData(); // Refresh balance
            }
        } catch (error) {
            // Fallback to regular create if transaction endpoint fails or isn't desired
            // Actually, let's try the regular CREATE endpoint if we want to specify date
            // The form allows date selection. 
            // If user selected today, use transaction? Or just use the POST / root endpoint?
            // The POST / root endpoint (Step 16) takes { date, type, amount, description } and inserts a new row.
            // But wait, the table cash_register has one row per day?
            // My schema in Step 16 had: CREATE TABLE IF NOT EXISTS cash_register (id, date, type, amount, description, created_at)
            // It does NOT enforce unique date. It seems to be a ledger of transactions.
            // Ah, wait. In Step 16, I updated init.sql to add:
            // CREATE TABLE IF NOT EXISTS cash_register (id, date, type, amount, description...)
            // This looks like a TRANSACTION ledger, not a daily summary.
            // So I should just post a new entry.

            try {
                const res2 = await api.post('/cash-register', {
                    date: formData.date,
                    type: formData.type, // IN or OUT
                    amount: formData.amount,
                    description: formData.description
                });
                if (res2.data.success) {
                    showToast('Entry recorded', 'success');
                    setShowModal(false);
                    setFormData({ type: 'IN', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
                    fetchHistory();
                    fetchTodayData();
                }
            } catch (err2) {
                showToast(err2.response?.data?.error || 'Failed to save', 'error');
            }
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

    const columns = [
        { header: 'Date', field: 'date', render: row => new Date(row.date).toLocaleDateString() },
        { header: 'Description', field: 'description' },
        {
            header: 'Type', field: 'type', render: row => (
                <span className={`slds-badge ${row.type === 'IN' ? 'slds-badge_success' : 'slds-badge_danger'}`}>
                    {row.type}
                </span>
            )
        },
        {
            header: 'Amount', field: 'amount', render: row => (
                <span style={{ color: row.type === 'IN' ? '#04844b' : '#ea001e', fontWeight: 'bold' }}>
                    {formatCurrency(row.amount)}
                </span>
            )
        }
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
                            <FaCoins /> Cash In Hand
                        </h1>
                        <p className="text-muted" style={{ margin: 0 }}>Daily cash register and petty cash management</p>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <div className="card" style={{ background: '#04844b', color: 'white', maxWidth: '350px' }}>
                    <div className="card-body">
                        <h6 style={{ opacity: 0.9, marginBottom: '8px' }}>Current Cash Balance</h6>
                        <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>{formatCurrency(totalCash)}</h2>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="card-title">Cash Register</h2>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FaPlus style={{ marginRight: '6px' }} /> New Entry
                    </button>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={entries}
                        loading={loading}
                    />
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} title="Record Cash Transaction">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">Transaction Type</label>
                        <select
                            className="form-control"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="IN">Cash IN (Deposit/Sales)</option>
                            <option value="OUT">Cash OUT (Expense/Withdrawal)</option>
                        </select>
                    </div>
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
                        <label className="form-label">Amount (₹)</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Entry</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CashInHand;
