import React from "react";
import {
  LayoutDashboard,
  Mic,
  Pill,
  BedDouble,
  Ambulance,
  Users,
  BrainCircuit,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate?: (view: string) => void;
  onSelectView?: (view: string) => void;
  collapsed?: boolean;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onSelectView,
  collapsed = false,
  unreadAlertsCount = 0,
}) => {
  const handleNav = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else if (onSelectView) {
      onSelectView(id);
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      description: "Clinic OS Overview",
    },
    {
      id: "scribe",
      label: "AI Scribe",
      icon: Mic,
      badge: "LIVE",
      badgeColor: "bg-red-500 text-white animate-pulse",
      description: "Ambient SOAP Generator",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Pill,
      badge: "1 Alert",
      badgeColor: "bg-amber-100 text-amber-800 border border-amber-300",
      description: "Smart Medicine Pharmacy",
    },
    {
      id: "beds",
      label: "Beds",
      icon: BedDouble,
      badge: "78%",
      badgeColor: "bg-blue-100 text-blue-700",
      description: "3D Isometric Ward Manager",
    },
    {
      id: "ambulance",
      label: "Ambulance",
      icon: Ambulance,
      badge: "ETA 4m",
      badgeColor: "bg-rose-100 text-rose-700 font-semibold",
      description: "Cardiac & Trauma Dispatch",
    },
    {
      id: "staff",
      label: "Staff",
      icon: Users,
      badge: "6 Active",
      badgeColor: "bg-emerald-100 text-emerald-700",
      description: "On-Duty Clinical Roster",
    },
    {
      id: "what-if",
      label: "AI What-If",
      icon: BrainCircuit,
      badge: "Gemini 3.7",
      badgeColor: "bg-indigo-100 text-indigo-700 font-semibold",
      description: "Clinical Decision Support",
    },
  ];

  return (
    <aside
      id="dashboard-sidebar"
      className={`${
        collapsed ? "w-18" : "w-64"
      } bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] p-3 select-none transition-all duration-300`}
    >
      <div className="space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Clinic Operations
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === "dashboard" && currentView === "overview");

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNav(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full group flex items-center justify-between ${
                collapsed ? "px-2 py-3 justify-center" : "px-3 py-2.5"
              } rounded-xl text-xs font-medium transition-all duration-200 text-left ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"} truncate`}>
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <div className="truncate">
                    <div className={`font-semibold ${isActive ? "text-white" : "text-slate-800"}`}>
                      {item.label}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                      {item.description}
                    </div>
                  </div>
                )}
              </div>

              {!collapsed && item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight shrink-0 ml-1.5 ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry & FHIR status card */}
      {!collapsed && (
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>FHIR v4.0 Stream</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">100% OK</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Latency (Ambient)</span>
              <span className="font-mono text-slate-700 font-medium">1.4s</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Model Engine</span>
              <span className="font-mono text-blue-700 font-medium flex items-center">
                <Zap className="w-2.5 h-2.5 mr-0.5 text-amber-500" />
                Gemini 3.7 Flash
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>HIPAA BAA Certified</span>
            </span>
            <span>v2.4.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};
