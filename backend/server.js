import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import businessIdeasRoutes from "./routes/businessIdeasRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";

import User from "./models/User.js";
import BusinessIdea from "./models/BusinessIdea.js";
import Investment from "./models/Investment.js";
import Property from "./models/Property.js";

import { protect, adminOnly } from "./middleware/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();

// ---------------------------
// ✅ CORS FIXED FOR RENDER + VERCEL
// ---------------------------
const allowedOrigins = [
  "https://teftef-business-ecosystem.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  })
);

// Fix preflight
app.options("*", cors());

// Extra header fix (Render sometimes needs this)
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://teftef-business-ecosystem.vercel.app"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  next();
});

app.use(express.json());

// ---------------------------
// ROUTES
// ---------------------------

app.use("/api/auth", authRoutes);
app.use("/api/business-ideas", businessIdeasRoutes);
app.use("/api/investments", investmentRoutes);

app.get("/", (req, res) => res.send("Backend is running on Render 🚀"));

// Admin Dashboard Data
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

// ---------------------------
// SOCKET.IO
// ---------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("send_message", ({ senderId, recipientId, content }) => {
    const recipientSocket = connectedUsers.get(recipientId);
    const messageData = {
      senderId,
      recipientId,
      content,
      createdAt: new Date(),
    };

    if (recipientSocket)
      io.to(recipientSocket).emit("receive_message", messageData);

    socket.emit("receive_message", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let [userId, sId] of connectedUsers) {
      if (sId === socket.id) connectedUsers.delete(userId);
    }
  });
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
