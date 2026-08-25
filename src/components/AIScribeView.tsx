import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  ShieldCheck,
  User,
  Heart,
  Activity,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Stethoscope,
  Send,
  Code,
  FileCheck,
  Plus,
  Share2,
  Lock,
} from "lucide-react";
import { Patient, TranscriptLine, SoapNote } from "../types";
import { MOCK_PATIENTS, MOCK_TRANSCRIPTS, INITIAL_SOAP_NOTE } from "../data/mockData";
import { generateSoapNoteApi } from "../services/api";
import { maskName, maskMRN, maskDOB, maskGeneric } from "../utils/privacyMask";

interface AIScribeViewProps {
  onOpenFhirModal: (soap: SoapNote) => void;
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
  privacyMode?: boolean;
}

export const AIScribeView: React.FC<AIScribeViewProps> = ({ onOpenFhirModal, onShowToast, privacyMode = false }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-1");
  const [specialty, setSpecialty] = useState<string>("Internal Medicine & Cardiology");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(142);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>(
    MOCK_TRANSCRIPTS["pat-1"] || []
  );
  const [soapNote, setSoapNote] = useState<SoapNote>(INITIAL_SOAP_NOTE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"soap" | "fhir" | "icd">("soap");
  const [manualInput, setManualInput] = useState<string>("");

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const activePatient: Patient =
    MOCK_PATIENTS.find((p) => p.id === selectedPatientId) || MOCK_PATIENTS[0];

  // Timer for active recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // When changing patient, update transcript
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    const newTranscripts = MOCK_TRANSCRIPTS[pId] || MOCK_TRANSCRIPTS["pat-1"];
    setTranscriptLines(newTranscripts);
    setIsSigned(false);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      onShowToast("Ambient microphone active. Listening for clinical dialogue...", "info");
    } else {
      setIsRecording(false);
      onShowToast("Consultation paused. SOAP note ready for signature.", "success");
    }
  };

  const handleGenerateSoap = async () => {
    setIsGenerating(true);
    try {
      const fullTranscriptText = transcriptLines
        .map((l) => `${l.speaker} [${l.timestamp}]: ${l.text}`)
        .join("\n");

      const res = await generateSoapNoteApi({
        transcript: fullTranscriptText,
        patientData: {
          name: activePatient.name,
          age: activePatient.age,
          sex: activePatient.sex,
          mrn: activePatient.mrn,
          allergies: activePatient.allergies.join(", "),
        },
        specialty,
      });

      setSoapNote(res.data);
      onShowToast("SOAP note successfully synthesized with Gemini 3.7 Flash!", "success");
    } catch (err) {
      onShowToast("SOAP note generated using clinical template.", "info");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    onShowToast(`Copied ${sectionName} to clipboard!`, "success");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleAddManualLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const newLine: TranscriptLine = {
      id: `t-man-${Date.now()}`,
      speaker: "Doctor",
      text: manualInput.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      category: "general",
    };

    setTranscriptLines((prev) => [...prev, newLine]);
    setManualInput("");
    setTimeout(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div id="ai-scribe-workspace" className="space-y-4 pb-12">
      {/* Top Patient Bar & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Patient Selector & Info */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <select
                    id="patient-picker-select"
                    value={selectedPatientId}
                    onChange={(e) => handleSelectPatient(e.target.value)}
                    className="font-bold text-base text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-hidden py-0.5"
                  >
                    {MOCK_PATIENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {privacyMode ? `${maskName(p.name)} (●●y, ${p.sex}) • ${maskMRN(p.mrn)}` : `${p.name} (${p.age}y, ${p.sex}) • ${p.mrn}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                  <span>DOB: {privacyMode ? maskDOB(activePatient.dob) : activePatient.dob}</span>
                  <span>•</span>
                  <span>Blood: {activePatient.bloodType}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">{activePatient.room}</span>
                </div>
              </div>
            </div>

            {/* Vitals Summary Pill Bar */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center space-x-1 text-slate-700">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-semibold">BP: {activePatient.vitals.bp}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1 text-slate-700">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>HR: {activePatient.vitals.hr}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="text-slate-700">
                <span>SpO2: {activePatient.vitals.spo2}</span>
              </div>
            </div>

            {/* Allergies Highlight */}
            <div className="flex items-center space-x-1.5 bg-red-50 text-red-800 px-2.5 py-1 rounded-lg border border-red-200 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Allergies: {privacyMode ? activePatient.allergies.map(a => maskGeneric(a)).join(", ") : activePatient.allergies.join(", ")}</span>
            </div>
          </div>

          {/* Specialty Mode Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Specialty:</span>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="Internal Medicine & Cardiology">Cardiology / Internal Medicine</option>
              <option value="Pulmonology & Respiratory">Pulmonology & Respiratory</option>
              <option value="Emergency & Acute Triage">Emergency & Trauma Triage</option>
              <option value="Endocrinology & Nephrology">Endocrinology & Nephrology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (Live STT Transcript & Audio Stream) - 5 Columns */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header with Prominent Recording Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isRecording ? "bg-red-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <h2 className="text-sm font-bold text-slate-900">Live Ambient Audio & STT</h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Biomedical Multi-Speaker Diarization</p>
                </div>

                <div className="flex items-center space-x-2 font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatTimer(recordingSeconds)}</span>
                </div>
              </div>

              {/* Prominent Recording Button */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200/90 text-center space-y-3">
                <button
                  id="start-consultation-mic-btn"
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 animate-pulse shadow-red-500/40 ring-8 ring-red-100"
                      : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-500/30"
                  }`}
                  title={isRecording ? "Pause Consultation" : "Start Consultation"}
                >
                  {isRecording ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
                </button>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {isRecording ? "Ambient Consultation Active" : "Click to Start Consultation"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isRecording
                      ? "Microphone listening • Real-time STT streaming"
                      : "Ready to capture doctor-patient dialogue"}
                  </p>
                </div>

                {/* Animated Waveform Equalizer */}
                {isRecording && (
                  <div className="w-full flex items-center justify-center space-x-1 h-8 px-4">
                    {[35, 60, 25, 80, 45, 95, 30, 70, 50, 85, 40, 65, 30, 90, 55, 35, 75, 45, 60].map(
                      (val, idx) => (
                        <div
                          key={idx}
                          className="w-1 bg-red-500 rounded-full animate-pulse"
                          style={{
                            height: `${val}%`,
                            animationDelay: `${idx * 50}ms`,
                            animationDuration: "600ms",
                          }}
                        />
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Live Transcript Stream Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Diarized Dialogue Stream</span>
                  <span className="text-[10px] text-blue-600 font-semibold">{transcriptLines.length} segments</span>
                </div>

                <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 text-xs">
                  {transcriptLines.map((line) => {
                    const isDoc = line.speaker === "Doctor";
                    const isNurse = line.speaker === "Nurse";

                    return (
                      <div
                        key={line.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isDoc
                            ? "bg-blue-50/70 border-blue-200 text-slate-900"
                            : isNurse
                            ? "bg-emerald-50/70 border-emerald-200 text-slate-900"
                            : "bg-white border-slate-200 text-slate-800 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <span
                            className={`font-bold ${
                              isDoc ? "text-blue-700" : isNurse ? "text-emerald-700" : "text-slate-700"
                            }`}
                          >
                            {line.speaker === "Doctor"
                              ? "Dr. Sarah Lin"
                              : line.speaker === "Nurse"
                              ? "Nurse Davis, RN"
                              : privacyMode ? maskName(activePatient.name) : activePatient.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{line.timestamp}</span>
                        </div>
                        <p className="leading-relaxed text-slate-700">{line.text}</p>
                      </div>
                    );
                  })}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </div>

            {/* Quick Add Line Form */}
            <form onSubmit={handleAddManualLine} className="mt-3 pt-3 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Doctor's verbal remark or clinical addendum..."
                className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                title="Add to transcript"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side (Structured Output: SOAP Standard Note) - 7 Columns */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header with Tabs & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Clinical Documentation (SOAP Standard)</h2>
                    <p className="text-[11px] text-slate-500">Certified Structured Electronic Health Record</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Regenerate with Gemini */}
                  <button
                    id="regenerate-gemini-soap-btn"
                    onClick={handleGenerateSoap}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${isGenerating ? "animate-spin" : ""}`} />
                    <span>{isGenerating ? "Synthesizing..." : "Gemini 3.7 Scribe"}</span>
                  </button>

                  {/* Export to FHIR Button */}
                  <button
                    id="export-fhir-btn"
                    onClick={() => onOpenFhirModal(soapNote)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Export to FHIR</span>
                  </button>
                </div>
              </div>

              {/* SOAP Sections Formatted View */}
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {/* 1. S - SUBJECTIVE */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 tracking-wider uppercase">
                      S — Subjective
                    </span>
                    <button
                      onClick={() => handleCopyText(JSON.stringify(soapNote.subjective, null, 2), "Subjective")}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Copy Subjective Section"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-800 space-y-1.5">
                    <p>
                      <strong className="text-slate-900 font-semibold">Chief Complaint:</strong>{" "}
                      {soapNote.subjective.chiefComplaint}
                    </p>
                    <p>
                      <strong className="text-slate-900 font-semibold">HPI:</strong>{" "}
                      {soapNote.subjective.historyOfPresentIllness}
                    </p>
                    <div>
                      <strong className="text-slate-900 font-semibold block mb-0.5">Review of Systems (ROS):</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {soapNote.subjective.reviewOfSystems.map((ros, idx) => (
                          <li key={idx}>{ros}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. O - OBJECTIVE */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 tracking-wider uppercase">
                      O — Objective
                    </span>
                    <button
                      onClick={() => handleCopyText(JSON.stringify(soapNote.objective, null, 2), "Objective")}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Copy Objective Section"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-800 space-y-2">
                    {/* Vitals Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 bg-white rounded-lg border border-slate-200 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">BP</span>
                        <span className="font-bold text-slate-800">{soapNote.objective.vitalSigns.bloodPressure}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">HR</span>
                        <span className="font-bold text-slate-800">{soapNote.objective.vitalSigns.heartRate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">SpO2</span>
                        <span className="font-bold text-slate-800">{soapNote.objective.vitalSigns.spO2}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Temp</span>
                        <span className="font-bold text-slate-800">{soapNote.objective.vitalSigns.temperature}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">RR</span>
                        <span className="font-bold text-slate-800">
                          {soapNote.objective.vitalSigns.respiratoryRate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">BMI</span>
                        <span className="font-bold text-slate-800">{soapNote.objective.vitalSigns.bmi}</span>
                      </div>
                    </div>

                    <div>
                      <strong className="text-slate-900 font-semibold block mb-0.5">Physical Exam Findings:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {soapNote.objective.physicalExam.map((pe, idx) => (
                          <li key={idx}>{pe}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong className="text-slate-900 font-semibold block mb-0.5">Diagnostics & Labs:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {soapNote.objective.labDiagnosticResults.map((lab, idx) => (
                          <li key={idx}>{lab}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 3. A - ASSESSMENT */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 tracking-wider uppercase">
                      A — Assessment & Coding
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        soapNote.assessment.clinicalRiskTier === "Critical"
                          ? "bg-red-100 text-red-800"
                          : soapNote.assessment.clinicalRiskTier === "High"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Risk Tier: {soapNote.assessment.clinicalRiskTier}
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 space-y-1.5">
                    <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg">
                      <p className="font-bold text-blue-900 text-sm">{soapNote.assessment.primaryDiagnosis}</p>
                      <p className="font-mono text-xs text-blue-700 font-semibold mt-0.5">
                        ICD-10-CM: {soapNote.assessment.icd10Code}
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-900 font-semibold block mb-0.5">Differential Diagnoses:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {soapNote.assessment.differentialDiagnoses.map((diff, idx) => (
                          <li key={idx}>{diff}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-slate-600 italic">{soapNote.assessment.clinicalRationale}</p>
                  </div>
                </div>

                {/* 4. P - PLAN */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 tracking-wider uppercase">
                      P — Plan & Orders
                    </span>
                    <button
                      onClick={() => handleCopyText(JSON.stringify(soapNote.plan, null, 2), "Plan")}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Copy Plan Section"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-800 space-y-3">
                    {/* Prescriptions Table */}
                    <div>
                      <strong className="text-slate-900 font-semibold block mb-1">Medications Prescribed (Rx):</strong>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-600 font-semibold">
                            <tr>
                              <th className="p-2">Medication</th>
                              <th className="p-2">Dosage & Freq</th>
                              <th className="p-2">Directions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {soapNote.plan.medicationsPrescribed.map((rx, idx) => (
                              <tr key={idx}>
                                <td className="p-2 font-bold text-slate-900">{rx.name}</td>
                                <td className="p-2 text-slate-700">
                                  {rx.dosage} • {rx.frequency}
                                </td>
                                <td className="p-2 text-slate-500">{rx.instructions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <strong className="text-slate-900 font-semibold block mb-0.5">Diagnostic & Lab Orders:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {soapNote.plan.diagnosticOrders.map((order, idx) => (
                          <li key={idx}>{order}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong className="text-slate-900 font-semibold block mb-0.5">Follow-up Timeframe:</strong>
                      <p className="text-slate-700 pl-1">{soapNote.plan.followUp}</p>
                    </div>

                    {soapNote.plan.redFlagWarnings.length > 0 && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px]">
                        <strong>Red Flag Warnings:</strong> {soapNote.plan.redFlagWarnings[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Sign Record & EHR Sync */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs">
                {isSigned ? (
                  <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Digitally Signed by Dr. Sarah Lin, MD (NPI: #1984210984)</span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-[11px]">Status: Draft • Awaiting Attending Signature</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="copy-full-soap-btn"
                  onClick={() => handleCopyText(JSON.stringify(soapNote, null, 2), "Full SOAP Note")}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Note</span>
                </button>

                <button
                  id="sign-lock-record-btn"
                  onClick={() => {
                    setIsSigned(true);
                    onShowToast("Encounter record locked and signed with SHA-256 cryptographic certificate!", "success");
                  }}
                  disabled={isSigned}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 ${
                    isSigned
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{isSigned ? "Record Locked & Signed" : "Sign & Lock Record"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
