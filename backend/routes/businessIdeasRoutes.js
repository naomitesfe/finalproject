import express from "express";
import BusinessIdea from "../models/BusinessIdea.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all business ideas of logged-in user
router.get("/", protect, async (req, res) => {
  const ideas = await BusinessIdea.find({ user: req.user._id });
  res.json(ideas);
});

// POST a new business idea
router.post("/", protect, async (req, res) => {
  const idea = await BusinessIdea.create({ ...req.body, user: req.user._id });
  res.status(201).json(idea);
});

// PUT (edit) business idea
router.put("/:id", protect, async (req, res) => {
  const idea = await BusinessIdea.findById(req.params.id);
  if (!idea) return res.status(404).json({ message: "Business idea not found" });
  if (!idea.user.equals(req.user._id)) return res.status(403).json({ message: "Unauthorized" });

  Object.assign(idea, req.body);
  await idea.save();
  res.json(idea);
});

// DELETE business idea
router.delete("/:id", protect, async (req, res) => {
  const idea = await BusinessIdea.findById(req.params.id);
  if (!idea) return res.status(404).json({ message: "Business idea not found" });
  if (!idea.user.equals(req.user._id)) return res.status(403).json({ message: "Unauthorized" });

  await idea.remove();
  res.json({ message: "Business idea deleted" });
});

export default router;
