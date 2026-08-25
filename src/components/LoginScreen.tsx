import React, { useState } from "react";
import {
  Activity,
  Stethoscope,
  HeartPulse,
  Pill,
  ShieldCheck,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Fingerprint,
} from "lucide-react";
import { UserRole, ROLE_CONFIGS } from "../config/roles";

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

const ROLE_CARDS: {
  role: UserRole;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    role: "doctor",
    icon: Stethoscope,
    title: "Physician",
    subtitle: "Internal Medicine & Cardiology",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    role: "nurse",
    icon: HeartPulse,
    title: "Registered Nurse",
    subtitle: "ICU & Critical Care",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    role: "pharmacist",
    icon: Pill,
    title: "Pharmacist",
    subtitle: "Central Pharmacy Unit",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    role: "admin",
    icon: ShieldCheck,
    title: "Administrator",
    subtitle: "Hospital IT Administration",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("doctor");
  const [email, setEmail] = useState(ROLE_CONFIGS["doctor"].email);
  const [password, setPassword] = useState("omniscribe2026");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(ROLE_CONFIGS[role].email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    // Simulate a brief authentication delay for visual polish
    setTimeout(() => {
      onLogin(selectedRole);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 font-sans">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            OmniScribe{" "}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 align-middle">
              Health OS
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI Medical Scribe & Clinical Operations Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Role Selector Cards */}
          <div className="p-5 pb-4 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Select Your Role
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLE_CARDS.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedRole === card.role;
                return (
                  <button
                    key={card.role}
                    onClick={() => handleSelectRole(card.role)}
                    className={`relative p-3.5 rounded-xl border-2 text-left transition-all duration-200 group ${
                      isSelected
                        ? `${card.borderColor} ${card.bgColor} ring-2 ring-offset-1 ring-blue-400/50 shadow-sm`
                        : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg ${isSelected ? card.bgColor : "bg-slate-100"} flex items-center justify-center mb-2 transition-colors`}>
                      <Icon className={`w-4 h-4 ${isSelected ? card.color : "text-slate-500"}`} />
                    </div>
                    <p className={`text-xs font-bold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                      {card.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {card.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credential Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="clinician@metrogeneral.health"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Biometric hint */}
            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center space-x-2 text-slate-500 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>Remember this device</span>
              </label>
              <button type="button" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Biometric Login</span>
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm ${
                isLoggingIn
                  ? "bg-blue-400 text-white cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md"
              }`}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>
                    Sign In as{" "}
                    {ROLE_CARDS.find((c) => c.role === selectedRole)?.title}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* HIPAA Compliance Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-center space-x-4 text-[10px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>256-bit TLS</span>
              </span>
              <span>•</span>
              <span>HIPAA BAA Certified</span>
              <span>•</span>
              <span>SOC 2 Type II</span>
              <span>•</span>
              <span>HL7 FHIR v4</span>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Metro General Hospital • OmniScribe Health OS v2.4.0
        </p>
      </div>
    </div>
  );
};
