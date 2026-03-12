const { db } = require('../db/db');

class ListService {
    async getList(type, params) {
        const { page = 1, limit = 10, search = '' } = params;
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
                    page: parseInt(page),
                    limit: parseInt(limit),
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
        const childSearchClause = " AND (c.name LIKE ? OR c.phone LIKE ? OR t.item_number LIKE ? OR p.auto_number LIKE ?)";

        switch (type) {
            case 'gold-tests':
                query = getParentQuery('gold_test');
                countQuery = getParentCount('gold_test');
                if (search) {
                    query += parentSearchClause;
                    countQuery += parentSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-tests':
                query = getParentQuery('silver_test');
                countQuery = getParentCount('silver_test');
                if (search) {
                    query += parentSearchClause;
                    countQuery += parentSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'gold-certificates':
                query = getParentQuery('gold_certificate');
                countQuery = getParentCount('gold_certificate');
                if (search) {
                    query += parentSearchClause;
                    countQuery += parentSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-certificates':
                query = getParentQuery('silver_certificate');
                countQuery = getParentCount('silver_certificate');
                if (search) {
                    query += parentSearchClause;
                    countQuery += parentSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'photo-certificates':
                query = getParentQuery('photo_certificate');
                countQuery = getParentCount('photo_certificate');
                if (search) {
                    query += parentSearchClause;
                    countQuery += parentSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'gold-test-items':
                query = getChildQuery('gold_test_item', 'gold_test', 'gold_test_id');
                countQuery = getChildCount('gold_test_item', 'gold_test', 'gold_test_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    // childSearchClause has 4 params
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-test-items':
                query = getChildQuery('silver_test_item', 'silver_test', 'silver_test_id');
                countQuery = getChildCount('silver_test_item', 'silver_test', 'silver_test_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'gold-certificate-items':
                query = getChildQuery('gold_certificate_item', 'gold_certificate', 'gold_certificate_id');
                countQuery = getChildCount('gold_certificate_item', 'gold_certificate', 'gold_certificate_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'silver-certificate-items':
                query = getChildQuery('silver_certificate_item', 'silver_certificate', 'silver_certificate_id');
                countQuery = getChildCount('silver_certificate_item', 'silver_certificate', 'silver_certificate_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'photo-certificate-items':
                query = getChildQuery('photo_certificate_item', 'photo_certificate', 'photo_certificate_id');
                countQuery = getChildCount('photo_certificate_item', 'photo_certificate', 'photo_certificate_id');
                if (search) {
                    query += childSearchClause;
                    countQuery += childSearchClause;
                    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'credit-history':
                // credit_history uses 'created' not 'createdon', and has no 'deletedon'
                query = `SELECT t.*, t.created, c.name as customer_name FROM credit_history t ${joinCustomer} WHERE 1=1`;
                countQuery = `SELECT COUNT(*) as total FROM credit_history t ${joinCustomer} WHERE 1=1`;
                if (search) {
                    query += " AND (c.name LIKE ? OR c.phone LIKE ?)";
                    countQuery += " AND (c.name LIKE ? OR c.phone LIKE ?)";
                    queryParams.push(searchTerm, searchTerm);
                    countParams.push(searchTerm, searchTerm);
                }
                query += " ORDER BY t.created DESC";
                break;

            case 'weight-loss-history':
                // weight_loss_history uses 'created' not 'createdon', and has no 'deletedon'
                query = `SELECT t.*, t.created, c.name as customer_name FROM weight_loss_history t ${joinCustomer} WHERE 1=1`;
                countQuery = `SELECT COUNT(*) as total FROM weight_loss_history t ${joinCustomer} WHERE 1=1`;
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

        return execute();
    }
}

module.exports = new ListService();
