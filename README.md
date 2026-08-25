# OmniScribe Health: AI-Powered Hospital Management System

OmniScribe Health is a next-generation, AI-driven hospital management dashboard designed to reduce administrative burden on healthcare professionals, optimize hospital logistics, and improve patient outcomes through real-time intelligence.

## 🚀 Key Features

*   **🎙️ AI Medical Scribe:** Uses Google's Gemini AI to listen to doctor-patient conversations and automatically generate structured, clinical-grade SOAP notes.
*   **🔐 Role-Based Access Control (RBAC):** Customized, secure views for Doctors, Nurses, Pharmacists, and Admins. Restricts sensitive modules via permissions.
*   **🛡️ PHI Privacy Masking (HIPAA Safe Harbor):** A global toggle that instantly masks Protected Health Information (PHI) such as patient names, MRNs, DOBs, and allergies across all dashboard views.
*   **🚑 Live Ambulance Telemetry:** Interactive Leaflet maps tracking real-time ambulance GPS locations alongside live patient vitals transmitted directly from the field.
*   **🛏️ 3D Bed Management:** Visual, spatial tracking of ward occupancy, bed status (Triage, ICU, Sanitization), and oxygen manifold levels.
*   **📦 Automated Inventory & Auto-Reorder:** Real-time pharmacy stock monitoring with a web-hook and NodeMailer integration that automatically emails purchase orders to suppliers when stock drops below 10%.
*   **🤖 AI "What-If" Clinical Support:** Chat-based clinical decision support tool allowing doctors to query alternative treatments and medication conflicts.

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TypeScript, Tailwind CSS
*   **UI Components:** Framer Motion (Animations), Lucide React (Icons)
*   **Mapping:** React-Leaflet, OpenStreetMap
*   **AI / Backend integrations:** Google Gemini API, Node.js (Express)
*   **Email Automation:** NodeMailer

## ⚙️ Installation & Setup

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
   Create a `.env` file in the root directory and add the following:
   ```env
   # API Keys
   GEMINI_API_KEY=your_google_gemini_api_key

   # Email configuration for Auto-Reorder system
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🔒 Privacy & Compliance
This application features a built-in "PHI Privacy Toggle" to demonstrate HIPAA Safe Harbor compliance techniques, instantly anonymizing patient data for presentation or non-cleared staff viewing.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
