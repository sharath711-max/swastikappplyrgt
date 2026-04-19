'use strict';

const { z } = require('zod');

// ─── Primitives ───────────────────────────────────────────────────────────────

const nonEmptyString = (label) =>
    z.string({ required_error: `${label} is required` }).trim().min(1, `${label} cannot be blank`);

const positiveNumber = (label) =>
    z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` })
     .positive(`${label} must be positive`);

const nonNegativeNumber = (label) =>
    z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` })
     .min(0, `${label} cannot be negative`);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

const paymentMode = z.enum(['Cash', 'UPI', 'Bank Transfer', 'Credit', 'Cheque'],
    { errorMap: () => ({ message: 'Invalid payment mode' }) });

const workflowStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE'],
    { errorMap: () => ({ message: 'Status must be TODO, IN_PROGRESS or DONE' }) });

// ─── Auth ─────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
    username: nonEmptyString('Username'),
    password: nonEmptyString('Password'),
});

const registerSchema = z.object({
    username: nonEmptyString('Username').min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'manager', 'technician', 'front_desk', 'user']).default('front_desk'),
});

const changePasswordSchema = z.object({
    currentPassword: nonEmptyString('Current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const resetPasswordSchema = z.object({
    userId: nonEmptyString('User ID'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const updateRoleSchema = z.object({
    role: z.enum(['admin', 'manager', 'technician', 'front_desk', 'user']),
});

// ─── Customer ─────────────────────────────────────────────────────────────────

const customerCreateSchema = z.object({
    name: nonEmptyString('Name').max(255),
    phone: z.string().trim().regex(/^\d{7,15}$/, 'Phone must be 7–15 digits').optional().or(z.literal('')).nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
});

const customerUpdateSchema = customerCreateSchema.partial();

// ─── Test items ───────────────────────────────────────────────────────────────

const testItemUpdateSchema = z.object({
    id: nonEmptyString('Item ID'),
    test_weight: nonNegativeNumber('Test weight'),
    purity: z.number().min(0).max(100, 'Purity must be 0–100'),
    returned: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
});

const testItemsBatchSchema = z.object({
    items: z.array(testItemUpdateSchema).min(1, 'At least one item is required'),
});

// ─── Gold / Silver Test ───────────────────────────────────────────────────────

const testCreateSchema = z.object({
    customer_id: nonEmptyString('Customer ID'),
    mode_of_payment: paymentMode.optional(),
    items: z.array(z.object({
        item_type: nonEmptyString('Item type'),
        gross_weight: nonNegativeNumber('Gross weight'),
        test_weight: nonNegativeNumber('Test weight').optional(),
        purity: z.number().min(0).max(100).optional(),
        returned: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
    })).min(1, 'At least one item is required'),
    gst: z.boolean().optional(),
    notes: z.string().trim().max(2000).optional().nullable(),
});

const testCompleteSchema = z.object({
    mode_of_payment: paymentMode,
    items: z.array(testItemUpdateSchema).min(1, 'At least one item is required'),
    gst: z.boolean().optional(),
    weight_loss: nonNegativeNumber('Weight loss').optional(),
});

const calculateItemSchema = z.object({
    gross_weight: nonNegativeNumber('Gross weight'),
    test_weight: nonNegativeNumber('Test weight'),
    purity: z.number().min(0).max(100, 'Purity must be 0–100'),
    rate_per_gram: nonNegativeNumber('Rate per gram').optional(),
    returned: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
    is_returned: z.boolean().optional(),
});

// ─── Certificate ──────────────────────────────────────────────────────────────

const certItemSchema = z.object({
    item_number: nonEmptyString('Item number'),
    item_type: nonEmptyString('Item type'),
    gross_weight: nonNegativeNumber('Gross weight'),
    test_weight: nonNegativeNumber('Test weight'),
    purity: z.number().min(0).max(100, 'Purity must be 0–100'),
    rate_per_gram: nonNegativeNumber('Rate per gram').optional(),
    returned: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
});

const certificateCreateSchema = z.object({
    customer_id: nonEmptyString('Customer ID'),
    mode_of_payment: paymentMode,
    gst: z.boolean().optional(),
    gst_bill_number: z.string().trim().max(100).optional().nullable(),
    items: z.array(certItemSchema).min(1, 'At least one item is required'),
    notes: z.string().trim().max(2000).optional().nullable(),
});

const certificateStatusSchema = z.object({
    status: workflowStatus,
});

// ─── Credit History (Ledger) ──────────────────────────────────────────────────

const creditHistoryCreateSchema = z.object({
    customer_id: nonEmptyString('Customer ID'),
    amount: positiveNumber('Amount'),
    type: z.enum(['CREDIT', 'DEBIT'], { errorMap: () => ({ message: 'Type must be CREDIT or DEBIT' }) }),
    mode_of_payment: paymentMode.optional(),
    description: nonEmptyString('Description').max(1000),
    weight: nonNegativeNumber('Weight').optional(),
    weight_type: z.enum(['GOLD', 'SILVER', 'NONE']).optional(),
});

const creditHistoryQuerySchema = z.object({
    customer_id: nonEmptyString('Customer ID').optional(),
    type: z.enum(['CREDIT', 'DEBIT']).optional(),
    start_date: isoDate.optional(),
    end_date: isoDate.optional(),
    min_amount: z.coerce.number().min(0).optional(),
    max_amount: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(200).default(20),
});

// ─── Weight Loss ──────────────────────────────────────────────────────────────

const weightLossCreateSchema = z.object({
    customer_id: z.string().trim().optional().nullable(),
    amount: positiveNumber('Amount'),
    reason: z.string().trim().max(1000).optional().nullable(),
    mode_of_payment: paymentMode.optional(),
    date: isoDate.optional(),
});

// ─── Cash Register ────────────────────────────────────────────────────────────

const cashCreateSchema = z.object({
    type: z.enum(['IN', 'OUT'], { errorMap: () => ({ message: 'Type must be IN or OUT' }) }),
    amount: positiveNumber('Amount'),
    description: nonEmptyString('Description').max(1000),
    date: isoDate.optional(),
    mode_of_payment: paymentMode.optional(),
});

// ─── Workflow ─────────────────────────────────────────────────────────────────

const workflowMoveSchema = z.object({
    type: z.enum(['gold', 'silver', 'gold_cert', 'silver_cert', 'photo_cert'],
        { errorMap: () => ({ message: 'Invalid workflow type' }) }),
    status: workflowStatus,
});

// ─── Pagination ───────────────────────────────────────────────────────────────

const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(200).default(20),
    status: workflowStatus.optional(),
    search: z.string().trim().max(255).optional(),
});

module.exports = {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    resetPasswordSchema,
    updateRoleSchema,
    customerCreateSchema,
    customerUpdateSchema,
    testCreateSchema,
    testCompleteSchema,
    testItemsBatchSchema,
    testItemUpdateSchema,
    calculateItemSchema,
    certificateCreateSchema,
    certificateStatusSchema,
    certItemSchema,
    creditHistoryCreateSchema,
    creditHistoryQuerySchema,
    weightLossCreateSchema,
    cashCreateSchema,
    workflowMoveSchema,
    paginationSchema,
    paymentMode,
    workflowStatus,
};
