const axios = require('axios');

const API_URL = 'http://127.0.0.1:4000/api';

async function verifyAuthBulk() {
    console.log('--- VERIFYING AUTH: 5 ACCOUNTS REGISTRATION & LOGIN ---');

    const testUsers = [
        { name: 'Test User 1', email: 'test1@example.com', password: 'password123', role: 'customer' },
        { name: 'Test User 2', email: 'test2@example.com', password: 'password123', role: 'customer' },
        { name: 'Test User 3', email: 'test3@example.com', password: 'password123', role: 'customer' },
        { name: 'Test User 4', email: 'test4@example.com', password: 'password123', role: 'customer' },
        { name: 'Test User 5', email: 'test5@example.com', password: 'password123', role: 'staff' },
    ];

    for (let u of testUsers) {
        console.log(`\nProcessing: ${u.email}`);

        // 1. Register
        try {
            console.log(`  Registering ${u.email}...`);
            const regRes = await axios.post(`${API_URL}/auth/register`, u);
            console.log(`  ✅ Registered successfully. Token: ${regRes.data.token.substring(0, 10)}...`);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            if (errorMsg.includes('duplicate key') || errorMsg.includes('already exists') || err.response?.status === 400 || err.response?.status === 409) {
                console.log(`  ⚠️ User already exists or registration issue (${errorMsg}). Proceeding to login check.`);
            } else {
                console.error(`  ❌ Registration failed:`, errorMsg);
                continue;
            }
        }

        // 2. Login
        try {
            console.log(`  Logging in ${u.email}...`);
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: u.email,
                password: u.password
            });
            console.log(`  ✅ Logged in successfully. Token: ${loginRes.data.token.substring(0, 10)}...`);
        } catch (err) {
            console.error(`  ❌ Login failed:`, err.response?.data?.message || err.message);
        }
    }

    console.log('\n--- BULK AUTH VERIFICATION COMPLETE ---');
}

verifyAuthBulk();
