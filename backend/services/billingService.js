/**
 * Billing Service - Handles financial calculations for all services
 * Based on Distilled Business Rules
 */
class BillingService {
    calculateTestBill(itemCount) {
        const rate = 30.00;
        return {
            baseAmount: itemCount * rate,
            taxAmount: 0,
            netAmount: itemCount * rate
        };
    }

    calculateCertificateBill(quantity, includeGst = false) {
        if (includeGst) {
            // Rule: Base 42.37 * Qty, GST 18%
            const baseAmount = Math.round(42.37 * quantity * 100) / 100;
            const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100;
            const netAmount = Math.round((baseAmount + taxAmount) * 100) / 100;

            // Note: Designed to yield round figures like 50.00 for 1 qty (42.37 * 1.18 = 49.996)
            return {
                baseAmount,
                taxAmount,
                netAmount: Math.ceil(netAmount) // Lab typically rounds up to nearest rupee
            };
        } else {
            // Rule: Without GST, typically 50.00 per qty
            const rate = 50.00;
            return {
                baseAmount: quantity * rate,
                taxAmount: 0,
                netAmount: quantity * rate
            };
        }
    }

    calculateWeightLossBill(serviceLevel) {
        // Rule: Common amounts 30, 80, 130, 200
        const rates = {
            1: 30.00,
            2: 80.00,
            3: 130.00,
            4: 200.00
        };
        const amount = rates[serviceLevel] || 30.00;
        return {
            baseAmount: amount,
            taxAmount: 0,
            netAmount: amount
        };
    }
}

module.exports = new BillingService();
