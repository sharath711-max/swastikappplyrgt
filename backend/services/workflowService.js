const { db, transaction } = require('../db/db');
const testServiceV2 = require('./v2/testService');
const certificateService = require('./certificateService');
const documentDeliveryService = require('./documentDeliveryService');
const { writeAuditLog } = require('./auditLogService');
const logger = require('../utils/logger');
const { BusinessError, ERR } = require('./v2/errors');
const socket = require('../socket');

class WorkflowService {
    async getAllItems() {
        const query = `
            SELECT 
                'gold' as type, gt.id, gt.customer_id, gt.auto_number, gt.status, 
                'Gold Test' as description, 
                gt.total as total, gt.mode_of_payment, gt.created as createdon, 
                c.name as customer_name
            FROM gold_test gt
            JOIN customer c ON gt.customer_id = c.id
            WHERE gt.deletedon IS NULL
            
            UNION ALL
            
            SELECT 
                'silver' as type, st.id, st.customer_id, st.auto_number, st.status, 
                'Silver Test' as description, 
                st.total as total, st.mode_of_payment, st.created as createdon, 
                c.name as customer_name
            FROM silver_test st
            JOIN customer c ON st.customer_id = c.id
            WHERE st.deletedon IS NULL

            UNION ALL

            SELECT 
                'gold_cert' as type, gc.id, gc.customer_id, gc.auto_number, gc.status,
                'Gold Certificate' as description,
                gc.total as total, gc.mode_of_payment, gc.created as createdon,
                c.name as customer_name
            FROM gold_certificate gc
            JOIN customer c ON gc.customer_id = c.id
            WHERE gc.deletedon IS NULL

            UNION ALL

            SELECT 
                'silver_cert' as type, sc.id, sc.customer_id, sc.auto_number, sc.status,
                'Silver Certificate' as description,
                sc.total as total, sc.mode_of_payment, sc.created as createdon,
                c.name as customer_name
            FROM silver_certificate sc
            JOIN customer c ON sc.customer_id = c.id
            WHERE sc.deletedon IS NULL

            UNION ALL

            SELECT 
                'photo_cert' as type, pc.id, pc.customer_id, pc.auto_number, pc.status,
                'Photo Certificate' as description,
                pc.total as total, pc.mode_of_payment, pc.created as createdon,
                c.name as customer_name
            FROM photo_certificate pc
            JOIN customer c ON pc.customer_id = c.id
            WHERE pc.deletedon IS NULL

            ORDER BY datetime(createdon) DESC, id DESC
        `;
        return db.prepare(query).all();
    }

    async getKanbanBoard(limit = 50) {
        const items = await this.getAllItems();
        return {
            TODO: items.filter((item) => item.status === 'TODO').slice(0, limit),
            IN_PROGRESS: items.filter((item) => item.status === 'IN_PROGRESS').slice(0, limit),
            DONE: items.filter((item) => item.status === 'DONE').slice(0, limit),
            sequence: Date.now(),
            meta: {
                limit,
                counts: {
                    TODO: items.filter((item) => item.status === 'TODO').length,
                    IN_PROGRESS: items.filter((item) => item.status === 'IN_PROGRESS').length,
                    DONE: items.filter((item) => item.status === 'DONE').length,
                }
            }
        };
    }

    async moveItem(type, id, toStatus, actor = {}) {
        if (toStatus === 'DONE') {
            throw new BusinessError('Finalization requires explicit completion logic', ERR.STATUS_INVALID, 403);
        }

        const getCurrentRow = this._getCurrentRow(type, id);
        if (!getCurrentRow) {
            throw new BusinessError(`Workflow item not found: ${id}`, ERR.NOT_FOUND, 404);
        }
        if (getCurrentRow.status !== 'TODO' || toStatus !== 'IN_PROGRESS') {
            throw new BusinessError('Only TODO -> IN_PROGRESS is allowed via workflow move', ERR.STATUS_INVALID, 409);
        }

        const tableMap = {
            gold: 'gold_test',
            silver: 'silver_test',
            gold_cert: 'gold_certificate',
            silver_cert: 'silver_certificate',
            photo_cert: 'photo_certificate',
        };
        const table = tableMap[type];
        if (!table) {
            throw new BusinessError(`Invalid workflow type: ${type}`, ERR.INVALID_TYPE, 400);
        }

        const runMove = transaction(() => {
            const ts = new Date().toISOString();
            const result = db.prepare(
                `UPDATE ${table}
                 SET status = ?, lastmodified = ?, in_progress_at = COALESCE(in_progress_at, ?)
                 WHERE id = ? AND deletedon IS NULL`
            ).run(toStatus, ts, ts, id);

            writeAuditLog({
                userId: actor.userId || 'unknown',
                username: actor.username || 'unknown',
                action: 'WORKFLOW_MOVE',
                event: 'STATUS_CHANGE',
                operation: 'workflowService.moveItem',
                entityType: 'workflow_item',
                entityId: id,
                metadata: {
                    type,
                    fromStatus: getCurrentRow.status,
                    toStatus,
                    user_agent: actor.userAgent || null,
                    ip_address: actor.ipAddress || null,
                },
                ipAddress: actor.ipAddress || null,
            });

            return {
                updated: true,
                fromStatus: getCurrentRow.status,
                toStatus,
                result,
                immutableIds: { testId: id, certificateId: null }
            };
        });

        const moved = runMove();
        socket.emit('workflow', 'item:updated', { id, type, status: toStatus });
        socket.emit(type === 'gold' || type === 'silver' ? `${type}_test` : type, 'item:updated', { id, type, status: toStatus });
        return moved;
    }

    async finalizeItem(type, id, actor = {}) {
        const currentRow = this._getCurrentRow(type, id);
        if (!currentRow) {
            throw new BusinessError(`Workflow item not found: ${id}`, ERR.NOT_FOUND, 404);
        }
        if (currentRow.status !== 'IN_PROGRESS') {
            throw new BusinessError('Only IN_PROGRESS items can be finalized', ERR.STATUS_INVALID, 409);
        }

        if (type === 'gold' || type === 'silver') {
            const detail = await testServiceV2.getTest(type, id);
            if (!detail) {
                throw new BusinessError(`${type} test not found`, ERR.TEST_NOT_FOUND, 404);
            }

            const items = (detail.items || []).map((item) => ({
                id: item.id,
                purity: Number(item.purity) || 0,
                returned: !!item.returned,
                item_number: item.item_number || item.item_no
            }));

            const totalWtLoss = (detail.items || []).reduce((acc, item) => acc + (
                Number(item.gross_weight || item.sample_weight || 0) -
                (Number(item.test_weight || item.sample_weight || 0) + Number(item.net_weight || 0))
            ), 0);

            const result = await testServiceV2.completeTest(type, id, {
                items,
                mode_of_payment: detail.mode_of_payment,
                weight_loss: Math.max(0, totalWtLoss),
                cert: { gst: !!detail.gst },
                post_ledger: true,
            });

            writeAuditLog({
                userId: actor.userId || 'unknown',
                username: actor.username || 'unknown',
                action: 'WORKFLOW_FINALIZE',
                event: 'COMMIT',
                operation: 'workflowService.finalizeItem',
                entityType: `${type}_test`,
                entityId: id,
                metadata: {
                    type,
                    user_agent: actor.userAgent || null,
                    ip_address: actor.ipAddress || null,
                    certificate_id: result.certificate?.id || null,
                },
                ipAddress: actor.ipAddress || null,
            });

            return {
                updated: true,
                toStatus: 'DONE',
                immutableIds: {
                    testId: result.test?.id || id,
                    certificateId: result.certificate?.id || null,
                },
                result,
            };
        }

        const result = await certificateService.updateStatus(type.replace('_cert', ''), id, 'DONE');
        writeAuditLog({
            userId: actor.userId || 'unknown',
            username: actor.username || 'unknown',
            action: 'WORKFLOW_FINALIZE',
            event: 'COMMIT',
            operation: 'workflowService.finalizeItem',
            entityType: type,
            entityId: id,
            metadata: {
                type,
                user_agent: actor.userAgent || null,
                ip_address: actor.ipAddress || null,
            },
            ipAddress: actor.ipAddress || null,
        });
        return {
            updated: true,
            toStatus: 'DONE',
            immutableIds: { testId: null, certificateId: id },
            result,
        };
    }

    _getCurrentRow(type, id) {
        const tableMap = {
            gold: 'gold_test',
            silver: 'silver_test',
            gold_cert: 'gold_certificate',
            silver_cert: 'silver_certificate',
            photo_cert: 'photo_certificate',
        };
        const table = tableMap[type];
        if (!table) return null;
        return db.prepare(`SELECT id, status, mode_of_payment, total FROM ${table} WHERE id = ? AND deletedon IS NULL`).get(id);
    }

    async updateStatus(type, id, status) {
        // Map frontend type to service type
        const serviceType = type.replace('_cert', '');

        let result;
        switch (serviceType) {
            case 'gold':
                result = type === 'gold' ? await testServiceV2.updateStatus('gold', id, status) : await certificateService.updateStatus('gold', id, status);
                break;
            case 'silver':
                result = type === 'silver' ? await testServiceV2.updateStatus('silver', id, status) : await certificateService.updateStatus('silver', id, status);
                break;
            case 'photo':
                result = await certificateService.updateStatus('photo', id, status);
                break;
            default:
                throw new Error('Invalid item type: ' + type);
        }

        const response = { updated: true, result };

        if (status === 'DONE') {
            try {
                response.delivery = await documentDeliveryService.deliverCompletedRecord(type, id);
            } catch (error) {
                logger.error('Workflow completion delivery failed.', {
                    type,
                    id,
                    error: error.message
                });

                response.delivery = {
                    ok: false,
                    message: 'Moved to Completed, but the secure PDF or phone delivery could not be prepared.',
                    error: error.message
                };
            }
        }

        return response;
    }
}

module.exports = new WorkflowService();
