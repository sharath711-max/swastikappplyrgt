import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaSearch, FaInbox, FaFilter, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';

const EMPTY_FILTERS = { status: '', start_date: '', end_date: '', mode: '', gst: '', txn_type: '' };
const SEL_STYLE = { padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', minWidth: '130px' };

const FilterField = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '3px' }}>{label}</span>
        {children}
    </div>
);

const GenericListView = ({ type, endpoint, columns, title, emptyMessage }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState(EMPTY_FILTERS);   // live form
    const [applied, setApplied] = useState(EMPTY_FILTERS);   // committed on Apply

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ page, limit: 12 });
            if (search) qs.set('search', search);
            Object.entries(applied).forEach(([k, v]) => { if (v) qs.set(k, v); });
            const response = await api.get(`${endpoint}?${qs.toString()}`);
            setData(response.data.data);
            setPagination(response.data.pagination);
        } catch (err) {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [endpoint, page, search, applied]);

    useEffect(() => {
        fetchData();
    }, [type, fetchData]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setPage(1);
        fetchData();
    };

    // Which filters are relevant for this list type.
    const isItem   = type.endsWith('-items');
    const isLedger = type === 'credit-history' || type === 'weight-loss-history';
    const isCert   = type.includes('certificate') && !isItem;
    const isParentRecord = !isItem && !isLedger;

    const applyFilters = () => { setApplied(filters); setPage(1); };
    const resetFilters = () => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1); };
    const activeFilterCount = Object.values(applied).filter(Boolean).length;

    const formatCell = (row, col) => {
        if (col.render) return col.render(row);
        const val = row[col.key];

        if (col.key === 'created' || col.key === 'createdon') {
            if (!val) return '-';
            const date = new Date(val);
            return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        if (['gross_weight', 'test_weight', 'net_weight', 'weight'].includes(col.key)) {
            if (val === undefined || val === null) return '-';
            return `${Number(val).toFixed(3)} g`;
        }

        if (['total', 'amount', 'item_total', 'balance'].includes(col.key)) {
            if (val === undefined || val === null) return '-';
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
        }

        if (col.key === 'purity') {
            if (val === undefined || val === null) return '-';
            return `${Number(val).toFixed(2)} %`;
        }

        return val !== null && val !== undefined ? val : '-';
    };

    const isNumeric = (key) => ['total', 'amount', 'item_total', 'balance', 'gross_weight', 'test_weight', 'net_weight', 'weight', 'purity'].includes(key);

    return (
        <div className="sf-list-view">
            <div className="list-action-bar">
                <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
                    <FaSearch className="search-icon-sm" />
                    <input
                        type="text"
                        className="sf-search-input"
                        placeholder={`Search ${title || 'records'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>

                <div className="d-flex gap-3 align-items-center">
                    <div className="record-count-badge">
                        <span>Total Records:</span>
                        <strong>{pagination.total}</strong>
                    </div>
                    <button
                        className={`btn-sf-view${showFilters || activeFilterCount ? ' active' : ''}`}
                        style={{ padding: '10px' }}
                        title="Filter Results"
                        onClick={() => setShowFilters(v => !v)}
                    >
                        <FaFilter />{activeFilterCount ? ` (${activeFilterCount})` : ''}
                    </button>
                    <button className="btn-sf-view" onClick={() => fetchData()}>Refresh</button>
                </div>
            </div>

            {showFilters && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    {(isParentRecord || isItem) && (
                        <FilterField label="Status">
                            <select style={SEL_STYLE} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                                <option value="">All</option>
                                <option value="TODO">To-Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </FilterField>
                    )}
                    {isLedger && (
                        <FilterField label="Type">
                            <select style={SEL_STYLE} value={filters.txn_type} onChange={e => setFilters(f => ({ ...f, txn_type: e.target.value }))}>
                                <option value="">All</option>
                                <option value="CREDIT">Credit</option>
                                <option value="DEBIT">Debit</option>
                            </select>
                        </FilterField>
                    )}
                    <FilterField label="From">
                        <input type="date" style={SEL_STYLE} value={filters.start_date} onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} />
                    </FilterField>
                    <FilterField label="To">
                        <input type="date" style={SEL_STYLE} value={filters.end_date} onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} />
                    </FilterField>
                    {(isParentRecord || isLedger) && (
                        <FilterField label="Payment Mode">
                            <select style={SEL_STYLE} value={filters.mode} onChange={e => setFilters(f => ({ ...f, mode: e.target.value }))}>
                                <option value="">All</option>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Balance">Balance</option>
                            </select>
                        </FilterField>
                    )}
                    {isCert && (
                        <FilterField label="GST">
                            <select style={SEL_STYLE} value={filters.gst} onChange={e => setFilters(f => ({ ...f, gst: e.target.value }))}>
                                <option value="">All</option>
                                <option value="1">GST</option>
                                <option value="0">Non-GST</option>
                            </select>
                        </FilterField>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-sf-view" onClick={applyFilters}>Apply</button>
                        <button className="btn-sf-view" onClick={resetFilters}>Reset</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted fw-bold">Synchronizing Records...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-5">
                    <FaInbox size={48} className="text-muted mb-3" style={{ opacity: 0.2 }} />
                    <h5 className="fw-bold text-secondary">{emptyMessage || 'No Records Found'}</h5>
                    <p className="text-muted small">Refine your search parameters or select a different category.</p>
                </div>
            ) : (
                <div className="sf-table-wrapper">
                    <table className="sf-table">
                        <thead>
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={idx} className={isNumeric(col.key) ? 'text-end' : ''}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx} className={isNumeric(col.key) ? 'text-end' : ''}>{formatCell(row, col)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="p-4 border-top d-flex justify-content-between align-items-center bg-light">
                    <div className="small text-muted fw-bold">
                        Page {page} of {pagination.totalPages}
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn-sf-view"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <FaArrowLeft className="me-2" /> Previous
                        </button>
                        <button
                            className="btn-sf-view"
                            disabled={page === pagination.totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next <FaArrowRight className="ms-2" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenericListView;
