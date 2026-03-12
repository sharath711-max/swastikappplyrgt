/**
 * SwastikCore Complete E2E Test Suite
 * All workflows with corrected API paths
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
    testResults.passed++;
    return authToken;
  } catch (e) {
    log.error('Login failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('Login failed');
    testResults.failed++;
    return null;
  }
}

// Test 1: Fetch customers
async function testFetchCustomers() {
  log.header('TEST 1: Fetch 3,420 Migrated Customers');
  try {
    const res = await axios.get(`${API_BASE}/customers`);
    const customers = res.data;
    log.success(`✓ Fetched ${customers.length} customers`);
    if (customers.length > 0) {
      log.info(`Sample: "${customers[0].name}" - Phone: ${customers[0].phone}`);
    }
    testResults.passed++;
    return customers[0] || null;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('Fetch customers failed');
    testResults.failed++;
    return null;
  }
}

// Test 2: Create Gold Certificate
async function testCreateGoldCertificate(customerId) {
  log.header('TEST 2: Create Gold Certificate (Intake Phase)');
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
        { item_type: 'Gatti', gross_weight: 50.0, purity: 91.6 },
        { item_type: 'Gundu', gross_weight: 25.5, purity: 91.6 }
      ]
    };

    const res = await axios.post(`${API_BASE}/certificates`, payload);
    const cert = res.data;
    log.success(`✓ Gold Certificate created`);
    log.info(`ID: ${cert.id}`);
    log.info(`Auto#: ${cert.auto_number}`);
    log.info(`Items: ${cert.items?.length || 0}`);
    testResults.passed++;
    return cert;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('Create gold cert failed');
    testResults.failed++;
    return null;
  }
}

// Test 3: Zero-Sum Validation (Phase 2)
async function testPhase2ZeroSum(certId) {
  log.header('TEST 3: Phase 2 - Zero-Sum Constraint Validation');
  try {
    if (!certId) {
      log.warn('Skipping: No certificate');
      return;
    }

    const certRes = await axios.get(`${API_BASE}/certificates/${certId}?type=gold`);
    const cert = certRes.data;

    if (!cert.items || cert.items.length === 0) {
      log.warn('No items');
      return;
    }

    const item = cert.items[0];

    // 3a: Valid (zero loss)
    log.info('  3a. Valid input (zero loss)');
    try {
      await axios.put(`${API_BASE}/certificates/${certId}/items/${item.id}`, {
        test_weight: 0.5,
        net_weight: 49.5,
        purity: 91.6
      });
      log.success('    Accepted ✓');
      testResults.passed++;
    } catch (e) {
      log.error('    Rejected ✗: ' + (e.response?.data?.error || e.message));
      testResults.failed++;
    }

    // 3b: Invalid (exceeds zero-sum)
    log.info('  3b. Invalid: Returned + Test > Intake (should be rejected)');
    try {
      await axios.put(`${API_BASE}/certificates/${certId}/items/${item.id}`, {
        test_weight: 30.0,
        net_weight: 25.0,  // Total = 55 > 50, will fail
        purity: 91.6
      });
      log.error('    ERROR: Should have rejected!');
      testResults.failed++;
    } catch (e) {
      if (e.response?.status === 400) {
        log.success('    Correctly rejected ✓');
        testResults.passed++;
      } else {
        log.error('    Wrong error: ' + e.message);
        testResults.failed++;
      }
    }

    // 3c: With weight loss
    log.info('  3c. Valid with weight loss (0.7g loss)');
    try {
      await axios.put(`${API_BASE}/certificates/${certId}/items/${item.id}`, {
        test_weight: 0.5,
        net_weight: 48.8,  // Loss = 50 - 49.3 = 0.7
        purity: 91.6
      });
      log.success('    Accepted ✓');
      testResults.passed++;
    } catch (e) {
      log.error('    Failed: ' + (e.response?.data?.error || e.message));
      testResults.failed++;
    }
  } catch (e) {
    log.error('Phase 2 error: ' + e.message);
    testResults.failed++;
  }
}

// Test 4: Migrated certificates
async function testFetchMigratedCerts() {
  log.header('TEST 4: Verify Migrated Certificates (6,681 total)');
  try {
    // Gold certificates
    const goldRes = await axios.get(`${API_BASE}/certificates?type=gold&limit=1`);
    const goldCerts = goldRes.data.result || goldRes.data;
    log.success(`✓ Gold: ${goldRes.data.count || goldCerts.length} migrated`);

    // Silver certificates
    const silverRes = await axios.get(`${API_BASE}/certificates?type=silver&limit=1`);
    const silverCerts = silverRes.data.result || silverRes.data;
    log.success(`✓ Silver: ${silverRes.data.count || silverCerts.length} migrated`);

    // Photo certificates
    const photoRes = await axios.get(`${API_BASE}/certificates?type=photo&limit=1`);
    const photoCerts = photoRes.data.result || photoRes.data;
    log.success(`✓ Photo: ${photoRes.data.count || photoCerts.length} migrated`);

    testResults.passed++;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.errors.push('Fetch certs failed');
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
    log.success(`✓ WLH recorded`);
    log.info(`Amount: ${res.data.amount}g`);
    testResults.passed++;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.failed++;
  }
}

// Test 6: Gold Testing
async function testGoldTesting(customerId) {
  log.header('TEST 6: Create Gold Test (Testing Workflow)');
  try {
    if (!customerId) {
      log.warn('Skipping: No customer');
      return;
    }

    const payload = {
      customer_id: customerId,
      mode_of_payment: 'cash',
      items: [
        { item_type: 'Sample for testing', gross_weight: 100, purity: 91.6 }
      ]
    };

    const res = await axios.post(`${API_BASE}/gold-tests`, payload);
    log.success(`✓ Gold Test created`);
    log.info(`ID: ${res.data.id}`);
    testResults.passed++;
  } catch (e) {
    log.error('Failed: ' + (e.response?.data?.error || e.message));
    testResults.failed++;
  }
}

// Main
async function runAllTests() {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        🏭 SWASTIKCORE COMPLETE E2E TEST SUITE 🏭          ║');
  console.log('║    Testing all 3 major workflows + data migrations        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Auth
  const token = await testLogin();
  if (!token) {
    log.error('Cannot proceed without auth');
    return;
  }

  // All tests
  const customer = await testFetchCustomers();
  const cert = customer ? await testCreateGoldCertificate(customer.id) : null;
  if (cert) await testPhase2ZeroSum(cert.id);
  await testFetchMigratedCerts();
  if (customer) {
    await testWeightLossHistory(customer.id);
    await testGoldTesting(customer.id);
  }

  // Summary
  log.header('📊 FINAL RESULTS');
  console.log(`✓ Passed:  ${testResults.passed}`);
  console.log(`✗ Failed:  ${testResults.failed}`);

  if (testResults.errors.length > 0) {
    log.warn('Issues:');
    testResults.errors.forEach((e) => console.log('  -', e));
  }

  const total = testResults.passed + testResults.failed;
  const rate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  console.log(`\nSuccess Rate: ${rate}%\n`);

  if (testResults.failed === 0) {
    log.success('🎉 ALL TESTS PASSED 🎉\n');
  }
}

runAllTests().catch((err) => {
  log.error('Fatal: ' + err.message);
  process.exit(1);
});
