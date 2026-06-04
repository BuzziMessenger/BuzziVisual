const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "data:", "blob:"],
        },
    },
}));

// Connect to MongoDB (production: set MONGO_URI env var)
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buzzi';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, 'public')));

let activeUsers = {};
let chatHistory = [];

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        socket.username = data.username;
        activeUsers[socket.id] = { 
            username: data.username, 
            pm: data.pm, 
            color: data.color, 
            status: 'Online',
            music: 'Stilte'
        };
        // load last messages from DB if available, fallback to in-memory history
        if (mongoose.connection.readyState === 1) {
            Message.find().sort({ createdAt: 1 }).limit(50).lean().then(docs => {
                const history = docs.map(m => ({ username: m.sender, text: m.text, timestamp: new Date(m.createdAt).toLocaleTimeString() }));
                socket.emit('load-history', history);
            }).catch(err => {
                console.error('Failed to load history from DB:', err);
                socket.emit('load-history', chatHistory);
            });
        } else {
            socket.emit('load-history', chatHistory);
        }
        io.emit('update-user-list', Object.values(activeUsers));
    });

    socket.on('update-status', (status) => {
        if(activeUsers[socket.id]) {
            activeUsers[socket.id].status = status;
            io.emit('update-user-list', Object.values(activeUsers));
        }
    });

    socket.on('buzz', () => { io.emit('incoming-buzz'); });

    socket.on('typing', () => { socket.broadcast.emit('user-typing', socket.username); });

    socket.on('chat message', (data) => {
        const msg = { 
            username: socket.username, 
            text: data.text, 
            color: data.color,
            timestamp: new Date().toLocaleTimeString() 
        };
        chatHistory.push(msg);
        if (chatHistory.length > 50) chatHistory.shift();
        io.emit('chat message', msg);
        // persist message to MongoDB when available
        if (mongoose.connection.readyState === 1) {
            const dbMsg = new Message({ sender: socket.username, text: data.text });
            dbMsg.save().catch(err => console.error('Failed to save message:', err));
        }
    });

    socket.on('disconnect', () => {
        delete activeUsers[socket.id];
        io.emit('update-user-list', Object.values(activeUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Buzzi Messenger draait op poort ${PORT}`));