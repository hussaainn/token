// Socket.io configuration and event management
let io;

const initSocket = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:3000',
                'http://172.20.10.2:5173'
            ],
            methods: ['GET', 'POST'],
            credentials: true
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join personal room for targeted notifications
        socket.on('join:room', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`👤 User ${userId} joined their room`);
        });

        // Join queue room for live queue updates
        socket.on('join:queue', () => {
            socket.join('queue:live');
        });

        // Customer sends geo location update
        socket.on('geo:update', async (data) => {
            const { tokenId, lat, lng, userId } = data;
            // Broadcast arrival status to admin room
            io.to('admin:room').emit('geo:arrival', { tokenId, lat, lng, userId });
        });

        socket.on('join:admin', () => {
            socket.join('admin:room');
            console.log(`🛡️ Admin joined admin:room — ${socket.id}`);
        });

        // Customer sends 'on my way' notification
        socket.on('customer:onway', (data) => {
            io.to('admin:room').emit('customer:onway', data);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

module.exports = { initSocket, getIO };
