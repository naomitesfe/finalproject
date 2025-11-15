import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender_id: {
    type: String,
    required: true,
  },
  recipient_id: {
    type: String,
    required: true,
  },
  subject: String,
  content: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  conversation_id: String,
  related_type: {
    type: String,
    enum: ["investment", "property", "business", "general"]
  },
  related_id: String,
}, { timestamps: true });

export default mongoose.model("Message", MessageSchema);
