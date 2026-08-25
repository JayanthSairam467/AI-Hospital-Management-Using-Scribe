import React, { useState } from "react";
import {
  Activity,
  Mic,
  Pill,
  BedDouble,
  BrainCircuit,
  ShieldCheck,
  Zap,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface LandingPageProps {
  onEnterDashboard: (targetView?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  const [isPlayingTeaser, setIsPlayingTeaser] = useState<boolean>(true);
  const [teaserStep, setTeaserStep] = useState<number>(2);

  const pillars = [
    {
      id: "scribe",
      icon: Mic,
      title: "AI Ambient Scribe",
      description: "Passive voice-to-SOAP transcription with medical diarization, zero hallucination guardrails, and automated ICD-10/CPT coding.",
      stats: "91% Charting Time Saved",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50/70",
      border: "border-blue-200",
      accentText: "text-blue-700",
    },
    {
      id: "inventory",
      icon: Pill,
      title: "Smart Pharmacy Inventory",
      description: "Real-time stock prediction, automated shortage alerts, QR cold-chain monitoring, and instant supplier restock triggers.",
      stats: "Zero Emergency Stock-Outs",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50/70",
      border: "border-amber-200",
      accentText: "text-amber-700",
    },
    {
      id: "beds",
      icon: BedDouble,
      title: "3D Bed & Ward Management",
      description: "Stylized 3D isometric hospital layout displaying live bed occupancy, triage escalation, and medical oxygen pipeline tracking.",
      stats: "<12 Min Bed Turnover",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50/70",
      border: "border-emerald-200",
      accentText: "text-emerald-700",
    },
    {
      id: "what-if",
      icon: BrainCircuit,
      title: "Predictive Decision Support",
      description: "Pharmacological What-If simulator evaluating drug-drug interactions, renal dosage adjustments, and penicillin allergy cross-reactivity.",
      stats: "ACC/AHA 2026 Guidelines",
      color: "from-purple-500 to-indigo-600",
      bgLight: "bg-purple-50/70",
      border: "border-purple-200",
      accentText: "text-purple-700",
    },
  ];

  const metrics = [
    { value: "85%", label: "Less Time Spent on EHR Charting" },
    { value: "<1.4s", label: "Real-Time Ambient Transcription Latency" },
    { value: "100%", label: "HL7 FHIR v4 & HIPAA BAA Compliant" },
    { value: "18,400+", label: "Physician Clinical Hours Reclaimed" },
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-blue-50/80 via-white to-slate-50 border-b border-slate-200">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Next-Gen Medical Scribe & Clinic Operating System</span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-900 font-mono">v2.4 Live</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Automate Documentation. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Elevate Patient Care.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              OmniScribe Health turns natural doctor-patient consultations into structured, certified SOAP notes
              in seconds while synchronizing hospital beds, pharmacy stock, and emergency dispatch.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                id="hero-enter-dashboard-btn"
                onClick={() => onEnterDashboard("dashboard")}
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2.5"
              >
                <span>Enter Clinic Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-launch-scribe-btn"
                onClick={() => onEnterDashboard("scribe")}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-semibold text-sm shadow-xs hover:shadow-sm hover:border-slate-400 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Mic className="w-4 h-4 text-blue-600" />
                <span>Test Live AI Scribe</span>
              </button>
            </div>

            {/* Compliance Guarantee Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-4">
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>HIPAA BAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>SOC-2 Type II Certified</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>HL7 FHIR v4.0 Export</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Ambient Consultation Teaser Card */}
          <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Header bar */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div className="text-xs font-mono font-medium text-slate-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>ENCOUNTER #98421 - LIVE AMBIENT STREAM</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-700">
                  Model: Gemini 3.7 Flash
                </span>
                <button
                  onClick={() => onEnterDashboard("scribe")}
                  className="text-white hover:text-blue-300 font-semibold flex items-center space-x-1 transition-colors"
                >
                  <span>Open Full Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Split live preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
              {/* Left: Live Audio & Dialogue Stream */}
              <div className="p-5 space-y-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <Mic className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>Real-Time Consultation Audio</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active 00:02:14
                  </span>
                </div>

                {/* Animated wave bars */}
                <div className="h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center px-4 space-x-1">
                  {[24, 40, 16, 48, 60, 32, 70, 45, 80, 55, 30, 65, 40, 20, 50, 35, 75, 45, 25, 60, 35].map(
                    (height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-blue-500 rounded-full transition-all duration-150 animate-pulse"
                        style={{
                          height: `${Math.max(15, (height * (1 + (i % 3) * 0.2)) % 100)}%`,
                          animationDelay: `${i * 60}ms`,
                        }}
                      />
                    )
                  )}
                </div>

                {/* Dialogue Snippets */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-slate-800">
                    <span className="font-bold text-blue-700 block mb-0.5">Dr. Sarah Lin (Cardiology):</span>
                    "What triggers the chest pressure, Mr. Vance? Does it radiate into your shoulder?"
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                    <span className="font-bold text-slate-700 block mb-0.5">Marcus Vance (Patient):</span>
                    "Yes doctor, whenever I climb the office stairs. Also, remember I'm severely allergic to Penicillin."
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center space-x-2">
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>AI Flag: Penicillin allergy noted; contraindication check passed.</span>
                  </div>
                </div>
              </div>

              {/* Right: Instant Structured SOAP Output */}
              <div className="p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Generated SOAP Clinical Record</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    ICD-10: I20.0
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/60">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide text-blue-700">
                      S - Subjective
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Substernal exertional chest heaviness radiating to left shoulder x 4 days. Relieved by 5 min rest.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/60">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide text-blue-700">
                      A - Assessment
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Unstable / Exertional Angina Pectoris; Essential Stage 2 Hypertension. Risk: Moderate.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/60">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide text-blue-700">
                      P - Plan
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      1. Metoprolol ER 25mg daily • 2. Nitroglycerin 0.4mg SL PRN • 3. Urgent Nuclear Stress Test.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => onEnterDashboard("scribe")}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>Launch Full Clinical Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {metrics.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono tracking-tight">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">The Clinic Operating System</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              One Unified Platform for Care & Operations
            </p>
            <p className="text-base text-slate-600">
              Eliminate disjointed hospital tools. OmniScribe bridges ambient clinician workflow directly with
              real-time bed availability, automated pharmacy stock, and live ambulance telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  id={`feature-card-${pillar.id}`}
                  onClick={() => onEnterDashboard(pillar.id)}
                  className={`p-8 rounded-2xl border ${pillar.border} ${pillar.bgLight} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {pillar.stats}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    <span>Explore Module</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to test the future of clinical AI?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
            Experience our ambient transcription engine, interactive 3D hospital ward, and clinical What-If
            simulator in full live prototype mode.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onEnterDashboard("dashboard")}
              className="px-8 py-4 bg-white hover:bg-slate-100 text-blue-700 font-bold rounded-xl text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Launch OmniScribe Health OS</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              O
            </div>
            <span className="font-bold text-slate-200 text-sm">OmniScribe Health</span>
            <span className="text-slate-500">© 2026. Built for Hackathon Excellence.</span>
          </div>

          <div className="flex items-center space-x-6">
            <button onClick={() => onEnterDashboard("scribe")} className="hover:text-white transition-colors">
              AI Scribe
            </button>
            <button onClick={() => onEnterDashboard("inventory")} className="hover:text-white transition-colors">
              Inventory
            </button>
            <button onClick={() => onEnterDashboard("beds")} className="hover:text-white transition-colors">
              3D Ward
            </button>
            <button onClick={() => onEnterDashboard("what-if")} className="hover:text-white transition-colors">
              What-If AI
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
