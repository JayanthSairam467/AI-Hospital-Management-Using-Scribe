import React from "react";
import { Bell, X, AlertTriangle, CheckCircle2, Clock, Ambulance, Pill, BedDouble } from "lucide-react";
import { SystemNotification } from "../types";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onDismiss,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Hospital Operational Alerts</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No active alerts. All clinical telemetry nominal.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                  n.type === "critical"
                    ? "bg-red-50/70 border-red-200 text-red-900"
                    : n.type === "warning"
                    ? "bg-amber-50/70 border-amber-200 text-amber-900"
                    : "bg-blue-50/70 border-blue-200 text-blue-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{n.title}</span>
                  <button
                    onClick={() => onDismiss(n.id)}
                    className="text-slate-400 hover:text-slate-700 text-[10px]"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">{n.message}</p>
                <div className="text-[10px] font-mono text-slate-400 pt-0.5">{n.timestamp}</div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={onClearAll}
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            Clear All Alerts
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
