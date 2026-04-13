# 🎯 AI Resume Analyzer

> **Bridging the Gap Between Job Seekers and ATS Systems with Generative AI.**

---

## 💡 The Problem
In today's job market, **75% of resumes are rejected by Applicant Tracking Systems (ATS)** before they ever reach a human recruiter. Students and job seekers often struggle to:
- Understand why their resume isn't getting past initial screens.
- Identify specific technical or soft skill gaps for a particular role.
- Create a structured, actionable learning plan to improve their employability.

## 🛠️ The Solution
This AI Resume Analyzer leverages the power of **OpenAI's GPT-3.5-Turbo** to provide a comprehensive, transparent, and encouraging career assessment. It doesn't just "score" a resume; it acts as a virtual career coach.

### 🌟 Key Features
- **🔍 Intelligent Extraction**: Automatically parses unstructured PDF data into structured candidate profiles (Skills, Experience, Education).
- **📈 ATS Simulation**: Calculates a "Match Percentage" based on real-world hiring criteria and job role requirements.
- **❌ Gap Detection**: pinpoints exactly which skills are missing and explains *why* they are critical for the role.
- **🗺️ Personalized Roadmaps**: Generates a month-by-month learning plan to help users bridge identified gaps.
- **📊 HR-Ready Insights**: Provides data-driven evaluations that help recruiters understand a candidate's potential beyond just a list of keywords.

---

## � UI Showcase


### Landing Page
<div align="center">
  <img alt="image" src="https://github.com/user-attachments/assets/6b9fbd14-a688-4ee2-b59b-762d1202ee8b" />
 
</div>

### Upload & Target Role Selection
<div align="center">
  <img width="1883" height="914" alt="image" src="https://github.com/user-attachments/assets/f380314b-3318-4c7a-b862-488acf5fa097" />

</div>

### Detailed AI Analysis Results
<div align="center">
  <img width="1910" height="2791" alt="screencapture-localhost-3000-2026-04-04-00_20_10" src="https://github.com/user-attachments/assets/b2c59b4e-6089-4144-8584-0f9030032b27" />

</div>

---

## �🏗️ How It Was Built (Architecture)

This application is built using a high-performance **Vanilla JavaScript stack**. By avoiding heavy frameworks like React, the app remains extremely lean, fast-loading, and easy to deploy.

### 1. **Data Processing Layer (Node.js & PDF-Parse)**
- Securely handles PDF uploads using `Multer`.
- Extracts raw text from complex PDF layouts using `pdf-parse`, ensuring no candidate data is lost.

### 2. **AI Reasoning Engine (OpenAI GPT-3.5-Turbo)**
- **Two-Stage Analysis**:
    - **Stage 1 (Extraction)**: Distills raw text into structured JSON data.
    - **Stage 2 (Evaluation)**: Performs a deep-dive analysis against specific job roles to generate the ATS score and learning roadmap.
- This decoupling ensures high accuracy and professional formatting in the final report.

### 3. **Secure Auth & Persistence (JWT & MongoDB)**
- Uses **JWT (JSON Web Tokens)** for stateless, secure authentication.
- Implements **BcryptJS** for high-security password hashing.
- MongoDB stores analysis history, allowing users to track their progress over time.

---

## 🧬 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) |
| **AI/ML** | ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white) (GPT-3.5-Turbo) |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) (Atlas) |
| **Auth** | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) ![Bcrypt](https://img.shields.io/badge/Bcrypt-Grey?style=flat) |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) |

---

## 🚀 Getting Started (Step-by-Step)

Follow these steps to get your own local instance of the Resume Analyzer running.

### 1. Prerequisites
- **Node.js**: [Download and install Node.js](https://nodejs.org/) (LTS version recommended).
- **Git**: [Download and install Git](https://git-scm.com/).
- **OpenAI API Key**: Create an account at [OpenAI](https://platform.openai.com/) and generate an API key.

### 2. Clone the Repository
Open your terminal (or Command Prompt) and run:
```bash
git clone https://github.com/yourusername/resume-analyzer.git
cd resume-analyzer
```

### 3. Install Dependencies
In the same terminal, run:
```bash
npm install
```
*This will install all necessary libraries like Express, OpenAI, and Mongoose.*

### 4. Set Up Environment Variables
1.  Find the file `.env.example` in the root folder.
2.  **Rename** it to simply `.env`.
3.  Open the `.env` file in a text editor (like VS Code or Notepad) and fill in your keys:
    ```env
    OPENAI_API_KEY=sk-your-real-key-here
    MONGO_URI=your-mongodb-link (optional)
    JWT_SECRET=any-random-long-string
    PORT=3000
    ```

### 5. Run the Application
Finally, start the server:
```bash
npm start
```

### 6. Access the App
Open your web browser and go to:
**`http://localhost:3000`**

---

## 🔮 Future Advancement (Roadmap)

I am constantly looking for ways to improve the Resume Analyzer. Here are some of the features currently in development:

- **🎓 Smart Course Recommendations**: Integration with platforms like Coursera, Udemy, and edX to suggest specific courses to fill identified skill gaps.
- **💼 Real-time Job Market Data**: Syncing with live job boards (LinkedIn, Indeed) to provide the most up-to-date role requirements.
- **🤖 Mock Interview Prep**: AI-generated interview questions tailored to the candidate's specific resume and target job role.
- **📊 Progress Dashboard**: A visual history of resume scores to help users track their improvement over time.
- **✨ Advanced AI Models**: Transitioning to GPT-4o for even deeper sentiment and experience analysis.

---

## 🤝 For HR & Recruiters
This tool demonstrates my ability to:
- **Integrate complex AI APIs** into functional, value-driven products.
- **Handle unstructured data** and transform it into actionable business intelligence.
- **Implement secure, scalable authentication** and database management.
- **Focus on User Experience (UX)** by solving a real-world pain point with a clean, intuitive interface.

---

## 📄 License
This project is licensed under the MIT License.
