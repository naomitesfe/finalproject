import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  roiPercentage: { type: Number },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  businessIdea: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessIdea" }
});

export default mongoose.model("Investment", investmentSchema);
