import React, { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import {
  Activity,
  Mic,
  Pill,
  BedDouble,
  Ambulance as AmbulanceIcon,
  Users,
  BrainCircuit,
  Wind,
  AlertTriangle,
  ArrowRight,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  MedicineItem,
  Bed,
  OxygenManifold,
  Ambulance,
  StaffMember,
  Patient,
} from "../types";
import { maskName } from "../utils/privacyMask";

interface DashboardOverviewProps {
  medicines: MedicineItem[];
  beds: Bed[];
  oxygen: OxygenManifold[];
  ambulances: Ambulance[];
  staff: StaffMember[];
  onNavigate: (view: string) => void;
  onTriggerDemandAlert: (medId: string) => void;
  onSelectBed: (bed: Bed) => void;
  onAskWhatIfMini: (query: string) => Promise<string>;
  onLaunchConsultation: () => void;
  privacyMode?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  medicines,
  beds,
  oxygen,
  ambulances,
  staff,
  onNavigate,
  onTriggerDemandAlert,
  onSelectBed,
  onAskWhatIfMini,
  onLaunchConsultation,
  privacyMode = false,
}) => {
  // Mini What-If chat state
  const [miniQuery, setMiniQuery] = useState<string>("What if patient is allergic to penicillin?");
  const [miniChatLog, setMiniChatLog] = useState<
    Array<{ sender: "doctor" | "ai"; text: string; timestamp: string }>
  >([
    {
      sender: "doctor",
      text: "What if patient is allergic to penicillin?",
      timestamp: "10:14 AM",
    },
    {
      sender: "ai",
      text: "Direct Alternative: Azithromycin 500mg PO Day 1, then 250mg PO Days 2-5 (Z-Pak) or Doxycycline 100mg BID. All standard beta-lactams (Amoxicillin, Ampicillin) are contraindicated due to documented anaphylaxis risk. (Ref: IDSA Guidelines).",
      timestamp: "10:14 AM",
    },
  ]);
  const [isMiniThinking, setIsMiniThinking] = useState<boolean>(false);
  const [selectedWard, setSelectedWard] = useState<string>("All");

  const handleMiniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!miniQuery.trim() || isMiniThinking) return;

    const userText = miniQuery.trim();
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    setMiniChatLog((prev) => [...prev, { sender: "doctor", text: userText, timestamp: timeStr }]);
    setMiniQuery("");
    setIsMiniThinking(true);

    try {
      const reply = await onAskWhatIfMini(userText);
      setMiniChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMiniChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Clinical protocol updated based on local hospital formulary. Consider Macrolide or Fluoroquinolone coverage.",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsMiniThinking(false);
    }
  };

  // Metrics summary
  const occupiedBeds = beds.filter((b) => b.status === "occupied" || b.status === "critical").length;
  const totalBeds = beds.length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const inboundAmbulance = ambulances.find((a) => a.status === "arriving" || a.status === "in-transit");

  return (
    <div id="dashboard-overview-container" className="space-y-6 pb-12">
      {/* Top Banner: Quick Summary & Instant Scribe Launcher */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[11px] font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hospital Telemetry: Nominal</span>
            <span className="text-white/40">•</span>
            <span>Shift: Day 07:00-19:00</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Clinic Operating Command</h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            Welcome back, Dr. Sarah Lin. Ambient scribe engine is primed for patient encounters. Hospital bed
            occupancy is at <span className="font-bold text-white">{occupancyRate}%</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="overview-launch-scribe-btn"
            onClick={onLaunchConsultation}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-blue-700 rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 group"
          >
            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span>Start Ambient Consultation</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 4 Quick Stat KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate("beds")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Ward Bed Occupancy</span>
            <BedDouble className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{occupancyRate}%</span>
            <span className="text-xs text-slate-500">
              ({occupiedBeds}/{totalBeds} beds)
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>

        <div
          onClick={() => onNavigate("ambulance")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Inbound Ambulances</span>
            <AmbulanceIcon className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-600 font-mono">1 Urgent</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
              ETA {inboundAmbulance?.etaMinutes || 4}m
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">Code STEMI • Cath Lab Suite 1</p>
        </div>

        <div
          onClick={() => onNavigate("inventory")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pharmacy Low Stock</span>
            <Pill className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-600 font-mono">2 Critical</span>
            <span className="text-xs text-slate-500">of 6 tracked</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">Amoxicillin (42u) • Epinephrine</p>
        </div>

        <div
          onClick={() => onNavigate("staff")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">On-Duty Clinicians</span>
            <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 font-mono">6 Staff</span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              100% Shift Cov.
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">Dr. Lin • Dr. Thorne • Nurse Davis</p>
        </div>
      </div>

      {/* Main Grid: Core 6 Mini Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Medicine Inventory (Minimal table with low stock highlight & Trigger Demand Alert button) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Medicine Inventory</h3>
                  <p className="text-[11px] text-slate-500">Critical Stock & Demand Alerts</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("inventory")}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5"
              >
                <span>Full Pharmacy</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Medicine Items List */}
            <div className="pt-3 space-y-2.5">
              {medicines.slice(0, 4).map((med) => {
                const stockPct = Math.round((med.stockUnits / med.maxUnits) * 100);
                const isCritical = med.status === "critical" || med.stockUnits <= med.minThreshold * 0.6;
                const isLow = med.status === "low" || med.stockUnits <= med.minThreshold;

                return (
                  <div
                    key={med.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${isCritical
                        ? "bg-red-50/60 border-red-200"
                        : isLow
                          ? "bg-amber-50/60 border-amber-200"
                          : "bg-slate-50/60 border-slate-200"
                      }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <div>
                        <span className="font-bold text-slate-900">{med.name}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">{med.dosage}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold ${isCritical ? "text-red-700" : isLow ? "text-amber-700" : "text-slate-800"
                            }`}
                        >
                          {med.stockUnits} {med.unitType.split(" ")[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] mt-1.5 text-slate-500">
                      <span>Threshold: {med.minThreshold}</span>
                      <span
                        className={`font-semibold uppercase tracking-wider text-[9px] px-1.5 py-0.2 rounded ${isCritical
                            ? "bg-red-200 text-red-800"
                            : isLow
                              ? "bg-amber-200 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                      >
                        {med.status}
                      </span>
                    </div>

                    {/* Stock Bar */}
                    <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-1 rounded-full ${isCritical ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              id="trigger-demand-alert-btn"
              onClick={() => onTriggerDemandAlert("med-1")}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Trigger Demand Alert (Amoxicillin)</span>
            </button>
          </div>
        </div>

        {/* Module 2: Bed Management (Stylized 3D Isometric View with green=available, blue=occupied) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ward Beds (Stylized 3D)</h3>
                  <p className="text-[11px] text-slate-500">Live Hospital Floor Status</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("beds")}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5"
              >
                <span>3D Floorplan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ward Filter Pills */}
            <div className="flex items-center space-x-1.5 pt-2">
              {["All", "ICU", "Ward A", "Emergency Triage"].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWard(w)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${selectedWard === w
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Stylized 3D Bed Matrix */}
            <div className="pt-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                {/* Legend */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded bg-emerald-500"></span>
                    <span>Available</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded bg-blue-500"></span>
                    <span>Occupied</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded bg-red-500"></span>
                    <span>Critical</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded bg-amber-500"></span>
                    <span>Clean/Rsv</span>
                  </span>
                </div>

                {/* Isometric Styled Bed Grid */}
                <div className="grid grid-cols-4 gap-2.5 py-1">
                  {beds
                    .filter((b) => (selectedWard === "All" ? true : b.ward === selectedWard))
                    .slice(0, 8)
                    .map((bed) => {
                      let colorClass = "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-950";
                      let indicatorColor = "bg-emerald-400";
                      if (bed.status === "occupied") {
                        colorClass = "bg-blue-500/20 border-blue-400 text-blue-300 shadow-blue-950";
                        indicatorColor = "bg-blue-400";
                      } else if (bed.status === "critical") {
                        colorClass = "bg-red-500/30 border-red-400 text-red-200 shadow-red-950 animate-pulse";
                        indicatorColor = "bg-red-400";
                      } else if (bed.status === "cleaning" || bed.status === "reserved") {
                        colorClass = "bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-950";
                        indicatorColor = "bg-amber-400";
                      }

                      return (
                        <div
                          key={bed.id}
                          onClick={() => onSelectBed(bed)}
                          title={`${bed.code} - ${bed.status.toUpperCase()} ${bed.patientName ? `(${privacyMode ? maskName(bed.patientName) : bed.patientName})` : ""
                            }`}
                          className={`relative group p-2 rounded-lg border text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${colorClass}`}
                          style={{
                            transform: "perspective(400px) rotateX(10deg)",
                            boxShadow: "0 6px 12px -2px rgba(0,0,0,0.5)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono font-bold">{bed.code}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`}></span>
                          </div>
                          <div className="text-[10px] font-medium truncate">
                            {bed.patientName ? (privacyMode ? maskName(bed.patientName).split(" ")[0] : bed.patientName.split(" ")[0]) : "Vacant"}
                          </div>
                          {bed.spO2 && (
                            <div className="text-[8px] font-mono text-slate-300 mt-0.5">
                              SpO2 {bed.spO2}%
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Click any bed to view patient telemetry</span>
            <span className="font-semibold text-slate-700">ICU / WA / ER</span>
          </div>
        </div>

        {/* Module 3: Oxygen Tracking (Visual capacity bars & critical alert) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Oxygen Tracking</h3>
                  <p className="text-[11px] text-slate-500">Pipeline Manifolds & Capacity</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                1 Warning
              </span>
            </div>

            {/* Oxygen Manifolds Capacity Bars */}
            <div className="pt-3 space-y-3">
              {oxygen.map((ox, idx) => {
                const isCritical = ox.currentLevelPct <= 25;
                const isWarning = ox.currentLevelPct <= 50 && !isCritical;

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{ox.wardName}</span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`font-mono font-bold ${isCritical ? "text-red-600 animate-pulse" : isWarning ? "text-amber-600" : "text-emerald-600"
                            }`}
                        >
                          {ox.currentLevelPct}%
                        </span>
                        {isCritical && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 rounded">
                            CRITICAL
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${isCritical
                            ? "bg-red-500 animate-pulse"
                            : isWarning
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        style={{ width: `${ox.currentLevelPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Pressure: {ox.pressurePsi} PSI</span>
                      <span>Est. {ox.estimatedHoursLeft}h left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-1">
            <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Ward B manifold below 20% reserve</span>
              </span>
              <button
                onClick={() => onNavigate("beds")}
                className="font-bold text-red-700 hover:underline"
              >
                Switch Backup
              </button>
            </div>
          </div>
        </div>

        {/* Module 4: Ambulance Tracking (Card with styled map placeholder & ETA 4 mins) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                  <AmbulanceIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ambulance Tracking</h3>
                  <p className="text-[11px] text-slate-500">Live GPS & Emergency Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("ambulance")}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5"
              >
                <span>Dispatch Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Real Mini Map */}
            <div className="pt-2">
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200">
                <MapContainer
                  center={[37.77, -122.40]}
                  zoom={12}
                  scrollWheelZoom={false}
                  zoomControl={false}
                  dragging={false}
                  attributionControl={false}
                  className="w-full h-full"
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={[37.755, -122.405]} icon={L.divIcon({
                    className: '', iconSize: [28, 28], iconAnchor: [14, 14],
                    html: `<div style="width:28px;height:28px;background:#2563eb;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏥</div>`,
                  })} />
                  <Marker position={[37.785, -122.409]} icon={L.divIcon({
                    className: '', iconSize: [26, 26], iconAnchor: [13, 13],
                    html: `<div style="width:26px;height:26px;background:#dc2626;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🚑</div>`,
                  })} />
                </MapContainer>
              </div>
            </div>

            {/* In-Transit Ambulance Info */}
            <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900">Ambulance 1</span>
                <span className="font-bold text-rose-700 bg-rose-200/80 px-1.5 py-0.5 rounded text-[10px]">
                  ETA 4 mins
                </span>
              </div>
              <p className="text-rose-800 font-medium">Cardiac Emergency (STEMI protocol)</p>
              <div className="flex items-center space-x-3 text-[10px] text-slate-600 font-mono pt-1">
                <span>Speed: 74 km/h</span>
                <span>SpO2: 93%</span>
                <span>HR: 118 bpm</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("ambulance")}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Open Trauma Bay Protocol</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 5: Staff Scheduling (Simple list showing On Shift Today) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Staff Scheduling</h3>
                  <p className="text-[11px] text-slate-500">On Shift Today & Department Duty</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("staff")}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5"
              >
                <span>Full Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Staff List */}
            <div className="pt-2 space-y-2">
              {staff.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200">
                      {member.avatarInitials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">{member.name}</p>
                      <p className="text-[10px] text-slate-500">{member.department}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${member.status === "on-duty"
                        ? "bg-emerald-100 text-emerald-800"
                        : member.status === "in-or"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                  >
                    {member.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Shift hours: 07:00 - 19:00</span>
            <span className="font-semibold text-emerald-600">All shifts staffed</span>
          </div>
        </div>

        {/* Module 6: What-If Analysis (AI Chat where doctor asks questions and AI responds based on guidelines) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">What-If Analysis (AI Chat)</h3>
                  <p className="text-[11px] text-slate-500">Clinical Decision Support</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("what-if")}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5"
              >
                <span>Deep Dive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Box */}
            <div className="pt-2 h-44 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              {miniChatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl text-xs ${msg.sender === "doctor"
                      ? "bg-blue-600 text-white ml-6 font-medium shadow-xs"
                      : "bg-white text-slate-800 mr-4 border border-slate-200 shadow-2xs"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1 opacity-75 text-[9px]">
                    <span className="font-semibold">
                      {msg.sender === "doctor" ? "Dr. Sarah Lin" : "OmniScribe AI (Gemini 3.7)"}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">{msg.text}</p>
                </div>
              ))}

              {isMiniThinking && (
                <div className="p-2.5 rounded-xl bg-white text-slate-600 border border-slate-200 mr-4 flex items-center space-x-2 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>Consulting clinical pharmacology guidelines...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleMiniSubmit} className="pt-1 flex items-center space-x-2">
            <input
              type="text"
              value={miniQuery}
              onChange={(e) => setMiniQuery(e.target.value)}
              placeholder="Ask clinical what-if scenario..."
              className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isMiniThinking}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors shrink-0"
              title="Submit clinical query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
