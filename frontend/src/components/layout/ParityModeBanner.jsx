import React, { useEffect, useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import api from '../../services/api';

/**
 * ParityModeBanner — canonical global governance-state authority.
 *
 * Single render authority for SYSTEM_MODE === PARITY visibility across the
 * entire app. Persistent, non-dismissible, static. The anomaly widget
 * (Gap 1.6) is detail/inspection telemetry only and must NOT echo this
 * state — that would split institutional authority.
 *
 * Data source: one-shot bootstrap fetch on AppShell mount. No polling, no
 * websocket, no localStorage, no shadow context state. SYSTEM_MODE changes
 * require a backend restart, so a single bootstrap read is sufficient —
 * the operator session was already invalidated by that restart.
 *
 * Failure mode: if the mode endpoint fails at bootstrap, hide the banner
 * (do not assume strict; do not assume parity). The anomaly widget will
 * surface the connectivity issue separately as a detail concern.
 */

export default function ParityModeBanner() {
    const [isParity, setIsParity] = useState(false);

    useEffect(() => {
        let cancelled = false;
        api.get('/system/mode')
            .then((res) => {
                if (cancelled) return;
                setIsParity(!!res.data?.data?.is_parity);
            })
            .catch(() => {
                // Bootstrap fetch failed — leave isParity=false so the banner
                // stays hidden. We do not retry; mode does not flip mid-session.
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        document.body.classList.toggle('parity-mode-active', isParity);
        return () => document.body.classList.remove('parity-mode-active');
    }, [isParity]);

    if (!isParity) return null;

    return (
        <div className="parity-banner" role="status" aria-live="off">
            <FaShieldAlt className="parity-banner__icon" aria-hidden="true" />
            <span className="parity-banner__text">
                <span className="parity-banner__title">PARITY MODE ACTIVE</span>
                <span className="parity-banner__sep"> — </span>
                <span className="parity-banner__detail">
                    Strict integrity protections are relaxed for migration or legacy compatibility operations.
                </span>
            </span>
        </div>
    );
}
