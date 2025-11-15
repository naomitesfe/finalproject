import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  payerId: String,
  receiverId: String,
  amount: Number,
  status: String,
  paymentMethod: String,
  type: String,
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
