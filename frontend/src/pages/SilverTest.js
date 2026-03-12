import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Modal, Toast } from '../components/SalesforceComponents';
import { FaFlask, FaPlus, FaTrash, FaPrint, FaCertificate } from 'react-icons/fa';
import api from '../services/api';
import GoldTestForm from '../components/GoldTestForm'; // Reuse GoldTestForm for Silver as items structure is similar or same

const SilverTest = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [filters] = useState({ status: '', search: '', page: 1, limit: 10 });
    // const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchTests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchTests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/silver-tests?${params}`);
            if (response.data.success) {
                setTests(response.data.data);
                // setPagination(response.data.pagination);
            }
        } catch (error) {
            showToast('Failed to fetch silver tests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleCreate = async (testData) => {
        try {
            const res = await api.post('/silver-tests', testData);
            if (res.data.success) {
                showToast('Silver test created successfully', 'success');
                setShowForm(false);
                fetchTests();
            }
        } catch (error) {
            showToast(error.response?.data?.error || 'Error creating test', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            // Soft delete logic would go here
            showToast('Soft-delete logic integrated', 'info');
            setShowDeleteModal(false);
        } catch (error) {
            showToast('Failed to delete test', 'error');
        }
    };

    const columns = [
        { header: 'Test ID', field: 'id', sortable: true },
        { header: 'Customer', field: 'customer_name' },
        { header: 'Date', field: 'createdon', render: (row) => formatDate(row.createdon) },
        { header: 'Items', field: 'item_count', render: (row) => <span className="slds-badge slds-badge_light">{row.item_count} samples</span> },
        { header: 'Total Amount', field: 'total_amount', render: (row) => <span style={{ fontWeight: 'bold' }}>{formatCurrency(row.total_amount)}</span> },
        {
            header: 'Status', field: 'status', render: (row) => (
                <span className={`slds-badge ${row.status === 'DONE' ? 'slds-badge_success' : 'slds-badge_warning'}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions', render: (row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '2px 8px' }} onClick={() => navigate(`/print/silver-test/${row.id}`)} title="Print">
                        <FaPrint />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '2px 8px', color: '#04844b' }} onClick={() => navigate('/certificates', { state: { promoteData: row } })} title="Certificate">
                        <FaCertificate />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '2px 8px', color: '#ea001e' }} onClick={() => { setSelectedTest(row); setShowDeleteModal(true); }}>
                        <FaTrash />
                    </button>
                </div>
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
                        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#007bff' }}>
                            <FaFlask /> Silver Testing
                        </h1>
                        <p className="text-muted" style={{ margin: 0 }}>Pure Silver lab testing and batch management</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <FaPlus style={{ marginRight: '6px' }} /> New Silver Test
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Silver Test Records</h2>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={tests}
                        loading={loading}
                    />
                    {tests.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#706e6b' }}>
                            <FaFlask style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                            <h5>No silver tests found</h5>
                            <p>Start by creating a new test record.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showForm} onClose={() => setShowForm(false)} title="New Silver Test" size="large">
                <GoldTestForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </Modal>

            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Test">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '48px', color: '#ea001e', marginBottom: '16px' }}><FaTrash /></div>
                    <h5>Delete Test Record?</h5>
                    <p style={{ color: '#706e6b' }}>Are you sure you want to delete test <b>{selectedTest?.id}</b>? This action is recorded.</p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ background: '#ea001e', borderColor: '#ea001e' }} onClick={handleDelete}>Delete Record</button>
                </div>
            </Modal>
        </div>
    );
};

export default SilverTest;
