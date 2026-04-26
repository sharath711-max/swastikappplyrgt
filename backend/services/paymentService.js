'use strict';

const { v4: uuid } = require('uuid');
const { db, withTransaction } = require('../db/db');
const { generateHmac, verifyHmac, stableStringify } = require('./hmac');
const { SYSTEM_MODE } = require('../config/systemMode');
const { normalizePaymentMode } = require('../config/parityAdapter');
const logger = require('../utils/logger');
const assert = require('assert');

function n2(v) {
    if (v == null) return null;
    return Math.round(Number(v) * 100) / 100;
}

function buildReceiptSnapshot({
    customer,
    amount,
    paymentMode,
    prevBalance,
    newBalance,
    ledgerId
}) {
    return {
        receipt_id: uuid(),

        customer: {
            id: customer.id,
            name: customer.name // 🔒 freeze name (fix Python bug)
        },

        transaction: {
            amount,
            type: 'DEBIT',
            mode: normalizePaymentMode(paymentMode),
            timestamp: new Date().toISOString(),
            ledger_id: ledgerId
        },

        balance: {
            before: prevBalance,
            after: newBalance
        }
    };
}

async function applyPayment({ customerId, amount, paymentMode, requestId }) {
    return withTransaction((trx) => {

        const effectiveRequestId = requestId || `AUTO_${customerId}_${Date.now()}_${Math.random()}`;
        let reqId = effectiveRequestId;

        // 3️⃣ Missing request_id (Python behavior)
        if (SYSTEM_MODE === 'PARITY') {
            reqId = null; // simulate no idempotency
        }

        // 🔒 Idempotency (STRICT only)
        if (SYSTEM_MODE === 'STRICT' && reqId) {
            const exists = trx.prepare(`
                SELECT 1 FROM credit_history WHERE request_id = ?
            `).get(reqId);
            if (exists) {
                logger.warn(`[PaymentService] RECEIPT_DUPLICATE_BLOCKED for request_id: ${reqId}`);
                return { status: 'IDEMPOTENT_REPLAY' };
            }
        }

        const customer = trx.prepare(`
            SELECT id, name, balance FROM customer WHERE id = ?
        `).get(customerId);

        if (!customer) throw new Error('Customer not found');

        const prevBalance = n2(customer.balance);
        const amt = n2(amount);

        // 🔴 Python-style behavior (PARITY)
        // Python directly mutates balance
        const newBalance = n2(prevBalance - amt);

        // 1️⃣ Ledger entry FIRST (same logical order as Python intent)
        const ledgerIdRaw = uuid();
        const ledgerInfo = trx.prepare(`
            INSERT INTO credit_history (
                id,
                customer_id,
                amount,
                type,
                previous_balance,
                mode_of_payment,
                description,
                request_id,
                created
            ) VALUES (?, ?, ?, 'DEBIT', ?, ?, 'Customer balance payment', ?, CURRENT_TIMESTAMP)
            RETURNING id, amount
        `).get(
            ledgerIdRaw,
            customerId,
            amt,
            prevBalance,
            normalizePaymentMode(paymentMode),
            reqId
        );

        // 2️⃣ Balance update
        trx.prepare(`
            UPDATE customer SET balance = ? WHERE id = ?
        `).run(newBalance, customerId);

        // 3️⃣ Snapshot (IMMUTABLE)
        const snapshot = buildReceiptSnapshot({
            customer,
            amount: amt,
            paymentMode,
            prevBalance,
            newBalance,
            ledgerId: ledgerInfo.id
        });

        // 🔴 PARITY BRIDGING RULES
        if (SYSTEM_MODE === 'PARITY') {
            // Python doesn't have a before balance in receipt, or it uses current balance
            // but we leave snapshot shape valid here and use parity adapter to compare.
            // Duplicate behavior is already simulated by setting reqId = null.
        }

        const hash = generateHmac(snapshot);

        trx.prepare(`
            INSERT INTO receipts (id, customer_id, snapshot, snapshot_hash)
            VALUES (?, ?, ?, ?)
        `).run(snapshot.receipt_id, customerId, stableStringify(snapshot), hash);

        // 🔒 Invariants (STRICT only)
        if (SYSTEM_MODE === 'STRICT') {
            assert(effectiveRequestId != null, 'Missing request_id');
            assert(
                (snapshot.transaction.type === 'DEBIT' && amt > 0) ||
                (snapshot.transaction.type === 'CREDIT' && amt > 0),
                "Invalid ledger sign"
            );
            assert(snapshot.transaction.amount === amt, 'Amount mismatch');
            assert(snapshot.balance.after === newBalance, 'Balance mismatch');
        }

        // 📊 Monitoring hooks
        if (snapshot.transaction.amount !== ledgerInfo.amount) {
            logger.error(`RECEIPT_MISMATCH: Snapshot amount (${snapshot.transaction.amount}) != ledger amount (${ledgerInfo.amount})`);
        }
        
        if (!snapshot.transaction.ledger_id) {
            logger.error(`RECEIPT_NO_LEDGER: Orphan receipt for customer ${customerId}`);
        }

        return snapshot;
    });
}

function getReceipt(id) {
    const row = db.prepare(`
        SELECT snapshot, snapshot_hash FROM receipts WHERE id = ?
    `).get(id);

    if (!row) throw new Error('Receipt not found');

    const snapshot = JSON.parse(row.snapshot);

    verifyHmac(snapshot, row.snapshot_hash);

    return snapshot;
}

module.exports = {
    applyPayment,
    getReceipt,
    buildReceiptSnapshot
};
