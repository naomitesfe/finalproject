import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  status: {
    type: String,
    enum: ["available", "sold", "rented"],
    default: "available"
  },
  createdAt: { type: Date, default: Date.now },
  listedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Property", propertySchema);
