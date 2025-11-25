import express from "express";
import ChatSession from "../models/ChatSession.js";
import Message from "../models/Message.js";
import { clerkClient } from "@clerk/clerk-sdk-node";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* -------------------------
   AUTH MIDDLEWARE
-------------------------- */
async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing token" });

    const session = await clerkClient.sessions.verifySession(token);
    req.userId = session.userId;
    next();
  } catch (e) {
    console.log("AUTH ERROR:", e);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/* -------------------------
   GET ALL CHAT SESSIONS 
-------------------------- */
router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const sessions = await ChatSession.find({
      entrepreneur_id: req.userId,
    }).sort({ updatedAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

/* -------------------------
   GET ONE SESSION
-------------------------- */
router.get("/sessions/:id", requireAuth, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

/* -------------------------
   CREATE NEW SESSION
-------------------------- */
router.post("/sessions", requireAuth, async (req, res) => {
  try {
    const session = await ChatSession.create({
      entrepreneur_id: req.userId,
      session_name: req.body.session_name || "New Chat Session",
      business_context: req.body.business_context || {},
      messages: [],
    });

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

/* -------------------------
   SEND USER MESSAGE
-------------------------- */
router.post("/sessions/:id/message", requireAuth, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const newMsg = {
      role: "user",
      content: req.body.content,
      timestamp: new Date(),
    };

    session.messages.push(newMsg);
    await session.save();

    res.json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/* -------------------------
   STREAM AI RESPONSE
-------------------------- */
router.post("/sessions/:id/ai", requireAuth, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const userMessages = session.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Add latest user message
    userMessages.push({
      role: "user",
      content: req.body.prompt,
    });

    // STREAM HEADERS
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // OPENAI STREAMING
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: userMessages,
    });

    let fullMessage = "";

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || "";

      fullMessage += token;

      res.write(`data: ${token}\n\n`);
    }

    // Save AI message in DB
    session.messages.push({
      role: "assistant",
      content: fullMessage,
      timestamp: new Date(),
    });

    await session.save();

    res.write("data: [END]\n\n");
    res.end();
  } catch (err) {
    console.error("STREAM ERROR:", err);
    res.status(500).json({ error: "AI Stream Error" });
  }
});

/* -------------------------
   EXPORT ROUTER
-------------------------- */
export default router;
