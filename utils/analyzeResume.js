const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeResume(resumeText, jobRole) {
  try {
    console.log("Starting resume analysis for job role:", jobRole);

    // Check if resume text is valid
    if (!resumeText || resumeText.trim().length < 10) {
      throw new Error("Resume text is too short or empty");
    }

    // Simple extraction prompt
    const extractionPrompt = `Extract from this resume:
Name: [full name]
Email: [email]
Phone: [phone number]
Skills: [comma-separated skills]
Education: [degrees and schools]
Experience: [jobs and companies]

Resume text:
${resumeText.substring(0, 2000)}

Format as simple text, not JSON.`;

    console.log("Making extraction API call...");
    const extractionResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: extractionPrompt }],
      max_tokens: 800,
      temperature: 0.1,
    });

    let extractedData;
    try {
      const rawContent = extractionResponse.choices[0].message.content.trim();
      console.log("Raw extraction response length:", rawContent.length);

      // Parse the simple text format
      const lines = rawContent.split("\n");
      extractedData = {
        candidateName: "Unknown",
        email: null,
        phone: null,
        skills: [],
        education: [],
        experience: [],
      };

      lines.forEach((line) => {
        if (line.toLowerCase().includes("name:")) {
          extractedData.candidateName = line.split(":")[1]?.trim() || "Unknown";
        } else if (line.toLowerCase().includes("email:")) {
          extractedData.email = line.split(":")[1]?.trim() || null;
        } else if (line.toLowerCase().includes("phone:")) {
          extractedData.phone = line.split(":")[1]?.trim() || null;
        } else if (line.toLowerCase().includes("skills:")) {
          const skillsText = line.split(":")[1]?.trim() || "";
          extractedData.skills = skillsText
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        } else if (line.toLowerCase().includes("education:")) {
          const eduText = line.split(":")[1]?.trim() || "";
          extractedData.education = eduText
            ? [{ degree: eduText, institution: "", year: "" }]
            : [];
        } else if (line.toLowerCase().includes("experience:")) {
          const expText = line.split(":")[1]?.trim() || "";
          extractedData.experience = expText
            ? [{ position: expText, company: "", duration: "" }]
            : [];
        }
      });

      console.log(
        "Successfully parsed extracted data for:",
        extractedData.candidateName,
      );
    } catch (parseError) {
      console.error("Extraction parse error:", parseError.message);
      extractedData = {
        candidateName: "Unknown Candidate",
        email: null,
        phone: null,
        skills: ["Not detected"],
        education: [],
        experience: [],
      };
    }

    // Detailed analysis prompt
    const analysisPrompt = `Analyze this resume for the ${jobRole} position.

Skills: ${extractedData.skills.join(", ")}
Experience: ${extractedData.experience.length} items
Education: ${extractedData.education.length} items

Resume text: ${resumeText.substring(0, 1500)}

Please provide a highly detailed analysis EXACTLY in this Markdown format:

# 🎯 Resume Analysis for ${jobRole}

### ⭐ Match Percentage: [ATS Score 0-100]% 
*[Brief explanation of score and proficiency]*

### 💰 Estimated Package: [Estimated package e.g., 3.5 to 4.5 LPA] 
*[Brief explanation]*

### ⏳ Estimated Learning Time: [Estimated time e.g., 3-4 months] 
*[Brief explanation]*

---

## ❌ Missing Skills

- ⚡ **[Skill 1]**: [Reason for skill 1]
- 🟦 **[Skill 2]**: [Reason for skill 2]
*(Add more missing skills as bullet points with consistent emojis)*

---

## 💡 Skill Suggestions

| Area | Suggested Skills |
| :--- | :--- |
| 🔥 **[Area 1]** | [Suggestions] |
| 🛠️ **[Area 2]** | [Suggestions] |
*(Add more categories as needed, keep it neat)*

---

## 📅 Learning Plan

### Month 1
- 📘 [Action 1]
- 🟦 [Action 2]

### Month 2
- 🔧 [Action 1]
- ⚙️ [Action 2]

### Month 3
- 🧪 [Action 1]
- ✅ [Action 2]

*(Add more months explicitly as Month 4, Month 5, etc., necessary to fill the gaps)*`;

    console.log("Making analysis API call...");
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: analysisPrompt }],
      max_tokens: 1500,
      temperature: 0.3,
    });

    let analysisData;
    let textAnalysis;
    try {
      const rawContent = analysisResponse.choices[0].message.content.trim();
      console.log("Raw analysis response length:", rawContent.length);

      textAnalysis = rawContent;

      // Parse the ATS Score from the generated markdown
      const scoreMatch = rawContent.match(/Match Percentage:.*?(\d+)%/i) || rawContent.match(/⭐.*?(\d+)%/i);
      let atsScore = 50; // default
      if (scoreMatch && scoreMatch[1]) {
        atsScore = parseInt(scoreMatch[1]);
      } else {
        // Fallback generic number search
        const genericMatch = rawContent.match(/(\d+)%/);
        if (genericMatch) {
          atsScore = parseInt(genericMatch[1]);
        }
      }

      // Simple missing skills extraction for database structure
      const missingSkills = [];
      const lines = rawContent.split("\\n");
      let inMissing = false;
      lines.forEach(line => {
        if (line.includes("❌ Missing Skills")) inMissing = true;
        else if (line.includes("💡 Skill Suggestions")) inMissing = false;
        else if (inMissing && line.trim().length > 0) {
          const cleaned = line.replace(/^[\\⚡\\🟦\\🔧\\🧪\\🎨\\-\\>\\*\\s]+/, "").split("(");
          if (cleaned[0].trim().length > 0) {
            missingSkills.push({
              skill: cleaned[0].trim(),
              reason: cleaned[1] ? cleaned[1].replace(")", "").trim() : "Required for role"
            });
          }
        }
      });

      analysisData = {
        atsScore: atsScore,
        missingSkills: missingSkills.length > 0 ? missingSkills : [{ skill: "None detected", reason: "" }],
        suggestedRoadmap: "Refer to the detailed Learning Plan in the analysis above.",
      };

      console.log(
        "Successfully parsed analysis data, ATS score:",
        analysisData.atsScore,
      );
    } catch (parseError) {
      console.error("Analysis parse error:", parseError.message);
      analysisData = {
        atsScore: Math.floor(Math.random() * 40) + 30,
        missingSkills: [
          { skill: "Analysis unavailable", reason: "Please try again" },
        ],
        suggestedRoadmap: "Unable to generate roadmap at this time",
      };
      textAnalysis = "Unable to parse the generated response.";
    }

    console.log("Generated textAnalysis:", textAnalysis.substring(0, 200));

    // Combine extracted data with analysis
    return {
      ...extractedData,
      ...analysisData,
      textAnalysis: textAnalysis,
    };
  } catch (error) {
    console.error("Error in analyzeResume:", error);
    // Return basic fallback data that won't cause database errors
    return {
      candidateName: "Analysis Failed",
      email: null,
      phone: null,
      skills: ["Analysis failed"],
      education: [],
      experience: [],
      atsScore: 0,
      missingSkills: [
        { skill: "Unable to analyze", reason: "Please try again" },
      ],
      suggestedRoadmap: "Please try uploading your resume again",
      textAnalysis: `❌ Resume Analysis Failed

We encountered an error while analyzing your resume. This might be due to:

- Invalid PDF format
- Network connectivity issues
- Temporary service unavailability

Please try again with a different PDF file or contact support if the issue persists.`,
    };
  }
}

module.exports = analyzeResume;
