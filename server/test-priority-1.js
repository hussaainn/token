const axios = require('axios');
const { io } = require('socket.io-client');

const API_URL = 'http://127.0.0.1:5055/api';
const SOCKET_URL = 'http://127.0.0.1:5055';

async function verifyPriority1() {
    console.log('--- VERIFYING PRIORITY 1: SOCKET & QR ---');

    let socket;
    try {
        // 1. Setup Admin Socket
        console.log('1. Logging in as Admin to listen for socket events...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@mercysalon.com',
            password: 'password123'
        });
        const { token, user } = loginRes.data;

        socket = io(SOCKET_URL, {
            extraHeaders: { Authorization: `Bearer ${token}` }
        });

        socket.on('connect', () => {
            console.log('✅ Admin Socket connected');
            socket.emit('join:admin');
        });

        const checkinPromise = new Promise((resolve) => {
            socket.on('token:checkin', (data) => {
                console.log('✅ Socket Event Received: token:checkin', data);
                resolve(data);
            });
            // Timeout if event not received
            setTimeout(() => resolve(null), 5000);
        });

        const statusPromise = new Promise((resolve) => {
            socket.on('token:statusChange', (data) => {
                console.log('✅ Socket Event Received: token:statusChange', data);
                resolve(data);
            });
            setTimeout(() => resolve(null), 5000);
        });

        // 2. Perform QR Check-in (using a known qrToken from seeder or finding one)
        console.log('2. Finding a waiting token to check in...');
        const tokenRes = await axios.get(`${API_URL}/tokens?status=waiting`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (tokenRes.data.tokens.length === 0) {
            console.log('❌ No waiting tokens found. Run seeder.');
            return;
        }

        const targetToken = tokenRes.data.tokens[0];
        console.log(`Target Token: ${targetToken.tokenNumber} (qrToken: ${targetToken.qrToken})`);

        console.log('3. Triggering QR Check-in...');
        const checkinRes = await axios.post(`${API_URL}/tokens/checkin`, {
            qrToken: targetToken.qrToken
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Check-in status:', checkinRes.status);
        console.log('Check-in data:', checkinRes.data.token.status, checkinRes.data.token.arrivalStatus);

        // 3. Wait for events
        const event1 = await checkinPromise;
        const event2 = await statusPromise;

        if (event1 && event2) {
            console.log('\n🌟 PRIORITY 1 VERIFIED: Socket signals and QR logic work together!');
        } else {
            console.log('\n⚠️ Partial verification. Some socket events missing. (Check if server already sent them)');
        }

    } catch (err) {
        console.error('❌ Verification failed:', err.response?.data?.message || err.message);
    } finally {
        if (socket) socket.disconnect();
        process.exit();
    }
}

verifyPriority1();
