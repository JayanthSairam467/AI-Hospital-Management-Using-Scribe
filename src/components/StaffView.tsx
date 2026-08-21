import React, { useState } from "react";
import {
  Users,
  Search,
  Clock,
  PhoneCall,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { StaffMember } from "../types";

interface StaffViewProps {
  staff: StaffMember[];
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ staff, onShowToast }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [activePagerStaff, setActivePagerStaff] = useState<StaffMember | null>(null);
  const [pagerMessage, setPagerMessage] = useState<string>("");

  const departments = [
    "All",
    "Cardiology",
    "Emergency Medicine",
    "Inpatient Ward A",
    "Neurology & ICU",
    "Pulmonology & Oxygen Supply",
    "Central Pharmacy & Cold Chain",
  ];

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All" || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleSendPager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagerMessage.trim() || !activePagerStaff) return;
    onShowToast(`High-priority clinical page sent to ${activePagerStaff.name} (${activePagerStaff.pagerId})!`, "success");
    setPagerMessage("");
    setActivePagerStaff(null);
  };

  return (
    <div id="staff-view-container" className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Clinical Staff Scheduling & Shift Operating System
            </h1>
            <p className="text-xs text-slate-500">
              Real-Time On-Duty Roster • Active Patient Workload • Secure Medical Paging
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            6 On-Duty Today
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            100% Shift Coverage
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clinician, specialty, role..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === d
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-base flex items-center justify-center shadow-2xs">
                    {member.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{member.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{member.role}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    member.status === "on-duty"
                      ? "bg-emerald-100 text-emerald-800"
                      : member.status === "in-or"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {member.status}
                </span>
              </div>

              {/* Department and Shift Info */}
              <div className="space-y-1 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 text-[10px]">Department:</span>
                  <span className="font-semibold">{member.department}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 text-[10px]">Shift Schedule:</span>
                  <span className="font-mono text-slate-800">{member.shift}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 text-[10px]">Assigned Inpatients:</span>
                  <span className="font-bold text-blue-700">{member.patientsAssigned} Patients</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 text-[10px]">Emergency Pager:</span>
                  <span className="font-mono font-bold text-slate-800">{member.pagerId}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <button
                onClick={() => setActivePagerStaff(member)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Send Direct Clinical Page</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pager Modal */}
      {activePagerStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Send Page: {activePagerStaff.name}
                </h3>
              </div>
              <button
                onClick={() => setActivePagerStaff(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendPager} className="space-y-3">
              <div className="text-xs text-slate-600">
                <span>Pager Channel: </span>
                <span className="font-mono font-bold text-slate-900">{activePagerStaff.pagerId}</span>
                <span> ({activePagerStaff.department})</span>
              </div>

              <textarea
                value={pagerMessage}
                onChange={(e) => setPagerMessage(e.target.value)}
                placeholder="Enter urgent clinical message (e.g., Code STEMI Cath Lab Suite 1 ready, bedside consult requested in Ward A Bed 03)..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePagerStaff(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Page</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
