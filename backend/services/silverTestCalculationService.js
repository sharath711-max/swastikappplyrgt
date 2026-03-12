const Decimal = require('decimal.js');

class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
    }
}

class SilverTestCalculationService {
    /**
     * Testing charge per item (can be moved to globals later)
     */
    static TESTING_CHARGE = 0.00;

    /**
     * Calculate individual silver test item values
     */
    static calculateItem(input) {
        const {
            gross_weight = 0,
            test_weight = 0,
            purity = 0,
            returned = false,
            item_type = 'Silver',
            net_weight: input_net
        } = input;

        // 1. VALIDATION
        const errors = [];
        if (!gross_weight || gross_weight <= 0) {
            errors.push('Gross weight must be > 0');
        }
        if (test_weight < 0) {
            errors.push('Test weight cannot be negative');
        }

        const gross = new Decimal(gross_weight);
        const test = new Decimal(test_weight);
        const pur = new Decimal(purity);

        // Logical Net = Gross - Test
        const logicalNet = gross.minus(test);

        // Actual Net
        const netFetch = input_net !== undefined ? new Decimal(input_net) : logicalNet;

        if (test.gt(gross)) {
            errors.push('Test weight cannot exceed gross weight');
        }
        if (netFetch.gt(logicalNet)) {
            errors.push('Returned weight cannot exceed (Gross - Test)');
        }
        if (purity < 0 || purity > 100) {
            errors.push('Purity must be between 0 and 100%');
        }

        if (errors.length > 0) {
            throw new ValidationError('Silver test item validation failed', errors);
        }

        // 2. CALCULATION
        const net_weight = netFetch.toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        // Fine Weight
        const fine_weight = net_weight.times(pur.dividedBy(100)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        // Item Total
        const item_total = returned ? new Decimal(0) : new Decimal(this.TESTING_CHARGE);

        return {
            gross_weight: gross.toNumber(),
            test_weight: test.toNumber(),
            net_weight: net_weight.toNumber(),
            purity: pur.toNumber(),
            fine_weight: fine_weight.toNumber(),
            item_total: item_total.toNumber(),
            returned: Boolean(returned),
            item_type,
            loss: logicalNet.minus(net_weight).toNumber()
        };
    }

    /**
     * Update parent roll-up totals
     */
    static updateParentTotals(testId, db) {
        // 1. Check Existence and Immutability
        const parent = db.prepare('SELECT status FROM silver_test WHERE id = ?').get(testId);
        if (!parent) return;

        if (parent.status === 'DONE') {
            return; // Immutable
        }

        // Amount is manually entered by the user in Tested status, do not overwrite 'total' here
        return 0;
    }
}

module.exports = SilverTestCalculationService;
module.exports.ValidationError = ValidationError;
