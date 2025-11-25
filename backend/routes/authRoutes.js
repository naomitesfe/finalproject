import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// -------------------
// Signup
// -------------------
router.post("/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({ fullName, email, password, role });
  if (user) {
    res.status(201).json({
      user: { email: user.email },
      profile: { fullName: user.fullName, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// -------------------
// Login
// -------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      user: { email: user.email },
      profile: { fullName: user.fullName, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

export default router;
