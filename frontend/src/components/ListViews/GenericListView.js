import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaSearch, FaInbox, FaFilter, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';

const GenericListView = ({ type, endpoint, columns, title, emptyMessage }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`${endpoint}?page=${page}&limit=12&search=${search}`);
            setData(response.data.data);
            setPagination(response.data.pagination);
        } catch (err) {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [endpoint, page, search]);

    useEffect(() => {
        fetchData();
    }, [type, fetchData]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setPage(1);
        fetchData();
    };

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
                    <button className="btn-sf-view" style={{ padding: '10px' }} title="Filter Results">
                        <FaFilter />
                    </button>
                    <button className="btn-sf-view" onClick={() => fetchData()}>Refresh</button>
                </div>
            </div>

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

