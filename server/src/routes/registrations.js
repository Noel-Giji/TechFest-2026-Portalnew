const express = require("express");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");

const router = express.Router();

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function handleDbError(error, res) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "This student is already registered for that event."
    });
  }
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({ message: messages.join(". ") });
  }
  console.error(error);
  return res.status(500).json({ message: "Database operation failed" });
}

// GET all registrations
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 }).lean();
    res.json(registrations);
  } catch (error) {
    handleDbError(error, res);
  }
});

// GET one registration
router.get("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid registration ID" });
  }
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    res.json(registration);
  } catch (error) {
    handleDbError(error, res);
  }
});

// CREATE registration
router.post("/", async (req, res) => {
  try {
    const registration = await Registration.create(req.body);
    res.status(201).json(registration);
  } catch (error) {
    handleDbError(error, res);
  }
});

// UPDATE registration
router.put("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid registration ID" });
  }
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    res.json(registration);
  } catch (error) {
    handleDbError(error, res);
  }
});

// DELETE registration
router.delete("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid registration ID" });
  }
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    res.json({ message: "Registration deleted successfully" });
  } catch (error) {
    handleDbError(error, res);
  }
});

module.exports = router;