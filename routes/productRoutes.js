const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");

// Multer setup – same
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

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

// GET all products – same
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single – same
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const productData = req.body;

    productData.stock = Number(productData.stock) || 0;
    productData.costPrice = Number(productData.costPrice) || 0;
    productData.salePrice = Number(productData.salePrice) || 0;
    productData.minStockAlert = Number(productData.minStockAlert) || 10;

    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    const product = new Product(productData);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("POST product error:", err);
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = req.body;

    if (updateData.stock !== undefined)
      updateData.stock = Number(updateData.stock) || 0;
    if (updateData.costPrice !== undefined)
      updateData.costPrice = Number(updateData.costPrice) || 0;
    if (updateData.salePrice !== undefined)
      updateData.salePrice = Number(updateData.salePrice) || 0;
    if (updateData.minStockAlert !== undefined)
      updateData.minStockAlert = Number(updateData.minStockAlert) || 10;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error("PUT product error:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE – same
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
