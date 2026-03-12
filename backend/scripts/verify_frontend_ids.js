const fs = require('fs');
const path = require('path');
const FRONTEND_DIR = path.join(__dirname, '../../frontend/src');

console.log('🔍 Scanning frontend for exposed Internal IDs...');

const dangerousPatterns = [
    /<[a-zA-Z0-9]+[^>]*>\{[^}]*\.id\}<\/[a-zA-Z0-9]+>/g, // Generic tag wrapping .id
    /<td>\{[^}]*\.id\}<\/td>/g,
    /<div>\{[^}]*\.id\}<\/div>/g,
    /<span>\{[^}]*\.id\}<\/span>/g,
    /<p>\{[^}]*\.id\}<\/p>/g,
    /label="ID"/ig,
    /header:\s*['"]ID['"]/ig,
    /header:\s*['"]Customer ID['"]/ig
];

const filesToScan = [
    'pages/CustomerProfile.js',
    'pages/Customers.js',
    'components/NewCustomerModal.js',
    'components/NewGoldTestModal.js',
    'components/NewSilverTestModal.js'
];

let errors = 0;

filesToScan.forEach(file => {
    const filePath = path.join(FRONTEND_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${file}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let fileErrors = 0;

    dangerousPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(match => {
                // Ignore legitimate uses (e.g. key={item.id} is caught by <Tag... but the regex needs to be smarter)
                // The regex <tag>{*.id}</tag> specifically looks for RENDERED content.
                // It does NOT match attribute assignment like key={c.id}.

                // Allow some edge cases?
                // For now, flag everything matching >{*.id}<
                console.error(`❌ Potential ID exposure in ${file}: ${match}`);
                fileErrors++;
            });
        }
    });

    if (fileErrors === 0) {
        console.log(`✅ ${file} passed scan.`);
    } else {
        errors += fileErrors;
    }
});

if (errors > 0) {
    console.error(`failed with ${errors} potential ID exposures.`);
    process.exit(1);
} else {
    console.log('🎉 No ID exposures detected in key files.');
}
