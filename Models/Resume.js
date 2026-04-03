const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Candidate Information
  candidateName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  // Extracted Skills
  skills: [
    {
      type: String,
    },
  ],
  // Structured Education and Experience
  education: [
    {
      degree: String,
      institution: String,
      year: String,
      grade: String,
    },
  ],
  experience: [
    {
      position: String,
      company: String,
      duration: String,
      description: String,
    },
  ],
  // Analysis Results
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  missingSkills: [
    {
      skill: String,
      reason: String,
    },
  ],
  suggestedRoadmap: {
    type: String,
  },
  jobRole: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", resumeSchema);
