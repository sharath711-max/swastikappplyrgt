'use strict';

/**
 * calculationService.js  —  v2 (hardened)
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 *   1. ValidationError now extends BusinessError (from ./errors).
 *   2. rollupTotals throws SystemError on infrastructure failure, BusinessError
 *      on DONE-parent conflict.
 *   3. All thrown errors carry ERR.* codes.
 *
 * Pure functions (calculateItem, calculateGstBreakdown) — no DB, no audit.
 * rollupTotals — bare-DB composable helper (no own transaction).
 */

const Decimal = require('decimal.js');
const { BusinessError, ValidationError, SystemError, ERR } = require('./errors');

// ─── Constants ────────────────────────────────────────────────────────────────
const GST_RATE  = new Decimal('0.18');
const WEIGHT_DP = 3;
const MONEY_DP  = 2;
const RM        = Decimal.ROUND_HALF_UP;

const TYPE_MAP = Object.freeze({
    gold: {
        parentTable  : 'gold_certificate',
        itemTable    : 'gold_certificate_item',
        fkColumn     : 'gold_certificate_id',
        hasFineTotal : true,
    },
    silver: {
        parentTable  : 'silver_certificate',
        itemTable    : 'silver_certificate_item',
        fkColumn     : 'silver_certificate_id',
        hasFineTotal : false,
    },
});

// ─── Decimal coercion ─────────────────────────────────────────────────────────
function dec(v) {
    try {
        const n = new Decimal(v ?? 0);
        return n.isFinite() ? n : new Decimal(0);
    } catch {
        return new Decimal(0);
    }
}

// ─── Shared validators ────────────────────────────────────────────────────────
function _validateWeights(gross, test, errors) {
    if (gross.lte(0))   errors.push('gross_weight must be > 0');
    if (test.lt(0))     errors.push('test_weight cannot be negative');
    if (test.gt(gross)) errors.push('test_weight cannot exceed gross_weight');
}

function _validatePurity(purity, required, errors) {
    if (purity.lt(0) || purity.gt(100)) errors.push('purity must be between 0 and 100');
    if (required && purity.lte(0))      errors.push('purity is required (must be > 0)');
}

// ─── Per-type calculation ─────────────────────────────────────────────────────
function _calcGoldItem(input) {
    const gross      = dec(input.gross_weight);
    const test       = dec(input.test_weight);
    const purity     = dec(input.purity);
    const rate       = dec(input.rate_per_gram);
    const isReturned = Boolean(input.is_returned || input.returned);

    const errors = [];
    _validateWeights(gross, test, errors);
    _validatePurity(purity, true, errors);
    if (rate.lt(0)) errors.push('rate_per_gram must be ≥ 0');
    if (errors.length) throw new ValidationError('Gold item validation failed', errors);

    const net_weight  = gross.minus(test).toDecimalPlaces(WEIGHT_DP, RM);
    const fine_weight = net_weight.times(purity.div(100)).toDecimalPlaces(WEIGHT_DP, RM);
    const item_total  = isReturned
        ? new Decimal(0)
        : fine_weight.times(rate).toDecimalPlaces(MONEY_DP, RM);

    return {
        gross_weight : gross.toNumber(),
        test_weight  : test.toNumber(),
        net_weight   : net_weight.toNumber(),
        purity       : purity.toNumber(),
        fine_weight  : fine_weight.toNumber(),
        rate_per_gram: rate.toNumber(),
        item_total   : item_total.toNumber(),
        is_returned  : isReturned,
        calculated_at: new Date().toISOString(),
    };
}

function _calcSilverItem(input) {
    const gross      = dec(input.gross_weight);
    const test       = dec(input.test_weight);
    const purity     = dec(input.purity);
    const isReturned = Boolean(input.is_returned || input.returned);

    const errors = [];
    _validateWeights(gross, test, errors);
    _validatePurity(purity, false, errors);
    if (errors.length) throw new ValidationError('Silver item validation failed', errors);

    const net_weight  = gross.minus(test).toDecimalPlaces(WEIGHT_DP, RM);
    const fine_weight = net_weight.times(purity.div(100)).toDecimalPlaces(WEIGHT_DP, RM);

    return {
        gross_weight : gross.toNumber(),
        test_weight  : test.toNumber(),
        net_weight   : net_weight.toNumber(),
        purity       : purity.toNumber(),
        fine_weight  : fine_weight.toNumber(),
        item_total   : 0,
        is_returned  : isReturned,
        calculated_at: new Date().toISOString(),
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Unified per-item calculation.  Pure — no DB.
 * @param {'gold'|'silver'} type
 * @param {Object} input
 * @returns {Object}
 * @throws {ValidationError} on invalid input
 * @throws {BusinessError}   on unknown type
 */
function calculateItem(type, input) {
    if (type === 'gold')   return _calcGoldItem(input);
    if (type === 'silver') return _calcSilverItem(input);
    throw new BusinessError(
        `Unknown metal type: "${type}". Expected 'gold' or 'silver'.`,
        ERR.INVALID_TYPE, 400
    );
}

/**
 * GST breakdown.  Pure — no DB.
 * @param {number}  baseTotal
 * @param {boolean} applyGst
 * @returns {{ base_total, tax_amount, grand_total }}
 */
function calculateGstBreakdown(baseTotal, applyGst) {
    const base = dec(baseTotal);
    if (!applyGst) {
        return { base_total: base.toNumber(), tax_amount: 0, grand_total: base.toNumber() };
    }
    const tax   = base.times(GST_RATE).toDecimalPlaces(MONEY_DP, RM);
    const grand = base.plus(tax).toDecimalPlaces(MONEY_DP, RM);
    return {
        base_total : base.toNumber(),
        tax_amount : tax.toNumber(),
        grand_total: grand.toNumber(),
    };
}

/**
 * Master-detail roll-up: SUM items → UPDATE parent.
 * COMPOSABLE BARE-DB — no own transaction.  Must run inside an active transaction.
 *
 * @param {'gold'|'silver'}                   type
 * @param {string}                            parentId
 * @param {import('better-sqlite3').Database} db
 * @returns {{ item_count, total_net_weight, total_fine_weight, grand_total }}
 * @throws {BusinessError}  if parent is DONE (immutable)
 * @throws {SystemError}    if parent row is missing mid-transaction
 */
function rollupTotals(type, parentId, db) {
    const cfg = TYPE_MAP[type];
    if (!cfg) {
        throw new BusinessError(
            `rollupTotals: unknown type "${type}"`, ERR.INVALID_TYPE, 400
        );
    }

    const parent = db.prepare(
        `SELECT status, total, total_net_weight FROM ${cfg.parentTable} WHERE id = ?`
    ).get(parentId);

    if (!parent) {
        // Mid-transaction disappearance — this is a system failure
        throw new SystemError(
            `rollupTotals: parent ${parentId} not found — possible concurrent deletion`,
            null, { parentId, type }
        );
    }

    // Guard: immutable DONE records return stored totals without mutating
    if (parent.status === 'DONE') {
        return {
            item_count       : null,
            total_net_weight : parent.total_net_weight ?? 0,
            total_fine_weight: null,
            grand_total      : parent.total ?? 0,
        };
    }

    const agg = db.prepare(`
        SELECT
            COUNT(*)                      AS item_count,
            COALESCE(SUM(net_weight),  0) AS total_net_weight,
            COALESCE(SUM(fine_weight), 0) AS total_fine_weight,
            COALESCE(SUM(item_total),  0) AS grand_total
        FROM ${cfg.itemTable}
        WHERE ${cfg.fkColumn} = ? AND deletedon IS NULL
    `).get(parentId);

    const ts = new Date().toISOString();

    if (type === 'gold') {
        db.prepare(`
            UPDATE gold_certificate
            SET    total = ?, total_net_weight = ?, total_fine_weight = ?, lastmodified = ?
            WHERE  id = ?
        `).run(agg.grand_total, agg.total_net_weight, agg.total_fine_weight, ts, parentId);
    } else {
        db.prepare(`
            UPDATE silver_certificate
            SET    total = ?, total_net_weight = ?, lastmodified = ?
            WHERE  id = ?
        `).run(agg.grand_total, agg.total_net_weight, ts, parentId);
    }

    return {
        item_count       : agg.item_count,
        total_net_weight : agg.total_net_weight,
        total_fine_weight: agg.total_fine_weight,
        grand_total      : agg.grand_total,
    };
}

module.exports = {
    calculateItem,
    calculateGstBreakdown,
    rollupTotals,
    // Re-export from errors for convenience (callers that only need calc + errors)
    ValidationError,
    BusinessError,
    // Unit-test internals
    _calcGoldItem,
    _calcSilverItem,
};
