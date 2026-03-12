const Decimal = require('decimal.js');

class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
    }
}

class CertificateCalculationService {
    /**
     * Calculate gold item values with financial-grade precision
     * @param {Object} input - Raw input from client
     * @returns {Object} - Calculated values (authoritative)
     */
    static calculateGoldItem(input) {
        const {
            gross_weight,
            test_weight = 0,
            purity,
            rate_per_gram,
            is_returned = false,
            item_name = 'Unknown'
        } = input;

        // 1. VALIDATION (non-negotiable)
        const errors = [];

        if (!gross_weight || gross_weight <= 0) {
            errors.push('Gross weight must be > 0');
        }

        if (test_weight < 0) {
            errors.push('Test weight cannot be negative');
        }

        if (new Decimal(test_weight || 0).gt(new Decimal(gross_weight || 0))) {
            errors.push('Test weight cannot exceed gross weight');
        }

        if (purity === undefined || purity < 0 || purity > 100) {
            errors.push('Purity must be between 0 and 100%');
        }

        if (!rate_per_gram || rate_per_gram <= 0) {
            errors.push('Rate per gram must be > 0');
        }

        if (errors.length > 0) {
            throw new ValidationError('Gold item validation failed', errors);
        }

        // 2. CALCULATION (authoritative, using Decimal.js)
        const gross = new Decimal(gross_weight);
        const test = new Decimal(test_weight);
        const purityDec = new Decimal(purity);
        const rate = new Decimal(rate_per_gram);

        // Net weight = Gross - Test (rounded to 3 decimal places)
        const net_weight = gross.minus(test)
            .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        // Fine weight = Net Weight × (Purity / 100) (rounded to 3 decimal places)
        const fine_weight = net_weight.times(purityDec.dividedBy(100))
            .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        // Item total = Fine Weight × Rate per Gram (rounded to 2 decimal places)
        // If an item is marked as returned, the item_total is strictly 0.
        let item_total = new Decimal(0);
        if (!is_returned) {
            item_total = fine_weight.times(rate)
                .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        }

        // 3. RETURN AUTHORITATIVE VALUES
        return {
            // Raw inputs (validated)
            gross_weight: gross.toNumber(),
            test_weight: test.toNumber(),
            purity: purityDec.toNumber(),
            rate_per_gram: rate.toNumber(),

            // Calculated outputs (authoritative)
            net_weight: net_weight.toNumber(),
            fine_weight: fine_weight.toNumber(),
            item_total: item_total.toNumber(),

            // Metadata
            is_returned: Boolean(is_returned),
            item_name,
            calculated_at: new Date().toISOString(),
            calculation_version: '1.1.0'
        };
    }

    /**
     * Calculate silver item values
     * @param {Object} input
     * @returns {Object}
     */
    static calculateSilverItem(input) {
        const {
            gross_weight,
            test_weight = 0,
            purity = 0,
            is_returned = false,
            item_name = 'Silver Item'
        } = input;

        const errors = [];
        if (!gross_weight || gross_weight <= 0) errors.push('Gross weight must be > 0');
        if (test_weight < 0) errors.push('Test weight cannot be negative');
        if (new Decimal(test_weight).gt(new Decimal(gross_weight))) errors.push('Test weight cannot exceed gross weight');
        if (purity < 0 || purity > 100) errors.push('Purity must be between 0 and 100%');

        if (errors.length > 0) {
            throw new ValidationError('Silver item validation failed', errors);
        }

        const gross = new Decimal(gross_weight);
        const test = new Decimal(test_weight);
        const purityDec = new Decimal(purity);

        // Net weight = Gross - Test
        const net_weight = gross.minus(test).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        // Fine weight = Net Weight * (Purity / 100)
        const fine_weight = net_weight.times(purityDec.dividedBy(100)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        return {
            gross_weight: gross.toNumber(),
            test_weight: test.toNumber(),
            net_weight: net_weight.toNumber(),
            purity: purityDec.toNumber(),
            fine_weight: fine_weight.toNumber(),
            is_returned: Boolean(is_returned),
            item_name,
            calculated_at: new Date().toISOString()
        };
    }
    /**
     * Update parent certificate roll-up totals
     * Salesforce-style Master-Detail roll-up
     */
    static async updateCertificateTotals(certificateId, db) {
        // Determine table based on ID prefix
        let tableName = 'gold_certificate';
        let itemTable = 'gold_certificate_item';
        let idPrefix = certificateId.substring(0, 3);

        if (idPrefix === 'SCR') {
            tableName = 'silver_certificate';
            itemTable = 'silver_certificate_item';
        } else if (idPrefix === 'PCR') {
            tableName = 'photo_certificate';
            itemTable = 'photo_certificate_item';
        }

        // 1. Check Immutability
        const parent = db.prepare(`SELECT status FROM ${tableName} WHERE id = ?`).get(certificateId);
        if (parent && parent.status === 'DONE') {
            // Immutable, but we return current totals
            return this.getCurrentTotals(certificateId, tableName, itemTable, db);
        }

        // 2. Roll-up Calculation
        // Total Weights: Roll up total_net_weight from all associated items (non-deleted)
        const items = db.prepare(`
            SELECT 
                COUNT(*) as item_count,
                COALESCE(SUM(net_weight), 0) as total_net_weight
            FROM ${itemTable}
            WHERE 
                ${tableName}_id = ? 
                AND deletedon IS NULL
        `).get(certificateId);

        // 3. Update Parent
        const now = new Date().toISOString();

        if (idPrefix === 'GCR') {
            db.prepare(`
                UPDATE gold_certificate 
                SET 
                    total_net_weight = ?,
                    lastmodified = ?
                WHERE id = ?
            `).run(
                items.total_net_weight,
                now,
                certificateId
            );
        } else if (idPrefix === 'SCR') {
            db.prepare(`
                UPDATE silver_certificate 
                SET 
                    total_net_weight = ?,
                    lastmodified = ?
                WHERE id = ?
            `).run(
                items.total_net_weight,
                now,
                certificateId
            );
        } else {
            // Photo certificate or others
            db.prepare(`
                UPDATE ${tableName} 
                SET lastmodified = ?
                WHERE id = ?
            `).run(now, certificateId);
        }

        return {
            item_count: items.item_count,
            total_net_weight: items.total_net_weight
        };
    }

    static getCurrentTotals(certificateId, tableName, itemTable, db) {
        const result = db.prepare(`
            SELECT 
                total as grand_total,
                (SELECT COUNT(*) FROM ${itemTable} WHERE ${tableName}_id = ? AND deletedon IS NULL) as item_count
            FROM ${tableName}
            WHERE id = ?
        `).get(certificateId, certificateId);

        // For gold, we might have weight columns
        if (tableName === 'gold_certificate') {
            const weights = db.prepare(`SELECT total_net_weight, total_fine_weight FROM gold_certificate WHERE id = ?`).get(certificateId);
            return { ...result, ...weights };
        }

        return result;
    }
}

module.exports = CertificateCalculationService;
module.exports.ValidationError = ValidationError;
