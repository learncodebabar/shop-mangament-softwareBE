const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    email: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    address: String,
    cnic: String,
    creditLimit: { type: Number, default: 50000 },
    dueDate: Date,
    totalPurchases: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    remainingDue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
