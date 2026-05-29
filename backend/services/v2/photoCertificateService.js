'use strict';

const { transaction } = require('../../db/db');
const photoCertRepo = require('../../repositories/photoCertificateRepository');
const { writeAuditLog } = require('../../services/auditLogService');
const sharedValidationGate = require('./sharedValidationGate');

function create(customer_id, items, data, status) {
    // Shared domain validation — single source of truth for item rules.
    sharedValidationGate.gateCreate('PC', { customer_id, items });
    return photoCertRepo.create(customer_id, items, data, status);
}

function findAll(filters) {
    return photoCertRepo.findAll(filters);
}

function findById(id) {
    return photoCertRepo.findById(id);
}

// ── Type coercion for incoming item updates ──────────────────────────────────
// SQLite is permissive but we mirror the conventions used by
// certificateService.updateItem so PC items obey the same persistence
// semantics as GC/SC items. A field is forwarded only when explicitly
// present on the inbound payload (`!== undefined`); absent keys leave the
// stored value untouched.
const _flagToInt = (v) => (v === 1 || v === true || v === '1' || v === 'true') ? 1 : 0;

function _buildItemUpdates(item) {
    const u = {};
    // String / metadata fields
    if (item.media       !== undefined) u.media_path  = item.media;
    if (item.name        !== undefined) u.name        = item.name;
    if (item.item_type   !== undefined) u.item_type   = item.item_type;
    // Numeric fields — float coercion (purity range bounded by table CHECK)
    if (item.purity      !== undefined) u.purity       = parseFloat(item.purity);
    if (item.gross_weight!== undefined) u.gross_weight = parseFloat(item.gross_weight);
    if (item.test_weight !== undefined) u.test_weight  = parseFloat(item.test_weight);
    if (item.net_weight  !== undefined) u.net_weight   = parseFloat(item.net_weight);
    if (item.fine_weight !== undefined) u.fine_weight  = parseFloat(item.fine_weight);
    if (item.item_total  !== undefined) u.item_total   = parseFloat(item.item_total);
    // Boolean flags stored as INTEGER 0/1
    if (item.show_kt     !== undefined) u.show_kt  = _flagToInt(item.show_kt);
    if (item.returned    !== undefined) u.returned = _flagToInt(item.returned);
    return u;
}

// All writes share ONE transaction boundary. Inner repo calls become SAVEPOINTs
// via better-sqlite3's automatic nesting, so a failure on any step rolls back all.
function saveResults(certId, data) {
    const { items = [], mode_of_payment, total, gst } = data;

    transaction(() => {
        for (const item of items) {
            // GAP-C fix: forward all editable item fields, not just media+purity.
            // Previously, operator edits to show_kt / name / item_type / weights /
            // returned were silently dropped, creating UI ≠ persisted truth.
            const updates = _buildItemUpdates(item);
            if (Object.keys(updates).length > 0) {
                photoCertRepo.updateItem(certId, item.id, updates);
            }
        }

        if (mode_of_payment !== undefined || total !== undefined || gst !== undefined) {
            const cert = photoCertRepo.findById(certId);
            if (cert) {
                photoCertRepo.updatePayment(
                    certId,
                    mode_of_payment || cert.mode_of_payment,
                    total !== undefined ? total : cert.total,
                    gst   !== undefined ? gst   : cert.gst,
                );
            }
        }

        writeAuditLog({ action: 'SAVE_CERT_RESULTS', entityType: 'photo_cert', entityId: certId });
    })();
}

module.exports = { create, findAll, findById, saveResults };
