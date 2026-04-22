const BaseRepository = require('./baseRepository');
const { db, now, genId, getNextSequence, transaction } = require('../db/db');
const SequenceService = require('../services/sequenceService');
const CertificateCalculationService = require('../services/certificateCalculationService');
const { writeAuditLog } = require('../services/auditLogService');
const ledgerSvc = require('../services/v2/ledgerService');

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
            const parentAutoNumber = SequenceService.generateGlobalSequence();

            // 1. Insert Parent
            this.db.prepare(`
                INSERT INTO photo_certificate (
                    id, auto_number, customer_id, status, mode_of_payment, total, 
                    gst, gst_bill_number, total_tax, created, lastmodified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                certId, parentAutoNumber, customer_id, status, mode_of_payment, total,
                gst ? 1 : 0, gst_bill_number, total_tax, timestamp, timestamp
            );

            // 2. Insert Items
            const insertedItems = [];
            let itemSeq = 1;
            for (const item of items) {
                const itemId = genId('PCI');
                const itemNumber = `${parentAutoNumber}-${itemSeq++}`;
                const certNum = item.certificate_number || item.item_no || `${itemSeq - 1}`;

                this.db.prepare(`
                    INSERT INTO photo_certificate_item (
                        id, item_number, photo_certificate_id, certificate_number,
                        name, item_type, gross_weight, test_weight, net_weight, 
                        purity, fine_weight, item_total, returned, media_path, created
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    itemId,
                    itemNumber,
                    certId,
                    certNum,
                    item.name,
                    item.item_type || item.item_name || 'Item',
                    item.gross_weight || item.weight || null,
                    item.test_weight || 0,
                    item.net_weight || item.gross_weight || item.weight || 0,
                    item.purity || null,
                    item.fine_weight || 0,
                    item.item_total || 0,
                    item.returned ? 1 : 0,
                    item.media_path || null,
                    timestamp
                );

                insertedItems.push({
                    id: itemId,
                    item_number: itemNumber,
                    ...item,
                    created: timestamp
                });
            }

            // 3. Initial Roll-up Calculation
            CertificateCalculationService.updateCertificateTotals(certId, this.db);

            return { id: certId, auto_number: parentAutoNumber, items: insertedItems, created: timestamp };
        })();
    }

    findAll(filters = {}) {
        let query = `
            SELECT 
                pc.*, 
                pc.created as created_at,
                c.name as customer_name,
                (SELECT COUNT(*) FROM photo_certificate_item WHERE photo_certificate_id = pc.id AND deletedon IS NULL) as item_count
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
                OR pc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM photo_certificate_item pci WHERE pci.photo_certificate_id = pc.id AND pci.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
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
                OR pc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM photo_certificate_item pci WHERE pci.photo_certificate_id = pc.id AND pci.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
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

            const statusHierarchy = { 'TODO': 1, 'IN_PROGRESS': 2, 'DONE': 3 };

            if (!current) throw new Error(`Photo certificate not found: ${id}`);
            if (statusHierarchy[current.status] > statusHierarchy[status]) {
                throw new Error(`Backward move NOT permitted: Cannot move from ${current.status} to ${status}`);
            }
            if (current.status === 'DONE') {
                throw new Error('409: Cannot update status of a DONE certificate');
            }

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
                    const alreadyCharged = this.db.prepare(
                        `SELECT COUNT(*) AS cnt FROM credit_history WHERE reference_type = 'photo_certificate' AND reference_id = ? AND type = 'DEBIT'`
                    ).get(id).cnt > 0;

                    if (!alreadyCharged) {
                        // Step 3: Stamp canonical fee BEFORE DONE (cert still IN_PROGRESS — no trigger conflict)
                        this.db.prepare(
                            `UPDATE photo_certificate SET total = ?, lastmodified = ? WHERE id = ?`
                        ).run(feeTotal, timestamp, id);

                        // Step 4: Ledger (cert still IN_PROGRESS)
                        ledgerSvc.recordRevenue('photo', {
                            customer_id    : current.customer_id,
                            amount         : feeTotal,
                            entry_type     : 'DEBIT',
                            description    : `Photo Certificate ${current.auto_number} — lab charges`,
                            mode_of_payment: current.mode_of_payment || 'Cash',
                            post_cash_register: false,
                            reference_type : 'photo_certificate',
                            reference_id   : id,
                        });
                    }
                }

                // Step 5: Compute snapshot (cert still IN_PROGRESS, total already updated)
                const printSvc = require('../services/v2/printService');
                const { getRequestId } = require('../utils/audit');
                const snapshotResult = opts.precomputedSnapshot
                    || printSvc.serializeSnapshot('certificate', 'photo', id, actor.userId || getRequestId() || null);
                const { snapshotJson, snapshotHash, snapshotKeyVersion } = snapshotResult;

                // Step 6: Single atomic DONE write — after this, trigger blocks all further UPDATEs
                const result = this.db.prepare(`
                    UPDATE photo_certificate
                    SET status = 'DONE', done_at = COALESCE(done_at, ?),
                        print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ?, lastmodified = ?
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

            return result;
        })();
    }
}

module.exports = new PhotoCertificateRepository();
