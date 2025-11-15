import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const BusinessContextSchema = new mongoose.Schema({
  capital_available: Number,
  location: String,
  interests: [String],
  experience: String,
});

const ChatSessionSchema = new mongoose.Schema({
  entrepreneur_id: {
    type: String,
    required: true,
  },
  session_name: String,

  messages: [MessageSchema],

  business_context: BusinessContextSchema,

  generated_ideas: [String], // store generated idea IDs
}, { timestamps: true });

export default mongoose.model("ChatSession", ChatSessionSchema);
