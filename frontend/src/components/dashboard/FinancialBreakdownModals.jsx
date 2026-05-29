import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import useSafeModalClose from '../../hooks/useSafeModalClose';

const fmtINR = (v) =>
    Number(v || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function useBreakdown(show) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/analytics/revenue-breakdown');
            setData(r.data?.data || null);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { if (show) load(); }, [show, load]);
    return { data, loading };
}

/* ── Reusable "big number column" — Python-style glanceable cell ─────────── */
function BigCell({ label, value, tone }) {
    return (
        <div className={`fbm-cell${tone ? ' fbm-cell--' + tone : ''}`}>
            <div className="fbm-cell__value">{fmtINR(value)}</div>
            <div className="fbm-cell__label">{label}</div>
        </div>
    );
}

function ScopeBody({ scope, label }) {
    if (!scope) return null;
    return (
        <>
            <h6 className="fbm-section">Revenue ({label})</h6>
            <div className="fbm-grid fbm-grid--4">
                <BigCell label="Total"   value={scope.revenue.total}   tone="success" />
                <BigCell label="Cash"    value={scope.revenue.cash}    />
                <BigCell label="UPI"     value={scope.revenue.upi}     />
                <BigCell label="Balance" value={scope.revenue.balance} />
            </div>
            <hr className="fbm-rule" />
            <h6 className="fbm-section">Expense / Weight Loss ({label})</h6>
            <div className="fbm-grid fbm-grid--3">
                <BigCell label="Total"       value={scope.expense.total}       tone="danger" />
                <BigCell label="Weight Loss" value={scope.expense.weight_loss} />
                <BigCell
                    label="Other"
                    value={Math.max(0, (scope.expense.total || 0) - (scope.expense.weight_loss || 0))}
                />
            </div>
        </>
    );
}

export function RevenueTodayModal({ show, onHide }) {
    const { data, loading } = useBreakdown(show);
    const scope = data?.today;
    const { safeClose } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose();
    return (
        <Modal show={show} onHide={closeSafely} centered size="lg" contentClassName="fbm-modal">
            <Modal.Header closeButton>
                <Modal.Title className="fbm-title">Revenue Today</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading || !scope ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                ) : (
                    <>
                        <ScopeBody scope={scope} label="Today" />
                        <hr className="fbm-rule" />
                        <div className={`fbm-pnl${scope.pnl >= 0 ? ' fbm-pnl--pos' : ' fbm-pnl--neg'}`}>
                            <span className="fbm-pnl__label">P&amp;L</span>
                            <span className="fbm-pnl__value">{fmtINR(scope.pnl)}</span>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}

export function RevenueAllTimeModal({ show, onHide }) {
    const { data, loading } = useBreakdown(show);
    const scope = data?.allTime;
    const { safeClose } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose();
    return (
        <Modal show={show} onHide={closeSafely} centered size="lg" contentClassName="fbm-modal">
            <Modal.Header closeButton>
                <Modal.Title className="fbm-title">Total Revenue</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading || !scope ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                ) : (
                    <>
                        <ScopeBody scope={scope} label="All Time" />
                        <hr className="fbm-rule" />
                        <div className="fbm-grid fbm-grid--2">
                            <BigCell label="Cash In Hand" value={scope.cashInHand} />
                            <div className={`fbm-cell fbm-cell--${scope.pnl >= 0 ? 'success' : 'danger'}`}>
                                <div className="fbm-cell__value">{fmtINR(scope.pnl)}</div>
                                <div className="fbm-cell__label">P&amp;L (All Time)</div>
                            </div>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}

export function CashInHandModal({ show, onHide }) {
    const { data, loading } = useBreakdown(show);
    const today = data?.today;
    const allTime = data?.allTime;
    const cashInHand = allTime?.cashInHand;
    const { safeClose } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose();

    return (
        <Modal show={show} onHide={closeSafely} centered size="lg" contentClassName="fbm-modal">
            <Modal.Header closeButton>
                <Modal.Title className="fbm-title">Cash In Hand</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading || !data ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                ) : (
                    <>
                        <div className="fbm-hero">
                            <div className="fbm-hero__value">{fmtINR(cashInHand)}</div>
                            <div className="fbm-hero__label">Current liquidity</div>
                        </div>
                        <hr className="fbm-rule" />
                        <h6 className="fbm-section">Today's Cash Flow</h6>
                        <div className="fbm-grid fbm-grid--2">
                            <BigCell label="Cash In (today)"  value={today?.revenue?.cash}  tone="success" />
                            <BigCell label="Cash Out (today)" value={today?.expense?.total} tone="danger"  />
                        </div>
                        <p className="fbm-note">
                            Cash-out by mode is not yet broken out by the backend; total expense shown.
                        </p>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
