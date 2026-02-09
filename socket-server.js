const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`[SocketServer] User connected: ${socket.id}`);

    // Relay all events to all other connected clients
    socket.onAny((eventName, data) => {
        console.log(`[SocketServer] Relaying event: ${eventName}`, data);
        socket.broadcast.emit(eventName, data);
    });

    socket.on('disconnect', () => {
        console.log(`[SocketServer] User disconnected: ${socket.id}`);
    });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`[SocketServer] Local relay server running on port ${PORT}`);
    console.log(`[SocketServer] Point your mobile app to: http://<YOUR_IP>:${PORT}`);
});
