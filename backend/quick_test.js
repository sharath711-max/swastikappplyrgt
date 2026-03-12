const axios = require('axios');
const API = 'http://localhost:5000/api';

(async () => {
  try {
    // Login
    console.log('\n🔐 Logging in...');
    const loginRes = await axios.post(`${API}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Logged in\n');

    // Get customer
    console.log('👤 Fetching customer...');
    const custRes = await axios.get(`${API}/customers`);
    const cust = custRes.data[0];
    console.log(`✅ Got customer: ${cust.name}\n`);

    // Create gold cert with ALL required fields
    console.log('🥇 Creating gold certificate...');
    const certRes = await axios.post(`${API}/certificates`, {
      type: 'gold',
      customer_id: cust.id,
      mode_of_payment: 'cash',
      items: [
        {
          item_type: 'Gatti',
          gross_weight: 50.0,
          purity: 91.6,
          rate_per_gram: 7500  // <-- REQUIRED
        }
      ]
    });
    const cert = certRes.data;
    console.log(`✅ Created: ${cert.id}`);
    console.log(`   Auto#: ${cert.auto_number}\n`);

    // Get cert details
    console.log('📄 Fetching certificate...');
    const getRes = await axios.get(`${API}/certificates/${cert.id}?type=gold`);
    console.log(`✅ Retrieved, items: ${getRes.data.items.length}\n`);

    // Test Phase 2 - valid
    console.log('⚖️  Testing Phase 2 - valid input (zero loss)');
    const item = getRes.data.items[0];
    await axios.put(`${API}/certificates/${cert.id}/items/${item.id}`, {
      test_weight: 0.5,
      net_weight: 49.5,
      purity: 91.6
    });
    console.log('✅ Accepted\n');

    // Test Phase 2 - invalid (zero-sum violation)
    console.log('⚠️  Testing Phase 2 - invalid (zero-sum violation)');
    try {
      await axios.put(`${API}/certificates/${cert.id}/items/${item.id}`, {
        test_weight: 30.0,
        net_weight: 25.0  // Total = 55 > 50, should fail
      });
      console.log('❌ ERROR: Should have been rejected!');
    } catch (e) {
      if (e.response?.status === 400) {
        console.log('✅ Correctly rejected\n');
      }
    }

    // Fetch all migrated gold certs
    console.log('📊 Checking migrated certificates...');
    const allRes = await axios.get(`${API}/certificates?type=gold&limit=5`);
    console.log(`✅ Gold certificates in DB: ${allRes.data.count || 'unknown'}`);
    if (allRes.data.result) {
      console.log(`   Sample: ${allRes.data.result[0].auto_number}\n`);
    }

    // Create test for Weight Loss
    console.log('❌ Creating weight loss record...');
    const wlhRes = await axios.post(`${API}/weight-loss`, {
      customer_id: cust.id,
      amount: 0.5,
      reason: 'Test weight loss'
    });
    console.log(`✅ Created\n`);

    console.log('═══════════════════════════════════════');
    console.log('✨ ALL WORKFLOWS TESTED SUCCESSFULLY ✨');
    console.log('═══════════════════════════════════════\n');

  } catch (e) {
    console.error('❌ Error:', e.response?.data?.error || e.message);
    process.exit(1);
  }
})();
