// routes/locations.js
const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// GET all
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find().populate(
      "assignedStaff",
      "name role"
    );
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST
router.post("/", async (req, res) => {
  const location = new Location(req.body);
  try {
    const saved = await location.save();
    const populated = await Location.findById(saved._id).populate(
      "assignedStaff",
      "name role"
    );
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT
router.put("/:id", async (req, res) => {
  try {
    const updated = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignedStaff", "name role");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH toggle active
router.patch("/:id/toggle", async (req, res) => {
  try {
    const loc = await Location.findById(req.params.id);
    loc.isActive = req.body.isActive;
    const saved = await loc.save();
    const populated = await Location.findById(saved._id).populate(
      "assignedStaff",
      "name role"
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
