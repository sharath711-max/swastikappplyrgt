const app = require('../app');
const http = require('http');

const PORT = 5005;

let server;
let token = '';
let testCustomer = {};

const baseUrl = `http://localhost:${PORT}`;

async function runTests() {
    console.log("Starting API Verification Suite...\n");
    server = app.listen(PORT, async () => {
        console.log(`Server started on temp port ${PORT} for testing...`);
        try {
            await testLogin();
            await testCustomerFlow();
            await testGoldFlow();
            await testWorkflow();

            console.log("\n✅ ALL API TESTS PASSED SUCCESSFULLY!");
            server.close();
            process.exit(0);
        } catch (err) {
            console.error("\n❌ API TEST FAILED:", err.message);
            server.close();
            process.exit(1);
        }
    });
}

// Ensure the process exits cleanly on uncaught errors
process.on('unhandledRejection', (err) => {
    console.error("\n❌ UNHANDLED PROMISE REJECTION:", err);
    if (server) server.close();
    process.exit(1);
});

async function request(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(`API Error [${method} ${endpoint}]: ${res.status} ${res.statusText} - ${JSON.stringify(data)}`);
    }

    return data && data.success !== undefined && data.data !== undefined ? data.data : data;
}

async function testLogin() {
    console.log("[1] Testing Login...");
    // Let's seed admin silently directly via DB if it doesn't exist
    const bcrypt = require('bcryptjs');
    const { db } = require('../db/db');
    const exist = db.prepare("SELECT * FROM users WHERE username='admin'").get();
    if (!exist) {
        db.prepare("INSERT INTO users (id, username, password, created, lastmodified) VALUES (?, ?, ?, ?, ?)").run(
            'root123', 'admin', bcrypt.hashSync('admin123', 10), new Date().toISOString(), new Date().toISOString()
        );
    }

    const data = await request('/api/auth/login', 'POST', { username: 'admin', password: 'admin123' });
    if (!data || !data.token) throw new Error("No token returned on login");
    token = data.token;
    console.log("    -> Login successful, Token received.");
}

async function testCustomerFlow() {
    console.log("[2] Testing Customer API...");
    // Create new customer
    const newCust = await request('/api/customers', 'POST', {
        name: `Test API Customer ${Date.now()}`,
        phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        notes: 'API automated test'
    });

    if (!newCust.id) throw new Error("Customer creation failed - no ID");
    testCustomer = newCust;
    console.log(`    -> Created Customer ${testCustomer.name} (${testCustomer.id})`);

    // Fetch all customers to verify
    const list = await request('/api/customers', 'GET');
    const found = list.find(c => c.id === testCustomer.id);
    if (!found) throw new Error("Created customer not found in list");
    console.log("    -> Customer list fetch passed.");
}

async function testGoldFlow() {
    console.log("[3] Testing Gold Test API...");

    const testPayload = {
        customer_id: testCustomer.id,
        items: [
            {
                name: "Gold Ring API",
                item_type: "RING",
                gross_weight: 10,
                test_weight: 9.8,
                net_weight: 9.8,
                purity: 91.6
            }
        ]
    };

    const newTest = await request('/api/gold-tests', 'POST', testPayload);
    if (!newTest.id) throw new Error("Gold test creation failed");
    console.log(`    -> Created Gold Test: ID=${newTest.id}, AutoNumber=${newTest.auto_number}`);

    // Fetch test details
    const fetchedTest = await request(`/api/gold-tests/${newTest.id}`, 'GET');
    if (!fetchedTest || fetchedTest.items.length === 0) throw new Error("Failed to fetch gold test items");
    console.log(`    -> Gold Test details structured properly. Items=${fetchedTest.items.length}`);
}

async function testWorkflow() {
    console.log("[4] Testing Workflow Dashboard API...");
    // Hit root workflow items
    const wfItems = await request('/api/workflow', 'GET');
    if (!Array.isArray(wfItems)) throw new Error("Workflow items is not an array");
    console.log(`    -> Workflow records retrieved: ${wfItems.length} items`);
}

runTests();
