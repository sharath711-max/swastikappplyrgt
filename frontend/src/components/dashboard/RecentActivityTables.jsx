import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import { getAgingBucket, agingTitle } from '../../utils/aging';

const fmtINR = (v) =>
    Number(v || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const STATUS_VARIANT = { DONE: 'success', IN_PROGRESS: 'info', TODO: 'secondary' };

// Both row types deep-link to the universal record page. RecordPage
// expects pluralised dashed types: gold-tests / silver-tests /
// gold-certificates / silver-certificates / photo-certificates.
const testHref = (row) =>
    `/record/${row.metal_type === 'silver' ? 'silver-tests' : 'gold-tests'}/${row.id}`;
const certHref = (row) =>
    `/record/${row.metal_type === 'silver' ? 'silver-certificates' : 'gold-certificates'}/${row.id}`;

function AgingMarker({ createdAt, status }) {
    const aging = getAgingBucket(createdAt, status);
    if (aging.severity === 0) return null;
    return (
        <span
            className={`rat__aging rat__aging--${aging.bucket}`}
            title={agingTitle(aging.severity)}
            aria-label={agingTitle(aging.severity)}
        >
            {aging.label}
        </span>
    );
}

export function RecentTestsTable({ rows = [] }) {
    return (
        <div className="rat">
            <div className="rat__head">
                <h6 className="rat__title">Recent Tests</h6>
                <span className="rat__count">{rows.length}</span>
            </div>
            {rows.length === 0 ? (
                <div className="rat__empty">No recent tests.</div>
            ) : (
                <ul className="rat__list">
                    {rows.map((r) => (
                        <li key={`test-${r.id}`} className="rat__row">
                            <Link to={testHref(r)} className="rat__link" aria-label={`Open ${r.auto_number}`}>
                                <span className="rat__date">{fmtDate(r.created_at)}</span>
                                <span className={`rat__metal rat__metal--${r.metal_type}`}>
                                    {r.metal_type === 'silver' ? 'ST' : 'GT'}
                                </span>
                                <span className="rat__id">{r.auto_number}</span>
                                <span className="rat__customer">{r.customer_name}</span>
                                <span className="rat__status">
                                    <Badge bg={STATUS_VARIANT[r.status] || 'primary'} className="rat__badge">
                                        {r.status}
                                    </Badge>
                                    <AgingMarker createdAt={r.created_at} status={r.status} />
                                </span>
                                <span className="rat__amount">{fmtINR(r.total)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function RecentCertificatesTable({ rows = [] }) {
    return (
        <div className="rat">
            <div className="rat__head">
                <h6 className="rat__title">Recent Certificates</h6>
                <span className="rat__count">{rows.length}</span>
            </div>
            {rows.length === 0 ? (
                <div className="rat__empty">No recent certificates.</div>
            ) : (
                <ul className="rat__list">
                    {rows.map((r) => (
                        <li key={`cert-${r.id}`} className="rat__row">
                            <Link to={certHref(r)} className="rat__link" aria-label={`Open ${r.certificate_no}`}>
                                <span className="rat__date">{fmtDate(r.issue_date)}</span>
                                <span className={`rat__metal rat__metal--${r.metal_type}`}>
                                    {r.metal_type === 'silver' ? 'SC' : 'GC'}
                                </span>
                                <span className="rat__id">{r.certificate_no}</span>
                                <span className="rat__customer">{r.customer_name}</span>
                                <span className="rat__status">
                                    <Badge bg="success" className="rat__badge">ISSUED</Badge>
                                </span>
                                <span className="rat__amount">{fmtINR(r.total_amount)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
