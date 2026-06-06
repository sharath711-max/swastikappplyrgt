'use strict';

const {
    PYTHON_TO_SERN_STATUS,
    SERN_TO_PYTHON_STATUS,
    toNodeStatus,
    toPythonStatus,
} = require('./statusSemantics');

// ─── 1. Status vocabulary ─────────────────────────────────────────────────────
// Python: ongoing / pending     / completed
// Node:   TODO    / IN_PROGRESS / DONE

const STATUS_TO_PYTHON = SERN_TO_PYTHON_STATUS;
const STATUS_TO_NODE = PYTHON_TO_SERN_STATUS;

// ─── 2. Payment mode casing ───────────────────────────────────────────────────
// Python: cash / upi / balance / bill  (lowercase)
// Node:   Cash / UPI / Balance / Bill  (title-case / uppercase)

const PAYMENT_TO_PYTHON = Object.freeze({
    Cash   : 'cash',
    UPI    : 'upi',
    Balance: 'balance',
    Bill   : 'bill',
});

const PAYMENT_TO_NODE = Object.freeze({
    cash   : 'Cash',
    upi    : 'UPI',
    balance: 'Balance',
    bill   : 'Bill',
});

function toPythonPayment(nodeMode) {
    return PAYMENT_TO_PYTHON[nodeMode] ?? (nodeMode ? nodeMode.toLowerCase() : nodeMode);
}

function toNodePayment(pythonMode) {
    return PAYMENT_TO_NODE[pythonMode] ?? (pythonMode ? (pythonMode.charAt(0).toUpperCase() + pythonMode.slice(1)) : pythonMode);
}

// ─── 3. Numeric precision ─────────────────────────────────────────────────────
// Normalize to 2dp to eliminate float round-trip noise between Python and Node.

function n2(v) {
    if (v === null || v === undefined) return null;
    const f = parseFloat(v);
    return isNaN(f) ? null : Math.round(f * 100) / 100;
}

// ─── 4. Canonical comparison normalizer ──────────────────────────────────────
// Run BOTH Python and Node records through this before diffing.
// Rules:
//   undefined  → null        (field presence)
//   true/false → 1/0         (Python SQLite integers, not JSON booleans)
//
// Do NOT use this on live API output — only in the comparator layer.

function normalizeRecord(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (value === undefined) return null;
        if (typeof value === "boolean") return value ? 1 : 0;
        return value;
    }));
}

// ─── 4b. Python Presentation Parity ──────────────────────────────────────────
// Used to reproduce print-time formatting if PARITY mode is active.

function computePythonTotals({ price, gst, itemCount }) {
    const t = gst ? price / 1.18 : price;
    const itemTotal = Math.round(t * 100) / 100;
    const total = Math.round(itemCount * t * 100) / 100;
    return { itemTotal, total };
}

function resolvePythonName(item, customer) {
    return item.name || customer.name;
}

// ─── 5. Deterministic item sort ───────────────────────────────────────────────
// Python JSON blob preserves insertion order.
// Node DB rows have no guaranteed order.
// Sort by the most stable key available before mapping.

function _sortByKey(arr, key) {
    return [...arr].sort((a, b) => {
        const av = a[key] || '';
        const bv = b[key] || '';
        return String(av).localeCompare(String(bv));
    });
}

// cert items:  certificate_number (A001-Z999 global counter — stable, unique per cert)
// test items:  item_number        (GT-001-1, GT-001-2 — sequential insertion order)

// ─── 6. Item shape adapters (Node normalized rows → Python JSON blob) ─────────
// Booleans: Python reads raw SQLite integers (0/1), so adapters emit 0/1 not true/false.
// All optional fields are always present (null, not omitted).

// Gold Test item
// Python: { name, item, total_weight, test_weight, purity, returned, total }
function goldTestItemToPython(nodeItem) {
    return {
        name        : nodeItem.name        ?? null,
        item        : nodeItem.item_type   ?? null,
        total_weight: n2(nodeItem.gross_weight),
        test_weight : n2(nodeItem.test_weight),
        purity      : n2(nodeItem.purity),
        returned    : nodeItem.returned ?? 0,
        total       : n2(nodeItem.item_total ?? 0),
    };
}

// Gold Certificate item
// Python: { certificate_number, name, item, total_weight, test_weight, purity, returned, total }
function goldCertItemToPython(nodeItem) {
    return {
        certificate_number: nodeItem.certificate_number ?? null,
        name              : nodeItem.name               ?? null,
        item              : nodeItem.item_type          ?? null,
        total_weight      : n2(nodeItem.gross_weight),
        test_weight       : n2(nodeItem.test_weight),
        purity            : n2(nodeItem.purity),
        returned          : nodeItem.returned ?? 0,
        total             : n2(nodeItem.item_total ?? 0),
    };
}

// Silver Certificate item — same shape as gold cert
const silverCertItemToPython = goldCertItemToPython;

// Photo Certificate item
// Python: { certificate_number, name, item, total_weight, test_weight, purity, returned, show_kt }
function photoCertItemToPython(nodeItem) {
    return {
        certificate_number: nodeItem.certificate_number ?? null,
        name              : nodeItem.name               ?? null,
        item              : nodeItem.item_type          ?? null,
        total_weight      : n2(nodeItem.gross_weight),
        test_weight       : n2(nodeItem.test_weight),
        purity            : n2(nodeItem.purity),
        returned          : nodeItem.returned ?? 0,
        show_kt           : nodeItem.show_kt ?? 0,
    };
}

// Silver Test item — same structure as Gold Test item
const silverTestItemToPython = goldTestItemToPython;

// ─── 7. Full record adapters ──────────────────────────────────────────────────
// Takes a Node record + its raw item rows, returns Python-comparable shape.

function _base(record) {
    return {
        id             : record.id              ?? null,
        status         : toPythonStatus(record.status),
        mode_of_payment: toPythonPayment(record.mode_of_payment) ?? null,
        total          : n2(record.total),
        customer_id    : record.customer_id     ?? null,
        created        : record.created         ?? null,
    };
}

function goldTestToPython(record, items = []) {
    return {
        ..._base(record),
        data: _sortByKey(items, 'item_number').map(goldTestItemToPython),
    };
}

function goldCertToPython(record, items = []) {
    return {
        ..._base(record),
        gst            : record.gst ? 1 : 0,
        gst_bill_number: record.gst_bill_number ?? null,
        data           : _sortByKey(items, 'certificate_number').map(goldCertItemToPython),
    };
}

function silverCertToPython(record, items = []) {
    return {
        ..._base(record),
        gst            : record.gst ? 1 : 0,
        gst_bill_number: record.gst_bill_number ?? null,
        data           : _sortByKey(items, 'certificate_number').map(silverCertItemToPython),
    };
}

function photoCertToPython(record, items = []) {
    return {
        ..._base(record),
        gst            : record.gst ? 1 : 0,
        gst_bill_number: record.gst_bill_number ?? null,
        data           : _sortByKey(items, 'certificate_number').map(photoCertItemToPython),
    };
}

function silverTestToPython(record, items = []) {
    return {
        ..._base(record),
        data: _sortByKey(items, 'item_number').map(silverTestItemToPython),
    };
}

// ─── 8. Receipt Adapters ──────────────────────────────────────────────────────

function receiptToPythonShape(nodeSnapshot, pythonCustomer) {
    return normalizeRecord({
        customer_name: pythonCustomer.name, // Python uses live name
        amount: nodeSnapshot.transaction.amount,
        balance: nodeSnapshot.balance.after, // Python prints current balance
        payment_mode: nodeSnapshot.transaction.mode
    });
}

function normalizePaymentMode(mode) {
    if (!mode) return null;
    return mode.toLowerCase(); // match Python
}

module.exports = {
    // Status
    toPythonStatus,
    toNodeStatus,
    STATUS_TO_PYTHON,
    STATUS_TO_NODE,

    // Payment mode
    toPythonPayment,
    toNodePayment,
    PAYMENT_TO_PYTHON,
    PAYMENT_TO_NODE,

    // Numeric normalization
    n2,

    // Comparison utilities
    normalizeRecord,

    // Item adapters
    goldTestItemToPython,
    goldCertItemToPython,
    silverCertItemToPython,
    photoCertItemToPython,
    silverTestItemToPython,

    // Record adapters (record + raw item rows → Python-comparable shape)
    goldTestToPython,
    goldCertToPython,
    silverCertToPython,
    photoCertToPython,
    silverTestToPython,
    
    // Receipt adapters
    receiptToPythonShape,
    normalizePaymentMode,
};
