const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ShopSettings = require("../models/ShopSettings");

// Multer setup  for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "logo" + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET current shop settings
router.get("/", async (req, res) => {
  try {
    const settings = await ShopSettings.getInstance();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// POST / PUT to update settings
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const settings = await ShopSettings.getInstance();

    // Update all text fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "logo" && req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });

    if (req.file) {
      settings.logo = `/uploads/${req.file.filename}`;
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

router.put("/", async (req, res) => {
  try {
    const settings = await ShopSettings.getInstance();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
