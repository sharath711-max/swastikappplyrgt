const { db } = require('../db/db');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 500;

function normalizePositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    return Math.min(parsed, max);
}

// Server-side list filters. Applies only clauses valid for the type's shape:
// parent records (status / mode / gst), items (status via parent `p`), and
// ledgers (txn type / mode). Date range applies to t.created everywhere.
// Returns a clause fragment appended before ORDER BY, plus its bound params.
function buildFilters(type, p = {}) {
    const isItem   = type.endsWith('-items');
    const isLedger = type === 'credit-history' || type === 'weight-loss-history';
    const clauses = [];
    const params  = [];

    if (p.start_date) { clauses.push('DATE(t.created) >= DATE(?)'); params.push(p.start_date); }
    if (p.end_date)   { clauses.push('DATE(t.created) <= DATE(?)'); params.push(p.end_date); }

    if (isItem) {
        if (p.status) { clauses.push('p.status = ?'); params.push(p.status); }
    } else if (isLedger) {
        if (p.txn_type) { clauses.push('t.type = ?'); params.push(p.txn_type); }
        if (p.mode)     { clauses.push('t.mode_of_payment = ?'); params.push(p.mode); }
    } else {
        if (p.status) { clauses.push('t.status = ?'); params.push(p.status); }
        if (p.mode)   { clauses.push('t.mode_of_payment = ?'); params.push(p.mode); }
        if (type.includes('certificate') && (p.gst === '1' || p.gst === '0')) {
            clauses.push('t.gst = ?'); params.push(Number(p.gst));
        }
    }
    return { clause: clauses.length ? ' AND ' + clauses.join(' AND ') : '', params };
}

class ListService {
    async getList(type, params) {
        const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
        const limit = normalizePositiveInteger(params.limit, DEFAULT_LIMIT, MAX_LIMIT);
        const search = typeof params.search === 'string' ? params.search.trim() : '';
        const offset = (page - 1) * limit;
        const searchTerm = `%${search}%`;

        let query = '';
        let countQuery = '';
        let queryParams = [];
        let countParams = [];

        const execute = () => {
            query += ` LIMIT ? OFFSET ?`;
            queryParams.push(limit, offset);

            const data = db.prepare(query).all(...queryParams);
            const totalResult = db.prepare(countQuery).get(...countParams);

            return {
                data,
                pagination: {
                    total: totalResult.total,
                    page,
                    limit,
                    totalPages: Math.ceil(totalResult.total / limit)
                }
            };
        };

        const joinCustomer = `JOIN customer c ON t.customer_id = c.id`;

        const getParentQuery = (table) => {
            return `SELECT t.*, t.created as created, c.name as customer_name FROM ${table} t ${joinCustomer} WHERE t.deletedon IS NULL`;
        };
        const getParentCount = (table) => {
            return `SELECT COUNT(*) as total FROM ${table} t ${joinCustomer} WHERE t.deletedon IS NULL`;
        };

        const getChildQuery = (itemTable, parentTable, fkColumn = 'parent_id') => {
            // Also select parent auto_number for display context
            return `SELECT t.*, t.created as created, p.id as parent_id, p.auto_number as parent_auto_number, c.name as customer_name 
                    FROM ${itemTable} t 
                    JOIN ${parentTable} p ON t.${fkColumn} = p.id 
                    JOIN customer c ON p.customer_id = c.id 
                    WHERE t.deletedon IS NULL`;
        };
        const getChildCount = (itemTable, parentTable, fkColumn = 'parent_id') => {
            return `SELECT COUNT(*) as total 
                     FROM ${itemTable} t 
                     JOIN ${parentTable} p ON t.${fkColumn} = p.id 
                     JOIN customer c ON p.customer_id = c.id 
                     WHERE t.deletedon IS NULL`;
        };

        // Standard search logic: Name, Phone. Added Auto/Item Number.
        // Removed ID search as per requirement.
        const parentSearchClause = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.auto_number LIKE ?)";
        const childSearchClause = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.item_number LIKE ? OR p.auto_number LIKE ? OR t.item_type LIKE ? OR t.name LIKE ?)";

        switch (type) {
            case 'gold-tests':
                query = getParentQuery('gold_test');
                countQuery = getParentCount('gold_test');
                if (search) {
                    const sc = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.auto_number LIKE ? OR EXISTS (SELECT 1 FROM gold_test_item WHERE gold_test_id = t.id AND deletedon IS NULL AND (item_type LIKE ? OR name LIKE ?)))";
                    query += sc;
                    countQuery += sc;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-tests':
                query = getParentQuery('silver_test');
                countQuery = getParentCount('silver_test');
                if (search) {
                    const sc = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.auto_number LIKE ? OR EXISTS (SELECT 1 FROM silver_test_item WHERE silver_test_id = t.id AND deletedon IS NULL AND (item_type LIKE ? OR name LIKE ?)))";
                    query += sc;
                    countQuery += sc;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'gold-certificates':
                query = getParentQuery('gold_certificate');
                countQuery = getParentCount('gold_certificate');
                if (search) {
                    const sc = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.auto_number LIKE ? OR EXISTS (SELECT 1 FROM gold_certificate_item WHERE gold_certificate_id = t.id AND deletedon IS NULL AND (item_type LIKE ? OR name LIKE ?)))";
                    query += sc;
                    countQuery += sc;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-certificates':
                query = getParentQuery('silver_certificate');
                countQuery = getParentCount('silver_certificate');
                if (search) {
                    const sc = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.auto_number LIKE ? OR EXISTS (SELECT 1 FROM silver_certificate_item WHERE silver_certificate_id = t.id AND deletedon IS NULL AND (item_type LIKE ? OR name LIKE ?)))";
                    query += sc;
                    countQuery += sc;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'photo-certificates':
                query = getParentQuery('photo_certificate');
                countQuery = getParentCount('photo_certificate');
                if (search) {
                    const sc = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.auto_number LIKE ? OR EXISTS (SELECT 1 FROM photo_certificate_item WHERE photo_certificate_id = t.id AND deletedon IS NULL AND (item_type LIKE ? OR name LIKE ?)))";
                    query += sc;
                    countQuery += sc;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'gold-test-items':
                query = getChildQuery('gold_test_item', 'gold_test', 'gold_test_id');
                countQuery = getChildCount('gold_test_item', 'gold_test', 'gold_test_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-test-items':
                query = getChildQuery('silver_test_item', 'silver_test', 'silver_test_id');
                countQuery = getChildCount('silver_test_item', 'silver_test', 'silver_test_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'gold-certificate-items':
                query = getChildQuery('gold_certificate_item', 'gold_certificate', 'gold_certificate_id');
                countQuery = getChildCount('gold_certificate_item', 'gold_certificate', 'gold_certificate_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-certificate-items':
                query = getChildQuery('silver_certificate_item', 'silver_certificate', 'silver_certificate_id');
                countQuery = getChildCount('silver_certificate_item', 'silver_certificate', 'silver_certificate_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'photo-certificate-items':
                query = getChildQuery('photo_certificate_item', 'photo_certificate', 'photo_certificate_id');
                countQuery = getChildCount('photo_certificate_item', 'photo_certificate', 'photo_certificate_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'credit-history':
                // credit_history now follows the standard lifecycle contract
                // (created/lastmodified/deletedon). Soft-deleted rows excluded.
                query = `SELECT t.*, t.created, c.name as customer_name FROM credit_history t ${joinCustomer} WHERE t.deletedon IS NULL`;
                countQuery = `SELECT COUNT(*) as total FROM credit_history t ${joinCustomer} WHERE t.deletedon IS NULL`;
                if (search) {
                    query += " AND (c.name LIKE ? OR c.phone LIKE ?)";
                    countQuery += " AND (c.name LIKE ? OR c.phone LIKE ?)";
                    queryParams.push(searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'weight-loss-history':
                // weight_loss_history now follows the standard lifecycle contract.
                query = `SELECT t.*, t.created, c.name as customer_name FROM weight_loss_history t ${joinCustomer} WHERE t.deletedon IS NULL`;
                countQuery = `SELECT COUNT(*) as total FROM weight_loss_history t ${joinCustomer} WHERE t.deletedon IS NULL`;
                if (search) {
                    query += " AND (c.name LIKE ? OR c.phone LIKE ?)";
                    countQuery += " AND (c.name LIKE ? OR c.phone LIKE ?)";
                    queryParams.push(searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            default:
                throw new Error('Invalid list type');
        }

        // Apply optional filters (status / date / mode / gst / txn type) after
        // search but before ORDER BY, so their params bind ahead of LIMIT/OFFSET.
        const { clause: filterClause, params: filterParams } = buildFilters(type, params);
        if (filterClause) {
            query = query.replace(' ORDER BY', ` ${filterClause} ORDER BY`);
            countQuery += filterClause;
            queryParams.push(...filterParams);
            countParams.push(...filterParams);
        }

        return execute();
    }
}

module.exports = new ListService();
