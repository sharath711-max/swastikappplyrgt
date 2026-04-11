'use strict';

/**
 * services/v2/auditLogger.js — shim
 * ─────────────────────────────────────────────────────────────────────────────
 * All five v2 services import from this path.  The real implementation now
 * lives in utils/audit.js where it is shared with the middleware layer and has
 * access to the AsyncLocalStorage correlation context.
 *
 * This file is a pure re-export so that:
 *   • No service file needs an import-path change.
 *   • utils/audit.js remains the single source of truth.
 */

const { audit } = require('../../utils/audit');

module.exports = audit;
