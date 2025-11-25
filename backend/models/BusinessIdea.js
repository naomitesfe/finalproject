import mongoose from "mongoose";

const businessIdeaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // optional relation
});

export default mongoose.model("BusinessIdea", businessIdeaSchema);
