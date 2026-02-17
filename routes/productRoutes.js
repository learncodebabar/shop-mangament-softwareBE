const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");

// Use memoryStorage for Vercel
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product - HANDLES BOTH WITH AND WITHOUT IMAGE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Creating product...");
    console.log("Body:", req.body);
    console.log("File:", req.file ? "Yes" : "No");
    
    const productData = { ...req.body };

    // Convert string values to numbers
    productData.stock = Number(productData.stock) || 0;
    productData.costPrice = Number(productData.costPrice) || 0;
    productData.salePrice = Number(productData.salePrice) || 0;
    productData.minStockAlert = Number(productData.minStockAlert) || 10;

    // Handle empty strings for optional fields
    if (!productData.category || productData.category === "") {
      delete productData.category;
    }
    if (!productData.location || productData.location === "") {
      delete productData.location;
    }
    if (!productData.supplier || productData.supplier === "") {
      delete productData.supplier;
    }

    // Handle image - ONLY if file exists
    if (req.file) {
      // Convert to base64 for storage
      const imageBase64 = req.file.buffer.toString('base64');
      productData.image = `data:${req.file.mimetype};base64,${imageBase64}`;
      console.log("Image added, size:", req.file.buffer.length);
    } else {
      // No image uploaded - don't include image field
      console.log("No image uploaded");
    }

    const product = new Product(productData);
    const newProduct = await product.save();
    
    console.log("Product created successfully:", newProduct._id);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate SKU or barcode"
      });
    }
    
    res.status(400).json({ message: err.message });
  }
});

// PUT update product - HANDLES BOTH WITH AND WITHOUT IMAGE
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("Updating product:", req.params.id);
    
    const updateData = { ...req.body };

    // Convert string values to numbers
    if (updateData.stock !== undefined)
      updateData.stock = Number(updateData.stock) || 0;
    if (updateData.costPrice !== undefined)
      updateData.costPrice = Number(updateData.costPrice) || 0;
    if (updateData.salePrice !== undefined)
      updateData.salePrice = Number(updateData.salePrice) || 0;
    if (updateData.minStockAlert !== undefined)
      updateData.minStockAlert = Number(updateData.minStockAlert) || 10;

    // Handle empty strings
    if (updateData.category === "") updateData.category = null;
    if (updateData.location === "") updateData.location = null;
    if (updateData.supplier === "") updateData.supplier = "";

    // Handle image - ONLY if new file is uploaded
    if (req.file) {
      const imageBase64 = req.file.buffer.toString('base64');
      updateData.image = `data:${req.file.mimetype};base64,${imageBase64}`;
      console.log("New image uploaded");
    }
    // If no new file, keep existing image (don't include image field in update)

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product updated successfully");
    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;