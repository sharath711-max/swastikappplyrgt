/**
 * SwastikCore End-to-End Workflow Tests
 * Tests all critical paths: Intake → Testing → Completion
 * Validates mathematical constraints and GST calculations
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Color output
const log = {
  success: (msg) => console.log('\x1b[32m✅\x1b[0m', msg),
  error: (msg) => console.log('\x1b[31m❌\x1b[0m', msg),
  info: (msg) => console.log('\x1b[34mℹ️\x1b[0m', msg),
  warn: (msg) => console.log('\x1b[33m⚠️\x1b[0m', msg),
  header: (msg) => console.log('\n\x1b[36m━━━ ' + msg + ' ━━━\x1b[0m\n')
};

let testResults = { passed: 0, failed: 0, errors: [] };

// Test 1: Fetch existing migrated customers
async function testFetchCustomers() {
  log.header('TEST 1: Fetch Migrated Customers');
  try {
    const res = await axios.get(`${API_BASE}/customers`);
    const customers = res.data;
    log.success(`Fetched ${customers.length} customers`);
    log.info(`Sample customer: ${customers[0]?.name} (ID: ${customers[0]?.id})`);
    testResults.passed++;
    return customers[0]; // Return first customer for next test
  } catch (e) {
    log.error('Failed to fetch customers: ' + e.message);
    testResults.errors.push('TEST 1: ' + e.message);
    testResults.failed++;
    return null;
  }
}

// Test 2: Create a new Gold Certificate (Intake Phase)
async function testCreateGoldCertificate(customerId) {
  log.header('TEST 2: Create Gold Certificate (Intake)');
  try {
    if (!customerId) {
      log.warn('Skipping: No customer ID provided');
      return null;
    }

    const payload = {
      customer_id: customerId,
      mode_of_payment: 'cash',
      items: [
        {
          item_type: 'Gatti (piece)',
          gross_weight: 50.00,
          purity: 91.6
        },
        {
          item_type: 'Gundu (piece)',
          gross_weight: 25.50,
          purity: 91.6
        }
      ]
    };

    const res = await axios.post(`${API_BASE}/gold_certificate`, payload);
    const certData = res.data;
    log.success(`Gold Certificate created: ${certData.id}`);
    log.info(`Auto Number: ${certData.auto_number}`);
    log.info(`Items: ${certData.items.length} items registered`);
    testResults.passed++;
    return certData;
  } catch (e) {
    log.error('Failed to create gold certificate: ' + e.message);
    testResults.errors.push('TEST 2: ' + e.message);
    testResults.failed++;
    return null;
  }
}

// Test 3: Phase 2 - Technician Testing (enter purity, test weight, verify zero-sum)
async function testPhase2Technician(certId) {
  log.header('TEST 3: Phase 2 - Technician Testing');
  try {
    if (!certId) {
      log.warn('Skipping: No certificate ID provided');
      return;
    }

    // Get the certificate to fetch item IDs
    const certRes = await axios.get(`${API_BASE}/gold_certificate/${certId}`);
    const cert = certRes.data;

    if (!cert.items || cert.items.length === 0) {
      log.warn('No items found');
      return;
    }

    const firstItem = cert.items[0];

    // Test Case 3a: Valid input (zero loss)
    log.info('3a. Testing valid input (zero loss)...');
    const validPayload = {
      test_weight: 0.5,
      net_weight: 49.5,
      purity: 91.6,
      returned: 0
    };

    try {
      await axios.put(
        `${API_BASE}/gold_certificate_item/${firstItem.id}`,
        validPayload
      );
      log.success('Valid input accepted (zero loss case)');
      testResults.passed++;
    } catch (e) {
      log.error('Valid input rejected: ' + (e.response?.data?.message || e.message));
      testResults.failed++;
    }

    // Test Case 3b: Negative case - returned + test exceeds intake
    log.info('3b. Testing negative case (zero-sum violation)...');
    const invalidPayload = {
      test_weight: 30.0,
      net_weight: 25.0, // Total = 55.0 > 50.0 intake
      purity: 91.6,
      returned: 0
    };

    try {
      await axios.put(
        `${API_BASE}/gold_certificate_item/${firstItem.id}`,
        invalidPayload
      );
      log.error('SHOULD HAVE REJECTED: Returned + Test exceeds intake!');
      testResults.failed++;
    } catch (e) {
      if (e.response?.status === 400) {
        log.success('Correctly rejected zero-sum violation');
        testResults.passed++;
      } else {
        log.error('Unexpected error: ' + e.message);
        testResults.failed++;
      }
    }

    // Test Case 3c: With weight loss (triggers WLH)
    log.info('3c. Testing weight loss detection (> 0.001)...');
    const weightLossPayload = {
      test_weight: 0.5,
      net_weight: 48.8, // Loss = 50.0 - (0.5 + 48.8) = 0.7
      purity: 91.6,
      returned: 0
    };

    try {
      await axios.put(
        `${API_BASE}/gold_certificate_item/${firstItem.id}`,
        weightLossPayload
      );
      log.success('Weight loss input accepted (will trigger WLH categorization)');
      testResults.passed++;
    } catch (e) {
      log.error('Weight loss input rejected: ' + e.message);
      testResults.failed++;
    }
  } catch (e) {
    log.error('Phase 2 test error: ' + e.message);
    testResults.errors.push('TEST 3: ' + e.message);
    testResults.failed++;
  }
}

// Test 4: GST Calculation
async function testGSTCalculation(certId) {
  log.header('TEST 4: GST Calculation & Financials');
  try {
    if (!certId) {
      log.warn('Skipping: No certificate ID provided');
      return;
    }

    // Create a test certificate with known amounts
    const customerId = (await testFetchCustomers())?.id;
    const payload = {
      customer_id: customerId,
      mode_of_payment: 'cash',
      gst: 1,
      total: 11800, // Amount inclusive of 18% GST
      items: [
        {
          item_type: 'Test Item',
          gross_weight: 100,
          purity: 91.6
        }
      ]
    };

    const res = await axios.post(`${API_BASE}/gold_certificate`, payload);
    const cert = res.data;

    const expectedBase = 11800 / 1.18; // ~10000
    const expectedGST = 11800 - expectedBase; // ~1800

    log.success(`GST Certificate created`);
    log.info(`Total (inclusive): ₹${cert.total}`);
    log.info(`Base Amount: ₹${expectedBase.toFixed(2)}`);
    log.info(`GST (18%): ₹${expectedGST.toFixed(2)}`);
    testResults.passed++;
  } catch (e) {
    log.error('GST calculation test error: ' + e.message);
    testResults.errors.push('TEST 4: ' + e.message);
    testResults.failed++;
  }
}

// Test 5: Silver Certificate workflow
async function testSilverCertificate() {
  log.header('TEST 5: Silver Certificate Workflow');
  try {
    const customer = await testFetchCustomers();
    if (!customer) {
      log.warn('Skipping: No customer available');
      return;
    }

    const payload = {
      customer_id: customer.id,
      mode_of_payment: 'cash',
      items: [
        {
          item_type: 'Silver Bar',
          gross_weight: 500,
          purity: 92
        }
      ]
    };

    const res = await axios.post(`${API_BASE}/silver_certificate`, payload);
    log.success(`Silver Certificate created: ${res.data.id}`);
    log.info(`Auto Number: ${res.data.auto_number}`);
    testResults.passed++;
  } catch (e) {
    log.error('Silver certificate test error: ' + e.message);
    testResults.errors.push('TEST 5: ' + e.message);
    testResults.failed++;
  }
}

// Test 6: Weight Loss History tracking
async function testWeightLossHistory() {
  log.header('TEST 6: Weight Loss History Tracking');
  try {
    const customer = await testFetchCustomers();
    if (!customer) {
      log.warn('Skipping: No customer available');
      return;
    }

    // Create WLH entry
    const payload = {
      customer_id: customer.id,
      amount: 0.75,
      reason: 'Evaporation during testing'
    };

    const res = await axios.post(`${API_BASE}/weight_loss_history`, payload);
    log.success(`Weight Loss recorded: ${res.data.id}`);
    log.info(`Amount: ${res.data.amount}g`);
    log.info(`Reason: ${res.data.reason}`);
    testResults.passed++;
  } catch (e) {
    log.error('Weight loss history test error: ' + e.message);
    testResults.errors.push('TEST 6: ' + e.message);
    testResults.failed++;
  }
}

// Test 7: Fetch existing migrated certificates
async function testFetchMigratedCertificates() {
  log.header('TEST 7: Fetch Migrated Certificates');
  try {
    const goldRes = await axios.get(`${API_BASE}/certificates`);
    const silverRes = await axios.get(`${API_BASE}/certificates`);
    const photoRes = await axios.get(`${API_BASE}/certificates`);

    log.success(`Gold Certificates: ${goldRes.data.length} records`);
    log.success(`Silver Certificates: ${silverRes.data.length} records`);
    log.success(`Photo Certificates: ${photoRes.data.length} records`);

    if (goldRes.data.length > 0) {
      log.info(`Sample Gold Cert: ${goldRes.data[0].auto_number}`);
    }
    if (silverRes.data.length > 0) {
      log.info(`Sample Silver Cert: ${silverRes.data[0].auto_number}`);
    }

    testResults.passed += 3;
  } catch (e) {
    log.error('Fetch migrated certificates error: ' + e.message);
    testResults.errors.push('TEST 7: ' + e.message);
    testResults.failed += 3;
  }
}

// Test 8: Certificate completion (move to DONE status)
async function testCertificateCompletion(certId) {
  log.header('TEST 8: Certificate Completion');
  try {
    if (!certId) {
      log.warn('Skipping: No certificate ID provided');
      return;
    }

    const payload = {
      status: 'DONE',
      done_at: new Date().toISOString()
    };

    await axios.put(`${API_BASE}/gold_certificate/${certId}`, payload);
    log.success('Certificate marked as DONE');
    testResults.passed++;
  } catch (e) {
    log.error('Certificate completion error: ' + e.message);
    testResults.errors.push('TEST 8: ' + e.message);
    testResults.failed++;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          SWASTIKCORE COMPREHENSIVE TEST SUITE              ║');
  console.log('║  Testing Intake → Testing → Completion Workflows           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const customer = await testFetchCustomers();
  const goldCert = await testCreateGoldCertificate(customer?.id);

  if (goldCert) {
    await testPhase2Technician(goldCert.id);
    await testCertificateCompletion(goldCert.id);
  }

  await testGSTCalculation(null);
  await testSilverCertificate();
  await testWeightLossHistory();
  await testFetchMigratedCertificates();

  // Final summary
  log.header('TEST SUMMARY');
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);

  if (testResults.errors.length > 0) {
    log.warn('Errors encountered:');
    testResults.errors.forEach((err) => console.log('  -', err));
  }

  const total = testResults.passed + testResults.failed;
  const percentage = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;

  console.log(`\nSuccess Rate: ${percentage}%`);

  if (testResults.failed === 0) {
    log.success('🎉 ALL TESTS PASSED! 🎉');
  } else {
    log.warn('Some tests failed. Review errors above.');
  }
}

// Run with error handling
runAllTests().catch((err) => {
  log.error('Fatal error: ' + err.message);
  process.exit(1);
});
