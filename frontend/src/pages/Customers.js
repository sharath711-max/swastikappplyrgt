import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUserPlus, FaSearch, FaPhone, FaSync, FaInbox, FaUserEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../services/api';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import './Customers.css';

const DEFAULT_PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 250;

const Customers = () => {
    const { addToast } = useToast();
    const { openModal } = useModal();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // URL is the source of truth for page / filter / sort.
    const page          = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize      = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);
    const search        = searchParams.get('search') || '';
    const balanceFilter = searchParams.get('balanceFilter') || 'all';
    const sortBy        = searchParams.get('sortBy') || 'name';

    // Local search input — debounced into the URL.
    const [searchInput, setSearchInput] = useState(search);
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [refetchTick, setRefetchTick] = useState(0);

    // Keep input in sync when URL changes externally (back button, etc.)
    useEffect(() => { setSearchInput(search); }, [search]);

    // Debounce searchInput → URL.
    const isFirstSearchSync = useRef(true);
    useEffect(() => {
        if (isFirstSearchSync.current) { isFirstSearchSync.current = false; return; }
        if (searchInput === search) return;
        const t = setTimeout(() => {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (searchInput) next.set('search', searchInput); else next.delete('search');
                next.set('page', '1');
                return next;
            }, { replace: true });
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchInput, search, setSearchParams]);

    // Server fetch on any URL change or explicit refetch.
    useEffect(() => {
        let cancelled = false;
        const fetchPage = async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams({
                    page: String(page),
                    pageSize: String(pageSize),
                    search,
                    balanceFilter,
                    sortBy,
                });
                const res = await api.get(`/customers?${qs.toString()}`);
                if (cancelled) return;
                const body = res.data || {};
                setCustomers(Array.isArray(body.data) ? body.data : []);
                setPagination(body.pagination || { page, pageSize, total: 0, totalPages: 1 });
            } catch (error) {
                if (cancelled) return;
                addToast('Failed to synchronize customer database', 'error');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchPage();
        return () => { cancelled = true; };
    }, [page, pageSize, search, balanceFilter, sortBy, refetchTick, addToast]);

    const updateParam = useCallback((key, value) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === '' || value == null) next.delete(key); else next.set(key, String(value));
            if (key !== 'page') next.set('page', '1');
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const refetch = useCallback(() => setRefetchTick(t => t + 1), []);

    const handleEditCustomer = (e, customer) => {
        e.stopPropagation();
        openModal('customer', { customer, reload: refetch });
    };

    const handleAddCustomer = () => {
        openModal('customer', { reload: refetch });
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

    const { total, totalPages } = pagination;
    const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd   = Math.min(page * pageSize, total);

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
                        <button className="btn-icon-action" onClick={refetch} disabled={loading} title="Sync">
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
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select w-auto"
                        value={balanceFilter}
                        onChange={(e) => updateParam('balanceFilter', e.target.value === 'all' ? '' : e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="due">Due (DR)</option>
                        <option value="advance">Advance (CR)</option>
                        <option value="settled">Settled</option>
                    </select>

                    <select
                        className="form-select w-auto"
                        value={sortBy}
                        onChange={(e) => updateParam('sortBy', e.target.value === 'name' ? '' : e.target.value)}
                    >
                        <option value="name">Sort: Name</option>
                        <option value="balance">Sort: Balance</option>
                    </select>

                    <select
                        className="form-select w-auto"
                        value={pageSize}
                        onChange={(e) => updateParam('pageSize', e.target.value === String(DEFAULT_PAGE_SIZE) ? '' : e.target.value)}
                        title="Page size"
                    >
                        <option value="25">25 / page</option>
                        <option value="50">50 / page</option>
                        <option value="100">100 / page</option>
                    </select>

                    <div className="count-info">
                        {total === 0
                            ? <strong>0</strong>
                            : <><strong>{rangeStart}</strong>–<strong>{rangeEnd}</strong> of <strong>{total}</strong></>
                        }
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
                ) : customers.length === 0 ? (
                    <div className="empty-customers">
                        <FaInbox className="empty-icon" />
                        <h5>No Customers Found</h5>
                        <p className="text-muted">
                            {search || balanceFilter !== 'all'
                                ? 'Try a different filter or add a new record.'
                                : 'Add the first customer to get started.'}
                        </p>
                        <button className="btn btn-primary mt-2" onClick={handleAddCustomer}>
                            <FaUserPlus className="me-2" /> Add Customer
                        </button>
                    </div>
                ) : (
                    <div className="row g-3">
                        {customers.map(customer => (
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

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-3 mt-4 mb-2">
                        <button
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                            onClick={() => updateParam('page', page - 1)}
                            disabled={loading || page <= 1}
                        >
                            <FaChevronLeft size={10} /> Prev
                        </button>
                        <span className="text-muted small">
                            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                            onClick={() => updateParam('page', page + 1)}
                            disabled={loading || page >= totalPages}
                        >
                            Next <FaChevronRight size={10} />
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Customers;
