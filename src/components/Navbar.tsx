import React, { useState, useEffect } from "react";
import {
  Activity,
  Bell,
  Search,
  Clock,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  Sparkles,
  ExternalLink,
  UserCheck,
  Menu,
  X,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { ClinicalNotification } from "../types";
import { UserRole, ROLE_CONFIGS } from "../config/roles";

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  notifications?: any[];
  onOpenNotifications?: () => void;
  unreadCount?: number;
  notificationCount?: number;
  onLaunchConsultation?: () => void;
  onToggleSidebar?: () => void;
  onReturnToLanding?: () => void;
  privacyMode?: boolean;
  onTogglePrivacy?: () => void;
  userRole?: UserRole;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = "overview",
  onNavigate,
  notifications = [],
  onOpenNotifications = () => {},
  unreadCount,
  notificationCount,
  onLaunchConsultation,
  onToggleSidebar,
  onReturnToLanding,
  privacyMode = false,
  onTogglePrivacy,
  userRole = "doctor",
  onLogout,
}) => {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [clinicName, setClinicName] = useState<string>("Metro General Hospital");
  const [isClinicDropdownOpen, setIsClinicDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const activeUnreadCount = unreadCount ?? notificationCount ?? notifications.filter((n: any) => !n.read).length;

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (view === "landing" && onReturnToLanding) {
      onReturnToLanding();
    }
  };

  const handleLaunchScribe = () => {
    if (onLaunchConsultation) {
      onLaunchConsultation();
    } else {
      handleNavigate("scribe");
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const clinics = [
    "Metro General Hospital (Central Campus)",
    "St. Jude Academic Medical Center",
    "Mercy Regional Health Clinic",
    "Memorial Children's Specialty Pavilion",
  ];

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 shadow-xs"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinic Branding */}
          <div className="flex items-center space-x-3">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavigate("landing")}
              className="flex items-center space-x-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-all duration-300">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">OmniScribe</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 border border-blue-200">
                    Health OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">AI Medical Scribe & Clinic OS</p>
              </div>
            </button>

            {/* Clinic Switcher */}
            {currentView !== "landing" && (
              <div className="relative hidden md:block ml-4 pl-4 border-l border-slate-200">
                <button
                  id="clinic-selector-btn"
                  onClick={() => setIsClinicDropdownOpen(!isClinicDropdownOpen)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-all duration-200 border border-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="max-w-[190px] truncate">{clinicName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isClinicDropdownOpen && (
                  <div
                    id="clinic-dropdown-menu"
                    className="absolute left-4 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Select Medical Campus
                    </div>
                    {clinics.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setClinicName(c);
                          setIsClinicDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between ${
                          clinicName === c ? "bg-blue-50/70 text-blue-700 font-semibold" : "text-slate-700"
                        }`}
                      >
                        <span className="truncate">{c}</span>
                        {clinicName === c && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center Search (Dashboard View Only) */}
          {currentView !== "landing" ? (
            <div className="hidden lg:flex items-center flex-1 mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient MRN, ICD-10 code, medication, bed #..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-100/90 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <button onClick={() => handleNavigate("landing")} className="text-blue-600 font-semibold hover:text-blue-700">
                Overview
              </button>
              <button onClick={() => handleNavigate("scribe")} className="hover:text-blue-600 transition-colors">
                AI Scribe
              </button>
              <button onClick={() => handleNavigate("inventory")} className="hover:text-blue-600 transition-colors">
                Smart Pharmacy
              </button>
              <button onClick={() => handleNavigate("beds")} className="hover:text-blue-600 transition-colors">
                3D Bed Ward
              </button>
              <button onClick={() => handleNavigate("what-if")} className="hover:text-blue-600 transition-colors">
                Clinical What-If
              </button>
            </div>
          )}

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            {/* Live Clock & Badge */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{time}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{date}</span>
            </div>

            {/* PHI Privacy Masking Toggle */}
            <button
              id="phi-privacy-toggle-btn"
              onClick={onTogglePrivacy}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                privacyMode
                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 ring-1 ring-red-300"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              title={privacyMode ? "PHI is currently masked — Click to unmask" : "Click to mask PHI (HIPAA Safe Harbor)"}
            >
              {privacyMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-red-600" />
                  <span>PHI MASKED</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>PHI</span>
                </>
              )}
            </button>

            {/* Quick Scribe Launch CTA button */}
            {currentView !== "scribe" && (
              <button
                id="header-launch-scribe-btn"
                onClick={handleLaunchScribe}
                className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>New Scribe</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 focus:outline-hidden"
              title="Hospital Alerts"
            >
              <Bell className="w-5 h-5" />
              {activeUnreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {activeUnreadCount}
                </span>
              )}
            </button>

            {/* User Profile / Dashboard Switcher */}
            {currentView === "landing" ? (
              <button
                id="enter-dashboard-nav-btn"
                onClick={() => handleNavigate("dashboard")}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span>Enter Dashboard</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
                <button
                  id="doctor-profile-card"
                  onClick={() => handleNavigate("staff")}
                  className="flex items-center space-x-2.5 text-left group focus:outline-hidden"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {ROLE_CONFIGS[userRole].initials}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                      {ROLE_CONFIGS[userRole].displayName}
                    </p>
                    <p className="text-[10px] text-slate-500">{ROLE_CONFIGS[userRole].department}</p>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => {
              handleNavigate("dashboard");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => {
              handleNavigate("scribe");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            AI Ambient Scribe
          </button>
          <button
            onClick={() => {
              handleNavigate("inventory");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Medicine Inventory
          </button>
          <button
            onClick={() => {
              handleNavigate("beds");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            3D Bed Ward
          </button>
          <button
            onClick={() => {
              handleNavigate("ambulance");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Ambulance Dispatch
          </button>
          <button
            onClick={() => {
              handleNavigate("staff");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Staff Schedule
          </button>
          <button
            onClick={() => {
              handleNavigate("what-if");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Clinical What-If AI
          </button>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                handleNavigate("landing");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Back to Landing / Pitch
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
