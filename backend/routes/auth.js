import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const router = express.Router();

// -----------------
// Signup
// -----------------
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      role,
      password: hashed,
    });

    res.status(201).json({
      message: "User created",
      user: { id: user._id, fullName, email, role },
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// -----------------
// Login
// -----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullName: user.fullName, email, role: user.role },
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

export default router;
