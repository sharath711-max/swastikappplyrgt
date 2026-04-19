'use strict';

const { ZodError } = require('zod');
const { ValidationError } = require('../services/v2/errors');

/**
 * validate(schema, source?)
 * ──────────────────────────
 * Zod validation middleware factory.
 *
 * @param {import('zod').ZodSchema} schema  - Zod schema to validate against
 * @param {'body'|'query'|'params'} source  - which part of req to validate (default: 'body')
 *
 * On success: replaces req[source] with the parsed (coerced) value and calls next().
 * On failure: passes a ValidationError to next(err) — caught by the global error handler.
 *
 * Usage:
 *   router.post('/', validate(customerCreateSchema), handler);
 *   router.get('/',  validate(paginationSchema, 'query'), handler);
 */
function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);

        if (result.success) {
            req[source] = result.data;
            return next();
        }

        const details = result.error.errors.map(e => ({
            field: e.path.join('.') || source,
            message: e.message,
        }));

        return next(new ValidationError('Validation failed', details));
    };
}

/**
 * validateZod(schema, source?)
 * ─────────────────────────────
 * Stricter variant that throws synchronously (use inside async route handlers).
 * Returns the parsed data; throws ValidationError on failure.
 *
 * Usage (inside a controller):
 *   const data = validateZod(customerCreateSchema, req.body);
 */
function validateZod(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) return result.data;

    const details = result.error.errors.map(e => ({
        field: e.path.join('.') || 'input',
        message: e.message,
    }));
    throw new ValidationError('Validation failed', details);
}

module.exports = { validate, validateZod };
