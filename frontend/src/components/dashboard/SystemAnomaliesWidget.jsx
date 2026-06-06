import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaShieldAlt, FaExclamationCircle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';

const REFRESH_MS = 60 * 1000;

const SEVERITY_META = {
    HIGH:   { className: 'sysanom__row--high',   icon: FaExclamationCircle, label: 'HIGH' },
    MEDIUM: { className: 'sysanom__row--medium', icon: FaInfoCircle,        label: 'MEDIUM' },
    LOW:    { className: 'sysanom__row--low',    icon: FaInfoCircle,        label: 'LOW' },
};

/**
 * System anomalies widget. Governance telemetry — answers
 * "what threatens institutional truth right now?"
 *
 * Detect-then-show: the backend's anomalyService only surfaces detectors
 * that have a real query. No fabricated metrics, no charts. Severity-
 * ordered list, expandable rows. Clean state collapses to a single line.
 *
 * Refresh: 60s poll. No socket layer — anomaly state is too coarse for
 * that and the widget is admin-only, not on every operator's screen.
 */
export default function SystemAnomaliesWidget() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(new Set());
    const seqRef = useRef(0);

    const refresh = useCallback(async () => {
        const seq = ++seqRef.current;
        try {
            const res = await api.get('/analytics/anomalies');
            if (seq !== seqRef.current) return;
            setData(res.data?.data || null);
            setError(null);
        } catch (e) {
            if (seq !== seqRef.current) return;
            setError(e.response?.data?.error || e.message || 'Failed to load anomalies');
        } finally {
            if (seq === seqRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, REFRESH_MS);
        return () => clearInterval(id);
    }, [refresh]);

    const toggleRow = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    if (loading && !data) {
        return (
            <div className="sysanom sysanom--loading" role="status">
                <FaShieldAlt className="sysanom__icon" aria-hidden="true" />
                <span className="sysanom__label">Checking system anomalies…</span>
            </div>
        );
    }

    if (error) {
        // Anomaly check itself failed — surface that, don't pretend the system is clean.
        return (
            <div className="sysanom sysanom--error" role="status">
                <FaExclamationCircle className="sysanom__icon" aria-hidden="true" />
                <span className="sysanom__label">Anomaly check unavailable: {error}</span>
            </div>
        );
    }

    // Single render authority for governance-state declaration is the
    // ParityModeBanner (Gap 1.8). The widget is detail/inspection telemetry —
    // it must not echo the parity-mode state as a competing declaration.
    // Drop the backend's parity_mode_active row; bypass counts remain
    // accessible via /api/analytics/parity-bypasses for detail inspection.
    const anomalies = (data?.anomalies || []).filter((a) => a.id !== 'parity_mode_active');

    if (anomalies.length === 0) {
        // Clean state — single calm line, no widget chrome.
        return (
            <div className="sysanom sysanom--clean" role="status">
                <FaCheckCircle className="sysanom__icon" aria-hidden="true" />
                <span className="sysanom__label">No anomalies detected.</span>
                <span className="sysanom__hint">Last checked just now.</span>
            </div>
        );
    }

    return (
        <div className="sysanom" role="region" aria-label="System anomalies">
            <div className="sysanom__header">
                <FaShieldAlt className="sysanom__icon" aria-hidden="true" />
                <span className="sysanom__title">System Anomalies</span>
                <span className="sysanom__total">{anomalies.length} active</span>
            </div>
            <ul className="sysanom__list">
                {anomalies.map((a) => {
                    const meta = SEVERITY_META[a.severity] || SEVERITY_META.LOW;
                    const Icon = meta.icon;
                    const isOpen = expanded.has(a.id);
                    return (
                        <li key={a.id} className={`sysanom__row ${meta.className}`}>
                            <button
                                type="button"
                                className="sysanom__row-head"
                                onClick={() => toggleRow(a.id)}
                                aria-expanded={isOpen}
                            >
                                <Icon className="sysanom__row-icon" aria-hidden="true" />
                                <span className="sysanom__row-severity">{meta.label}</span>
                                <span className="sysanom__row-title">{a.title}</span>
                                <span className="sysanom__row-count">{a.count}</span>
                            </button>
                            {isOpen && (
                                <div className="sysanom__row-body">
                                    <p className="sysanom__row-why">{a.explanation}</p>
                                    {a.remediation && (
                                        <p className="sysanom__row-remediation">
                                            <span className="sysanom__row-remediation-label">Remediation: </span>
                                            <code>{a.remediation}</code>
                                        </p>
                                    )}
                                    {a.examples && a.examples.length > 0 && (
                                        <details className="sysanom__row-examples">
                                            <summary>Examples ({a.examples.length})</summary>
                                            <ul>
                                                {a.examples.map((ex, i) => (
                                                    <li key={i}><code>{JSON.stringify(ex)}</code></li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
