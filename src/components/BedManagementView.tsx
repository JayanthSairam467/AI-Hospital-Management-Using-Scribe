import React, { useState } from "react";
import { BedFloorPlan3D } from "./BedFloorPlan3D";
import {
  BedDouble,
  Activity,
  Heart,
  Wind,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Bed, OxygenManifold } from "../types";
import { maskName } from "../utils/privacyMask";

interface BedManagementViewProps {
  beds: Bed[];
  oxygen: OxygenManifold[];
  onSelectBed: (bed: Bed) => void;
  onUpdateBedStatus: (bedId: string, newStatus: Bed["status"]) => void;
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
  privacyMode?: boolean;
}

export const BedManagementView: React.FC<BedManagementViewProps> = ({
  beds,
  oxygen,
  onSelectBed,
  onUpdateBedStatus,
  onShowToast,
  privacyMode = false,
}) => {
  const [selectedWard, setSelectedWard] = useState<string>("All");
  const [activeBedModal, setActiveBedModal] = useState<Bed | null>(null);

  const wards = ["All", "ICU", "Ward A", "Emergency Triage"];

  const filteredBeds = beds.filter((b) => (selectedWard === "All" ? true : b.ward === selectedWard));

  const occupiedCount = beds.filter((b) => b.status === "occupied" || b.status === "critical").length;
  const availableCount = beds.filter((b) => b.status === "available").length;
  const criticalCount = beds.filter((b) => b.status === "critical").length;

  return (
    <div id="bed-management-view-container" className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              3D Ward & Bed Occupancy Operating System
            </h1>
            <p className="text-xs text-slate-500">
              Interactive Stylized Isometric Floorplan • Central Oxygen Pipeline Telemetry
            </p>
          </div>
        </div>

        {/* Status Counts */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            {availableCount} Available
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            {occupiedCount} Occupied
          </span>
          {criticalCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 animate-pulse">
              {criticalCount} Critical
            </span>
          )}
        </div>
      </div>

      {/* Ward Selector and Oxygen Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Stylized 3D Ward Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Ward:</span>
                <div className="flex items-center space-x-1.5">
                  {wards.map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWard(w)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedWard === w
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Legend */}
              <div className="flex items-center space-x-3 text-xs font-medium text-slate-600">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-xs"></span>
                  <span>Available</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 shadow-xs"></span>
                  <span>Occupied</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500 shadow-xs"></span>
                  <span>Critical</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shadow-xs"></span>
                  <span>Cleaning/Rsv</span>
                </span>
              </div>
            </div>


            {/* Stylized 3D Floorplan Canvas */}
            <div className="p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
              {/* Floor grid lines */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:32px_32px]" />

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
                {filteredBeds.map((bed) => {
                  const isAvail = bed.status === "available";
                  const isOcc = bed.status === "occupied";
                  const isCrit = bed.status === "critical";
                  const isClean = bed.status === "cleaning" || bed.status === "reserved";

                  let cardBg = "bg-emerald-950/60 border-emerald-400 text-emerald-200 hover:border-emerald-300";
                  let topPillBg = "bg-emerald-500/30 text-emerald-300";

                  if (isOcc) {
                    cardBg = "bg-blue-950/70 border-blue-400 text-blue-100 hover:border-blue-300";
                    topPillBg = "bg-blue-500/30 text-blue-300";
                  } else if (isCrit) {
                    cardBg = "bg-red-950/80 border-red-500 text-red-100 animate-pulse hover:border-red-400";
                    topPillBg = "bg-red-500/40 text-red-200";
                  } else if (isClean) {
                    cardBg = "bg-amber-950/60 border-amber-400 text-amber-200 hover:border-amber-300";
                    topPillBg = "bg-amber-500/30 text-amber-300";
                  }

                  return (
                    <div
                      key={bed.id}
                      onClick={() => setActiveBedModal(bed)}
                      className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-2 hover:shadow-2xl ${cardBg}`}
                      style={{
                        transform: "perspective(600px) rotateX(12deg) rotateY(-2deg)",
                        boxShadow: isCrit
                          ? "0 14px 28px rgba(239, 68, 68, 0.35)"
                          : "0 10px 20px rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {/* Bed Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-extrabold text-sm tracking-wider text-white">
                          {bed.code}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${topPillBg}`}>
                          {bed.status}
                        </span>
                      </div>

                      {/* Patient Details */}
                      <div className="space-y-1 my-2">
                        <p className="text-xs font-bold text-white truncate">
                          {bed.patientName ? (privacyMode ? maskName(bed.patientName) : bed.patientName) : "Vacant Bed Ready"}
                        </p>
                        <p className="text-[10px] text-slate-300 truncate">
                          {bed.diagnosis || (isAvail ? "Sanitized & Verified" : "Awaiting Triage")}
                        </p>
                      </div>

                      {/* Live Vitals Telemetry */}
                      {bed.spO2 ? (
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                          <span className="flex items-center space-x-1">
                            <Activity className="w-3 h-3 text-blue-400" />
                            <span>{bed.heartRate} bpm</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Wind className="w-3 h-3 text-teal-400" />
                            <span>{bed.spO2}% SpO2</span>
                          </span>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400 text-center">
                          {isAvail ? "Ready for Intake" : "Sanitation in Progress"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 col: Oxygen Pipeline & Environmental Controls */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Medical Gas Manifolds</h3>
                <p className="text-[11px] text-slate-500">Central O2 Pipeline Telemetry</p>
              </div>
            </div>

            <div className="space-y-4">
              {oxygen.map((ox, idx) => {
                const isCrit = ox.currentLevelPct <= 25;
                const isWarn = ox.currentLevelPct <= 50 && !isCrit;

                return (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{ox.wardName}</span>
                      <span
                        className={`font-mono font-bold ${
                          isCrit ? "text-red-600 animate-pulse" : isWarn ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {ox.currentLevelPct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          isCrit ? "bg-red-500" : isWarn ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${ox.currentLevelPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Pressure: {ox.pressurePsi} PSI</span>
                      <span>Flow: {ox.activeFlowLpm} L/min</span>
                    </div>

                    {isCrit && (
                      <button
                        onClick={() =>
                          onShowToast(
                            `Automated switchover to Reserve Manifold activated for ${ox.wardName}!`,
                            "success"
                          )
                        }
                        className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors"
                      >
                        Switch to Backup Reserve
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bed Inspection / Action Modal */}
      {activeBedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BedDouble className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Bed Details: {activeBedModal.code} ({activeBedModal.ward})
                </h3>
              </div>
              <button
                onClick={() => setActiveBedModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {activeBedModal.patientName ? (privacyMode ? maskName(activeBedModal.patientName) : activeBedModal.patientName) : "Vacant"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Status</span>
                  <span className="font-bold uppercase text-blue-700">{activeBedModal.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Attending Physician</span>
                  <span className="font-medium text-slate-800">
                    {activeBedModal.attendingDoctor || "Dr. Sarah Lin, MD"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Diagnosis</span>
                  <span className="font-medium text-slate-800">
                    {activeBedModal.diagnosis || "No acute intake"}
                  </span>
                </div>
              </div>

              {activeBedModal.spO2 && (
                <div className="flex items-center justify-around p-3 bg-blue-50 border border-blue-200 rounded-xl font-mono text-center">
                  <div>
                    <span className="text-[10px] text-blue-600 block">Pulse Rate</span>
                    <span className="font-bold text-base text-blue-900">{activeBedModal.heartRate} bpm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 block">Oxygen Saturation</span>
                    <span className="font-bold text-base text-blue-900">{activeBedModal.spO2}% SpO2</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 block">O2 Delivery</span>
                    <span className="font-bold text-base text-blue-900">
                      {activeBedModal.oxygenFlowLpm || 2} L/min
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Change Buttons */}
            <div className="pt-2 grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onUpdateBedStatus(activeBedModal.id, "available");
                  setActiveBedModal(null);
                  onShowToast(`${activeBedModal.code} marked as Available!`, "success");
                }}
                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors"
              >
                Mark Available
              </button>
              <button
                onClick={() => {
                  onUpdateBedStatus(activeBedModal.id, "occupied");
                  setActiveBedModal(null);
                  onShowToast(`${activeBedModal.code} assigned to patient!`, "success");
                }}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors"
              >
                Assign Patient
              </button>
              <button
                onClick={() => {
                  onUpdateBedStatus(activeBedModal.id, "cleaning");
                  setActiveBedModal(null);
                  onShowToast(`Housekeeping dispatched for ${activeBedModal.code}!`, "info");
                }}
                className="py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs transition-colors"
              >
                Trigger Clean
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
