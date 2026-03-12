import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaSearch, FaPhone, FaArrowRight, FaSync, FaInbox, FaUserEdit } from 'react-icons/fa';
import api from '../services/api';
import NewCustomerModal from '../components/NewCustomerModal';
import { useToast } from '../contexts/ToastContext';
import './Customers.css';

const Customers = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        const filtered = customers.filter(c =>
            (c.name && c.name.toLowerCase().includes(lowerSearch)) ||
            (c.phone && c.phone.includes(searchTerm))
        );
        setFilteredCustomers(filtered);
    }, [searchTerm, customers]);

    const handleEditCustomer = (e, customer) => {
        e.stopPropagation();
        setSelectedCustomer(customer);
        setShowModal(true);
    };

    const handleAddCustomer = () => {
        setSelectedCustomer(null);
        setShowModal(true);
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

    return (
        <div className="customers-page">
            <div className="customers-header">
                <div className="header-top">
                    <div className="header-info">
                        <h1>Customer Directory</h1>
                        <p>Centralized ledger and profile management system</p>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn-icon-action" onClick={fetchCustomers} disabled={loading} title="Sync Database">
                            <FaSync className={loading ? 'fa-spin' : ''} />
                        </button>
                        <button className="btn-premium-add" onClick={handleAddCustomer}>
                            <FaUserPlus /> Add New Customer
                        </button>
                    </div>
                </div>
            </div>

            <div className="search-container">
                <div className="search-box">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="customer-search-input"
                            placeholder="Find by name, phone or record identification..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="count-info">
                        Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> active profiles
                    </div>
                </div>
            </div>

            <div className="customers-grid-container">
                {loading && customers.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 text-muted fw-bold">Connecting to Master Ledger...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="empty-customers">
                        <FaInbox className="empty-icon" />
                        <h3>No Customer Profiles Found</h3>
                        <p>Try searching with a different name or adding a new record.</p>
                    </div>
                ) : (
                    <div className="customer-card-grid">
                        {filteredCustomers.map(customer => (
                            <div
                                key={customer.id}
                                className="customer-item-card"
                                onClick={() => navigate(`/customers/${customer.id}`)}
                            >
                                <div className="customer-avatar">
                                    {getInitials(customer.name)}
                                </div>

                                <div className="customer-actions">
                                    <button
                                        className="btn-icon-action"
                                        onClick={(e) => handleEditCustomer(e, customer)}
                                        title="Secure Edit"
                                    >
                                        <FaUserEdit />
                                    </button>
                                </div>

                                <h3 className="customer-name">{customer.name}</h3>
                                <div className="customer-phone">
                                    <FaPhone className="text-muted small" />
                                    <span>+91 {customer.phone}</span>
                                </div>

                                <div className="customer-stats">
                                    <div className="stat-item">
                                        <div className="stat-label">Net Balance</div>
                                        <div className={`stat-value ${customer.balance > 0 ? 'negative' : (customer.balance < 0 ? 'positive' : '')}`}>
                                            {formatCurrency(Math.abs(customer.balance))}
                                            <span className="small ms-1 opacity-75">
                                                {customer.balance > 0 ? 'DR' : (customer.balance < 0 ? 'CR' : '')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="stat-item text-end d-flex align-items-end justify-content-end">
                                        <div className="btn-icon-action border-0 bg-transparent text-primary">
                                            <FaArrowRight />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <NewCustomerModal
                show={showModal}
                onHide={() => setShowModal(false)}
                customer={selectedCustomer}
                onSuccess={() => {
                    fetchCustomers();
                    setShowModal(false);
                }}
            />
        </div>
    );
};

export default Customers;
