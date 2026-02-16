const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    customerInfo: {
      // For temporary credit
      name: String,
      phone: String,
    },
    saleType: {
      type: String,
      enum: ["cash", "permanent", "temporary"],
      required: true,
    },
    payments: [
      {
        method: String,
        amount: Number,
        detail: String,
        date: { type: Date, default: Date.now },
      },
    ],
    paidAmount: { type: Number, default: 0 },
    subtotal: Number,
    discountPercent: { type: Number, default: 0 },
    serviceCharge: Number,
    tax: Number,
    total: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sale", SaleSchema);
