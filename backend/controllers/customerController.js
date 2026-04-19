'use strict';

const customerService  = require('../services/customerService');
const { writeAuditLog } = require('../services/auditLogService');
const { validateZod }  = require('../middleware/validate');
const { customerCreateSchema, customerUpdateSchema } = require('../schemas/index');

async function listCustomers(req, res, next) {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const customers = await customerService.getAllCustomers({ search, page: +page, limit: +limit });
        return res.json({ success: true, data: customers });
    } catch (err) {
        return next(err);
    }
}

async function getCustomer(req, res, next) {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        return res.json({ success: true, data: customer });
    } catch (err) {
        return next(err);
    }
}

async function createCustomer(req, res, next) {
    try {
        const data     = validateZod(customerCreateSchema, req.body);
        const customer = await customerService.createCustomer(data);

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            action    : 'CREATE_CUSTOMER',
            event     : 'COMMIT',
            entityType: 'customer',
            entityId  : customer.id ?? customer.data?.id,
            ipAddress : req.ip,
            metadata  : { name: data.name },
        });

        return res.status(201).json({ success: true, data: customer });
    } catch (err) {
        return next(err);
    }
}

async function updateCustomer(req, res, next) {
    try {
        const data     = validateZod(customerUpdateSchema, req.body);
        const customer = await customerService.updateCustomer(req.params.id, data);

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            action    : 'UPDATE_CUSTOMER',
            event     : 'COMMIT',
            entityType: 'customer',
            entityId  : req.params.id,
            ipAddress : req.ip,
        });

        return res.json({ success: true, data: customer });
    } catch (err) {
        return next(err);
    }
}

async function deleteCustomer(req, res, next) {
    try {
        await customerService.deleteCustomer(req.params.id);

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            action    : 'DELETE_CUSTOMER',
            event     : 'COMMIT',
            entityType: 'customer',
            entityId  : req.params.id,
            ipAddress : req.ip,
        });

        return res.json({ success: true, message: 'Customer deleted' });
    } catch (err) {
        return next(err);
    }
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
