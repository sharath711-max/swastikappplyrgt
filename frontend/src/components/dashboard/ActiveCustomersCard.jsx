import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';

const fmtN = (v) => Number(v || 0).toLocaleString('en-IN');

/**
 * Active Customers operator-cognition card. Python parity — Python's
 * dashboard surfaced a clickable customer count as the institutional
 * counterparty signal. SERN had no equivalent until now.
 *
 * Clickable → /customers. Numbers come from /customers list (already
 * paginated) — backend doesn't yet expose a dedicated count endpoint;
 * we use the page total. If the list is large, response holds a `total`
 * field we read; otherwise fall back to the array length.
 */
export default function ActiveCustomersCard() {
    const navigate = useNavigate();
    const [count, setCount] = useState(null);

    useEffect(() => {
        let cancelled = false;
        api.get('/customers')
            .then((res) => {
                if (cancelled) return;
                const payload = res.data?.data ?? res.data ?? [];
                const total = res.data?.total
                    ?? (Array.isArray(payload) ? payload.length : 0);
                setCount(total);
            })
            .catch(() => {
                if (!cancelled) setCount(0);
            });
        return () => { cancelled = true; };
    }, []);

    return (
        <button
            type="button"
            className="dash-stat-card dash-stat-card--customers"
            onClick={() => navigate('/customers')}
            aria-label="Open customer list"
        >
            <div className="dash-stat-card__icon">
                <FaUsers aria-hidden="true" />
            </div>
            <div className="dash-stat-card__body">
                <div className="dash-stat-card__label">Active Customers</div>
                <div className="dash-stat-card__value">{count === null ? '…' : fmtN(count)}</div>
            </div>
            <FaArrowRight className="dash-stat-card__chev" aria-hidden="true" />
        </button>
    );
}
