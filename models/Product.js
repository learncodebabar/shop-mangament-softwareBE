const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true },
  barcode: { type: String, sparse: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  supplier: { type: String, default: '' },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
  stock: { type: Number, required: true, default: 0, min: 0 },
  costPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  minStockAlert: { type: Number, default: 10, min: 0 },
  image: { type: String, default: null }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });

module.exports = mongoose.model('Product', productSchema);