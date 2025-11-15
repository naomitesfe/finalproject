// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: '*' } // replace with frontend URL in production
});

app.use(cors());
app.use(express.json());

// --------------------
// MongoDB connection
// --------------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// --------------------
// Mongoose Schemas
// --------------------
const User = mongoose.model('User', new mongoose.Schema({
  full_name: String,
  role: String,
  location: String,
  rating: Number,
  total_reviews: Number,
  created_at: Date
}));

const BusinessIdea = mongoose.model('BusinessIdea', new mongoose.Schema({
  title: String,
  status: String,
  created_at: Date
}));

const Investment = mongoose.model('Investment', new mongoose.Schema({
  amount: Number,
  status: String,
  roi_percentage: Number,
  created_at: Date
}));

const Property = mongoose.model('Property', new mongoose.Schema({
  title: String,
  status: String,
  created_at: Date
}));

// --------------------
// REST endpoints
// --------------------

// Admin dashboard data
app.get('/api/dashboard', async (req, res) => {
  const users = await User.find();
  const businessIdeas = await BusinessIdea.find();
  const investments = await Investment.find();
  const properties = await Property.find();
  res.json({ users, businessIdeas, investments, properties });
});

// Basic server test
app.get('/', (req, res) => {
  res.send('Socket.IO & MongoDB server running');
});

// --------------------
// Socket.IO events
// --------------------
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Real-time messaging
  socket.on('send_message', ({ senderId, recipientId, content }) => {
    const recipientSocket = connectedUsers.get(recipientId);

    const messageData = {
      senderId,
      recipientId,
      content,
      created_at: new Date()
    };

    // Emit to recipient if online
    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_message', messageData);
    }

    // Emit back to sender
    socket.emit('receive_message', messageData);

    // TODO: save message to DB if needed
  });

  // Real-time notifications
  socket.on('send_notification', ({ userId, notification }) => {
    const userSocket = connectedUsers.get(userId);

    if (userSocket) {
      io.to(userSocket).emit('receive_notification', {
        ...notification,
        created_at: new Date()
      });
    }

    // TODO: save notification to DB
  });

  // Dashboard room for admin
  socket.on('join_dashboard', () => {
    socket.join('dashboard');
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, sId] of connectedUsers) {
      if (sId === socket.id) connectedUsers.delete(userId);
    }
  });
});

// --------------------
// Real-time dashboard updates
// --------------------
const emitDashboardUpdate = async () => {
  const users = await User.find();
  const businessIdeas = await BusinessIdea.find();
  const investments = await Investment.find();
  const properties = await Property.find();

  io.to('dashboard').emit('dashboard-update', {
    users,
    businessIdeas,
    investments,
    properties
  });
};

// Example: Call emitDashboardUpdate() whenever DB changes (use in CRUD routes or Mongoose hooks)

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
