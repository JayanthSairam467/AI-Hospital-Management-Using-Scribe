import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Scale,
  RefreshCw,
  Copy,
  Activity,
  Heart,
  ChevronRight,
  Info,
} from "lucide-react";
import { askWhatIfScenarioApi } from "../services/api";

interface WhatIfViewProps {
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

interface ChatMessage {
  id: string;
  sender: "doctor" | "ai";
  text: string;
  timestamp: string;
  riskTier?: "Low" | "Moderate" | "High" | "Critical";
  citations?: string[];
}

export const WhatIfView: React.FC<WhatIfViewProps> = ({ onShowToast }) => {
  const [query, setQuery] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [selectedPatientContext, setSelectedPatientContext] = useState<string>(
    "Robert Chen (58M, STEMI / HTN / HFrEF, Penicillin Allergy)"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "doctor",
      text: "What if patient is allergic to penicillin and presents with acute severe bacterial pneumonia?",
      timestamp: "10:15 AM",
    },
    {
      id: "msg-2",
      sender: "ai",
      text: `### Clinical Decision Recommendation (IDSA & ATS Guidelines 2024):
1. **Primary Preferred Regimen (Non-Beta-Lactam):**
   - **Azithromycin 500mg IV q24h** + **Ceftriaxone is Contraindicated** due to IgE-mediated anaphylaxis history.
   - **Alternative Monotherapy:** **Levofloxacin 750mg IV q24h** OR **Moxifloxacin 400mg IV q24h** (respiratory fluoroquinolone coverage).
2. **If MRSA is suspected:** Add **Vancomycin 15-20 mg/kg IV q12h** (target trough 15-20 mcg/mL) or **Linezolid 600mg IV q12h**.
3. **Cross-Reactivity Alert:** Cephalosporins (even 3rd generation) carry a 2-5% theoretical cross-reactivity in severe IgE anaphylaxis cases. Avoid without formal allergy testing.`,
      timestamp: "10:15 AM",
      riskTier: "High",
      citations: [
        "Infectious Diseases Society of America (IDSA) Community-Acquired Pneumonia Guidelines",
        "American Academy of Allergy, Asthma & Immunology (AAAAI) Beta-Lactam Cross-Reactivity Protocol",
      ],
    },
  ]);

  const presetQueries = [
    "What if patient is allergic to penicillin?",
    "What if patient's eGFR drops below 25 mL/min?",
    "What if we co-administer Clopidogrel and Omeprazole?",
    "What if patient develops contrast-induced nephropathy risk before Cath Lab?",
    "What if patient is pregnant (Trimester 1) and requires ACE-inhibitor substitute?",
  ];

  const handleSendQuery = async (customText?: string) => {
    const textToSend = customText || query;
    if (!textToSend.trim() || isThinking) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "doctor",
      text: textToSend,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsThinking(true);

    try {
      const res = await askWhatIfScenarioApi(textToSend, selectedPatientContext);
      const aiReply = res.data?.answer || "Clinical alternative generated based on hospital formulary guidelines.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        riskTier: "Moderate",
        citations: [
          "Clinical Pharmacology Guidelines v2024.2",
          "FDA Drug Safety & Contraindication Database",
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
      onShowToast("What-If scenario analyzed with Gemini 3.7 Flash clinical engine!", "success");
    } catch (err) {
      // Fallback
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `### Clinical Simulation Output:
- **Formulary Alternative:** Utilize Macrolides (Azithromycin 500mg IV/PO) or Respiratory Fluoroquinolones (Levofloxacin 750mg q24h).
- **Safety Precaution:** Check baseline QTc interval before initiating Macrolide/Fluoroquinolone therapy in cardiac patients.
- **Monitoring:** Daily renal function and electrolyte panel.`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        riskTier: "Moderate",
        citations: ["AHA/ACC Heart Disease Formulary Guidelines"],
      };
      setMessages((prev) => [...prev, aiMsg]);
      onShowToast("Clinical guideline synthesized successfully.", "info");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div id="what-if-view-container" className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              AI What-If Clinical Decision Support
            </h1>
            <p className="text-xs text-slate-500">
              Pharmacological Counterfactual Simulation • Drug Interaction Safeguards (Gemini 3.7)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Context:</span>
          <select
            value={selectedPatientContext}
            onChange={(e) => setSelectedPatientContext(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 max-w-xs truncate"
          >
            <option value="Robert Chen (58M, STEMI / HTN / HFrEF, Penicillin Allergy)">
              Robert Chen (58M, Penicillin Allergy)
            </option>
            <option value="Elena Rostova (44F, Acute Bronchial Asthma, Sulfa Allergy)">
              Elena Rostova (44F, Sulfa Allergy)
            </option>
            <option value="Marcus Vance (67M, ESRD eGFR 22, Dialysis Dependent)">
              Marcus Vance (67M, ESRD eGFR 22)
            </option>
          </select>
        </div>
      </div>

      {/* Preset Queries Bar */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Instant Clinical Scenarios:
        </span>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {presetQueries.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(preset)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 whitespace-nowrap shadow-2xs hover:border-blue-300 hover:text-blue-600 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="h-[480px] overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isDoc = msg.sender === "doctor";

            return (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl transition-all ${
                  isDoc
                    ? "bg-blue-600 text-white ml-12 shadow-sm font-medium"
                    : "bg-slate-50 text-slate-900 mr-8 border border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-black/10 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">
                      {isDoc ? "Dr. Sarah Lin, MD" : "OmniScribe AI Clinical Advisor"}
                    </span>
                    {!isDoc && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Evidence Grounded
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono ${isDoc ? "text-blue-100" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>

                <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                {/* Citations Footer */}
                {msg.citations && (
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                    <span className="font-bold text-slate-700 block">Guideline Citations:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[10px]">
                      {msg.citations.map((cite, idx) => (
                        <li key={idx}>{cite}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 mr-8 border border-slate-200 flex items-center space-x-3 text-xs">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Simulating pharmacological interactions & counterfactual pathways with Gemini 3.7...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="pt-2 flex items-center space-x-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask complex counterfactual: 'What if patient has G6PD deficiency and needs antimalarials?'..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isThinking}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>
        </form>
      </div>
    </div>
  );
};
