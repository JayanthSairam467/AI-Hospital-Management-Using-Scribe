import React, { useState } from "react";
import {
  Pill,
  Search,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Thermometer,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { MedicineItem } from "../types";

interface InventoryViewProps {
  medicines: MedicineItem[];
  onTriggerDemandAlert: (medId: string) => void;
  onRestock: (medId: string, amount: number) => void;
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  medicines,
  onTriggerDemandAlert,
  onRestock,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedMed, setSelectedMed] = useState<MedicineItem | null>(null);

  const categories = ["All", "Antibiotics", "Emergency", "Anesthesia", "Cardiovascular", "Endocrinology"];

  const filteredMeds = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      categoryFilter === "All" || m.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div id="inventory-view-container" className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Smart Pharmacy Inventory</h1>
            <p className="text-xs text-slate-500">Automated Stock Depletion & Supplier Demand Alerts</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span>Cold Vault: 3.8°C (Optimal)</span>
          </div>

          <button
            onClick={() => onShowToast("Inventory synchronized with Central Pharmacy Pyxis safe.", "success")}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Sync Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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
            placeholder="Search medication, batch #, dosage..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === c
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Medicine Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeds.map((med) => {
          const stockPct = Math.round((med.stockUnits / med.maxUnits) * 100);
          const isCritical = med.status === "critical" || med.stockUnits <= med.minThreshold * 0.6;
          const isLow = med.status === "low" || med.stockUnits <= med.minThreshold;

          return (
            <div
              key={med.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-4 ${
                isCritical
                  ? "border-red-300 ring-1 ring-red-200 bg-gradient-to-b from-red-50/20 to-white"
                  : isLow
                  ? "border-amber-300 bg-gradient-to-b from-amber-50/20 to-white"
                  : "border-slate-200"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {med.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{med.name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{med.dosage}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCritical
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : isLow
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {med.status}
                  </span>
                </div>

                {/* Stock Level Bar */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 font-medium">Stock Level</span>
                    <span className="font-mono font-bold text-slate-900">
                      {med.stockUnits} / {med.maxUnits} {med.unitType.split(" ")[0]} ({stockPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCritical ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Reorder Min: {med.minThreshold} units</span>
                    <span>Burn Rate: ~{med.dailyConsumption}/day</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Batch #</span>
                    <span className="font-mono text-slate-700 font-medium">{med.batchNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Expiry Date</span>
                    <span className="font-mono text-slate-700 font-medium">{med.expiryDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Pyxis / Storage Location</span>
                    <span className="text-slate-700 font-medium">{med.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onTriggerDemandAlert(med.id)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-xs ${
                    isCritical
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Trigger Demand Alert</span>
                </button>

                <button
                  onClick={() => onRestock(med.id, 50)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  title="Quick Restock +50 units"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
