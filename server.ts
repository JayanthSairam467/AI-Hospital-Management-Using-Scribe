import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    geminiConfigured: !!getGeminiClient(),
    app: "OmniScribe Health",
    version: "2.4.0-clinicOS",
    timestamp: new Date().toISOString(),
  });
});

// API: Generate SOAP Clinical Note from Transcript
app.post("/api/scribe/generate-soap", async (req, res) => {
  try {
    const { transcript, patientData, specialty } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are OmniScribe Health AI, an elite Board-Certified Clinical Scribe & Medical NLP engine.
Convert the following live doctor-patient consultation transcript and patient background into an authentic, highly structured, comprehensive SOAP clinical documentation note.

Patient Background:
- Name: ${patientData?.name || "Patient"}
- Age/Sex: ${patientData?.age || "54"} ${patientData?.sex || "Male"}
- MRN: ${patientData?.mrn || "MRN-98421"}
- Known Allergies: ${patientData?.allergies || "Penicillin, Sulfa"}
- Specialty: ${specialty || "Internal Medicine & Cardiology"}

Consultation Transcript:
"""
${transcript}
"""

Provide the output strictly in the standard SOAP format with ICD-10 diagnosis coding, SNOMED CT terminology, objective clinical observations, and exact treatment plan.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subjective: {
                type: Type.OBJECT,
                properties: {
                  chiefComplaint: { type: Type.STRING },
                  historyOfPresentIllness: { type: Type.STRING },
                  reviewOfSystems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  currentMedications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["chiefComplaint", "historyOfPresentIllness", "reviewOfSystems"],
              },
              objective: {
                type: Type.OBJECT,
                properties: {
                  vitalSigns: {
                    type: Type.OBJECT,
                    properties: {
                      bloodPressure: { type: Type.STRING },
                      heartRate: { type: Type.STRING },
                      respiratoryRate: { type: Type.STRING },
                      temperature: { type: Type.STRING },
                      spO2: { type: Type.STRING },
                      bmi: { type: Type.STRING },
                    },
                    required: ["bloodPressure", "heartRate", "spO2"],
                  },
                  physicalExam: { type: Type.ARRAY, items: { type: Type.STRING } },
                  labDiagnosticResults: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["vitalSigns", "physicalExam"],
              },
              assessment: {
                type: Type.OBJECT,
                properties: {
                  primaryDiagnosis: { type: Type.STRING },
                  icd10Code: { type: Type.STRING },
                  differentialDiagnoses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  clinicalRiskTier: { type: Type.STRING, description: "Low, Moderate, High, or Critical" },
                  clinicalRationale: { type: Type.STRING },
                },
                required: ["primaryDiagnosis", "icd10Code", "differentialDiagnoses", "clinicalRiskTier"],
              },
              plan: {
                type: Type.OBJECT,
                properties: {
                  medicationsPrescribed: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        dosage: { type: Type.STRING },
                        frequency: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        instructions: { type: Type.STRING },
                      },
                      required: ["name", "dosage", "frequency"],
                    },
                  },
                  diagnosticOrders: { type: Type.ARRAY, items: { type: Type.STRING } },
                  patientEducation: { type: Type.ARRAY, items: { type: Type.STRING } },
                  followUp: { type: Type.STRING },
                  redFlagWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["medicationsPrescribed", "diagnosticOrders", "followUp"],
              },
              fhirResource: {
                type: Type.OBJECT,
                properties: {
                  resourceType: { type: Type.STRING },
                  id: { type: Type.STRING },
                  status: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
              },
            },
            required: ["subjective", "objective", "assessment", "plan"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsed, source: "gemini-3.7-flash" });
    } else {
      // High-fidelity fallback for offline or zero-key hackathon mode
      const fallbackSoap = {
        subjective: {
          chiefComplaint: "Substernal chest tightness radiating to left shoulder and persistent dyspnea on moderate exertion x 4 days.",
          historyOfPresentIllness: "54-year-old male with a 6-year history of stage 2 hypertension presents for evaluation of intermittent substernal pressure and mild orthopnea. Symptoms worsen after climbing stairs and are accompanied by mild diaphoresis. Denies syncope, fever, or hemoptysis.",
          reviewOfSystems: [
            "Cardiovascular: Positive for exertional chest heaviness, palpitations. Negative for syncope.",
            "Respiratory: Positive for mild dyspnea on exertion. Negative for wheezing or cough.",
            "Constitutional: Mild fatigue, denies fever, chills, or sudden weight loss.",
            "Gastrointestinal: Negative for reflux, nausea, or abdominal pain.",
          ],
          currentMedications: ["Amlodipine 10mg PO daily", "Lisinopril 20mg PO daily", "Aspirin 81mg PO daily"],
          allergies: ["Penicillin (Anaphylactoid urticaria)", "Sulfamethoxazole (Severe maculopapular rash)"],
        },
        objective: {
          vitalSigns: {
            bloodPressure: "148/92 mmHg",
            heartRate: "88 bpm (regular sinus)",
            respiratoryRate: "18 breaths/min",
            temperature: "98.4 °F (36.9 °C)",
            spO2: "97% on ambient room air",
            bmi: "28.4 kg/m²",
          },
          physicalExam: [
            "General: Alert, oriented x 4, in no acute distress at rest.",
            "Cardiovascular: Regular rate and rhythm. S1/S2 present. No S3/S4 gallop. Soft 2/6 systolic ejection murmur at base, no rub.",
            "Lungs: Clear to auscultation bilaterally. Good air exchange. No crackles, rales, or wheezing.",
            "Extremities: 1+ pitting edema bilateral lower ankles. Peripheral dorsalis pedis pulses palpable 2+ bilaterally.",
            "Abdomen: Soft, nontender, non-distended. Normal active bowel sounds. No hepatomegaly.",
          ],
          labDiagnosticResults: [
            "12-Lead ECG: Normal sinus rhythm, minor non-specific ST-T wave flattening in lateral leads (V5-V6), no acute STEMI.",
            "High-Sensitivity Troponin I: <0.01 ng/mL (negative).",
            "Serum Creatinine: 1.1 mg/dL | eGFR: 78 mL/min/1.73m²",
            "Lipid Panel: Total Cholesterol 224 mg/dL, LDL-C 142 mg/dL, HDL-C 44 mg/dL, Triglycerides 190 mg/dL",
          ],
        },
        assessment: {
          primaryDiagnosis: "Unstable / Exertional Angina Pectoris with Essential Stage 2 Hypertension",
          icd10Code: "I20.0 (Unstable Angina) / I10 (Essential Hypertension)",
          differentialDiagnoses: [
            "Non-ST-segment elevation myocardial infarction (NSTEMI) - low probability with negative serial troponins",
            "Gastroesophageal reflux disease (GERD) with esophageal spasm",
            "Costochondritis / Musculoskeletal thoracic strain",
          ],
          clinicalRiskTier: "Moderate",
          clinicalRationale: "Exertional character and radiation strongly suggest ischemic etiology in a patient with cardiovascular risk factors (HTN, dyslipidemia). Immediate cardioprotective optimization indicated.",
        },
        plan: {
          medicationsPrescribed: [
            {
              name: "Metoprolol Succinate ER",
              dosage: "25 mg",
              frequency: "Once daily in morning",
              duration: "30 days (with 3 refills)",
              instructions: "Take with food. Monitor morning heart rate; hold if HR < 55 bpm.",
            },
            {
              name: "Nitroglycerin Sublingual Tablet",
              dosage: "0.4 mg",
              frequency: "PRN chest pain",
              duration: "1 bottle (25 tabs)",
              instructions: "Dissolve 1 tablet under tongue at onset of chest pain. May repeat q5min x 3 doses. Call 911 if pain persists past 5 mins.",
            },
            {
              name: "Atorvastatin Calcium",
              dosage: "40 mg",
              frequency: "Once daily at bedtime",
              duration: "30 days (with 5 refills)",
              instructions: "High-intensity lipid lowering therapy. Report unexplained muscle soreness.",
            },
          ],
          diagnosticOrders: [
            "Urgent Outpatient Exercise Nuclear Stress Test (Myocardial Perfusion SPECT) within 5 business days.",
            "Transthoracic Echocardiogram (TTE) to assess left ventricular ejection fraction and regional wall motion.",
            "Comprehensive Metabolic Panel & HbA1c fasting recheck in 4 weeks.",
          ],
          patientEducation: [
            "Strict low-sodium (<2,000 mg/day) Mediterranean-style dietary counseling provided.",
            "Prescribed Nitroglycerin protocol thoroughly reviewed with patient.",
            "Instructed on daily blood pressure and pulse logging via OmniScribe connected cuff.",
          ],
          followUp: "Cardiology clinic follow-up in 14 days post-stress test, or sooner if symptomatic.",
          redFlagWarnings: [
            "Seek immediate Emergency Department care if chest pain lasts >10 mins, is accompanied by shortness of breath, dizziness, cold sweats, or does not resolve with 1 dose of sublingual Nitroglycerin.",
          ],
        },
        fhirResource: {
          resourceType: "ClinicalImpression",
          id: "omniscribe-imp-98421-2026",
          status: "completed",
          category: "ambulatory-consultation",
        },
      };

      return res.json({ success: true, data: fallbackSoap, source: "mock-high-fidelity" });
    }
  } catch (error: any) {
    console.error("Error in SOAP generation:", error);
    res.status(500).json({ error: error.message || "Failed to generate clinical SOAP note" });
  }
});

// API: Clinical What-If Decision Support Chat
app.post("/api/ai/what-if", async (req, res) => {
  try {
    const { query, patientContext } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are OmniScribe Health Clinical Decision Support AI, acting as a board-level clinical pharmacologist and medical advisor.
Answer the following physician "What-If" clinical scenario with high-precision guidelines, contraindicated warnings, dosage calculations, and evidence-based alternatives.

Patient Context:
- Current Diagnoses: ${patientContext?.diagnoses || "Stage 2 HTN, CAD, Dyslipidemia"}
- Known Allergies: ${patientContext?.allergies || "Penicillin (severe anaphylactoid reaction), Sulfa"}
- Current Medications: ${patientContext?.medications || "Amlodipine 10mg, Metoprolol 25mg, Atorvastatin 40mg, Aspirin 81mg"}
- Renal/Hepatic Function: eGFR 78 mL/min, Cr 1.1 mg/dL, AST/ALT normal.

Physician What-If Question:
"${query}"

Format your response clearly with:
1. Direct Clinical Recommendation
2. Pharmacological Rationale & Mechanism
3. Safe Alternative Therapies & Exact Dosages
4. Contraindications & Monitoring Parameters (e.g. Renal, Hepatic, QTc intervals)
5. Clinical Guidelines Reference (e.g. AHA/ACC, IDSA, ADA 2026 Standards)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      return res.json({
        success: true,
        answer: response.text,
        source: "gemini-3.7-flash",
      });
    } else {
      // Specialized simulated responses for medical what-if scenarios
      let simulatedAnswer = "";
      const lowerQ = query.toLowerCase();

      if (lowerQ.includes("penicillin") || lowerQ.includes("allergic")) {
        simulatedAnswer = `### Clinical Decision Support: Penicillin-Allergic Patient Protocol

**1. Direct Recommendation:**
Patient has a documented history of severe IgE-mediated/anaphylactoid reaction to Penicillin. All beta-lactams with identical side-chain structures (including ampicillin, amoxicillin) are **STRICTLY CONTRAINDICATED**.

**2. Recommended First-Line Alternatives:**
- **Respiratory / Sinusitis / Bronchitis:** **Azithromycin** 500 mg PO Day 1, followed by 250 mg PO daily for Days 2-5 (Z-Pak); OR **Doxycycline monohydrate** 100 mg PO BID x 7 days.
- **Severe / Hospital-Acquired Gram-Positive:** **Vancomycin** (15-20 mg/kg IV q8-12h with trough targeting 15-20 mcg/mL) or **Linezolid** 600 mg IV/PO q12h.
- **Gram-Negative / Abdominal:** **Ciprofloxacin** 500 mg PO BID + **Metronidazole** 500 mg PO TID.

**3. Cephalosporin Cross-Reactivity Risk:**
- 3rd/4th generation cephalosporins (e.g., Ceftriaxone, Cefepime) exhibit <1% cross-reactivity with aminopenicillins, but caution is warranted due to severe documented anaphylactoid history. Avoid 1st generation cephalosporins (Cephalexin, Cefazolin).

**4. Monitoring Parameters:**
- Baseline ECG (QTc interval) if initiating Macrolides or Fluoroquinolones alongside Metoprolol.
- Renal function monitoring if aminoglycosides or IV glycopeptides are ordered.

*Ref: IDSA Guidelines for Antimicrobial Therapy & AAAAI Drug Allergy Practice Parameters.*`;
      } else if (lowerQ.includes("metformin") || lowerQ.includes("creatinine") || lowerQ.includes("renal") || lowerQ.includes("kidney")) {
        simulatedAnswer = `### Clinical Decision Support: Renal Thresholds for Metformin & Contrast

**1. Renal Assessment:**
- Current baseline eGFR: 78 mL/min/1.73m² (Safe for full-dose Metformin).
- **If eGFR drops < 45 mL/min/1.73m²:** Reduce maximum daily Metformin dose by 50% (max 1,000 mg/day).
- **If eGFR drops < 30 mL/min/1.73m²:** Metformin is **ABSOLUTELY CONTRAINDICATED** due to high risk of Metformin-Associated Lactic Acidosis (MALA).

**2. Second-Line Glycemic Alternatives for Renal Impairment:**
- **DPP-4 Inhibitors:** Linagliptin 5 mg PO daily (no dose adjustment needed across all renal stages).
- **GLP-1 Receptor Agonists:** Dulaglutide 0.75-1.5 mg SubQ weekly (safe down to eGFR 15 mL/min).
- **SGLT2 Inhibitors:** Empagliflozin 10 mg daily (provides nephroprotection; glycemic efficacy reduced if eGFR < 20).

**3. Contrast-Induced Nephropathy Protocol:**
- Withhold Metformin 48 hours prior to and 48 hours following iodinated IV contrast procedures until stable renal function is reconfirmed.`;
      } else if (lowerQ.includes("aspirin") || lowerQ.includes("bleeding") || lowerQ.includes("surgery") || lowerQ.includes("stent")) {
        simulatedAnswer = `### Clinical Decision Support: Antiplatelet Management & Bleeding Risk

**1. Recommendation for Elective Surgery:**
- Hold Aspirin 81 mg 5 to 7 days prior to high-bleeding-risk surgical interventions only after verifying patient has no bare-metal (<1 mo) or drug-eluting coronary stents (<6-12 mos).
- For low-bleeding-risk minor procedures (cataract, minor dermatological, dental), continue low-dose Aspirin perioperatively.

**2. Dual Antiplatelet Therapy (DAPT) Considerations:**
- If adding P2Y12 inhibitor (Clopidogrel 75 mg daily), co-prescribe gastric mucosal protection with a PPI (e.g., Pantoprazole 40 mg daily; avoid Omeprazole if using Clopidogrel due to CYP2C19 competitive inhibition).

**3. Emergency Reversal Protocol:**
- Platelet transfusion (1-2 apheresis units) indicated only in life-threatening bleeding or emergency intracranial hemorrhage under antiplatelet therapy.`;
      } else {
        simulatedAnswer = `### Clinical Decision Support: Custom Scenario Analysis

**Query:** "${query}"

**1. Clinical Assessment & Synthesis:**
- Patient is a 54M with Stage 2 Hypertension, exertional angina, and severe Penicillin/Sulfa allergies on current regimen (Amlodipine, Lisinopril, Metoprolol, Atorvastatin, Aspirin).
- Evaluated against standard clinical guidelines (ACC/AHA 2026, Clinical Pharmacopeia).

**2. Pharmacokinetic & Interaction Check:**
- No significant CYP3A4 inhibition conflicts detected with current cardiovascular baseline.
- Maintain vigilance regarding renal perfusion pressure (Lisinopril + dehydration risk) and bradycardic threshold (Metoprolol + negative chronotropes).

**3. Actionable Clinical Pathway:**
- Implement graded titration with weekly outpatient vitals check.
- Repeat serum electrolytes (K+, Na+) and serum creatinine at 2-week interval.
- Provide patient symptom diary access via OmniScribe mobile portal.`;
      }

      return res.json({
        success: true,
        answer: simulatedAnswer,
        source: "mock-clinical-engine",
      });
    }
  } catch (error: any) {
    console.error("Error in what-if analysis:", error);
    res.status(500).json({ error: error.message || "Failed to process what-if clinical query" });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OmniScribe Health Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
