import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  FileSpreadsheet,
  UserCheck,
  TrendingUp,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

const PlatformOverview = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "facilities", label: "Monitored Facilities", icon: Building2 },
    { id: "bills", label: "Utility Bills OCR", icon: Receipt },
    { id: "reports", label: "14-Section ESG Reports", icon: FileSpreadsheet },
    { id: "profile", label: "Organization Profile", icon: UserCheck },
  ];

  return (
    <section id="overview" className="py-16 sm:py-24 bg-[#F7F6EE] border-b border-[#DDDDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-extrabold text-[#2F5241] uppercase tracking-wider block font-heading">
            Enterprise Product Suite
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#152A38] tracking-tight font-heading">
            Unified Carbon Intelligence Platform
          </h2>
          <p className="text-xs sm:text-sm text-[#7A8597] font-medium leading-relaxed">
            Switch seamlessly between real-time executive stat cards, multi-facility tracking grids, automated bill ingestion queues, and audit-ready ESG report generators.
          </p>
        </div>

        {/* TAB NAVIGATION STRIP */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-8">
          <div className="bg-[#EEEDDF] p-1.5 rounded-2xl border border-[#DDDDD0] flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${isActive
                      ? "bg-[#152A38] text-[#E4E5DB] shadow-sm"
                      : "text-[#7A8597] hover:text-[#152A38]"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* INTERACTIVE DEMO CANVAS */}
        <div className="dash-card bg-[#F7F6EE] border border-[#DDDDD0] rounded-[32px] p-5 sm:p-8 shadow-[0_20px_60px_rgba(21,42,56,0.08)] min-h-[460px] flex flex-col justify-between">
          <AnimatePresence mode="wait">

            {/* VIEW 1: DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDDDD0]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#152A38] uppercase tracking-wide">
                      Corporate Executive Carbon Dashboard
                    </h3>
                    <p className="text-xs font-medium text-[#7A8597] mt-0.5">
                      Scope 1 & Scope 2 aggregated emissions across monitored corporate facilities
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#2F5241] text-xs font-extrabold border border-[#2F5241]/20 self-start sm:self-auto">
                    Live Workspace Sync
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#EEEDDF] p-4 rounded-2xl border border-[#DDDDD0]">
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Total Carbon Footprint</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#152A38] block mt-1">16,374 kg CO₂e</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-1">
                      ▼ 12.4% vs prev
                    </span>
                  </div>

                  <div className="bg-[#EEEDDF] p-4 rounded-2xl border border-[#DDDDD0]">
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Scope 1 Direct</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#152A38] block mt-1">6,120 kg CO₂e</span>
                    <span className="text-[10px] font-medium text-[#7A8597] block mt-1">Natural Gas & Diesel</span>
                  </div>

                  <div className="bg-[#EEEDDF] p-4 rounded-2xl border border-[#DDDDD0]">
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Scope 2 Indirect</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#152A38] block mt-1">10,254 kg CO₂e</span>
                    <span className="text-[10px] font-medium text-[#7A8597] block mt-1">Grid Electricity</span>
                  </div>

                  <div className="bg-[#EEEDDF] p-4 rounded-2xl border border-[#DDDDD0]">
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Active Monitored Sites</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#2F5241] block mt-1">4 Facilities</span>
                    <span className="text-[10px] font-extrabold text-[#2E7D32] block mt-1">100% Online</span>
                  </div>
                </div>

                <div className="bg-[#EEEDDF]/60 p-4 rounded-2xl border border-[#DDDDD0]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#152A38] mb-3">
                    <span>Aggregated Carbon Emissions Trend Line (6-Month Rolling Average)</span>
                    <span className="text-[#2F5241] font-extrabold">TARGET: 14,200 kg</span>
                  </div>
                  <div className="h-28 bg-[#F7F6EE] rounded-xl border border-[#DDDDD0] p-3 flex items-center justify-center">
                    <svg viewBox="0 0 500 100" className="w-full h-full">
                      <path d="M 10 70 Q 120 10 250 50 T 490 30" fill="none" stroke="#2F5241" strokeWidth="3" />
                      <path d="M 10 50 L 490 50" fill="none" stroke="#2F5241" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                      <circle cx="250" cy="50" r="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
                      <circle cx="490" cy="30" r="4" fill="#2F5241" stroke="#E4E5DB" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: FACILITIES */}
            {activeTab === "facilities" && (
              <motion.div
                key="facilities"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDDDD0]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#152A38] uppercase tracking-wide">
                      Monitored Corporate Facilities
                    </h3>
                    <p className="text-xs font-medium text-[#7A8597] mt-0.5">
                      Real-time energy usage and carbon density metrics per facility node
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#152A38] text-white text-xs font-extrabold self-start sm:self-auto">
                    4 Active Sites
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#EEEDDF] p-4 rounded-2xl border border-[#DDDDD0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#152A38]">San Francisco HQ</span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
                    </div>
                    <p className="text-[11px] font-medium text-[#7A8597]">45,000 sq ft • Commercial Office</p>
                    <div className="pt-2 border-t border-[#DDDDD0] flex justify-between text-xs font-bold text-[#152A38]">
                      <span>Monthly Carbon: 5,420 kg</span>
                      <span className="text-[#2F5241]">0.12 kg/sq ft</span>
                    </div>
                  </div>

                  <div className="bg-[#EEEDDF] p-4 rounded-2xl border border-[#DDDDD0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#152A38]">Austin Operations Center</span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
                    </div>
                    <p className="text-[11px] font-medium text-[#7A8597]">68,000 sq ft • Data & Operations</p>
                    <div className="pt-2 border-t border-[#DDDDD0] flex justify-between text-xs font-bold text-[#152A38]">
                      <span>Monthly Carbon: 6,810 kg</span>
                      <span className="text-[#2F5241]">0.10 kg/sq ft</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: BILLS */}
            {activeTab === "bills" && (
              <motion.div
                key="bills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDDDD0]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#152A38] uppercase tracking-wide">
                      Automated Utility Invoices OCR Queue
                    </h3>
                    <p className="text-xs font-medium text-[#7A8597] mt-0.5">
                      Gemini AI Vision Multimodal Document Extraction Pipeline
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#2F5241] text-xs font-extrabold border border-[#2F5241]/20">
                    96.5% AI Confidence
                  </span>
                </div>

                <div className="bg-[#EEEDDF] rounded-2xl p-4 border border-[#DDDDD0] space-y-3">
                  <div className="flex items-center justify-between bg-[#F7F6EE] p-3 rounded-xl border border-[#DDDDD0]">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-[#2F5241]" />
                      <div>
                        <span className="text-xs font-extrabold text-[#152A38] block">PG&E Electric Statement #94812</span>
                        <span className="text-[10px] font-medium text-[#7A8597] block">Processed 2 mins ago • 14,200 kWh</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      4,122.4 kg CO₂e
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-[#F7F6EE] p-3 rounded-xl border border-[#DDDDD0]">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-[#2F5241]" />
                      <div>
                        <span className="text-xs font-extrabold text-[#152A38]">SoCal Gas Utility Invoice #55104</span>
                        <span className="text-[10px] font-medium text-[#7A8597] block">Processed 1 hour ago • 450 Therms</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      2,394.0 kg CO₂e
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 4: REPORTS */}
            {activeTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDDDD0]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#152A38] uppercase tracking-wide">
                      14-Section Executive ESG Compliance Generator
                    </h3>
                    <p className="text-xs font-medium text-[#7A8597] mt-0.5">
                      Formatted for Board Disclosures, Auditor Review & Sustainability Ratings
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#152A38] text-white text-xs font-extrabold">
                    PDF Export Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#EEEDDF] p-3.5 rounded-2xl border border-[#DDDDD0] space-y-1">
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase">Section 01-04</span>
                    <span className="text-xs font-extrabold text-[#152A38] block">Executive Summary & Scope</span>
                  </div>
                  <div className="bg-[#EEEDDF] p-3.5 rounded-2xl border border-[#DDDDD0] space-y-1">
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase">Section 05-09</span>
                    <span className="text-xs font-extrabold text-[#152A38] block">Facility Metrics & Anomaly Log</span>
                  </div>
                  <div className="bg-[#EEEDDF] p-3.5 rounded-2xl border border-[#DDDDD0] space-y-1">
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase">Section 10-14</span>
                    <span className="text-xs font-extrabold text-[#152A38] block">Decarbonization & Appendix</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 5: PROFILE */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDDDD0]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#152A38] uppercase tracking-wide">
                      Corporate Organization & Tenant Settings
                    </h3>
                    <p className="text-xs font-medium text-[#7A8597] mt-0.5">
                      Multi-tenant organization architecture & role privileges (`ORG_ADMIN`)
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#2F5241] text-xs font-extrabold border border-[#2F5241]/20">
                    ORG_ADMIN Scope
                  </span>
                </div>

                <div className="bg-[#EEEDDF] p-4 rounded-2xl border border-[#DDDDD0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase block">Organization Entity</span>
                    <span className="text-sm font-extrabold text-[#152A38] block mt-0.5">Acme Enterprise Solutions</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#7A8597] uppercase block">Admin Account</span>
                    <span className="text-sm font-extrabold text-[#152A38] block mt-0.5">alex.morgan@acme.com</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default PlatformOverview;
