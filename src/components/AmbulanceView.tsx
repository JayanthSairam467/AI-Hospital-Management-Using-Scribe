import React, { useState } from "react";
import { AmbulanceMap, useLiveVitals } from "./AmbulanceMap";
import {
  Ambulance as AmbulanceIcon,
  MapPin,
  Activity,
  Heart,
  Wind,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  ShieldAlert,
  ArrowRight,
  Thermometer,
  Stethoscope,
  User,
  Syringe,
  Droplets,
} from "lucide-react";
import { Ambulance } from "../types";

interface AmbulanceViewProps {
  ambulances: Ambulance[];
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export const AmbulanceView: React.FC<AmbulanceViewProps> = ({ ambulances, onShowToast }) => {
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>("amb-1");
  const [cathLabReady, setCathLabReady] = useState<boolean>(true);

  const activeAmbulance = ambulances.find((a) => a.id === selectedAmbulanceId) || ambulances[0];

  return (
    <div id="ambulance-view-container" className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <AmbulanceIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Emergency Dispatch & Telemetry Command
            </h1>
            <p className="text-xs text-slate-500">Live GPS Tracking • In-Flight 12-Lead ECG Stream • Trauma Bay Activation</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-semibold animate-pulse">
            <Radio className="w-4 h-4 text-rose-600" />
            <span>Telemetry Stream Live (900 MHz)</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Full-Width Map on top, Telemetry below */}
      <div className="space-y-6">
        {/* Full-Width Map Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Live Emergency Route & GPS Beacon</span>
              </h2>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                {activeAmbulance.callSign}
              </span>
            </div>

            {/* Real OpenStreetMap with Live GPS Tracking */}
            <AmbulanceMap
              ambulances={ambulances}
              selectedAmbulanceId={selectedAmbulanceId}
              onSelectAmbulance={setSelectedAmbulanceId}
            />

            {/* Ambulance Selector Cards */}
            <div className="grid grid-cols-3 gap-3">
              {ambulances.map((amb) => (
                <button
                  key={amb.id}
                  onClick={() => setSelectedAmbulanceId(amb.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedAmbulanceId === amb.id
                      ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{amb.callSign}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        amb.status === "arriving"
                          ? "bg-red-100 text-red-800"
                          : amb.status === "in-transit"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {amb.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{amb.emergencyType}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* In-Flight Patient Telemetry & Patient Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Live Vitals + ECG */}
          <LiveTelemetryPanel ambulance={activeAmbulance} onShowToast={onShowToast} />

          {/* RIGHT: Patient Info + Medical History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Patient Profile & Medical History</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                MRN: #PLT-29841
              </span>
            </div>

            {/* Patient Demographics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] block">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">Robert J. Chen</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] block">Age / Sex / Blood Type</span>
                <span className="font-bold text-slate-900 text-sm">58y Male • O+</span>
              </div>
            </div>

            {/* Known Conditions */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Known Conditions</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">Hypertension Stage II</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">Type 2 Diabetes</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">Hyperlipidemia</span>
              </div>
            </div>

            {/* Allergies */}
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="font-bold text-red-900 block">Known Allergies</span>
                <span className="text-red-700">Penicillin (Anaphylaxis) • Sulfa Drugs (Rash)</span>
              </div>
            </div>

            {/* Medications Administered En Route */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <Syringe className="w-3 h-3" />
                <span>Medications Administered En Route</span>
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Aspirin 325mg PO</span>
                  <span className="text-slate-500 font-mono text-[10px]">14:22</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Nitroglycerin 0.4mg SL x2</span>
                  <span className="text-slate-500 font-mono text-[10px]">14:28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Heparin 5000u IV Bolus</span>
                  <span className="text-slate-500 font-mono text-[10px]">14:35</span>
                </div>
              </div>
            </div>

            {/* IV Access & Fluids */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1">
                <Droplets className="w-3 h-3" />
                <span>IV Access & Fluid Resuscitation</span>
              </span>
              <div className="flex items-center justify-between text-slate-800">
                <span className="font-semibold">18G IV Left AC</span>
                <span className="text-blue-700 font-bold">NS 250mL Wide Open</span>
              </div>
              <div className="flex items-center justify-between text-slate-800">
                <span className="font-semibold">20G IV Right Hand</span>
                <span className="text-blue-700 font-bold">Saline Lock</span>
              </div>
            </div>

            {/* Paramedic & Driver Info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold">Paramedic Team:</span>
                <span>{activeAmbulance.paramedic}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold">Driver / Unit:</span>
                <span>{activeAmbulance.driver}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Live Telemetry Panel (vitals update every 1.2s) ─────────────────────────
const LiveTelemetryPanel: React.FC<{
  ambulance: Ambulance;
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
}> = ({ ambulance, onShowToast }) => {
  const vitals = useLiveVitals({
    hr: ambulance.telemetry.patientHR,
    spo2: ambulance.telemetry.patientSpO2,
    bp: ambulance.telemetry.patientBP,
    speedKmh: ambulance.telemetry.speedKmh,
  });

  const hrStatus = vitals.hr > 100 ? "text-rose-600" : vitals.hr < 60 ? "text-amber-600" : "text-emerald-600";
  const spo2Status = vitals.spo2 < 92 ? "text-rose-600" : vitals.spo2 < 95 ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>In-Flight Patient Telemetry</span>
        </h2>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700">LIVE</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
            {ambulance.urgencyTier}
          </span>
        </div>
      </div>

      {/* 6 Live Vital Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center font-mono">
          <Heart className="w-3.5 h-3.5 text-rose-500 mx-auto mb-0.5" />
          <span className="text-[10px] font-bold text-rose-600 block">Heart Rate</span>
          <span className={`text-2xl font-black transition-colors duration-300 ${hrStatus}`}>
            {vitals.hr}
          </span>
          <span className="text-[10px] text-rose-700 block">bpm</span>
        </div>

        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center font-mono">
          <Wind className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
          <span className="text-[10px] font-bold text-blue-600 block">SpO2</span>
          <span className={`text-2xl font-black transition-colors duration-300 ${spo2Status}`}>
            {vitals.spo2}%
          </span>
          <span className="text-[10px] text-blue-700 block">Oxygen</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono">
          <Stethoscope className="w-3.5 h-3.5 text-slate-500 mx-auto mb-0.5" />
          <span className="text-[10px] font-bold text-slate-600 block">Blood Pressure</span>
          <span className="text-xl font-black text-slate-900">
            {vitals.systolic}/{vitals.diastolic}
          </span>
          <span className="text-[10px] text-slate-500 block">mmHg</span>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center font-mono">
          <Wind className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-0.5" />
          <span className="text-[10px] font-bold text-emerald-600 block">Resp Rate</span>
          <span className="text-2xl font-black text-emerald-900">{vitals.rr}</span>
          <span className="text-[10px] text-emerald-700 block">br/min</span>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center font-mono">
          <Thermometer className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
          <span className="text-[10px] font-bold text-amber-600 block">Temperature</span>
          <span className="text-2xl font-black text-amber-900">{vitals.temp}</span>
          <span className="text-[10px] text-amber-700 block">°C</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono">
          <AmbulanceIcon className="w-3.5 h-3.5 text-slate-500 mx-auto mb-0.5" />
          <span className="text-[10px] font-bold text-slate-600 block">Speed</span>
          <span className="text-2xl font-black text-slate-900">{vitals.speedKmh}</span>
          <span className="text-[10px] text-slate-500 block">km/h</span>
        </div>
      </div>

      {/* ECG */}
      <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-white space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>12-Lead Live ECG Stream (Lead II)</span>
          </span>
          <span className="text-slate-400 text-[10px]">25 mm/s • 10 mm/mV</span>
        </div>
        <div className="h-16 w-full overflow-hidden relative">
          <svg
            className="absolute h-full stroke-emerald-400 fill-none"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            style={{
              width: '200%',
              animation: 'ecgScroll 3s linear infinite',
            }}
          >
            <path
              d="M 0 50 L 80 50 L 90 45 L 100 50 L 110 50 L 120 15 L 130 90 L 140 30 L 150 60 L 160 50 L 220 50 L 230 45 L 240 50 L 250 50 L 260 15 L 270 90 L 280 30 L 290 60 L 300 50 L 360 50 L 370 45 L 380 50 L 390 50 L 400 15 L 410 90 L 420 30 L 430 60 L 440 50 L 500 50 L 580 50 L 590 45 L 600 50 L 610 50 L 620 15 L 630 90 L 640 30 L 650 60 L 660 50 L 720 50 L 730 45 L 740 50 L 750 50 L 760 15 L 770 90 L 780 30 L 790 60 L 800 50 L 860 50 L 870 45 L 880 50 L 890 50 L 900 15 L 910 90 L 920 30 L 930 60 L 940 50 L 1000 50"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        <div className="text-[11px] text-amber-300 font-mono bg-amber-950/60 p-2 rounded border border-amber-800/80">
          ⚠️ STEMI Alert: 3.5mm ST-elevation in V2-V4 (Anterior Infarct)
        </div>
      </div>

      {/* Cath Lab Action */}
      <button
        onClick={() =>
          onShowToast("Cath Lab Suite 1 & Trauma Team 2 Activated. Interventionalist alerted.", "success")
        }
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-red-500/20 transition-all flex items-center justify-center space-x-2"
      >
        <ShieldAlert className="w-4 h-4" />
        <span>Confirm Cath Lab & Trauma Bay 1 Activation</span>
      </button>
    </div>
  );
};
