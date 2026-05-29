import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCoins, FaBalanceScale, FaCertificate, FaFileAlt, FaImage, FaPlus,
} from 'react-icons/fa';
import { useWorkflow, WORKFLOWS } from '../../contexts/WorkflowContext';
import { useSocket } from '../../hooks/useSocket';
import { getAgingBucketFromAgeMs, agingTitle } from '../../utils/aging';
import api from '../../services/api';

// Visual tone mirrors Python dashboard tile colors. ST has no Python
// analogue (Python had GT/GC/SC/PC); slate-grey fits the silver-metal
// semantic alongside the gold (warning) / blue (silver cert) palette.
const TONE = {
    gold:        { className: 'wdc-tile--warning', Icon: FaCoins,        tagline: 'New gold purity test'        },
    gold_cert:   { className: 'wdc-tile--danger',  Icon: FaCertificate,  tagline: 'Issue gold certificate'      },
    silver:      { className: 'wdc-tile--slate',   Icon: FaBalanceScale, tagline: 'New silver purity test'      },
    silver_cert: { className: 'wdc-tile--primary', Icon: FaFileAlt,      tagline: 'Issue silver certificate'    },
    photo_cert:  { className: 'wdc-tile--success', Icon: FaImage,        tagline: 'Issue photo certificate'     },
};

const SUMMARY_POLL_MS = 60 * 1000;

/**
 * Workflow dispatch tiles. The PRIMARY operator entry surface on the
 * dashboard — restores Python's top-of-page color-coded tile pattern.
 *
 * Click semantics (matches Sidebar's two-affordance pattern):
 *   - Card body → navigate to /workflow with that workflow selected (queue)
 *   - "+ New"   → requestNewWorkflow + navigate (opens the New X modal)
 *
 * Live counts + oldest-open aging dot reuse the same /workflow/summary
 * endpoint Sidebar polls; socket subscriptions keep the count in sync
 * without a 60s lag.
 */
export default function WorkflowDispatchCards() {
    const navigate = useNavigate();
    const { setSelectedWorkflow, requestNewWorkflow, tryWorkflowSwitch } = useWorkflow();
    const [summary, setSummary] = useState({});
    const seqRef = useRef(0);

    const refreshSummary = useCallback(async () => {
        const seq = ++seqRef.current;
        try {
            const res = await api.get('/workflow/summary');
            if (seq !== seqRef.current) return;
            setSummary(res.data?.data || {});
        } catch {
            /* Dashboard tiles are operational — last-good values acceptable. */
        }
    }, []);

    useEffect(() => {
        refreshSummary();
        const id = setInterval(refreshSummary, SUMMARY_POLL_MS);
        return () => clearInterval(id);
    }, [refreshSummary]);

    useSocket(
        ['gold_test', 'silver_test', 'gold_cert', 'silver_cert', 'workflow'],
        {
            'item:added':   refreshSummary,
            'item:updated': refreshSummary,
            'item:done':    refreshSummary,
            'cert:created': refreshSummary,
            'cert:updated': refreshSummary,
            'cert:done':    refreshSummary,
        },
        [refreshSummary]
    );

    const handleOpenQueue = (key) => {
        if (!tryWorkflowSwitch(key)) return;
        setSelectedWorkflow(key);
        navigate('/workflow');
    };

    const handleNew = (e, key) => {
        e.preventDefault();
        e.stopPropagation();
        if (!tryWorkflowSwitch(key)) return;
        requestNewWorkflow(key);
        navigate('/workflow');
    };

    return (
        <section className="wdc" aria-label="Workflow dispatch">
            <div className="wdc__row">
                {WORKFLOWS.map((w) => {
                    const tone = TONE[w.key] || TONE.silver;
                    const Icon = tone.Icon;
                    const wfSummary = summary[w.key];
                    const open = (wfSummary?.todo || 0) + (wfSummary?.in_progress || 0);
                    const aging = getAgingBucketFromAgeMs(wfSummary?.oldest_open_age_ms || 0);
                    const showDot = aging.severity > 0;

                    return (
                        <article
                            key={w.key}
                            className={`wdc-tile ${tone.className}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleOpenQueue(w.key)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleOpenQueue(w.key);
                                }
                            }}
                            aria-label={`Open ${w.label} queue`}
                            title={`Open ${w.label} queue`}
                        >
                            <div className="wdc-tile__icon">
                                <Icon aria-hidden="true" />
                            </div>
                            <div className="wdc-tile__body">
                                <div className="wdc-tile__head">
                                    <span className="wdc-tile__code">{w.code}</span>
                                    <span className="wdc-tile__name">{w.label}</span>
                                </div>
                                <div className="wdc-tile__tagline">{tone.tagline}</div>
                            </div>
                            <div className="wdc-tile__meta">
                                <div
                                    className="wdc-tile__count"
                                    title={`${open} open · ${wfSummary?.todo || 0} ongoing · ${wfSummary?.in_progress || 0} tested`}
                                >
                                    <span className="wdc-tile__count-num">{open}</span>
                                    <span className="wdc-tile__count-label">open</span>
                                </div>
                                {showDot && (
                                    <span
                                        className={`wdc-tile__aging wdc-tile__aging--${aging.bucket}`}
                                        aria-label={agingTitle(aging.severity)}
                                        title={agingTitle(aging.severity)}
                                    />
                                )}
                                <button
                                    type="button"
                                    className="wdc-tile__new"
                                    onClick={(e) => handleNew(e, w.key)}
                                    aria-label={`New ${w.label}`}
                                    title={`New ${w.label}`}
                                >
                                    <FaPlus aria-hidden="true" />
                                    <span className="wdc-tile__new-label">New</span>
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
