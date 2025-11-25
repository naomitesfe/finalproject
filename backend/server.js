import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

import User from "./models/User.js";
import BusinessIdea from "./models/BusinessIdea.js";
import Investment from "./models/Investment.js";
import Property from "./models/Property.js";

import { protect, adminOnly } from "./middleware/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRoutes);

// --------------------
// Test route
// --------------------
app.get("/", (req, res) => res.send("Socket.IO & MongoDB server running"));

// --------------------
// Admin Dashboard Data
// --------------------
app.get("/api/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find();
    const businessIdeas = await BusinessIdea.find();
    const investments = await Investment.find();
    const properties = await Property.find();

    res.json({ users, businessIdeas, investments, properties });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --------------------
// Socket.IO events
// --------------------
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("send_message", ({ senderId, recipientId, content }) => {
    const recipientSocket = connectedUsers.get(recipientId);
    const messageData = { senderId, recipientId, content, createdAt: new Date() };

    if (recipientSocket) io.to(recipientSocket).emit("receive_message", messageData);
    socket.emit("receive_message", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let [userId, sId] of connectedUsers) {
      if (sId === socket.id) connectedUsers.delete(userId);
    }
  });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
