const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("GET categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST new category
router.post("/", async (req, res) => {
  try {
    const { name, isActive } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const existing = await Category.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const category = new Category({ name, isActive: isActive !== false });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST category error:", err);
    res.status(500).json({ message: "Failed to save" });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// PATCH toggle active
router.patch("/:id/toggle", async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Not found" });
    cat.isActive = req.body.isActive;
    const saved = await cat.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: "Toggle failed" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
