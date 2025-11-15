import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  realtorId: { type: String, required: true },
  title: String,
  description: String,
  industry: String,
  items: [String],
  price: Number,
  minimumOrder: Number,
  estimatedCapital: Number,
  status: { type: String, default: 'available' },
}, { timestamps: true });

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
