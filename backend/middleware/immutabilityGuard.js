const express = require('express');
const { db } = require('../db/db');

/**
 * Middleware to enforce the immutability of records in the 'DONE' phase.
 * Prevents any PUT, PATCH, or DELETE requests against a DONE record.
 */
function immutabilityGuard(tableName, idParamName = 'id') {
    return (req, res, next) => {
        // We only care about mutation methods
        if (['PUT', 'PATCH', 'DELETE', 'POST'].includes(req.method)) {
            const recordId = req.params[idParamName] || req.body[idParamName];

            // Wait to intercept only if we have an ID to check against
            if (recordId) {
                try {
                    // Check the record's current status
                    const record = db.prepare(`SELECT status FROM ${tableName} WHERE id = ?`).get(recordId);

                    if (record && record.status === 'DONE') {
                        return res.status(409).json({
                            success: false,
                            error: `Conflict: This record is in the 'DONE' phase and is strictly immutable. Cannot perform ${req.method}.`
                        });
                    }
                } catch (error) {
                    console.error(`ImmutabilityGuard Error on ${tableName}:`, error);
                    // On error, we usually fallback to allowing the route handler to deal with the issue
                }
            }
        }
        next();
    };
}

module.exports = { immutabilityGuard };
