import React, { useState } from "react";
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

      {/* Main Split: Dispatch Map & Active Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map & Route Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
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

            {/* High-Contrast Interactive Styled Map */}
            <div className="relative h-96 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              {/* Radar Grid & Roads */}
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Simulated Map Roads */}
              <svg className="absolute inset-0 w-full h-full">
                <line x1="0" y1="120" x2="100%" y2="120" stroke="#334155" strokeWidth="6" />
                <line x1="0" y1="280" x2="100%" y2="280" stroke="#334155" strokeWidth="4" />
                <line x1="200" y1="0" x2="200" y2="100%" stroke="#334155" strokeWidth="6" />
                <line x1="450" y1="0" x2="450" y2="100%" stroke="#334155" strokeWidth="4" />

                {/* Emergency Route Curve */}
                <path
                  d="M 60 80 Q 200 120, 320 200 T 520 290"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeDasharray="6 3"
                />
              </svg>

              {/* Hospital Destination Pin */}
              <div className="absolute bottom-16 right-20 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-xl animate-pulse">
                  H
                </div>
                <span className="text-[10px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 mt-1">
                  Metro General (Cath Lab 1)
                </span>
              </div>

              {/* In-Transit Ambulance Beacon */}
              <div className="absolute top-24 left-24 flex flex-col items-center animate-bounce">
                <div className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xl border border-red-400">
                  <AmbulanceIcon className="w-4 h-4" />
                  <span>{activeAmbulance.callSign}</span>
                </div>
                <div className="text-[10px] font-mono text-white bg-black/80 px-2 py-0.5 rounded mt-1">
                  ETA {activeAmbulance.etaMinutes}m • {activeAmbulance.telemetry.speedKmh} km/h
                </div>
              </div>

              {/* Map Footer Telemetry */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Emergency Callout:</span>
                  <span className="font-bold text-rose-400">{activeAmbulance.emergencyType}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Assigned Bay:</span>
                  <span className="font-bold text-white">{activeAmbulance.destinationBay}</span>
                </div>
              </div>
            </div>

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

        {/* Right: In-Flight Patient Telemetry & Cath Lab Ready (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>In-Flight Patient Telemetry</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                {activeAmbulance.urgencyTier}
              </span>
            </div>

            {/* Live Vital Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-center font-mono">
                <span className="text-[10px] font-bold text-rose-600 block">Heart Rate</span>
                <span className="text-2xl font-black text-rose-950">
                  {activeAmbulance.telemetry.patientHR} <span className="text-xs font-normal">bpm</span>
                </span>
                <span className="text-[9px] text-rose-700 block mt-0.5">Tachycardic Sinus</span>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-center font-mono">
                <span className="text-[10px] font-bold text-blue-600 block">SpO2 Oxygen</span>
                <span className="text-2xl font-black text-blue-950">
                  {activeAmbulance.telemetry.patientSpO2}%
                </span>
                <span className="text-[9px] text-blue-700 block mt-0.5">High-Flow Nasal 6L</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono">
                <span className="text-[10px] font-bold text-slate-600 block">Blood Pressure</span>
                <span className="text-xl font-black text-slate-900">
                  {activeAmbulance.telemetry.patientBP}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Hypotensive Episode</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono">
                <span className="text-[10px] font-bold text-slate-600 block">Transit Speed</span>
                <span className="text-xl font-black text-slate-900">
                  {activeAmbulance.telemetry.speedKmh} <span className="text-xs font-normal">km/h</span>
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Siren & Lights Active</span>
              </div>
            </div>

            {/* 12-Lead ECG Stream Box */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>12-Lead Live ECG Stream (Lead II)</span>
                </span>
                <span className="text-slate-400 text-[10px]">25 mm/s • 10 mm/mV</span>
              </div>

              {/* Animated ECG path */}
              <div className="h-16 w-full flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full stroke-emerald-400 fill-none" viewBox="0 0 500 100">
                  <path
                    d="M 0 50 L 80 50 L 90 45 L 100 50 L 110 50 L 120 15 L 130 90 L 140 30 L 150 60 L 160 50 L 220 50 L 230 45 L 240 50 L 250 50 L 260 15 L 270 90 L 280 30 L 290 60 L 300 50 L 360 50 L 370 45 L 380 50 L 390 50 L 400 15 L 410 90 L 420 30 L 430 60 L 440 50 L 500 50"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              <div className="text-[11px] text-amber-300 font-mono bg-amber-950/60 p-2 rounded border border-amber-800/80">
                ⚠️ STEMI Alert: 3.5mm ST-elevation in V2-V4 (Anterior Infarct)
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

            {/* Trauma Bay / Cath Lab Action */}
            <div className="pt-2">
              <button
                onClick={() =>
                  onShowToast(
                    "Cath Lab Suite 1 & Trauma Team 2 Activated. Interventionalist alerted.",
                    "success"
                  )
                }
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-red-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Confirm Cath Lab & Trauma Bay 1 Activation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
