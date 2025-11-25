import express from "express";
import Investment from "../models/Investment.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all investments of logged-in user
router.get("/", protect, async (req, res) => {
  const investments = await Investment.find({ user: req.user._id });
  res.json(investments);
});

export default router;
