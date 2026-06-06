const BaseRepository = require('./baseRepository');
const { db, now, genId, getNextSequence, transaction } = require('../db/db');
const seqSvc = require('../services/v2/sequenceService');
const CertificateCalculationService = require('../services/certificateCalculationService');
const { writeAuditLog } = require('../services/auditLogService');
const ledgerSvc = require('../services/v2/ledgerService');
const wlhRepo = require('./weightLossHistoryRepository');
const { assertTransitionAllowed } = require('../services/workflowStateMachine');

const PHOTO_CERT_FEE_RATE = 50;   // canonical fee: same as gold/silver cert

class PhotoCertificateRepository {
    constructor() {
        this.db = db;
    }

    async create(customer_id, items, data, status = 'TODO') {
        const { mode_of_payment = 'Cash', gst = 0, gst_bill_number = '', total_tax = 0, total = 0 } = data;

        return transaction(() => {
            const nowObj = new Date();
            const timestamp = nowObj.toISOString();
            const certId = genId('PCR');
            // GAP 9 fix: use bare-DB composable helper so the sequence increment
            // participates in the outer transaction (SAVEPOINT-safe and explicit).
            const billNo = seqSvc._generateGlobalSequenceWork('photo', { context: 'CERT', isGst: Boolean(gst) });
            const parentAutoNumber = seqSvc.generateTechnicalAutoNumber('PC');

            // 1. Insert Parent
            this.db.prepare(`
                INSERT INTO photo_certificate (
                    id, auto_number, bill_no, customer_id, status, mode_of_payment, total, 
                    gst, gst_bill_number, total_tax, created, lastmodified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                certId, parentAutoNumber, billNo, customer_id, status, mode_of_payment, total,
                gst ? 1 : 0, gst_bill_number, total_tax, timestamp, timestamp
            );

            // 2. Insert Items
            const insertedItems = [];
            let itemSeq = 1;
            for (const item of items) {
                const itemId = genId('PCI');
                const itemNumber = `${billNo}-${itemSeq++}`;
                const itemAutoNumber = seqSvc.generateTechnicalAutoNumber('PCI');
                // Operator-supplied value wins (allows manual override / migration).
                // Otherwise fall through to the global A001-Z999 generator that
                // already serves GCI/SCI — same SEQ_KEY family (PHOTO_CERT_ITEM_SEQ).
                const certNum = item.certificate_number || seqSvc.getNextCertificateItemNumber('photo');

                this.db.prepare(`
                    INSERT INTO photo_certificate_item (
                        id, auto_number, parent_auto_number, item_number, photo_certificate_id, certificate_number,
                        name, item_type, gross_weight, test_weight, net_weight,
                        purity, fine_weight, item_total, returned, show_kt, media_path, created
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    itemId,
                    itemAutoNumber,
                    parentAutoNumber,
                    itemNumber,
                    certId,
                    certNum,
                    item.name,
                    item.item_type || item.item_name || 'Item',
                    item.gross_weight || item.weight || null,
                    item.test_weight || 0,
                    // Net = Gross − Test (matches gold/silver cert convention and
                    // the backend recompute on results submit). Storing the full
                    // gross here made Phase-2 read items as "overweight".
                    item.net_weight != null
                        ? item.net_weight
                        : Math.max(0, Number(item.gross_weight || item.weight || 0) - Number(item.test_weight || 0)),
                    item.purity || null,
                    item.fine_weight || 0,
                    item.item_total || 0,
                    item.returned ? 1 : 0,
                    item.show_kt ? 1 : 0,
                    item.media_path || null,
                    timestamp
                );

                insertedItems.push({
                    id: itemId,
                    auto_number: itemAutoNumber,
                    parent_auto_number: parentAutoNumber,
                    item_number: itemNumber,
                    ...item,
                    created: timestamp
                });
            }

            // 3. Initial Roll-up Calculation
            CertificateCalculationService.updateCertificateTotals(certId, this.db);

            const printSvc = require('../services/v2/printService');
            const { getRequestId } = require('../utils/audit');
            const { snapshotJson, snapshotHash, snapshotKeyVersion } = printSvc.serializeSnapshot('certificate', 'photo', certId, getRequestId() || null);
            this.db.prepare(`UPDATE photo_certificate SET print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ? WHERE id = ? AND deletedon IS NULL`).run(snapshotJson, snapshotHash, snapshotKeyVersion, certId);

            writeAuditLog({ action: 'CREATE_CERTIFICATE', entityType: 'photo_cert', entityId: certId, newValue: parentAutoNumber });
            return { id: certId, auto_number: parentAutoNumber, bill_no: billNo, items: insertedItems, created: timestamp };
        })();
    }

    findAll(filters = {}) {
        let query = `
            SELECT
                pc.*,
                pc.created as created_at,
                c.name as customer_name,
                (SELECT COUNT(*) FROM photo_certificate_item WHERE photo_certificate_id = pc.id AND deletedon IS NULL) as item_count,
                (SELECT gross_weight FROM photo_certificate_item
                 WHERE photo_certificate_id = pc.id AND deletedon IS NULL
                 ORDER BY item_number LIMIT 1) AS first_gross_weight,
                (SELECT test_weight  FROM photo_certificate_item
                 WHERE photo_certificate_id = pc.id AND deletedon IS NULL
                 ORDER BY item_number LIMIT 1) AS first_test_weight,
                (SELECT purity       FROM photo_certificate_item
                 WHERE photo_certificate_id = pc.id AND deletedon IS NULL
                 ORDER BY item_number LIMIT 1) AS first_purity
            FROM photo_certificate pc
            JOIN customer c ON pc.customer_id = c.id
            WHERE pc.deletedon IS NULL
        `;
        const params = [];
        if (filters.status) { query += " AND pc.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND pc.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR pc.bill_no LIKE ?
                OR pc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM photo_certificate_item pci WHERE pci.photo_certificate_id = pc.id AND (pci.item_number LIKE ? OR pci.auto_number LIKE ? OR pci.parent_auto_number LIKE ? OR pci.name LIKE ? OR pci.item_type LIKE ?))
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s, s, s, s, s, s);
        }
        query += " ORDER BY pc.created DESC";
        if (filters.limit) { query += " LIMIT ? OFFSET ?"; params.push(filters.limit, filters.offset || 0); }

        return this.db.prepare(query).all(...params);
    }

    count(filters = {}) {
        let query = "SELECT COUNT(*) as total FROM photo_certificate pc JOIN customer c ON pc.customer_id = c.id WHERE pc.deletedon IS NULL";
        const params = [];
        if (filters.status) { query += " AND pc.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND pc.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR pc.bill_no LIKE ?
                OR pc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM photo_certificate_item pci WHERE pci.photo_certificate_id = pc.id AND (pci.item_number LIKE ? OR pci.auto_number LIKE ? OR pci.parent_auto_number LIKE ? OR pci.name LIKE ? OR pci.item_type LIKE ?))
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s, s, s, s, s, s);
        }
        return this.db.prepare(query).get(...params).total;
    }

    findById(id) {
        const cert = this.db.prepare(`
            SELECT pc.*, pc.created as created_at, c.name as customer_name, c.phone as customer_phone
            FROM photo_certificate pc
            JOIN customer c ON pc.customer_id = c.id
            WHERE pc.id = ? AND pc.deletedon IS NULL
        `).get(id);

        if (!cert) return null;

        const items = this.db.prepare(`
            SELECT *, media_path as media FROM photo_certificate_item WHERE photo_certificate_id = ? AND deletedon IS NULL
        `).all(id);

        return { ...cert, items };
    }

    updateStatus(id, status, actor = {}, opts = {}) {
        return transaction(() => {
            const current = this.db.prepare(
                `SELECT id, status, customer_id, total, mode_of_payment, auto_number
                 FROM photo_certificate WHERE id = ? AND deletedon IS NULL`
            ).get(id);

            if (!current) throw new Error(`Photo certificate not found: ${id}`);
            assertTransitionAllowed('photo_cert', current.status, status);

            const timestamp = now();

            if (status === 'DONE') {
                // Step 1: Validate — every item must have a photo
                const itemsWithoutPhoto = this.db.prepare(`
                    SELECT COUNT(*) as count FROM photo_certificate_item
                    WHERE photo_certificate_id = ? AND (media_path IS NULL OR media_path = '') AND deletedon IS NULL
                `).get(id).count;
                if (itemsWithoutPhoto > 0) {
                    throw new Error(`Cannot finalize: ${itemsWithoutPhoto} items are missing photos.`);
                }

                // Step 2: Compute fee
                const itemCount = this.db.prepare(
                    `SELECT COUNT(*) AS cnt FROM photo_certificate_item WHERE photo_certificate_id = ? AND deletedon IS NULL`
                ).get(id).cnt;

                const feeTotal = PHOTO_CERT_FEE_RATE * itemCount;
                if (feeTotal > 0) {
                    // Step 3: Stamp canonical fee BEFORE DONE (cert still IN_PROGRESS — no trigger conflict)
                    this.db.prepare(
                        `UPDATE photo_certificate SET total = ?, lastmodified = ? WHERE id = ?`
                    ).run(feeTotal, timestamp, id);

                    // Step 4: Atomic + idempotent ledger charge. The cert's
                    // ledger_charged_at gate makes a second call a no-op —
                    // no need for a pre-flight COUNT(*) on credit_history.
                    ledgerSvc.chargeCertificate('photo', {
                        cert_id          : id,
                        customer_id      : current.customer_id,
                        amount           : feeTotal,
                        entry_type       : 'DEBIT',
                        description      : `Photo Certificate ${current.auto_number} — lab charges`,
                        mode_of_payment  : current.mode_of_payment || 'Cash',
                        post_cash_register: false,
                    });
                }

                // Step 4b: Auto-link Weight Loss History (only when weight_loss > 0).
                // Same transaction as the finalize — rollback removes the WLH row.
                const weightLoss = Number(opts.weight_loss);
                if (Number.isFinite(weightLoss) && weightLoss > 0) {
                    wlhRepo.insertWithinTransaction(this.db, {
                        customer_id    : current.customer_id,
                        amount         : weightLoss,
                        reason         : `Photo Certificate Finalization: ${id}`,
                        mode_of_payment: current.mode_of_payment || null,
                    });
                }

                // Step 5: Compute snapshot — must run after Step 3 so it captures the fee total
                const printSvc = require('../services/v2/printService');
                const { getRequestId } = require('../utils/audit');
                const snapshotResult = printSvc.serializeSnapshot('certificate', 'photo', id, actor.userId || getRequestId() || null);
                const { snapshotJson, snapshotHash, snapshotKeyVersion } = snapshotResult;

                // Step 6: Single atomic DONE write — after this, trigger blocks all further UPDATEs
                const result = this.db.prepare(`
                    UPDATE photo_certificate
                    SET status = 'DONE', done_at = COALESCE(done_at, ?),
                        print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ?,
                        version = version + 1, lastmodified = ?
                    WHERE id = ? AND deletedon IS NULL
                `).run(timestamp, snapshotJson, snapshotHash, snapshotKeyVersion, timestamp, id);

                writeAuditLog({
                    userId    : actor.userId   || 'system',
                    username  : actor.username || 'system',
                    action    : 'STATUS_CHANGE',
                    event     : 'COMMIT',
                    operation : 'photoCertificateRepository.updateStatus',
                    entityType: 'photo_cert',
                    entityId  : id,
                    field     : 'status',
                    oldValue  : current.status,
                    newValue  : status,
                    metadata  : { certId: id, auto_number: current.auto_number },
                });

                return result;
            }

            // Non-DONE transitions (e.g. TODO → IN_PROGRESS)
            let query = 'UPDATE photo_certificate SET status = ?, lastmodified = ?';
            const params = [status, timestamp];

            if (status === 'IN_PROGRESS') {
                query += ', in_progress_at = COALESCE(in_progress_at, ?)';
                params.push(timestamp);
            }

            query += ' WHERE id = ? AND deletedon IS NULL';
            params.push(id);
            const result = this.db.prepare(query).run(...params);

            writeAuditLog({
                userId    : actor.userId   || 'system',
                username  : actor.username || 'system',
                action    : 'STATUS_CHANGE',
                event     : 'COMMIT',
                operation : 'photoCertificateRepository.updateStatus',
                entityType: 'photo_cert',
                entityId  : id,
                field     : 'status',
                oldValue  : current.status,
                newValue  : status,
                metadata  : { certId: id, auto_number: current.auto_number },
            });

            return result;
        })();
    }

    softDelete(id) {
        return transaction(() => {
            const current = this.db.prepare(`SELECT status FROM photo_certificate WHERE id = ?`).get(id);
            if (current && current.status === 'DONE') {
                throw new Error('409: Cannot delete a DONE certificate');
            }
            const timestamp = now();
            this.db.prepare("UPDATE photo_certificate SET deletedon = ?, lastmodified = ? WHERE id = ?").run(timestamp, timestamp, id);
            this.db.prepare("UPDATE photo_certificate_item SET deletedon = ? WHERE photo_certificate_id = ?").run(timestamp, id);
        })();
    }

    updateItem(certId, itemId, updates) {
        return transaction(() => {
            // Check Immutability
            const parent = this.db.prepare(`SELECT status FROM photo_certificate WHERE id = ?`).get(certId);
            if (parent && (parent.status === 'DONE' || parent.status === 'IN_PROGRESS')) {
                throw new Error(`409: Cannot edit items of a ${parent.status} certificate`);
            }

            // Rule: Photo uploads are permitted only for Photo Certificates and are rejected for tests/others.
            // (Handled by the fact this is a PCR repository)

            if (Object.keys(updates).length === 0) return { changes: 0 };

            const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
            const values = [...Object.values(updates), itemId, certId];

            const result = this.db.prepare(`UPDATE photo_certificate_item SET ${fields} WHERE id = ? AND photo_certificate_id = ? AND deletedon IS NULL`).run(...values);

            // Roll-up recalculation
            CertificateCalculationService.updateCertificateTotals(certId, this.db);

            const printSvc = require('../services/v2/printService');
            const { getRequestId } = require('../utils/audit');
            const { snapshotJson, snapshotHash, snapshotKeyVersion } = printSvc.serializeSnapshot('certificate', 'photo', certId, getRequestId() || null);
            this.db.prepare(`UPDATE photo_certificate SET print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ? WHERE id = ? AND deletedon IS NULL`).run(snapshotJson, snapshotHash, snapshotKeyVersion, certId);

            return result;
        })();
    }

    updatePayment(certId, mode_of_payment, total, gst) {
        return transaction(() => {
            const parent = this.db.prepare(`SELECT status FROM photo_certificate WHERE id = ?`).get(certId);
            if (parent && (parent.status === 'DONE' || parent.status === 'IN_PROGRESS')) {
                throw new Error(`409: Cannot update payment of a ${parent.status} certificate`);
            }

            const timestamp = now();
            const result = this.db.prepare(`
                UPDATE photo_certificate SET mode_of_payment = ?, total = ?, gst = ?, lastmodified = ? 
                WHERE id = ? AND deletedon IS NULL
            `).run(mode_of_payment, total, gst ? 1 : 0, timestamp, certId);

            // Note: Recalculation logic in CertificateCalculationService actually SUMS item_total.
            // If the user manually overrides 'total' here, it might get overwritten by the roll-up if triggered later.
            // However, PCR might have different fee structures. We assume roll-up follows item sums.

            const printSvc = require('../services/v2/printService');
            const { getRequestId } = require('../utils/audit');
            const { snapshotJson, snapshotHash, snapshotKeyVersion } = printSvc.serializeSnapshot('certificate', 'photo', certId, getRequestId() || null);
            this.db.prepare(`UPDATE photo_certificate SET print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ? WHERE id = ? AND deletedon IS NULL`).run(snapshotJson, snapshotHash, snapshotKeyVersion, certId);

            return result;
        })();
    }
}

module.exports = new PhotoCertificateRepository();
