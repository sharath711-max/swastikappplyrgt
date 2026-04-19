const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const INSECURE_PLACEHOLDER_SECRETS = new Set([
    'your-super-secret-jwt-key-change-this-in-production',
    'swastik-lab-secret-key-change-in-production',
    'replace-with-a-long-random-secret'
]);

function getRequiredEnv(name) {
    const value = process.env[name];

    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value.trim();
}

/**
 * validateSnapshotSecret()
 * ─────────────────────────
 * Called once at server startup — fails fast before any request is served
 * rather than dying mid-request inside printService.serializeSnapshot.
 *
 * Rules:
 *   • Must be present and non-empty
 *   • Must not be a known insecure placeholder
 *   • Must be ≥ 32 characters (128-bit minimum for HMAC-SHA256 key material)
 */
function validateSnapshotSecret() {
    const value = getRequiredEnv('SNAPSHOT_SECRET');

    if (INSECURE_PLACEHOLDER_SECRETS.has(value)) {
        throw new Error(
            'SNAPSHOT_SECRET is still using a placeholder value. ' +
            'Set a strong random secret (≥ 32 chars) in backend/.env before starting the server.'
        );
    }

    if (value.length < 32) {
        throw new Error(
            `SNAPSHOT_SECRET must be at least 32 characters long (got ${value.length}). ` +
            'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }

    return value;
}

function getJwtSecret() {
    const value = getRequiredEnv('JWT_SECRET');

    if (INSECURE_PLACEHOLDER_SECRETS.has(value)) {
        throw new Error('JWT_SECRET is still using a placeholder value. Generate a long random secret in backend/.env before starting the server.');
    }

    if (value.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long.');
    }

    return value;
}

function parseEnvList(name) {
    const value = process.env[name];
    if (typeof value !== 'string' || value.trim() === '') {
        return [];
    }

    return value
        .split(',')
        .map(entry => entry.trim())
        .filter(Boolean);
}

function getAllowedCorsOrigins() {
    const configuredOrigins = parseEnvList('CORS_ALLOWED_ORIGINS');
    if (configuredOrigins.length > 0) {
        return configuredOrigins;
    }

    const frontendOrigins = parseEnvList('FRONTEND_ORIGIN');
    if (frontendOrigins.length > 0) {
        return frontendOrigins;
    }

    return ['http://localhost:3000'];
}

/**
 * validateDbPath(dbPath)
 * ───────────────────────
 * Called once at server startup to catch misconfigurations before any query runs.
 *
 * Rules:
 *   • Must be a non-empty string
 *   • ':memory:' is always valid (used in tests and CI)
 *   • For file paths: the parent directory must exist and be writable
 */
function validateDbPath(dbPath) {
    if (typeof dbPath !== 'string' || dbPath.trim() === '') {
        throw new Error('DB_PATH resolved to an empty value — check your environment configuration.');
    }

    if (dbPath === ':memory:') return;  // in-memory DB is always valid

    const fs   = require('fs');
    const path = require('path');
    const dir  = path.dirname(dbPath);

    if (!fs.existsSync(dir)) {
        throw new Error(`DB directory does not exist: ${dir}`);
    }

    try {
        fs.accessSync(dir, fs.constants.W_OK);
    } catch (_) {
        throw new Error(`DB directory is not writable: ${dir}`);
    }
}

module.exports = {
    getAllowedCorsOrigins,
    getJwtSecret,
    getRequiredEnv,
    validateSnapshotSecret,
    validateDbPath,
};
