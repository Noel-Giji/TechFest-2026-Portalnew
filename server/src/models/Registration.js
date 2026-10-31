const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, "Student name is required"],
    trim: true,
    minlength: 2,
    maxlength: 80
  },
  rollNumber: {
    type: String,
    required: [true, "Roll number is required"],
    trim: true,
    uppercase: true,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    maxlength: 120,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"]
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    trim: true,
    match: [/^[0-9+()\-\s]{7,20}$/, "Enter a valid mobile number"]
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    trim: true,
    maxlength: 80
  },
  year: {
    type: String,
    required: [true, "Year is required"],
    enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"]
  },
  eventName: {
    type: String,
    required: [true, "Please choose an event"],
    enum: [
      "CodeSprint",
      "RoboRumble",
      "Designathon",
      "Tech Quiz",
      "Project Expo"
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

registrationSchema.index({ rollNumber: 1, eventName: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);