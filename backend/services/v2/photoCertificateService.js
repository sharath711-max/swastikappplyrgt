'use strict';

const { transaction } = require('../../db/db');
const photoCertRepo = require('../../repositories/photoCertificateRepository');
const { writeAuditLog } = require('../../services/auditLogService');

function create(customer_id, items, data, status) {
    return photoCertRepo.create(customer_id, items, data, status);
}

function findAll(filters) {
    return photoCertRepo.findAll(filters);
}

function findById(id) {
    return photoCertRepo.findById(id);
}

// All writes share ONE transaction boundary. Inner repo calls become SAVEPOINTs
// via better-sqlite3's automatic nesting, so a failure on any step rolls back all.
function saveResults(certId, data) {
    const { items = [], mode_of_payment, total, gst } = data;

    transaction(() => {
        for (const item of items) {
            const updates = {};
            if (item.media  !== undefined) updates.media_path = item.media;
            if (item.purity !== undefined) updates.purity = parseFloat(item.purity);
            photoCertRepo.updateItem(certId, item.id, updates);
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
