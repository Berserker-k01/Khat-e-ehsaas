// app.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

// --- IMPORT ROUTES ---
const authRoutes = require('./src/routes/auth.routes');
const viewRoutes = require('./src/routes/views.routes');
const letterRoutes = require('./src/routes/letter.routes');
const galleryRoutes = require('./src/routes/gallery.routes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// --- Real-time User Tracking ---
const onlineUsers = new Map(); // (userId -> socketId)

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected... Dil Jud Gaya! ❤️'))
    .catch(err => console.log(err));

// --- Middleware ---
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// --- View Engine Setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/', viewRoutes);

// --- Anti-Sleep Mechanism for Render ---
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

const keepAlive = () => {
    const url = process.env.RENDER_EXTERNAL_URL;
    if (url) {
        const https = require('https');
        https.get(`${url}/ping`, (res) => {
            console.log(`Self-ping: Status Code ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`Self-ping error: ${err.message}`);
        });
    }
};
// Appeler keepAlive toutes les 14 minutes (840000 ms)
setInterval(keepAlive, 840000);

// --- Socket.IO Connection ---
io.on('connection', (socket) => {
    console.log('Ek naya Ehsaas juda hai...', socket.id);

    // FIX: Event ko 'join' kar diya (global-sockets.js se match karne ke liye)
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId); // User ko uske personal room mein join karwaya
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} (Socket: ${socket.id}) online hua.`);
        }
    });

    // === YEH HAI NOTIFICATION KA BACKEND LOGIC ===
    // Jab koi 'letterOpened' event bhejega...
    socket.on('letterOpened', (data) => {
        // 'data' object mein hoga: { partnerId, openerUsername, letterCategory }
        const partnerSocketId = onlineUsers.get(data.partnerId);

        if (partnerSocketId) {
            // ...to sirf uske partner ko 'notifyLetterOpened' event bhejo
            io.to(partnerSocketId).emit('notifyLetterOpened', {
                username: data.openerUsername,
                category: data.letterCategory
            });
        }
    });
    // ============================================

    socket.on('disconnect', () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} offline ho gaya.`);
                break;
            }
        }
        console.log('Ehsaas toot gaya...', socket.id);
    });
});

// --- Server Listening ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server dil ki baatein sun raha hai on port ${PORT}`));