'use strict';

// Anomaly service — governance telemetry layer.
//
// Detects anomalies that threaten institutional truth *right now*:
//   - missed ledger DEBITs on DONE certificates (financial drift)
//   - DONE certificates that never received a snapshot_hash (audit drift)
//   - IN_PROGRESS items stalled for more than 24h (workflow drift)
//   - parity-mode activation (governance-risk signal)
//
// All detectors return a stable shape: { id, severity, title, count,
// examples, explanation, remediation }. Examples is bounded so the UI
// payload stays small even on a dirty DB.
//
// Deliberately NOT included in v1:
//   - missed ledger DEBIT: reconcile_ledger.js assumes credit_history has
//     reference_type/reference_id columns; the live schema does not. The
//     real linkage is description-string matching ("Gold Certificate GC-X — lab charges")
//     which is too fragile to use as an anomaly trigger. Add the columns
//     OR a real linkage table before re-introducing this detector. Verified
//     against the live DB on 2026-05-23 — left out rather than ship a
//     query that throws on every poll.
//   - duplicate ledger DEBIT (should be 0 by index; noise risk)
//   - unknown reference_type (data-hygiene only, not operationally urgent)
//   - missing media (requires filesystem walk; defer to on-demand report)
//   - failed restore drill, correction chains, print recovery
//     (no in-DB record exists yet — would be observability theater)
//
// New anomalies added here MUST have a real detector or be removed. Per
// the architectural directive: governance telemetry is detect-then-show,
// not show-then-justify.

const { db } = require('../db/db');
const { isParity, getBypassSummary, SYSTEM_MODE } = require('../config/systemMode');

const MAX_EXAMPLES = 5;
const STALLED_DAYS = 1;

const SEVERITY = Object.freeze({
    HIGH  : 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW   : 'LOW',
});

const CERT_TABLES = [
    { table: 'gold_certificate',   refType: 'gold_certificate',   label: 'Gold' },
    { table: 'silver_certificate', refType: 'silver_certificate', label: 'Silver' },
    { table: 'photo_certificate',  refType: 'photo_certificate',  label: 'Photo' },
];

const STALL_TABLES = [
    { table: 'gold_test',           label: 'Gold Test' },
    { table: 'silver_test',         label: 'Silver Test' },
    { table: 'gold_certificate',    label: 'Gold Cert' },
    { table: 'silver_certificate',  label: 'Silver Cert' },
    { table: 'photo_certificate',   label: 'Photo Cert' },
];

function _detectUnsealedDone() {
    // Scope: certs DONE within the last 30 days. Older legacy/migrated
    // records pre-date the snapshot_hash feature and would otherwise drown
    // the operational signal ("what's wrong right now?") in historical noise.
    const examples = [];
    let total = 0;
    for (const { table, label } of CERT_TABLES) {
        const rows = db.prepare(
            `SELECT id, auto_number FROM ${table}
             WHERE status = 'DONE'
               AND deletedon IS NULL
               AND (snapshot_hash IS NULL OR snapshot_hash = '')
               AND JULIANDAY('now') - JULIANDAY(COALESCE(done_at, created)) <= 30`
        ).all();
        total += rows.length;
        for (const r of rows) {
            if (examples.length < MAX_EXAMPLES) {
                examples.push({ id: r.id, auto_number: r.auto_number, kind: label });
            }
        }
    }
    return {
        id: 'unsealed_done_recent',
        severity: SEVERITY.HIGH,
        title: 'Recent DONE certificates missing snapshot hash',
        count: total,
        examples,
        explanation: 'Certificates finalized in the last 30 days whose immutable print snapshot hash was never written. The finalization path should always write snapshot_hash on DONE transition.',
        remediation: 'Investigate per-record; check certificateService.updateStatus for the affected workflow type.',
        meta: { window_days: 30 },
    };
}

function _detectStalledInProgress() {
    const examples = [];
    let total = 0;
    for (const { table, label } of STALL_TABLES) {
        const rows = db.prepare(
            `SELECT id, auto_number, in_progress_at FROM ${table}
             WHERE status = 'IN_PROGRESS'
               AND deletedon IS NULL
               AND in_progress_at IS NOT NULL
               AND JULIANDAY('now') - JULIANDAY(in_progress_at) > ?`
        ).all(STALLED_DAYS);
        total += rows.length;
        for (const r of rows) {
            if (examples.length < MAX_EXAMPLES) {
                examples.push({ id: r.id, auto_number: r.auto_number, kind: label, in_progress_at: r.in_progress_at });
            }
        }
    }
    return {
        id: 'stalled_in_progress',
        severity: SEVERITY.MEDIUM,
        title: `IN_PROGRESS items stalled over ${STALLED_DAYS} day`,
        count: total,
        examples,
        explanation: 'Workflow items that entered IN_PROGRESS but have not been finalized for more than a day. May indicate forgotten work or operator interruption.',
        remediation: 'Surface in the workflow board (sidebar aging dots already flag this at the 24h+ tier).',
    };
}

function _detectParityMode() {
    if (!isParity()) return null;
    const bypass = getBypassSummary();
    const totalBypasses = Object.values(bypass).reduce((s, n) => s + n, 0);
    // count=1 because the mode itself is the anomaly. Bypass tallies go in
    // meta — they tell the operator how often relaxed rules have been hit,
    // but the active mode is the governance risk regardless of bypass count.
    return {
        id: 'parity_mode_active',
        severity: SEVERITY.HIGH,
        title: 'Parity mode is active',
        count: 1,
        examples: Object.entries(bypass).filter(([, n]) => n > 0).map(([rule, n]) => ({ rule, bypasses: n })),
        explanation: 'The system is running in PARITY mode for migration compatibility. Strict-mode guards (idempotency, OCC, status validations) are warning-only — they log bypasses instead of rejecting them.',
        remediation: 'Set SYSTEM_MODE=STRICT in backend/.env once migration parity is verified.',
        meta: { system_mode: SYSTEM_MODE, total_bypasses: totalBypasses },
    };
}

function listAnomalies() {
    const detectors = [
        _detectUnsealedDone,
        _detectStalledInProgress,
        _detectParityMode,
    ];
    const out = [];
    for (const d of detectors) {
        try {
            const result = d();
            // Skip count=0 rows — the widget answers "what threatens truth
            // right now?" so an empty detector contributes nothing.
            if (result && (result.count || 0) > 0) out.push(result);
        } catch (err) {
            // Detector failure is itself an anomaly — surface rather than swallow.
            out.push({
                id: `detector_failed_${d.name || 'unknown'}`,
                severity: SEVERITY.MEDIUM,
                title: `Anomaly detector failed: ${d.name || 'unknown'}`,
                count: 1,
                examples: [{ error: err.message }],
                explanation: 'The anomaly detector itself raised an error. The underlying state is unknown until the detector is fixed.',
                remediation: 'Inspect backend logs for the failing detector.',
            });
        }
    }
    // High-severity first so the UI can render top-down by severity.
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    out.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
    return out;
}

module.exports = { listAnomalies, SEVERITY };
