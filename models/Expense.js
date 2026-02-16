const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "salary",
        "purchase",
        "utility",
        "office",
        "food",
        "transport",
        "other",
      ],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    employee: {
      type: String, // Employee name
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "credit"],
      default: "cash",
    },
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", ExpenseSchema);
