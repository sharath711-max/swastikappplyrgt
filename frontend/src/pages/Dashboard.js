import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import {
    FaCoins, FaBalanceScale, FaCertificate, FaFileAlt, FaImage,
    FaWallet,
} from 'react-icons/fa';

import api from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../hooks/useSocket';

import SystemAnomaliesWidget   from '../components/dashboard/SystemAnomaliesWidget';
import NewGoldTestModal from '../components/NewGoldTestModal';
import NewSilverTestModal from '../components/NewSilverTestModal';
import NewCertificateModal from '../components/NewCertificateModal';
import {
    RevenueTodayModal,
    RevenueAllTimeModal,
    CashInHandModal,
} from '../components/dashboard/FinancialBreakdownModals';
import {
    CustomerCreditModal,
    WeightLossModal,
} from '../components/dashboard/CustomerActionModals';
import {
    RecentTestsTable,
    RecentCertificatesTable,
} from '../components/dashboard/RecentActivityTables';

import './Dashboard.css';

const POLL_FALLBACK_MS = 30 * 1000;

const fmtN   = (v) => Number(v || 0).toLocaleString('en-IN');
const fmtINR = (v) =>
    Number(v || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

// Workflow tile metadata — colours mirror the Python dashboard tiles.
// GT amber, GC red, ST slate (no Python ancestor), SC blue, PC green.
const WORKFLOW_TILES = {
    gold:        { Icon: FaCoins,        label: 'Gold Testing',       tone: 'amber' },
    gold_cert:   { Icon: FaCertificate,  label: 'Gold Certificate',   tone: 'red'   },
    silver:      { Icon: FaBalanceScale, label: 'Silver Testing',     tone: 'slate' },
    silver_cert: { Icon: FaFileAlt,      label: 'Silver Certificate', tone: 'blue'  },
    photo_cert:  { Icon: FaImage,        label: 'Photo Certificate',  tone: 'green' },
};

// Python dashboard ordered tiles as GT, GC, SC, PC (no ST). The SERN-only
// ST workflow moves to the secondary row below the hero so the hero matches
// Python's 6-card row exactly (2 stat cards + 4 workflow tiles).
const HERO_WORKFLOW_KEYS  = ['gold', 'gold_cert', 'silver_cert', 'photo_cert'];
const EXTRA_WORKFLOW_KEYS = ['silver'];

// Python-style operator control panel dashboard.
//   Row 1: Welcome | Active Customers | Customer Credit | Weight Loss
//   Row 2: Revenue Today | Total Revenue | GT | GC | SC | PC
//   Below: ST + Cash In Hand + Active Tests + Completed Today, governance,
//          recents.
// Per operator direction — visual style mirrors Python; SERN governance
// content (anomalies widget, recents, ST workflow tile, operational stats)
// preserved below the hero rather than dropped.
export default function Dashboard() {
    const navigate = useNavigate();

    const fetchSummary = useCallback(
        () => api.get('/analytics/summary').then((r) => r.data?.data ?? r.data),
        []
    );
    const { data, loading, error, reload } = useFetch(fetchSummary);

    const [totalRevenue,   setTotalRevenue]   = useState(0);
    const [workflowSummary, setWorkflowSummary] = useState({});
    const [activeCustomers, setActiveCustomers] = useState(null);

    const reloadBreakdown = useCallback(() => {
        api.get('/analytics/revenue-breakdown')
            .then((r) => setTotalRevenue(r.data?.data?.allTime?.revenue?.total ?? 0))
            .catch(() => {});
    }, []);

    const reloadWorkflowSummary = useCallback(() => {
        api.get('/workflow/summary')
            .then((r) => setWorkflowSummary(r.data?.data || {}))
            .catch(() => {});
    }, []);

    const reloadCustomers = useCallback(() => {
        api.get('/customers')
            .then((r) => {
                const payload = r.data?.data ?? r.data ?? [];
                const total = r.data?.total ?? (Array.isArray(payload) ? payload.length : 0);
                setActiveCustomers(total);
            })
            .catch(() => setActiveCustomers(0));
    }, []);

    useEffect(() => {
        reloadBreakdown();
        reloadWorkflowSummary();
        reloadCustomers();
    }, [reloadBreakdown, reloadWorkflowSummary, reloadCustomers]);

    useEffect(() => {
        const id = setInterval(() => {
            reload(); reloadBreakdown(); reloadWorkflowSummary();
        }, POLL_FALLBACK_MS);
        return () => clearInterval(id);
    }, [reload, reloadBreakdown, reloadWorkflowSummary]);

    const refreshAll = useCallback(() => {
        reload(); reloadBreakdown(); reloadWorkflowSummary(); reloadCustomers();
    }, [reload, reloadBreakdown, reloadWorkflowSummary, reloadCustomers]);

    useSocket(
        ['gold_test', 'silver_test', 'gold_cert', 'silver_cert', 'workflow'],
        {
            'item:added':   refreshAll,
            'item:updated': refreshAll,
            'item:done':    refreshAll,
            'cert:created': refreshAll,
            'cert:updated': refreshAll,
            'cert:done':    refreshAll,
        },
        [refreshAll]
    );

    const [breakdownScope, setBreakdownScope] = useState(null);  // 'today' | 'allTime' | 'cash'
    const [actionModal,    setActionModal]    = useState(null);  // 'credit' | 'weightloss'
    const [showGoldTestModal, setShowGoldTestModal] = useState(false);
    const [showSilverTestModal, setShowSilverTestModal] = useState(false);
    const [certModal, setCertModal] = useState({ show: false, type: 'gold' });

    const handleWorkflowClick = (key) => {
        if (key === 'gold') {
            setShowGoldTestModal(true);
        } else if (key === 'silver') {
            setShowSilverTestModal(true);
        } else if (key === 'gold_cert') {
            setCertModal({ show: true, type: 'gold' });
        } else if (key === 'silver_cert') {
            setCertModal({ show: true, type: 'silver' });
        } else if (key === 'photo_cert') {
            setCertModal({ show: true, type: 'photo' });
        }
    };

    if (loading && !data) {
        return (
            <div className="py-dash-loading"><Spinner animation="border" /></div>
        );
    }

    return (
        <div className="py-dash">
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            {/* ── HERO ROW 1 — Welcome + Active Customers + 2 large action tiles ── */}
            <section className="py-hero-row py-hero-row--top" aria-label="Welcome and quick actions">
                <div className="py-welcome">
                    <div className="py-welcome__title">
                        <span>Welcome</span>
                        <span>Back!</span>
                    </div>
                    <img
                        src={`${process.env.PUBLIC_URL || ''}/welcome.png`}
                        alt=""
                        className="py-welcome__img"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>

                <button
                    type="button"
                    className="py-stat-card py-stat-card--clickable"
                    onClick={() => navigate('/customers')}
                    aria-label="Open customer list"
                >
                    <div className="py-stat-card__value py-stat-card__value--lg">
                        {activeCustomers === null ? '…' : fmtN(activeCustomers)}
                    </div>
                    <div className="py-stat-card__label">Active Customers</div>
                </button>

                <button
                    type="button"
                    className="py-tile py-tile--credit"
                    onClick={() => setActionModal('credit')}
                    aria-label="Open Customer Credit"
                >
                    <FaWallet className="py-tile__icon" aria-hidden="true" />
                    <span className="py-tile__label">Customer Credit</span>
                </button>

                <button
                    type="button"
                    className="py-tile py-tile--wl"
                    onClick={() => setActionModal('weightloss')}
                    aria-label="Open Weight Loss"
                >
                    <FaBalanceScale className="py-tile__icon" aria-hidden="true" />
                    <span className="py-tile__label">Weight Loss</span>
                </button>
            </section>

            {/* ── HERO ROW 2 — 2 stat cards + 4 workflow tiles (Python parity) ── */}
            <section className="py-hero-row py-hero-row--bottom" aria-label="Financials and workflow dispatch">
                <button
                    type="button"
                    className="py-stat-card py-stat-card--clickable"
                    onClick={() => setBreakdownScope('today')}
                    aria-label="Open Revenue Today breakdown"
                >
                    <div className="py-stat-card__value">{fmtINR(data?.todayRevenue)}</div>
                    <div className="py-stat-card__label">Revenue today</div>
                </button>

                <button
                    type="button"
                    className="py-stat-card py-stat-card--clickable"
                    onClick={() => setBreakdownScope('allTime')}
                    aria-label="Open Total Revenue breakdown"
                >
                    <div className="py-stat-card__value">{fmtINR(totalRevenue)}</div>
                    <div className="py-stat-card__label">Total Revenue</div>
                </button>

                {HERO_WORKFLOW_KEYS.map((key) => {
                    const meta = WORKFLOW_TILES[key];
                    const Icon = meta.Icon;
                    const wfSummary = workflowSummary[key];
                    const openCount = (wfSummary?.todo || 0) + (wfSummary?.in_progress || 0);
                    return (
                        <button
                            key={key}
                            type="button"
                            className={`py-tile py-tile--${meta.tone}`}
                            onClick={() => handleWorkflowClick(key)}
                            title={meta.label}
                            aria-label={`Open ${meta.label}`}
                        >
                            <Icon className="py-tile__icon" aria-hidden="true" />
                            <span className="py-tile__label">{meta.label}</span>
                            {openCount > 0 && (
                                <span className="py-tile__count" title={`${openCount} open`}>
                                    {openCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </section>

            {/* ── SECONDARY ROW — ST tile + remaining operational stats ── */}
            <section className="py-secondary-row" aria-label="Operational stats">
                {EXTRA_WORKFLOW_KEYS.map((key) => {
                    const meta = WORKFLOW_TILES[key];
                    const Icon = meta.Icon;
                    const wfSummary = workflowSummary[key];
                    const openCount = (wfSummary?.todo || 0) + (wfSummary?.in_progress || 0);
                    return (
                        <button
                            key={key}
                            type="button"
                            className={`py-tile py-tile--${meta.tone}`}
                            onClick={() => handleWorkflowClick(key)}
                            title={meta.label}
                            aria-label={`Open ${meta.label}`}
                        >
                            <Icon className="py-tile__icon" aria-hidden="true" />
                            <span className="py-tile__label">{meta.label}</span>
                            {openCount > 0 && (
                                <span className="py-tile__count">{openCount}</span>
                            )}
                        </button>
                    );
                })}

                <button
                    type="button"
                    className="py-stat-card py-stat-card--clickable"
                    onClick={() => navigate('/cash-in-hand')}
                    aria-label="Open Cash In Hand ledger"
                >
                    <div className="py-stat-card__value">{fmtINR(data?.cashInHand)}</div>
                    <div className="py-stat-card__label">Cash In Hand</div>
                </button>

                <button
                    type="button"
                    className="py-stat-card py-stat-card--clickable"
                    onClick={() => navigate('/weight-loss')}
                    aria-label="Open Expense today"
                >
                    <div className="py-stat-card__value">{fmtINR(data?.todayExpense)}</div>
                    <div className="py-stat-card__label">Expense today</div>
                </button>

                <div className="py-stat-card">
                    <div className="py-stat-card__value">{fmtN(data?.activeTests)}</div>
                    <div className="py-stat-card__label">Active Tests</div>
                </div>

                <div className="py-stat-card">
                    <div className="py-stat-card__value">{fmtN(data?.completedToday)}</div>
                    <div className="py-stat-card__label">Completed Today</div>
                </div>
            </section>

            {/* ── GOVERNANCE TELEMETRY ── */}
            <SystemAnomaliesWidget />

            {/* ── RECENTS ── */}
            <section className="dash-recents-row" aria-label="Recent activity">
                <RecentTestsTable        rows={data?.recentTests || []} />
                <RecentCertificatesTable rows={data?.recentCertificates || []} />
            </section>

            {/* ── MODALS ── */}
            <RevenueTodayModal   show={breakdownScope === 'today'}   onHide={() => setBreakdownScope(null)} />
            <RevenueAllTimeModal show={breakdownScope === 'allTime'} onHide={() => setBreakdownScope(null)} />
            <CashInHandModal     show={breakdownScope === 'cash'}    onHide={() => setBreakdownScope(null)} />
            <CustomerCreditModal show={actionModal === 'credit'}     onHide={() => setActionModal(null)} onSuccess={refreshAll} />
            <WeightLossModal     show={actionModal === 'weightloss'} onHide={() => setActionModal(null)} onSuccess={refreshAll} />

            {/* ── INTAKE FORM MODALS ── */}
            <NewGoldTestModal
                show={showGoldTestModal}
                onHide={() => setShowGoldTestModal(false)}
                onSuccess={refreshAll}
            />
            <NewSilverTestModal
                show={showSilverTestModal}
                onHide={() => setShowSilverTestModal(false)}
                onSuccess={refreshAll}
            />
            <NewCertificateModal
                show={certModal.show}
                type={certModal.type}
                onHide={() => setCertModal(prev => ({ ...prev, show: false }))}
                onSuccess={refreshAll}
            />
        </div>
    );
}
