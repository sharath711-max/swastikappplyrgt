/**
 * SwastikCore End-to-End Workflow Tests V2
 * With JWT Authentication
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const log = {
  success: (msg) => console.log('\x1b[32m✅\x1b[0m', msg),
  error: (msg) => console.log('\x1b[31m❌\x1b[0m', msg),
  info: (msg) => console.log('\x1b[34mℹ️\x1b[0m', msg),
  warn: (msg) => console.log('\x1b[33m⚠️\x1b[0m', msg),
  header: (msg) => console.log('\n\x1b[36m━━━ ' + msg + ' ━━━\x1b[0m\n')
};

let testResults = { passed: 0, failed: 0, errors: [] };
let authToken = null;

// Test 0: Login
async function testLogin() {
  log.header('TEST 0: Login & Authenticate');
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
        password: 'admin123'
    });
    authToken = res.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    log.success(`Login successful`);
    log.info(`Token: ${authToken.substring(0, 30)}...`);
    testResults.passed++;
    return authToken;
  } catch (e) {
    log.error('Login failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('TEST 0 (Login): ' + (e.response?.data?.error || e.message));
    testResults.failed++;
    return null;
  }
}

// Test 1: Fetch migrated customers
async function testFetchCustomers() {
  log.header('TEST 1: Fetch Migrated Customers');
  try {
    const res = await axios.get(`${API_BASE}/customers`);
    const customers = res.data;
    log.success(`Fetched ${customers.length} customers`);
    if (customers.length > 0) {
      log.info(`Sample: ${customers[0].name} (${customers[0].id})`);
    }
    testResults.passed++;
    return customers[0] || null;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('TEST 1: ' + (e.response?.data?.error || e.message));
    testResults.failed++;
    return null;
  }
}

// Test 2: Create Gold Certificate
async function testCreateGoldCertificate(customerId) {
  log.header('TEST 2: Create Gold Certificate (Intake)');
  try {
    if (!customerId) {
      log.warn('Skipping: No customer');
      return null;
    }

    const payload = {
      type: 'gold',
      customer_id: customerId,
      mode_of_payment: 'cash',
      items: [
        { item_type: 'Gatti', gross_weight: 50, purity: 91.6 },
        { item_type: 'Gundu', gross_weight: 25.5, purity: 91.6 }
      ]
    };

    const res = await axios.post(`${API_BASE}/certificates`, payload);
    const cert = res.data;
    log.success(`Gold Certificate created: ${cert.id}`);
    log.info(`Auto#: ${cert.auto_number} | Items: ${cert.items?.length || 0}`);
    testResults.passed++;
    return cert;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('TEST 2: ' + (e.response?.data?.error || e.message));
    testResults.failed++;
    return null;
  }
}

// Test 3: Phase 2 - Technician Testing
async function testPhase2(certId) {
  log.header('TEST 3: Phase 2 - Technician Testing (Zero-Sum Validation)');
  try {
    if (!certId) {
      log.warn('Skipping: No certificate');
      return;
    }

    const certRes = await axios.get(`${API_BASE}/certificates/${certId}`);
    const cert = certRes.data;

    if (!cert.items || cert.items.length === 0) {
      log.warn('No items');
      return;
    }

    const item = cert.items[0];

    // 3a: Valid input (zero loss)
    log.info('3a. Valid input (zero loss)');
    try {
      await axios.put(`${API_BASE}/certificates/${certId}/items/${item.id}`, {
        test_weight: 0.5,
        net_weight: 49.5,
        purity: 91.6
      });
      log.success('Accepted');
      testResults.passed++;
    } catch (e) {
      log.error('Rejected: ' + (e.response?.data?.error || e.message));
      testResults.failed++;
    }

    // 3b: Invalid (zero-sum violation)
    log.info('3b. Zero-sum violation (should reject)');
    try {
      await axios.put(`${API_BASE}/certificates/${certId}/items/${item.id}`, {
        test_weight: 30,
        net_weight: 25, // Total > 50, should fail
        purity: 91.6
      });
      log.error('SHOULD HAVE REJECTED');
      testResults.failed++;
    } catch (e) {
      if (e.response?.status === 400) {
        log.success('Correctly rejected');
        testResults.passed++;
      } else {
        log.error('Unexpected error');
        testResults.failed++;
      }
    }
  } catch (e) {
    log.error('Test error: ' + e.message);
    testResults.failed++;
  }
}

// Test 4: Fetch all certificates from migration
async function testFetchCertificates() {
  log.header('TEST 4: Verify Migrated Certificate Data');
  try {
    const res = await axios.get(`${API_BASE}/certificates`);
    const certs = res.data;
    log.success(`Found ${certs.length} total certificates`);
    if (certs.length > 0) {
      log.info(`Sample: ${certs[0].auto_number} - ${certs[0].status}`);
    }
    testResults.passed++;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.failed++;
  }
}

// Test 5: Weight Loss History
async function testWeightLossHistory(customerId) {
  log.header('TEST 5: Weight Loss History Tracking');
  try {
    if (!customerId) {
      log.warn('Skipping: No customer');
      return;
    }

    const payload = {
      customer_id: customerId,
      amount: 0.75,
      reason: 'Evaporation during testing'
    };

    const res = await axios.post(`${API_BASE}/weight-loss`, payload);
    log.success(`WLH entry recorded: ${res.data.id}`);
    log.info(`Amount: ${res.data.amount}g`);
    testResults.passed++;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('TEST 5: ' + (e.response?.data?.error || e.message));
    testResults.failed++;
  }
}

// Test 6: Gold Tests
async function testGoldTests(customerId) {
  log.header('TEST 6: Gold Testing Workflow');
  try {
    if (!customerId) {
      log.warn('Skipping: No customer');
      return;
    }

    const payload = {
      customer_id: customerId,
      items: [
        { item_type: 'Test Item', gross_weight: 100, purity: 91.6 }
      ]
    };

    const res = await axios.post(`${API_BASE}/gold-tests`, payload);
    log.success(`Gold Test created: ${res.data.id}`);
    testResults.passed++;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.failed++;
  }
}

// Main runner
async function runAllTests() {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          SWASTIKCORE - COMPREHENSIVE E2E TESTS             ║');
  console.log('║  Intake → Testing → Completion Workflows                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Step 0: Authenticate
  const token = await testLogin();
  if (!token) {
    log.error('Authentication failed. Aborting.');
    return;
  }

  // Step 1: Fetch customers
  const customer = await testFetchCustomers();

  // Step 2: Create certificate
  const cert = customer ? await testCreateGoldCertificate(customer.id) : null;

  // Step 3: Phase 2 testing
  if (cert) {
    await testPhase2(cert.id);
  }

  // Step 4: Verify migrations
  await testFetchCertificates();

  // Step 5-6: Optional tests
  if (customer) {
    await testWeightLossHistory(customer.id);
    await testGoldTests(customer.id);
  }

  // Summary
  log.header('FINAL RESULTS');
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);

  if (testResults.errors.length > 0) {
    log.warn('Errors:');
    testResults.errors.forEach((e) => console.log('  -', e));
  }

  const total = testResults.passed + testResults.failed;
  const rate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  console.log(`\nSuccess Rate: ${rate}%\n`);

  if (testResults.failed === 0) {
    log.success('🎉 ALL TESTS PASSED 🎉\n');
  } else {
    log.warn('Some tests failed.\n');
  }
}

runAllTests().catch((err) => {
  log.error('Fatal: ' + err.message);
  process.exit(1);
});
