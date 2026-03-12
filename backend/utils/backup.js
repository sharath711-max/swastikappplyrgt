const { createBackup } = require('../scripts/backup');

// Delegate to the safe Master SQLite Backup script using the C-level SQLite backup API
const performBackup = () => {
    console.log("Delegating to Master SQLite backup task...");
    createBackup();
};

if (require.main === module) {
    performBackup();
}

module.exports = { performBackup };
