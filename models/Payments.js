const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: {
    type: String,
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  transactionId: { type: String, required: true },
  paymentStatus: { type: String, required: true }, // e.g., "COMPLETED", "PENDING"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("payments", paymentSchema);
