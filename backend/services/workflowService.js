'use strict';

const {
    db, withTransaction,
    readCachedResult, getIdempotencyKey, saveIdempotencyKey,
} = require('../db/db');
const { getRequestId }          = require('../utils/audit');
const testServiceV2             = require('./v2/testService');
const certServiceV2             = require('./v2/certificateService');
const seqSvc                    = require('./v2/sequenceService');
const photoCertRepo             = require('../repositories/photoCertificateRepository');
const documentDeliveryService   = require('./documentDeliveryService');
const { writeAuditLog }         = require('./auditLogService');
const logger                    = require('../utils/logger');
const { BusinessError, ERR }    = require('./v2/errors');
const { assertTransitionAllowed } = require('./workflowStateMachine');
const socket                    = require('../socket');
const { isStrict, parityLog }   = require('../config/systemMode');

// ─── Table map (used throughout) ─────────────────────────────────────────────

const TABLE_MAP = Object.freeze({
    gold       : 'gold_test',
    silver     : 'silver_test',
    gold_cert  : 'gold_certificate',
    silver_cert: 'silver_certificate',
    photo_cert : 'photo_certificate',
});

// ─── Timestamp helpers ────────────────────────────────────────────────────────
//
// SQLite stores `created` as 'YYYY-MM-DD HH:MM:SS[.sss]' in UTC with NO offset
// marker. `new Date(thatString)` parses it as LOCAL time in V8 / Node, which
// silently shifts wall-clock age by the system TZ offset (5.5h for IST).
// Used by getSummary() so aging is correct in every timezone.
function _parseDbTimestampMs(s) {
    if (s instanceof Date) return s.getTime();
    if (typeof s !== 'string') return Number(s);
    const trimmed = s.trim();
    if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed)) return new Date(trimmed).getTime();
    return new Date(trimmed.replace(' ', 'T') + 'Z').getTime();
}

// ─── Idempotency key helpers ──────────────────────────────────────────────────

function _moveIdemKey(type, id, toStatus, requestId) {
    return `workflow:move:${type}:${id}:${toStatus}:${requestId}`;
}

function _finalizeIdemKey(type, id, requestId) {
    return `workflow:finalize:${type}:${id}:${requestId}`;
}

// ─── WorkflowService ─────────────────────────────────────────────────────────

class WorkflowService {

    // ── READ ─────────────────────────────────────────────────────────────────

    async getAllItems() {
        const query = `
            SELECT
                'gold' AS type, gt.id, gt.customer_id, gt.auto_number, gt.status,
                'Gold Test' AS description,
                gt.total AS total, gt.mode_of_payment, gt.created AS createdon,
                c.name AS customer_name,
                CASE WHEN gt.print_snapshot IS NOT NULL THEN 1 ELSE 0 END AS has_snapshot,
                (SELECT GROUP_CONCAT(COALESCE(item_type, '') || ' ' || COALESCE(name, ''), ' ')
                 FROM gold_test_item
                 WHERE gold_test_id = gt.id AND deletedon IS NULL) AS items_summary
            FROM gold_test gt
            JOIN customer c ON gt.customer_id = c.id
            WHERE gt.deletedon IS NULL

            UNION ALL

            SELECT
                'silver' AS type, st.id, st.customer_id, st.auto_number, st.status,
                'Silver Test' AS description,
                st.total AS total, st.mode_of_payment, st.created AS createdon,
                c.name AS customer_name,
                CASE WHEN st.print_snapshot IS NOT NULL THEN 1 ELSE 0 END AS has_snapshot,
                (SELECT GROUP_CONCAT(COALESCE(item_type, '') || ' ' || COALESCE(name, ''), ' ')
                 FROM silver_test_item
                 WHERE silver_test_id = st.id AND deletedon IS NULL) AS items_summary
            FROM silver_test st
            JOIN customer c ON st.customer_id = c.id
            WHERE st.deletedon IS NULL

            UNION ALL

            SELECT
                'gold_cert' AS type, gc.id, gc.customer_id, gc.auto_number, gc.status,
                'Gold Certificate' AS description,
                gc.total AS total, gc.mode_of_payment, gc.created AS createdon,
                c.name AS customer_name,
                CASE WHEN gc.print_snapshot IS NOT NULL THEN 1 ELSE 0 END AS has_snapshot,
                (SELECT GROUP_CONCAT(COALESCE(item_type, '') || ' ' || COALESCE(name, ''), ' ')
                 FROM gold_certificate_item
                 WHERE gold_certificate_id = gc.id AND deletedon IS NULL) AS items_summary
            FROM gold_certificate gc
            JOIN customer c ON gc.customer_id = c.id
            WHERE gc.deletedon IS NULL

            UNION ALL

            SELECT
                'silver_cert' AS type, sc.id, sc.customer_id, sc.auto_number, sc.status,
                'Silver Certificate' AS description,
                sc.total AS total, sc.mode_of_payment, sc.created AS createdon,
                c.name AS customer_name,
                CASE WHEN sc.print_snapshot IS NOT NULL THEN 1 ELSE 0 END AS has_snapshot,
                (SELECT GROUP_CONCAT(COALESCE(item_type, '') || ' ' || COALESCE(name, ''), ' ')
                 FROM silver_certificate_item
                 WHERE silver_certificate_id = sc.id AND deletedon IS NULL) AS items_summary
            FROM silver_certificate sc
            JOIN customer c ON sc.customer_id = c.id
            WHERE sc.deletedon IS NULL

            UNION ALL

            SELECT
                'photo_cert' AS type, pc.id, pc.customer_id, pc.auto_number, pc.status,
                'Photo Certificate' AS description,
                pc.total AS total, pc.mode_of_payment, pc.created AS createdon,
                c.name AS customer_name,
                CASE WHEN pc.print_snapshot IS NOT NULL THEN 1 ELSE 0 END AS has_snapshot,
                (SELECT GROUP_CONCAT(COALESCE(item_type, '') || ' ' || COALESCE(name, ''), ' ')
                 FROM photo_certificate_item
                 WHERE photo_certificate_id = pc.id AND deletedon IS NULL) AS items_summary
            FROM photo_certificate pc
            JOIN customer c ON pc.customer_id = c.id
            WHERE pc.deletedon IS NULL

            ORDER BY 9 DESC, 2 DESC
        `;
        return db.prepare(query).all();
    }

    // ── SUMMARY (per-workflow counts + oldest open-item age) ─────────────────
    //
    // Used by the sidebar to surface queue pressure and operator aging without
    // fetching the full kanban payload. "Open" = TODO or IN_PROGRESS.
    // oldest_open_age_ms is the wall-clock ms since the oldest open item's
    // `createdon`; 0 if no open items.
    //
    // Implementation: one per-table aggregation that returns status counts +
    // MIN(created) over open rows only. Replaces the earlier getAllItems()
    // UNION-then-filter approach which scanned every DONE row in JS — for a
    // db with 30k+ DONE rows that took ~350 ms per call; this version uses
    // the (status, deletedon) index per table and runs in single-digit ms.
    async getSummary() {
        const now = Date.now();
        const workflows = ['gold', 'silver', 'gold_cert', 'silver_cert', 'photo_cert'];
        const summary = {};
        for (const w of workflows) {
            const table = TABLE_MAP[w];
            const row = db.prepare(
                `SELECT
                    COUNT(CASE WHEN status = 'TODO'        THEN 1 END) AS todo,
                    COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS in_progress,
                    COUNT(CASE WHEN status = 'DONE'        THEN 1 END) AS done,
                    MIN(CASE WHEN status IN ('TODO','IN_PROGRESS') THEN created END) AS oldest_open_created
                 FROM ${table}
                 WHERE deletedon IS NULL`
            ).get();
            let oldestOpenAgeMs = 0;
            if (row?.oldest_open_created) {
                const t = _parseDbTimestampMs(row.oldest_open_created);
                if (Number.isFinite(t)) {
                    const age = now - t;
                    if (age > 0) oldestOpenAgeMs = age;
                }
            }
            summary[w] = {
                todo       : row?.todo        || 0,
                in_progress: row?.in_progress || 0,
                done       : row?.done        || 0,
                oldest_open_age_ms: oldestOpenAgeMs,
            };
        }
        return summary;
    }

    async getKanbanBoard(limit = 50) {
        const items = await this.getAllItems();
        const counts = {
            TODO       : items.filter(i => i.status === 'TODO').length,
            IN_PROGRESS: items.filter(i => i.status === 'IN_PROGRESS').length,
            DONE       : items.filter(i => i.status === 'DONE').length,
        };
        return {
            TODO       : items.filter(i => i.status === 'TODO').slice(0, limit),
            IN_PROGRESS: items.filter(i => i.status === 'IN_PROGRESS').slice(0, limit),
            DONE       : items.filter(i => i.status === 'DONE').slice(0, limit),
            sequence   : Date.now(),
            meta       : { limit, counts },
            // Operator-facing preview of the next A001-Z999 label that will be
            // assigned to the next cert item created. Read-only peek — does not
            // increment the global counter.
            nextCertSeqs: {
                gold  : seqSvc.peekNextCertificateItemNumber('gold'),
                silver: seqSvc.peekNextCertificateItemNumber('silver'),
                photo : seqSvc.peekNextCertificateItemNumber('photo'),
            },
        };
    }

    // ── MOVE (TODO → IN_PROGRESS) ─────────────────────────────────────────────
    //
    // expectedVersion: optional OCC guard — client reads current version and sends
    //                  it here; if the row was modified concurrently the 409 fires
    //                  before any write happens.
    // ─────────────────────────────────────────────────────────────────────────

    async moveItem(type, id, toStatus, actor = {}, expectedVersion = null) {
        if (toStatus === 'DONE') {
            throw new BusinessError(
                'Finalization requires explicit completion logic',
                ERR.STATUS_INVALID, 403
            );
        }

        const table = TABLE_MAP[type];
        if (!table) {
            throw new BusinessError(`Invalid workflow type: ${type}`, ERR.INVALID_TYPE, 400);
        }

        // ── 1. Idempotency: return cached result for duplicate requests ────────
        const requestId = getRequestId() || null;
        if (isStrict() && requestId) {
            const cached = getIdempotencyKey(_moveIdemKey(type, id, toStatus, requestId));
            if (cached?.response) return { ...cached.response, _idempotent: true };
        } else if (requestId) {
            parityLog('workflow.move.idempotency', { type, id, toStatus });
        }

        // ── 2. Pre-flight read (fast-fail before acquiring write lock) ─────────
        const preflight = this._getFullRow(type, id);
        if (!preflight) {
            throw new BusinessError(`Workflow item not found: ${id}`, ERR.NOT_FOUND, 404);
        }
        assertTransitionAllowed(type, preflight.status, toStatus);

        // ── 3. BEGIN IMMEDIATE: OCC check + status UPDATE + audit (atomic) ───────
        const moved = withTransaction(() => {
            const ts = new Date().toISOString();

            // Re-read INSIDE transaction for serialisation
            const row = db.prepare(
                `SELECT id, status, version FROM ${table}
                 WHERE id = ? AND deletedon IS NULL`
            ).get(id);

            if (!row) {
                throw new BusinessError(`Workflow item not found: ${id}`, ERR.NOT_FOUND, 404);
            }
            // Re-validate inside the transaction to catch race conditions
            assertTransitionAllowed(type, row.status, toStatus);

            // OCC: reject if row was modified between client read and now
            if (isStrict() && expectedVersion !== null &&
                Number(row.version) !== Number(expectedVersion)) {
                throw new BusinessError(
                    `Version conflict on move: expected v${expectedVersion}, got v${row.version}. Reload and retry.`,
                    'OPTIMISTIC_LOCK_CONFLICT', 409,
                    { expectedVersion: Number(expectedVersion), actualVersion: Number(row.version) }
                );
            } else if (!isStrict() && expectedVersion !== null &&
                Number(row.version) !== Number(expectedVersion)) {
                parityLog('workflow.move.occ', { type, id, expectedVersion, actualVersion: Number(row.version) });
            }

            // Status update (DB trigger increments version automatically)
            db.prepare(
                `UPDATE ${table}
                 SET status = ?, lastmodified = ?,
                     in_progress_at = COALESCE(in_progress_at, ?)
                 WHERE id = ? AND deletedon IS NULL`
            ).run(toStatus, ts, ts, id);

            // Audit INSERT in the SAME BEGIN IMMEDIATE / COMMIT
            writeAuditLog({
                requestId : requestId || undefined,
                userId    : actor.userId    || 'unknown',
                username  : actor.username  || 'unknown',
                action    : 'WORKFLOW_MOVE',
                event     : 'STATUS_CHANGE',
                operation : 'workflowService.moveItem',
                entityType: type,
                entityId  : id,
                field     : 'status',
                oldValue  : row.status,
                newValue  : toStatus,
                metadata  : {
                    type,
                    request_id : requestId,
                    version_in : row.version,
                    user_agent : actor.userAgent  || null,
                    ip_address : actor.ipAddress  || null,
                },
                ipAddress : actor.ipAddress || null,
            });

            return {
                updated    : true,
                fromStatus : row.status,
                toStatus,
                fromVersion: row.version,
                immutableIds: { testId: id, certificateId: null },
            };
        });

        // ── 4. Persist idempotency key (24-h TTL) ─────────────────────────────
        if (requestId) {
            saveIdempotencyKey({
                key       : _moveIdemKey(type, id, toStatus, requestId),
                userId    : actor.userId || 'unknown',
                method    : 'POST',
                path      : '/api/workflow/move',
                entityType: type,
                entityId  : id,
                statusCode: 200,
                response  : moved,
            });
        }

        socket.emit('workflow', 'item:updated', { id, type, status: toStatus });
        socket.emit(
            type === 'gold' || type === 'silver' ? `${type}_test` : type,
            'item:updated',
            { id, type, status: toStatus }
        );

        return moved;
    }

    // ── FINALIZE (IN_PROGRESS → DONE) ─────────────────────────────────────────
    //
    // All five types share the same entry:
    //   gold / silver      → testServiceV2.completeTest (creates cert if eligible)
    //   gold_cert / silver_cert / photo_cert → certServiceV2 or photoCertRepo
    //
    // Guarantees:
    //   • Idempotency    — duplicate X-Request-Id returns cached result
    //   • OCC            — stale version → 409 before any write
    //   • Atomicity      — status + completion_request_id + audit in ONE transaction
    //   • Retry          — SQLITE_BUSY retried up to 3× with exponential back-off
    //   • Correlation    — requestId threaded through audit log and DB row
    // ─────────────────────────────────────────────────────────────────────────

    async finalizeItem(type, id, actor = {}, expectedVersion = null, paymentOpts = {}) {
        const table = TABLE_MAP[type];
        if (!table) {
            throw new BusinessError(`Invalid workflow type: ${type}`, ERR.INVALID_TYPE, 400);
        }

        // ── 1. Idempotency gate ───────────────────────────────────────────────
        const requestId = getRequestId() || null;
        if (isStrict() && requestId) {
            const cached = getIdempotencyKey(_finalizeIdemKey(type, id, requestId));
            if (cached?.response) return { ...cached.response, _idempotent: true };
        } else if (requestId) {
            parityLog('workflow.finalize.idempotency', { type, id });
        }

        // ── 2. Pre-flight status + completion_request_id check ────────────────
        const preflight = this._getFullRow(type, id);
        if (!preflight) {
            throw new BusinessError(`Workflow item not found: ${id}`, ERR.NOT_FOUND, 404);
        }

        // Already DONE by the SAME request — idempotency fallback when the
        // idempotency_keys row expired but the DB row still carries the stamp.
        if (preflight.status === 'DONE' &&
            requestId && preflight.completion_request_id === requestId) {
            return {
                updated    : true,
                toStatus   : 'DONE',
                _idempotent: true,
                immutableIds: { testId: null, certificateId: id },
            };
        }

        if (preflight.status !== 'IN_PROGRESS') {
            throw new BusinessError(
                `Only IN_PROGRESS items can be finalized (current: ${preflight.status})`,
                ERR.STATUS_INVALID, 409
            );
        }
        // Row already claimed by a different request
        if (preflight.completion_request_id &&
            preflight.completion_request_id !== requestId) {
            throw new BusinessError(
                `Item was already finalized by request ${preflight.completion_request_id.slice(0, 8)}…`,
                ERR.IMMUTABLE, 409
            );
        }

        // ── 3a. Test finalization (gold / silver) ─────────────────────────────
        if (type === 'gold' || type === 'silver') {
            return this._finalizeTest(type, id, table, actor, requestId, expectedVersion);
        }

        // ── 3b. Certificate finalization (gold_cert / silver_cert / photo_cert)
        return this._finalizeCert(type, id, table, actor, requestId, expectedVersion, paymentOpts);
    }

    // ── INTERNAL: test finalize ───────────────────────────────────────────────

    _finalizeTest(type, id, table, actor, requestId, expectedVersion) {
        const detail = testServiceV2.getTest(type, id);
        if (!detail) {
            throw new BusinessError(`${type} test not found`, ERR.TEST_NOT_FOUND, 404);
        }

        const items = (detail.items || []).map(item => ({
            id         : item.id,
            purity     : Number(item.purity) || 0,
            returned   : !!item.returned,
            item_number: item.item_number || item.item_no,
        }));

        const totalWtLoss = (detail.items || []).reduce((acc, item) =>
            acc + Math.max(0,
                Number(item.gross_weight || 0) -
                Number(item.test_weight  || 0) -
                Number(item.net_weight   || 0)
            ), 0);

        const completeData = {
            items,
            mode_of_payment: detail.mode_of_payment,
            weight_loss    : Math.max(0, totalWtLoss),
            cert           : { gst: !!detail.gst },
            post_ledger    : true,
        };

        // ── BEGIN IMMEDIATE: OCC + idempotency stamp + completeTest (SAVEPOINT)
        //    + audit — all in one transaction.
        //
        //    BEGIN IMMEDIATE acquires the reserved lock before any reads, so
        //    no mid-transaction lock escalation can produce SQLITE_BUSY after
        //    the stamp or completeTest's SAVEPOINT has already run.
        //    runWithRetry is embedded inside withTransaction.
        const testResult = withTransaction(() => {
            // Serialised read — re-confirm status and version inside the lock
            const snap = db.prepare(
                `SELECT version, status, completion_request_id
                 FROM ${table} WHERE id = ? AND deletedon IS NULL`
            ).get(id);

            if (!snap) {
                throw new BusinessError(`${type} test not found: ${id}`, ERR.TEST_NOT_FOUND, 404);
            }
            if (snap.status !== 'IN_PROGRESS') {
                throw new BusinessError(
                    `Status conflict: test is ${snap.status}, expected IN_PROGRESS`,
                    ERR.STATUS_INVALID, 409
                );
            }

            // Optimistic locking: reject stale-version writes before any mutation
            if (expectedVersion !== null &&
                Number(snap.version) !== Number(expectedVersion)) {
                throw new BusinessError(
                    `Version conflict on finalize: expected v${expectedVersion}, got v${snap.version}. Reload and retry.`,
                    'OPTIMISTIC_LOCK_CONFLICT', 409,
                    { expectedVersion: Number(expectedVersion), actualVersion: Number(snap.version) }
                );
            }

            // Concurrent-request guard: a different request already claimed this row
            if (snap.completion_request_id &&
                snap.completion_request_id !== requestId) {
                throw new BusinessError(
                    `Item already claimed by request ${snap.completion_request_id.slice(0, 8)}…`,
                    ERR.IMMUTABLE, 409
                );
            }

            // Stamp completion_request_id BEFORE completeTest.
            // completeTest may DELETE the test row (isFullConvert path); stamping
            // first ensures that if the DELETE rolls back the stamp also rolls back —
            // both participate in the same SAVEPOINT as completeTest's own transaction.
            if (requestId) {
                db.prepare(
                    `UPDATE ${table} SET completion_request_id = ?
                     WHERE id = ? AND deletedon IS NULL`
                ).run(requestId, id);
            }

            // completeTest's internal db.transaction() becomes a SAVEPOINT here.
            // It writes: status = DONE, snapshot_hash, print_snapshot, ledger entry,
            // optional cert row — all atomic with our outer BEGIN IMMEDIATE.
            const result = testServiceV2.completeTest(type, id, completeData);

            // Audit written in the same commit — never orphaned from the state change.
            // requestId passed explicitly so the column is populated even when
            // AsyncLocalStorage is unavailable (tests, batch jobs, CLI scripts).
            writeAuditLog({
                requestId : requestId || undefined,
                userId    : actor.userId    || 'unknown',
                username  : actor.username  || 'unknown',
                action    : 'WORKFLOW_FINALIZE',
                event     : 'COMMIT',
                operation : 'workflowService.finalizeItem',
                entityType: `${type}_test`,
                entityId  : id,
                field     : 'status',
                oldValue  : 'IN_PROGRESS',
                newValue  : 'DONE',
                metadata  : {
                    type,
                    request_id    : requestId,
                    version_in    : snap.version,
                    certificate_id: result.certificate?.id || null,
                    user_agent    : actor.userAgent  || null,
                    ip_address    : actor.ipAddress  || null,
                },
                ipAddress : actor.ipAddress || null,
            });

            return result;
        });

        const finalResult = {
            updated    : true,
            toStatus   : 'DONE',
            immutableIds: {
                testId       : testResult.test?.id || id,
                certificateId: testResult.certificate?.id || null,
            },
            result: testResult,
        };

        if (requestId) {
            saveIdempotencyKey({
                key       : _finalizeIdemKey(type, id, requestId),
                userId    : actor.userId || 'unknown',
                method    : 'POST',
                path      : '/api/workflow/finalize',
                entityType: `${type}_test`,
                entityId  : id,
                statusCode: 200,
                response  : finalResult,
            });
        }

        socket.emit('workflow',     'item:done',    { id, type });
        socket.emit(`${type}_test`, 'item:done',    { id, type });
        if (testResult.certificate) {
            socket.emit(`${type}_cert`, 'cert:created', { id: testResult.certificate.id, type });
            socket.emit('workflow',     'cert:created', { id: testResult.certificate.id, type });
        }

        return finalResult;
    }

    // ── INTERNAL: certificate finalize ────────────────────────────────────────

    _finalizeCert(type, id, certTable, actor, requestId, expectedVersion, paymentOpts = {}) {
        const certType = type.replace('_cert', '');

        // ── BEGIN IMMEDIATE: OCC + updateStatus (SAVEPOINT, writes hash) +
        //    idempotency stamp + audit — all in one transaction.
        //
        // Snapshot is computed INSIDE updateStatus (after the fee total is written),
        // not pre-computed here. Pre-computing would capture the pre-fee total and
        // produce a print_snapshot whose totals.total diverges from the DB total column.
        const certResult = withTransaction(() => {
            // Serialised read — re-confirm state under the reserved lock
            const snap = db.prepare(
                `SELECT version, status, completion_request_id
                 FROM ${certTable} WHERE id = ? AND deletedon IS NULL`
            ).get(id);

            if (!snap) {
                throw new BusinessError(`${type} not found: ${id}`, ERR.CERT_NOT_FOUND, 404);
            }
            if (snap.status !== 'IN_PROGRESS') {
                throw new BusinessError(
                    `Status conflict: cert is ${snap.status}, expected IN_PROGRESS`,
                    ERR.STATUS_INVALID, 409
                );
            }

            // Optimistic locking: stale-version write rejected before any mutation
            if (expectedVersion !== null &&
                Number(snap.version) !== Number(expectedVersion)) {
                throw new BusinessError(
                    `Version conflict on finalize: expected v${expectedVersion}, got v${snap.version}. Reload and retry.`,
                    'OPTIMISTIC_LOCK_CONFLICT', 409,
                    { expectedVersion: Number(expectedVersion), actualVersion: Number(snap.version) }
                );
            }

            // Concurrent-request guard
            if (snap.completion_request_id &&
                snap.completion_request_id !== requestId) {
                throw new BusinessError(
                    `Item already claimed by request ${snap.completion_request_id.slice(0, 8)}…`,
                    ERR.IMMUTABLE, 409
                );
            }

            // Stamp completion_request_id BEFORE status → DONE.
            // The immutability trigger (WHEN OLD.status = 'DONE') blocks all updates
            // on a DONE record, so this must run while the cert is still IN_PROGRESS.
            if (requestId) {
                db.prepare(
                    `UPDATE ${certTable}
                     SET completion_request_id = ?
                     WHERE id = ? AND deletedon IS NULL`
                ).run(requestId, id);
            }

            // Persist mode_of_payment / gst from the frontend BEFORE the DONE transition.
            // updateStatus (DONE) reads these columns for the ledger entry and snapshot,
            // so they must be written while the cert is still IN_PROGRESS.
            const { mode_of_payment, gst } = paymentOpts;
            if (mode_of_payment !== undefined || gst !== undefined) {
                const patches = [];
                const vals    = [];
                if (mode_of_payment !== undefined) { patches.push('mode_of_payment = ?'); vals.push(mode_of_payment); }
                if (gst !== undefined)              { patches.push('gst = ?');             vals.push(gst ? 1 : 0); }
                if (patches.length) {
                    db.prepare(
                        `UPDATE ${certTable} SET ${patches.join(', ')}, lastmodified = ?
                         WHERE id = ? AND deletedon IS NULL`
                    ).run(...vals, new Date().toISOString(), id);
                }
            }

            // Compute weight_loss as a transparent operational side-effect.
            // Same formula as _finalizeTest: sum of max(0, gross - test - net)
            // across non-deleted items. Used downstream to auto-link a WLH
            // row when > 0; if 0, no WLH is inserted.
            const itemTableMap = {
                gold_cert  : { table: 'gold_certificate_item',   fk: 'gold_certificate_id' },
                silver_cert: { table: 'silver_certificate_item', fk: 'silver_certificate_id' },
                photo_cert : { table: 'photo_certificate_item',  fk: 'photo_certificate_id' },
            };
            const itemMeta = itemTableMap[type];
            const certItems = db.prepare(
                `SELECT gross_weight, test_weight, net_weight
                 FROM ${itemMeta.table}
                 WHERE ${itemMeta.fk} = ? AND deletedon IS NULL`
            ).all(id);
            const totalWtLoss = certItems.reduce((acc, item) =>
                acc + Math.max(0,
                    Number(item.gross_weight || 0) -
                    Number(item.test_weight  || 0) -
                    Number(item.net_weight   || 0)
                ), 0);

            // updateStatus becomes a SAVEPOINT inside our BEGIN IMMEDIATE.
            // Snapshot is computed inside updateStatus after the fee write, so it
            // captures the canonical fee total, not the pre-finalization item sum.
            const result = certType === 'photo'
                ? photoCertRepo.updateStatus(id, 'DONE', actor, { weight_loss: totalWtLoss })
                : certServiceV2.updateStatus(certType, id, 'DONE', { weight_loss: totalWtLoss });

            // Audit written in the same commit — never orphaned.
            // requestId passed explicitly so the column is populated even when
            // AsyncLocalStorage is unavailable (tests, batch jobs, CLI scripts).
            writeAuditLog({
                requestId : requestId || undefined,
                userId    : actor.userId    || 'unknown',
                username  : actor.username  || 'unknown',
                action    : 'WORKFLOW_FINALIZE',
                event     : 'COMMIT',
                operation : 'workflowService.finalizeItem',
                entityType: type,
                entityId  : id,
                field     : 'status',
                oldValue  : 'IN_PROGRESS',
                newValue  : 'DONE',
                metadata  : {
                    type,
                    request_id : requestId,
                    version_in : snap.version,
                    user_agent : actor.userAgent  || null,
                    ip_address : actor.ipAddress  || null,
                },
                ipAddress : actor.ipAddress || null,
            });

            return result;
        });

        const finalResult = {
            updated    : true,
            toStatus   : 'DONE',
            immutableIds: { testId: null, certificateId: id },
            result     : certResult,
        };

        if (requestId) {
            saveIdempotencyKey({
                key       : _finalizeIdemKey(type, id, requestId),
                userId    : actor.userId || 'unknown',
                method    : 'POST',
                path      : '/api/workflow/finalize',
                entityType: type,
                entityId  : id,
                statusCode: 200,
                response  : finalResult,
            });
        }

        socket.emit('workflow', 'item:done', { id, type });
        socket.emit(type,       'item:done', { id, type });

        return finalResult;
    }

    // ── INTERNAL: row read ────────────────────────────────────────────────────

    _getFullRow(type, id) {
        const table = TABLE_MAP[type];
        if (!table) return null;
        return db.prepare(
            `SELECT id, status, mode_of_payment, total, version, completion_request_id
             FROM ${table} WHERE id = ? AND deletedon IS NULL`
        ).get(id);
    }

    // backward-compat alias used by older callers
    _getCurrentRow(type, id) {
        return this._getFullRow(type, id);
    }

    // ── STATUS UPDATE (PATCH route — non-DONE only) ───────────────────────────

    async updateStatus(type, id, status) {
        if (status === 'DONE') {
            throw new BusinessError(
                'Finalization requires explicit completion logic',
                ERR.STATUS_INVALID, 403
            );
        }

        const certType = type.replace('_cert', '');
        let result;

        if (type === 'gold' || type === 'silver') {
            result = testServiceV2.updateStatus(type, id, status);
        } else if (type === 'gold_cert' || type === 'silver_cert') {
            result = certServiceV2.updateStatus(certType, id, status);
        } else if (type === 'photo_cert') {
            result = photoCertRepo.updateStatus(id, status);
        } else {
            throw new BusinessError(`Invalid item type: ${type}`, ERR.INVALID_TYPE, 400);
        }

        return { updated: true, result };
    }
}

module.exports = new WorkflowService();
