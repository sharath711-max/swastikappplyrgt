const axios = require('axios');

async function testApiAuthority() {
    const API_URL = 'http://localhost:5000/api';
    const TEST_CERT_ID = 1; // Assuming a certificate with ID 1 exists

    console.log('🚀 Testing Backend Authority Enforcement...');

    // 1. Valid Input
    console.log('\nTest Case 1: Valid Input');
    try {
        const res = await axios.post(`${API_URL}/certificates/${TEST_CERT_ID}/items`, {
            item_name: 'Test Ring',
            gross_weight: 10,
            test_weight: 0.5,
            purity: 91.6,
            rate_per_gram: 5000
        });
        console.log('✅ Success:', res.data.message);
        console.log('   Calculated Value:', res.data.data.calculated_values.item_total);
    } catch (e) {
        console.error('❌ Failed:', e.response?.data || e.message);
    }

    // 2. Malicious Input (Attempt to override calculation)
    console.log('\nTest Case 2: Malicious Input (Trying to send net_weight)');
    try {
        const res = await axios.post(`${API_URL}/certificates/${TEST_CERT_ID}/items`, {
            item_name: 'Fake Ring',
            gross_weight: 10,
            test_weight: 0.5,
            purity: 100,
            rate_per_gram: 5000,
            net_weight: 20 // Trying to cheat
        });
        console.log('❌ Unexpectedly Accepted malicious input!');
    } catch (e) {
        console.log('✅ Correctly Rejected:', e.response?.data.message);
    }

    // 3. Validation Error
    console.log('\nTest Case 3: Validation Error (Negative weight)');
    try {
        const res = await axios.post(`${API_URL}/certificates/${TEST_CERT_ID}/items`, {
            item_name: 'Invalid Ring',
            gross_weight: -10,
            purity: 100,
            rate_per_gram: 5000
        });
        console.log('❌ Unexpectedly Accepted invalid input!');
    } catch (e) {
        console.log('✅ Correctly Rejected Validation:', e.response?.data.message);
    }
}

// Note: Requires the server to be running
if (require.main === module) {
    testApiAuthority();
}
