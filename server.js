// const express = require("express");
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const analyzeResume = require("./utils/analyzeResume");
// const cors = require("cors");
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// app.post("/analyze", upload.single("resume"), async (req, res) => {
//   try {
//     const jobRole = req.body.jobRole;
//     const pdfBuffer = req.file.buffer;

//     const data = await pdfParse(pdfBuffer);
//     const analysis = await analyzeResume(data.text, jobRole);

//     res.json(analysis);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Resume analysis failed" });
//   }
// });

// // login or registation ke liye code --->

// mongoose.
//     connect(process.env.MONGO_URI,{
//         dbName:"ResumeAnalyzerData"
//     },
// ).then(()=>console.log("MongoDB Connected..")).catch((err)=>console.log(err));

//   const authRoutes = require('./Routers/Auth');
//   app.use('/api', authRoutes);

// // bas --<

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const analyzeResume = require("./utils/analyzeResume");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const User = require("./Models/User");
const Resume = require("./Models/Resume");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "pages")));
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB (optional - analysis works without it)
let dbConnected = false;
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "ResumeAnalyzerData",
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    dbConnected = true;
  })
  .catch((err) => {
    console.log(
      "⚠️ MongoDB connection failed - analysis will work but data won't be saved",
    );
    console.log(
      "To fix: Add your IP to MongoDB Atlas whitelist or use local MongoDB",
    );
    console.log("Analysis functionality remains available");
    dbConnected = false;
  });

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    },
  );
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Resume Analysis Endpoint (Protected)
app.post(
  "/analyze",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("Received analyze request for user:", req.user.userId);

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: "Resume file is required" });
      }

      // Validate file type
      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        console.log("Invalid file type:", req.file.mimetype);
        return res.status(400).json({
          error: "Only PDF files are allowed. Please upload a PDF resume.",
        });
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        console.log("File too large:", req.file.size);
        return res
          .status(400)
          .json({ error: "File size must be less than 10MB." });
      }

      const jobRole = req.body.jobRole || "";
      if (!jobRole) {
        return res
          .status(400)
          .json({ error: "Job role is required for analysis" });
      }
      const userId = req.user.userId;
      const pdfBuffer = req.file.buffer;

      console.log("Parsing PDF...");
      let data;
      try {
        data = await pdfParse(pdfBuffer);
        console.log(
          "PDF parsed successfully, text length:",
          data.text ? data.text.length : 0,
        );

        if (!data.text || data.text.trim().length === 0) {
          console.log(
            "PDF has no extractable text, trying alternative parsing...",
          );
          // Try to extract text from pages array if available
          if (data.pages && data.pages.length > 0) {
            let extractedText = "";
            data.pages.forEach((page, index) => {
              if (page.text) {
                extractedText += page.text + "\n";
              }
            });
            if (extractedText.trim().length > 0) {
              data.text = extractedText;
              console.log(
                "Extracted text from pages, length:",
                data.text.length,
              );
            } else {
              throw new Error(
                "PDF appears to be empty or contains no extractable text",
              );
            }
          } else {
            throw new Error(
              "PDF appears to be empty or contains no extractable text",
            );
          }
        }

        // Validate minimum text length
        if (data.text.trim().length < 50) {
          throw new Error(
            "PDF contains too little text for meaningful analysis. Please ensure your resume has sufficient content.",
          );
        }
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        let errorMessage = "Unable to parse PDF file.";

        if (pdfError.message.includes("Invalid PDF")) {
          errorMessage =
            "Invalid PDF file. Please ensure you upload a valid PDF document.";
        } else if (pdfError.message.includes("encrypted")) {
          errorMessage =
            "PDF is password-protected. Please remove password protection and try again.";
        } else if (pdfError.message.includes("empty")) {
          errorMessage =
            "PDF appears to be empty or contains no readable text. Please check your resume content.";
        } else {
          errorMessage = `PDF parsing failed: ${pdfError.message}`;
        }

        return res.status(400).json({ error: errorMessage });
      }

      console.log("Analyzing resume...");
      const analysisResult = await analyzeResume(data.text, jobRole);
      console.log(
        "Analysis completed, result keys:",
        Object.keys(analysisResult),
      );
      console.log(
        "Analysis textAnalysis length:",
        analysisResult.textAnalysis ? analysisResult.textAnalysis.length : 0,
      );
      console.log(
        "Analysis textAnalysis preview:",
        analysisResult.textAnalysis
          ? analysisResult.textAnalysis.substring(0, 100)
          : "EMPTY",
      );

      // Save structured resume data to database (only if connected)
      let saved = false;
      let resumeId = null;

      if (dbConnected) {
        const resume = new Resume({
          userId,
          candidateName: analysisResult.candidateName || "Unknown",
          email: analysisResult.email,
          phone: analysisResult.phone,
          skills: analysisResult.skills || [],
          education: analysisResult.education || [],
          experience: analysisResult.experience || [],
          atsScore: analysisResult.atsScore || 0,
          missingSkills: analysisResult.missingSkills || [],
          suggestedRoadmap: analysisResult.suggestedRoadmap || "",
          jobRole,
        });

        console.log("Saving resume to database...");
        console.log("Resume data to save:", {
          userId: resume.userId,
          candidateName: resume.candidateName,
          skillsCount: resume.skills.length,
          atsScore: resume.atsScore,
        });

        try {
          await resume.save();
          console.log("Resume saved successfully with ID:", resume._id);
          saved = true;
          resumeId = resume._id;
        } catch (saveError) {
          console.error("Database save error:", saveError);
          console.log(
            "Continuing with analysis - data not saved due to database error",
          );
        }
      } else {
        console.log(
          "Database not connected - analysis completed but data not saved",
        );
      }

      res.json({
        analysis: analysisResult.textAnalysis, // Keep for backward compatibility
        textAnalysis: analysisResult.textAnalysis,
        resumeId: resumeId,
        saved: saved,
        structuredData: {
          candidateName: analysisResult.candidateName,
          email: analysisResult.email,
          phone: analysisResult.phone,
          skills: analysisResult.skills,
          education: analysisResult.education,
          experience: analysisResult.experience,
          atsScore: analysisResult.atsScore,
          missingSkills: analysisResult.missingSkills,
          suggestedRoadmap: analysisResult.suggestedRoadmap,
        },
      });

      console.log("Response sent successfully");
    } catch (error) {
      console.error("Error in /analyze endpoint:", error);
      res
        .status(500)
        .json({ error: "Resume analysis failed: " + error.message });
    }
  },
);

// Auth routes
const authRoutes = require("./Routers/Auth");
app.use("/api", authRoutes);

// Get user's resumes (protected route)
app.get("/api/resumes", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const resumes = await Resume.find({ userId }).sort({ uploadedAt: -1 });

    res.json({ resumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// Get specific resume (protected route)
app.get("/api/resumes/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const resume = await Resume.findOne({ _id: req.params.id, userId });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json({ resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
  console.log("🔐 Authentication enabled with JWT");
});
