import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaSearch, FaPhone, FaSync, FaInbox, FaUserEdit } from 'react-icons/fa';
import api from '../services/api';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import './Customers.css';

const Customers = () => {
    const { addToast } = useToast();
    const { openModal } = useModal();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [balanceFilter, setBalanceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/customers');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setCustomers(data);
        } catch (error) {
            addToast('Failed to synchronize customer database', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        let result = customers.filter(c =>
            (c.name && c.name.toLowerCase().includes(lowerSearch)) ||
            (c.phone && c.phone.includes(searchTerm))
        );

        if (balanceFilter === 'due') result = result.filter(c => (c.balance || 0) > 0);
        else if (balanceFilter === 'advance') result = result.filter(c => (c.balance || 0) < 0);
        else if (balanceFilter === 'settled') result = result.filter(c => !c.balance || c.balance === 0);

        if (sortBy === 'name') result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        else if (sortBy === 'balance') result = [...result].sort((a, b) => Math.abs(b.balance || 0) - Math.abs(a.balance || 0));

        setFilteredCustomers(result);
    }, [searchTerm, customers, balanceFilter, sortBy]);

    const handleEditCustomer = (e, customer) => {
        e.stopPropagation();
        openModal('customer', { customer, reload: fetchCustomers });
    };

    const handleAddCustomer = () => {
        openModal('customer', { reload: fetchCustomers });
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const getBalanceClass = (balance) => {
        if (balance > 0) return 'text-danger';
        if (balance < 0) return 'text-success';
        return 'text-secondary';
    };

    const getBalanceLabel = (balance) => {
        if (balance > 0) return 'DR';
        if (balance < 0) return 'CR';
        return 'Settled';
    };

    return (
        <div className="customers-page">

            {/* Header */}
            <div className="customers-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0 fw-bold">Customer Directory</h5>
                        <small className="text-muted">Centralized ledger and profile management</small>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn-icon-action" onClick={fetchCustomers} disabled={loading} title="Sync">
                            <FaSync className={loading ? 'fa-spin' : ''} />
                        </button>
                        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleAddCustomer}>
                            <FaUserPlus /> Add Customer
                        </button>
                    </div>
                </div>
            </div>

            {/* Search + Filter Bar */}
            <div className="search-container">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <div className="search-input-wrapper flex-grow-1">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="customer-search-input"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select w-auto"
                        value={balanceFilter}
                        onChange={(e) => setBalanceFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="due">Due (DR)</option>
                        <option value="advance">Advance (CR)</option>
                        <option value="settled">Settled</option>
                    </select>

                    <select
                        className="form-select w-auto"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="name">Sort: Name</option>
                        <option value="balance">Sort: Balance</option>
                    </select>

                    <div className="count-info">
                        <strong>{filteredCustomers.length}</strong> / <strong>{customers.length}</strong>
                    </div>
                </div>
            </div>

            {/* Customer Grid */}
            <div className="customers-grid-container">
                {loading && customers.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 text-muted fw-bold">Connecting to Master Ledger...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="empty-customers">
                        <FaInbox className="empty-icon" />
                        <h5>No Customers Found</h5>
                        <p className="text-muted">Try a different filter or add a new record.</p>
                        <button className="btn btn-primary mt-2" onClick={handleAddCustomer}>
                            <FaUserPlus className="me-2" /> Add Customer
                        </button>
                    </div>
                ) : (
                    <div className="row g-3">
                        {filteredCustomers.map(customer => (
                            <div key={customer.id} className="col-12 col-md-6 col-xl-4">
                                <div
                                    className="card shadow-sm h-100 customer-item-card"
                                    onClick={() => navigate(`/customers/${customer.id}`)}
                                >
                                    <div className="card-body d-flex flex-column">

                                        {/* Top row: avatar + name + badge + edit */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="customer-avatar">
                                                    {getInitials(customer.name)}
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold">{customer.name}</h6>
                                                    <small className="text-muted d-flex align-items-center gap-1">
                                                        <FaPhone size={10} /> +91 {customer.phone}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={`badge ${customer.deletedon ? 'bg-secondary' : 'bg-success'}`}>
                                                    {customer.deletedon ? 'Inactive' : 'Active'}
                                                </span>
                                                <button
                                                    className="btn-icon-action"
                                                    onClick={(e) => handleEditCustomer(e, customer)}
                                                    title="Edit"
                                                >
                                                    <FaUserEdit />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Balance */}
                                        <div className="mt-auto pt-2 border-top">
                                            <div className="balance-label">Net Balance</div>
                                            <div className={`fw-bold fs-5 ${getBalanceClass(customer.balance)}`}>
                                                {formatCurrency(Math.abs(customer.balance || 0))}
                                                <span className="ms-1 fs-6 opacity-75">
                                                    {getBalanceLabel(customer.balance)}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Customers;
