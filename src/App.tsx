import React, { useState, useEffect, Suspense, lazy } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LandingPage } from "./components/LandingPage";
import { LoginScreen } from "./components/LoginScreen";
import { ViewLoadingFallback } from "./components/ViewLoadingFallback";
import { FhirModal } from "./components/FhirModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { UserRole, ROLE_CONFIGS, hasAccess } from "./config/roles";

// Lazy-loaded views — loading animation shows only when chunks are slow to download
const DashboardOverview = lazy(() => import("./components/DashboardOverview").then(m => ({ default: m.DashboardOverview })));
const AIScribeView = lazy(() => import("./components/AIScribeView").then(m => ({ default: m.AIScribeView })));
const InventoryView = lazy(() => import("./components/InventoryView").then(m => ({ default: m.InventoryView })));
const BedManagementView = lazy(() => import("./components/BedManagementView").then(m => ({ default: m.BedManagementView })));
const AmbulanceView = lazy(() => import("./components/AmbulanceView").then(m => ({ default: m.AmbulanceView })));
const StaffView = lazy(() => import("./components/StaffView").then(m => ({ default: m.StaffView })));
const WhatIfView = lazy(() => import("./components/WhatIfView").then(m => ({ default: m.WhatIfView })));
import {
  MOCK_MEDICINES,
  MOCK_BEDS,
  MOCK_OXYGEN_MANIFOLDS,
  MOCK_AMBULANCES,
  MOCK_STAFF,
  MOCK_NOTIFICATIONS,
  INITIAL_SOAP_NOTE,
} from "./data/mockData";
import {
  MedicineItem,
  Bed,
  OxygenManifold,
  Ambulance,
  StaffMember,
  SystemNotification,
  SoapNote,
} from "./types";
import { askWhatIfScenarioApi, triggerAutoReorderApi } from "./services/api";

export default function App() {
  // Authentication & RBAC State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>("doctor");
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);

  // Navigation State
  const [currentView, setCurrentView] = useState<string>("landing"); // 'landing' | 'overview' | 'scribe' | 'inventory' | 'beds' | 'ambulance' | 'staff' | 'what-if'
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // App Data State
  const [medicines, setMedicines] = useState<MedicineItem[]>(MOCK_MEDICINES);
  const [beds, setBeds] = useState<Bed[]>(MOCK_BEDS);
  const [oxygen, setOxygen] = useState<OxygenManifold[]>(MOCK_OXYGEN_MANIFOLDS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(MOCK_AMBULANCES);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [notifications, setNotifications] = useState<SystemNotification[]>(MOCK_NOTIFICATIONS);

  // Modals & Drawers
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [fhirModalSoap, setFhirModalSoap] = useState<SoapNote | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  // Track which medicines have already had reorder emails sent (avoid spam)
  const [reorderedMeds, setReorderedMeds] = useState<Set<string>>(new Set());

  // AUTO-CHECK: On medicine stock changes, trigger reorder if below 10%
  useEffect(() => {
    medicines.forEach((med) => {
      const stockPct = Math.round((med.stockUnits / med.maxUnits) * 100);
      if (stockPct <= 10 && !reorderedMeds.has(med.id)) {
        // Auto-trigger reorder
        setReorderedMeds((prev) => new Set(prev).add(med.id));
        triggerAutoReorderApi(med, stockPct).then((result) => {
          if (result.success) {
            const urgency = stockPct <= 5 ? "CRITICAL" : "URGENT";
            showToast(
              `📧 Auto-Reorder [${urgency}]: Purchase order sent for ${med.name} (${stockPct}% stock)`,
              "warning"
            );
            const newNotif: SystemNotification = {
              id: `notif-reorder-${Date.now()}-${med.id}`,
              title: `Auto-Reorder: ${med.name}`,
              message: `Stock at ${stockPct}%. Automated PO dispatched to supplier (jayanthsairam8418@gmail.com). Reorder qty: ${result.reorderDetails?.reorderQuantity || "N/A"} ${med.unitType}.`,
              timestamp: "Just now",
              type: "critical",
              read: false,
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        });
      }
    });
  }, [medicines]);

  // Handlers for interactive actions
  const handleTriggerDemandAlert = (medId: string) => {
    const med = medicines.find((m) => m.id === medId) || medicines[0];
    const stockPct = Math.round((med.stockUnits / med.maxUnits) * 100);

    // Call the reorder API
    triggerAutoReorderApi(med, stockPct).then((result) => {
      const alertMsg = result.success
        ? `📧 Purchase order dispatched to supplier for ${med.name} (${med.dosage})!`
        : `Demand Alert logged for ${med.name} (email requires SMTP config)`;
      showToast(alertMsg, "warning");
    });

    const newNotif: SystemNotification = {
      id: `notif-dem-${Date.now()}`,
      title: `Pharmacy Demand Trigger: ${med.name}`,
      message: `Emergency reorder initiated for ${med.name}. Stock: ${stockPct}%. Supplier email: jayanthsairam8418@gmail.com`,
      timestamp: "Just now",
      type: "critical",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleRestockMedicine = (medId: string, amount: number) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === medId ? { ...m, stockUnits: m.stockUnits + amount } : m))
    );
    showToast(`Added +${amount} units to pharmacy inventory safe.`, "success");
  };

  const handleUpdateBedStatus = (bedId: string, newStatus: Bed["status"]) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status: newStatus } : b))
    );
  };

  const handleSelectBedFromOverview = (bed: Bed) => {
    setCurrentView("beds");
  };

  const handleMiniWhatIf = async (queryText: string): Promise<string> => {
    try {
      const res = await askWhatIfScenarioApi(queryText, "Robert Chen (58M, Penicillin Allergy)");
      return res.data.answer;
    } catch (e) {
      return "Direct Alternative: Azithromycin 500mg PO Day 1 then 250mg PO Days 2-5 or Doxycycline 100mg BID. (Ref: IDSA Guidelines).";
    }
  };

  // RBAC: Login handler
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentView("overview");
  };

  // RBAC: Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("landing");
    setPrivacyMode(false);
  };

  // RBAC: Guarded navigation — redirect to dashboard if no access
  const handleGuardedNavigate = (view: string) => {
    const resolvedView = view === "dashboard" ? "overview" : view;
    if (resolvedView === "overview" || resolvedView === "landing" || hasAccess(userRole, resolvedView)) {
      setCurrentView(resolvedView);
    } else {
      showToast(`Access denied: ${ROLE_CONFIGS[userRole].displayName} does not have permission for this module.`, "warning");
    }
  };

  // If on landing page, show marketing landing presentation
  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <LandingPage
          onEnterDashboard={() => {
            if (isAuthenticated) {
              setCurrentView("overview");
            } else {
              setCurrentView("login");
            }
          }}
        />

        {/* Global Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
            <div
              className={`px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center space-x-2 ${
                toast.type === "warning"
                  ? "bg-amber-600 text-white border-amber-700"
                  : toast.type === "info"
                  ? "bg-slate-900 text-white border-slate-800"
                  : "bg-emerald-600 text-white border-emerald-700"
              }`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Login screen — shown when user clicks "Enter Dashboard" from landing
  if (currentView === "login") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Dashboard Experience with Navbar & Sidebar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleGuardedNavigate}
        notifications={notifications}
        unreadCount={notifications.filter((n) => !n.read).length}
        notificationCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onReturnToLanding={() => setCurrentView("landing")}
        onLaunchConsultation={() => handleGuardedNavigate("scribe")}
        privacyMode={privacyMode}
        onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView === "overview" ? "dashboard" : currentView}
          onNavigate={handleGuardedNavigate}
          onSelectView={handleGuardedNavigate}
          collapsed={sidebarCollapsed}
          unreadAlertsCount={notifications.filter((n) => !n.read).length}
          userRole={userRole}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Suspense fallback={<ViewLoadingFallback />}>
          {(currentView === "overview" || currentView === "dashboard") && (
            <DashboardOverview
              medicines={medicines}
              beds={beds}
              oxygen={oxygen}
              ambulances={ambulances}
              staff={staff}
              onNavigate={handleGuardedNavigate}
              onTriggerDemandAlert={handleTriggerDemandAlert}
              onSelectBed={handleSelectBedFromOverview}
              onAskWhatIfMini={handleMiniWhatIf}
              onLaunchConsultation={() => handleGuardedNavigate("scribe")}
              privacyMode={privacyMode}
            />
          )}

          {currentView === "scribe" && (
            <AIScribeView
              onOpenFhirModal={(soap) => setFhirModalSoap(soap)}
              onShowToast={showToast}
              privacyMode={privacyMode}
            />
          )}

          {currentView === "inventory" && (
            <InventoryView
              medicines={medicines}
              onTriggerDemandAlert={handleTriggerDemandAlert}
              onRestock={handleRestockMedicine}
              onShowToast={showToast}
            />
          )}

          {currentView === "beds" && (
            <BedManagementView
              beds={beds}
              oxygen={oxygen}
              onSelectBed={handleSelectBedFromOverview}
              onUpdateBedStatus={handleUpdateBedStatus}
              onShowToast={showToast}
              privacyMode={privacyMode}
            />
          )}

          {currentView === "ambulance" && (
            <AmbulanceView ambulances={ambulances} onShowToast={showToast} />
          )}

          {currentView === "staff" && (
            <StaffView staff={staff} onShowToast={showToast} />
          )}

          {currentView === "what-if" && <WhatIfView onShowToast={showToast} />}
          </Suspense>
        </main>
      </div>

      {/* HL7 FHIR v4 Export Modal */}
      {fhirModalSoap && (
        <FhirModal
          soapNote={fhirModalSoap}
          onClose={() => setFhirModalSoap(null)}
          onShowToast={showToast}
        />
      )}

      {/* Real-time Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
        onClearAll={() => setNotifications([])}
      />

      {/* Global Action Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center space-x-2 ${
              toast.type === "warning"
                ? "bg-amber-600 text-white border-amber-700"
                : toast.type === "info"
                ? "bg-slate-900 text-white border-slate-800"
                : "bg-emerald-600 text-white border-emerald-700"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
