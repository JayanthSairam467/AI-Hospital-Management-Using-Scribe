<div align="center">
  <img src="https://api.iconify.design/lucide:hospital.svg?color=%232563eb" width="80" height="80" alt="OmniScribe Logo" />
  <h1>OmniScribe Health</h1>
  <h3>Next-Generation AI Hospital Management & Clinical Logistics</h3>
  <p><i>Automating clinical documentation, hospital logistics, and emergency response with Artificial Intelligence.</i></p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  </p>
</div>

<br />

## 🌟 The Vision
Healthcare professionals currently spend up to **40% of their day** on administrative paperwork and manual logistics. **OmniScribe Health** changes the paradigm. By leveraging state-of-the-art Generative AI, real-time telemetry, and automated workflows, OmniScribe gives doctors their time back—allowing them to focus on what matters most: **Saving Lives.**

---

## 🏆 Core Innovations (Hackathon Highlights)

### 🎙️ 1. Autonomous AI Medical Scribe
* **The Problem:** Manual charting leads to burnout and delayed patient care.
* **The Solution:** An integrated AI assistant powered by **Google Gemini** that listens to doctor-patient consultations, performs speaker diarization, and instantly generates structured **SOAP (Subjective, Objective, Assessment, Plan)** notes. It extracts medical entities, diagnoses, and prescriptions with high clinical accuracy.

### 🚑 2. Real-Time Emergency Telemetry (ER)
* **The Problem:** ERs lack visibility into incoming ambulance patients.
* **The Solution:** A live `React-Leaflet` map integration with OSRM routing providing live ETAs. Simultaneously, the system streams the in-transit patient's critical vitals (BPM, SpO2, Blood Pressure) directly to the ER dashboard *before* the ambulance arrives.

### 🔐 3. Enterprise Security & HIPAA Compliance
* **The Problem:** Medical software must protect patient data without slowing down collaboration.
* **The Solution:** 
  * **PHI Privacy Toggle (Safe Harbor):** A global UI toggle that instantly anonymizes all Protected Health Information (Names, MRNs, DOBs, Allergies) into encrypted formats for safe screen-sharing and non-cleared staff viewing.
  * **Strict RBAC:** Role-Based Access Control ensuring distinct, restricted workspaces for Doctors, Nurses, Pharmacists, and Administrators.

### 📦 4. Autonomous Pharmacy Supply Chain
* **The Problem:** Hospitals frequently face unexpected shortages of critical medications.
* **The Solution:** An algorithmic inventory tracker. When a medication drops below the 10% critical threshold, the system autonomously triggers a webhook via `NodeMailer`, generating and emailing a formatted Purchase Order directly to the pharmaceutical supplier—zero human intervention required.

### 🛏️ 5. Spatial Bed & Resource Management
* **The Problem:** Inefficient patient flow and bed allocation.
* **The Solution:** Real-time visual tracking of ward occupancy, bed sanitization statuses (Triage, ICU, General), and central oxygen manifold pressures to optimize hospital capacity.

---

## 💻 Technical Architecture

### Frontend 
* **Framework:** React 18 (Vite) + TypeScript
* **Styling:** Tailwind CSS + Custom CSS Keyframes
* **UI/UX:** Framer Motion (Fluid transitions), Lucide React (Iconography)
* **Maps:** React-Leaflet, OpenStreetMap Tiles
* **Performance:** React `lazy()` and `Suspense` for chunk optimization and rapid loading.

### Backend & AI 
* **Runtime:** Node.js + Express
* **AI Engine:** `@google/genai` (Gemini 3.7 Flash) configured with strict JSON schemas for predictable clinical outputs.
* **Automation:** Webhooks & NodeMailer for SMTP email automation.

---

## ⚙️ Quick Start Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JayanthSairam467/AI-Hospital-Management-Using-Scribe.git
   cd AI-Hospital-Management-Using-Scribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Google Gemini API for the AI Scribe
   GEMINI_API_KEY=your_google_gemini_api_key

   # SMTP Configuration for Auto-Reorder System
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Boot the Hospital Matrix**
   ```bash
   npm run dev
   ```
   *The application will deploy locally at `http://localhost:3000`.*

---

<div align="center">
  <p><i>Built with precision for the future of healthcare.</i></p>
</div>
