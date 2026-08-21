import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LandingPage } from "./components/LandingPage";
import { DashboardOverview } from "./components/DashboardOverview";
import { AIScribeView } from "./components/AIScribeView";
import { InventoryView } from "./components/InventoryView";
import { BedManagementView } from "./components/BedManagementView";
import { AmbulanceView } from "./components/AmbulanceView";
import { StaffView } from "./components/StaffView";
import { WhatIfView } from "./components/WhatIfView";
import { FhirModal } from "./components/FhirModal";
import { NotificationDrawer } from "./components/NotificationDrawer";

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
import { askWhatIfScenarioApi } from "./services/api";

export default function App() {
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

  // Handlers for interactive actions
  const handleTriggerDemandAlert = (medId: string) => {
    const med = medicines.find((m) => m.id === medId) || medicines[0];
    const alertMsg = `Automated Demand Alert: Expedited purchase order dispatched to MedSupply Corp for ${med.name} (${med.dosage})!`;
    showToast(alertMsg, "warning");

    const newNotif: SystemNotification = {
      id: `notif-dem-${Date.now()}`,
      title: `Pharmacy Demand Trigger: ${med.name}`,
      message: `Emergency reorder initiated for ${med.name}. Estimated supplier delivery: 4 hours.`,
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

  // If on landing page, show marketing landing presentation
  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <LandingPage
          onEnterDashboard={(view) =>
            setCurrentView(view === "dashboard" ? "overview" : view || "overview")
          }
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

  // Dashboard Experience with Navbar & Sidebar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) =>
          setCurrentView(view === "dashboard" ? "overview" : view)
        }
        notifications={notifications}
        unreadCount={notifications.filter((n) => !n.read).length}
        notificationCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onReturnToLanding={() => setCurrentView("landing")}
        onLaunchConsultation={() => setCurrentView("scribe")}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView === "overview" ? "dashboard" : currentView}
          onNavigate={(view) =>
            setCurrentView(view === "dashboard" ? "overview" : view)
          }
          onSelectView={(view) =>
            setCurrentView(view === "dashboard" ? "overview" : view)
          }
          collapsed={sidebarCollapsed}
          unreadAlertsCount={notifications.filter((n) => !n.read).length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {(currentView === "overview" || currentView === "dashboard") && (
            <DashboardOverview
              medicines={medicines}
              beds={beds}
              oxygen={oxygen}
              ambulances={ambulances}
              staff={staff}
              onNavigate={(view) =>
                setCurrentView(view === "dashboard" ? "overview" : view)
              }
              onTriggerDemandAlert={handleTriggerDemandAlert}
              onSelectBed={handleSelectBedFromOverview}
              onAskWhatIfMini={handleMiniWhatIf}
              onLaunchConsultation={() => setCurrentView("scribe")}
            />
          )}

          {currentView === "scribe" && (
            <AIScribeView
              onOpenFhirModal={(soap) => setFhirModalSoap(soap)}
              onShowToast={showToast}
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
            />
          )}

          {currentView === "ambulance" && (
            <AmbulanceView ambulances={ambulances} onShowToast={showToast} />
          )}

          {currentView === "staff" && (
            <StaffView staff={staff} onShowToast={showToast} />
          )}

          {currentView === "what-if" && <WhatIfView onShowToast={showToast} />}
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
