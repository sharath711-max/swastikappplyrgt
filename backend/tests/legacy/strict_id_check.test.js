const { generateId, validateId } = require('../utils/idUtils');
const assert = require('assert');

console.log('🚀 Starting Strict ID Check...');

// 1. Test Regex Compliance
const regex = /^[A-Z]{3}[A-Za-z0-9]{15}$/;
console.log('✅ Regex defined:', regex);

// 2. Generate 1000 IDs and validate
const iterations = 1000;
console.log(`🔄 Generating ${iterations} IDs for validation...`);

for (let i = 0; i < iterations; i++) {
    const id = generateId('CUS');

    // Check Length
    if (id.length !== 18) {
        console.error(`❌ Length mismatch: ${id} (${id.length})`);
        process.exit(1);
    }

    // Check Prefix
    if (!id.startsWith('CUS')) {
        console.error(`❌ Prefix mismatch: ${id}`);
        process.exit(1);
    }

    // Check Regex
    if (!regex.test(id)) {
        console.error(`❌ Regex failed: ${id}`);
        process.exit(1);
    }

    // Check Validator Function
    if (!validateId(id)) {
        console.error(`❌ validateId() failed for: ${id}`);
        process.exit(1);
    }
}

console.log('✅ 1000 IDs generated and validated successfully.');

// 3. Test Invalid Inputs
const invalidIds = [
    'cus123456789012345', // Lowercase prefix
    'CUS123', // Too short
    'CUS123456789012345678', // Too long
    'CUS!@#$%^&*()_+{}|', // Special chars
];

invalidIds.forEach(id => {
    if (validateId(id)) {
        console.error(`❌ Invalid ID passed validation: ${id}`);
        process.exit(1);
    }
});

console.log('✅ Invalid IDs correctly rejected.');
console.log('🎉 STRICT ID POLICY ENFORCED.');
