const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, unique: true },
    barcode: String,
    category: String,
    location: String,
    brand: String,
    supplier: String,
    unit: String,
    stock: { type: Number, default: 0 },
    costPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    minStockAlert: { type: Number, default: 10 },
    image: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
