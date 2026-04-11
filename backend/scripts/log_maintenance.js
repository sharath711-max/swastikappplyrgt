'use strict';

const logger = require('../utils/logger');
const { runAuditMaintenance } = require('../utils/audit');

async function main() {
    await logger.runMaintenance();
    await runAuditMaintenance();
    console.log('Log maintenance complete.');
}

main().catch((error) => {
    console.error('Log maintenance failed:', error);
    process.exitCode = 1;
});
