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

module.exports = {
    getAllowedCorsOrigins,
    getJwtSecret,
    getRequiredEnv
};
