'use strict';

const testService = require('./testService');
const certificateService = require('./certificateService');
const { BusinessError, ERR } = require('./errors');
const customerRepo = require('../../repositories/customerRepository');

/**
 * Presentation Layer Abstraction
 * Formats Test and Certificate data for thermal/A4 layouts.
 */

function _formatAmount(amt) {
    if (typeof amt !== 'number') return '0.00';
    return amt.toFixed(2);
}

function getPrintLayout(resourceType, metalType, id) {
    let data;

    if (resourceType === 'test') {
        data = testService.getTest(metalType, id);
    } else if (resourceType === 'certificate') {
        data = certificateService.getCertificate(metalType, id);
    } else {
        throw new BusinessError(`Unknown resourceType: ${resourceType}`, ERR.INVALID_TYPE, 400);
    }

    if (!data) {
        throw new BusinessError(`${resourceType} not found: ${id}`, ERR.NOT_FOUND, 404);
    }

    const customer = customerRepo.findById(data.customer_id);
    if (!customer) {
        throw new BusinessError(`Customer not found for ${resourceType} ${id}`, ERR.CUSTOMER_NOT_FOUND, 404);
    }

    if (data.print_snapshot) {
        try {
            return JSON.parse(data.print_snapshot);
        } catch (e) {
            // Fallthrough to regenerate dynamically if parse fails
        }
    }

    // Determine Base, Tax, Total
    const total = data.total || 0;
    const total_tax = data.total_tax || 0;
    
    // Reverse Inclusive GST extraction if tax exists
    let base = total - total_tax;
    if (total_tax === 0 && data.gst) { // Backwards compat fallback
         base = total / 1.18;
    }

    return {
        base: _formatAmount(base),
        tax: _formatAmount(total_tax || (total - base)),
        total: _formatAmount(total),
        mode_of_payment: data.mode_of_payment,
        gst_bill_no: data.gst_bill_number || null,
        header: {
            entity_type: resourceType,
            metal_type: metalType,
            auto_number: data.auto_number,
            status: data.status,
            created_at: data.created_at,
        },
        customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address || '',
        },
        items: data.items.map(item => ({
            item_number: item.item_number,
            certificate_number: item.certificate_number || null,
            name: item.name || item.item_type || '',
            gross_weight: _formatAmount(item.gross_weight),
            test_weight: _formatAmount(item.test_weight),
            net_weight: _formatAmount(item.net_weight),
            purity: _formatAmount(item.purity),
            fine_weight: _formatAmount(item.fine_weight),
            item_total: _formatAmount(item.item_total),
            returned: item.returned == 1 || item.returned === true,
        })),
        totals: {
            base: _formatAmount(base),
            tax: _formatAmount(total_tax || (total - base)),
            total: _formatAmount(total)
        }
    };
}

module.exports = {
    getPrintLayout
};
