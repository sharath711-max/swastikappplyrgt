'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

const DAY_MS = 24 * 60 * 60 * 1000;

function readPositiveIntEnv(name, fallback) {
    const raw = process.env[name];
    if (raw == null || raw === '') return fallback;

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return parsed;
}

function utcDateString(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ageInDays(dateString) {
    const createdAtUtc = Date.parse(`${dateString}T00:00:00.000Z`);
    if (Number.isNaN(createdAtUtc)) return null;

    const now = Date.now();
    return Math.floor((now - createdAtUtc) / DAY_MS);
}

async function gzipFile(sourcePath) {
    const targetPath = `${sourcePath}.gz`;

    try {
        await fs.promises.access(targetPath, fs.constants.F_OK);
        await fs.promises.unlink(sourcePath);
        return;
    } catch (_) {
        // Target does not exist yet; continue.
    }

    await pipeline(
        fs.createReadStream(sourcePath),
        zlib.createGzip({ level: zlib.constants.Z_BEST_SPEED }),
        fs.createWriteStream(targetPath)
    );

    await fs.promises.unlink(sourcePath);
}

/**
 * Create a daily log writer with size rollover and retention cleanup.
 *
 * Environment overrides:
 *   <ENV_PREFIX>_MAX_BYTES
 *   <ENV_PREFIX>_RETENTION_DAYS
 *   <ENV_PREFIX>_COMPRESS_AFTER_DAYS
 *   <ENV_PREFIX>_MAINTENANCE_INTERVAL_MS
 *
 * @param {Object} options
 * @param {string} options.dir
 * @param {string} options.filePrefix
 * @param {string} options.extension
 * @param {string} options.envPrefix
 * @param {number} options.defaultMaxBytes
 * @param {number} options.defaultRetentionDays
 * @param {number} options.defaultCompressAfterDays
 * @returns {{ append: (content: string, callback?: Function) => void, runMaintenance: () => Promise<void>, getActiveFilePath: () => string }}
 */
function createDailyLogWriter(options) {
    const {
        dir,
        filePrefix = '',
        extension,
        envPrefix,
        defaultMaxBytes,
        defaultRetentionDays,
        defaultCompressAfterDays,
    } = options;

    const maxBytes = readPositiveIntEnv(`${envPrefix}_MAX_BYTES`, defaultMaxBytes);
    const retentionDays = readPositiveIntEnv(`${envPrefix}_RETENTION_DAYS`, defaultRetentionDays);
    const compressAfterDays = readPositiveIntEnv(`${envPrefix}_COMPRESS_AFTER_DAYS`, defaultCompressAfterDays);
    const maintenanceIntervalMs = readPositiveIntEnv(
        `${envPrefix}_MAINTENANCE_INTERVAL_MS`,
        60 * 60 * 1000
    );

    const filePattern = new RegExp(
        `^${escapeRegex(filePrefix)}(\\d{4}-\\d{2}-\\d{2})(?:\\.(\\d+))?${escapeRegex(extension)}(?:\\.gz)?$`
    );

    let lastMaintenanceAt = 0;
    let maintenanceInFlight = false;

    fs.mkdirSync(dir, { recursive: true });

    function buildFileName(dateString, segment = 0) {
        const segmentSuffix = segment > 0 ? `.${segment}` : '';
        return `${filePrefix}${dateString}${segmentSuffix}${extension}`;
    }

    function getActiveFilePath() {
        const dateString = utcDateString();
        let segment = 0;

        while (true) {
            const filename = buildFileName(dateString, segment);
            const filePath = path.join(dir, filename);

            try {
                const stats = fs.statSync(filePath);
                if (stats.size < maxBytes) {
                    return filePath;
                }
                segment += 1;
            } catch (error) {
                if (error.code === 'ENOENT') {
                    return filePath;
                }
                throw error;
            }
        }
    }

    async function runMaintenance() {
        if (maintenanceInFlight) return;
        maintenanceInFlight = true;

        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            const today = utcDateString();

            for (const entry of entries) {
                if (!entry.isFile()) continue;

                const match = entry.name.match(filePattern);
                if (!match) continue;

                const fileDate = match[1];
                const fullPath = path.join(dir, entry.name);
                const isCompressed = entry.name.endsWith('.gz');
                const ageDays = ageInDays(fileDate);

                if (ageDays == null) continue;

                if (ageDays > retentionDays) {
                    await fs.promises.unlink(fullPath).catch(() => {});
                    continue;
                }

                const isCurrentDay = fileDate === today;
                if (!isCompressed && !isCurrentDay && ageDays >= compressAfterDays) {
                    await gzipFile(fullPath).catch(() => {});
                }
            }
        } finally {
            maintenanceInFlight = false;
        }
    }

    function scheduleMaintenance() {
        const now = Date.now();
        if ((now - lastMaintenanceAt) < maintenanceIntervalMs) {
            return;
        }

        lastMaintenanceAt = now;
        setImmediate(() => {
            runMaintenance().catch(() => {});
        });
    }

    function append(content, callback = () => {}) {
        try {
            scheduleMaintenance();
            fs.appendFile(getActiveFilePath(), content, callback);
        } catch (error) {
            callback(error);
        }
    }

    scheduleMaintenance();

    return {
        append,
        runMaintenance,
        getActiveFilePath,
    };
}

module.exports = {
    createDailyLogWriter,
};
