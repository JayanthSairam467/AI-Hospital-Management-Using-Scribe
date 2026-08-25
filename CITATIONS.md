# 📚 Citations & References

The OmniScribe Health project leverages several open-source technologies, public APIs, and established medical standards. We gratefully acknowledge the following resources and institutions that made this project possible:

## 🤖 Artificial Intelligence
* **Google Gemini API:** Utilized as the core NLP engine for the AI Medical Scribe (speaker diarization, medical entity extraction, and structured SOAP note generation). 
  * *Link:* [Google AI for Developers](https://ai.google.dev/)

## 🏥 Medical Standards & Compliance
* **HIPAA Safe Harbor De-identification:** The guidelines implemented in our "PHI Privacy Toggle" to ensure secure screen-sharing and data anonymization.
  * *Link:* [HHS.gov Guidance on De-identification](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html)
* **SOAP Notes Format:** The universally accepted medical documentation standard (Subjective, Objective, Assessment, Plan) that our AI structures its outputs into.
  * *Link:* [NCBI - Comprehensive SOAP Note Guidelines](https://www.ncbi.nlm.nih.gov/books/NBK482263/)

## 🗺️ Mapping & Telemetry
* **OpenStreetMap (OSM):** Map data and cartography tiles powering the Ambulance ER dashboard.
  * *Link:* [OpenStreetMap Copyright & License](https://www.openstreetmap.org/copyright)
* **React-Leaflet & Leaflet.js:** The open-source JavaScript library utilized for rendering high-performance, interactive ambulance telemetry maps.
  * *Link:* [Leaflet.js Documentation](https://leafletjs.com/)
* **OSRM (Open Source Routing Machine):** The routing engine used to calculate real-time ETAs and emergency routes for incoming ambulances.
  * *Link:* [Project OSRM](http://project-osrm.org/)

## 💻 Open Source Frameworks & Libraries
* **React & Vite:** The foundational frontend framework and lightning-fast build tool powering the dashboard.
  * *Link:* [React](https://react.dev/) | [Vite](https://vitejs.dev/)
* **Tailwind CSS:** The utility-first CSS framework used for rapid, clinical-grade UI development.
  * *Link:* [Tailwind CSS](https://tailwindcss.com/)
* **Framer Motion:** The animation library used for fluid UI transitions (e.g., the heartbeat loading screens).
  * *Link:* [Framer Motion](https://www.framer.com/motion/)
* **Lucide Icons:** Clean, consistent SVG iconography used throughout the user interface.
  * *Link:* [Lucide React](https://lucide.dev/)
* **NodeMailer:** The SMTP client for Node.js used to autonomously email purchase orders in the auto-reorder supply chain webhook.
  * *Link:* [NodeMailer](https://nodemailer.com/)
