import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  FileText,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Layers,
  BarChart3,
  Activity,
  Award,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const HeroSection = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'ocr' | 'facility' | 'report'

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 12;
    const y = (clientY / innerHeight - 0.5) * 12;
    setMousePos({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-28 overflow-hidden bg-[#E4E5DB]/30 border-b border-[#DDDDD0]"
    >
      {/* AMBIENT SOFT BACKGROUND GLOWS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-[#2F5241]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-[#2E7D32]/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── LEFT COLUMN: ENTERPRISE COPY & CTAS ────────────────────── */}
          <div className="lg:col-span-6 text-left space-y-6">

            {/* ENTERPRISE BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DDDDD0] text-[#2F5241] text-xs font-bold shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="tracking-wider uppercase font-heading text-[10px] sm:text-[11px] font-extrabold text-[#2F5241]">
                AI-Powered Scope 1 & 2 Carbon Intelligence
              </span>
            </motion.div>

            {/* POWERFUL HEADLINE WITH CLEAN TYPOGRAPHY */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-[#152A38] leading-[1.18] font-heading"
            >
              Automate Carbon Accounting.<br />
              Ingest Utility Bills with AI.<br />
              <span className="text-[#2F5241]">
                Publish Audit-Ready ESG Reports.
              </span>
            </motion.h1>

            {/* SHORT DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs sm:text-sm text-[#7A8597] font-semibold leading-relaxed max-w-xl"
            >
              EcoAudit AI combines Google Gemini Vision OCR with localized GHG protocol conversion factors. Ephemerally parse PDF statements or portal screenshots and output fully documented corporate ESG audits in minutes.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <button
                onClick={() => navigate(token ? "/dashboard" : "/signup")}
                className="px-6 py-3.5 rounded-2xl bg-[#152A38] hover:bg-[#2F5241] text-[#E4E5DB] hover:text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-[#2F5241]/30 group"
              >
                <span>{token ? "Open Workspace Dashboard" : "Create Enterprise Account"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#overview"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#EEEDDF]/50 border border-[#DDDDD0] text-[#152A38] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-decoration-none shadow-2xs"
              >
                <span>Explore Live Platform Demo</span>
              </a>
            </motion.div>

            {/* TRUST BADGES STRIP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 border-t border-[#DDDDD0]/70 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[11px] sm:text-xs font-extrabold text-[#152A38] block leading-tight">
                  GHG Protocol Aligned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[11px] sm:text-xs font-extrabold text-[#152A38] block leading-tight">
                  96.5% Extraction Speed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[11px] sm:text-xs font-extrabold text-[#152A38] block leading-tight">
                  Multi-Tenant Security
                </span>
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT COLUMN: INTERACTIVE PRODUCT PREVIEW MOCKUP ───────────── */}
          <div className="lg:col-span-6 relative pt-6 sm:pt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                transform: `rotateY(${mousePos.x * 0.15}deg) rotateX(${-mousePos.y * 0.15}deg)`,
                transformStyle: "preserve-3d",
              }}
              className="dash-card bg-white border border-[#DDDDD0] rounded-[32px] p-4 sm:p-7 shadow-[0_20px_50px_rgba(21,42,56,0.08)] relative transition-transform duration-200"
            >

              {/* TOP APPLICATION HEADER BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 mb-4 border-b border-[#DDDDD0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#152A38] text-emerald-400 flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-extrabold text-[#152A38] uppercase tracking-wide block font-heading">
                      EcoAudit AI Workspace
                    </span>
                    <span className="text-[9.5px] font-bold text-[#7A8597] block">
                      Enterprise Carbon Network Sync
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {["overview", "ocr", "facility", "report"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9.5px] sm:text-[10px] font-extrabold transition-all cursor-pointer uppercase shrink-0 ${activeTab === t
                          ? "bg-[#152A38] text-[#E4E5DB] shadow-2xs"
                          : "bg-[#EEEDDF] text-[#7A8597] hover:text-[#152A38]"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC DYNAMIC TAB CONTENT */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 text-left"
                  >
                    {/* KPI STATS ROW */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#EEEDDF]/50 p-3.5 rounded-2xl border border-[#DDDDD0]/70">
                        <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Total Scope 1 & 2</span>
                        <span className="text-base sm:text-lg font-extrabold text-[#152A38] block mt-0.5">16,374 kg CO₂e</span>
                      </div>
                      <div className="bg-[#EEEDDF]/50 p-3.5 rounded-2xl border border-[#DDDDD0]/70">
                        <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Timeline Direction</span>
                        <div className="mt-1">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                            ▼ 12.4% vs prev
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* GRAPH CANVAS SIMULATION */}
                    <div className="bg-[#EEEDDF]/30 p-4 rounded-2xl border border-[#DDDDD0]/60 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#7A8597] mb-2.5">
                        <span>Carbon Emission Analytics</span>
                        <span className="text-[#2F5241] font-extrabold">TARGET: 14,200 kg</span>
                      </div>

                      <svg viewBox="0 0 400 120" className="w-full h-auto">
                        <defs>
                          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2F5241" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#2F5241" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 10 90 Q 100 20 200 70 T 390 40 L 390 110 L 10 110 Z" fill="url(#heroGrad)" />
                        <path d="M 10 90 Q 100 20 200 70 T 390 40" fill="none" stroke="#2F5241" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="200" cy="70" r="4.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
                        <circle cx="390" cy="40" r="4.5" fill="#2F5241" stroke="#E4E5DB" strokeWidth="2" />
                      </svg>
                    </div>
                  </motion.div>
                )}

                {activeTab === "ocr" && (
                  <motion.div
                    key="ocr"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-left space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#152A38]">PG&E Utility Invoice Ingestion</span>
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        98.2% Confidence
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                      <div>Billing Period: <span className="font-extrabold text-[#152A38]">Jan 2026</span></div>
                      <div>kWh Consumed: <span className="font-extrabold text-[#152A38]">14,200 kWh</span></div>
                      <div>Scope 2 Output: <span className="font-extrabold text-[#2F5241]">4,122 kg CO₂e</span></div>
                      <div>OCR Status: <span className="font-extrabold text-emerald-700">Verified</span></div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "facility" && (
                  <motion.div
                    key="facility"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 text-left space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#152A38]">San Francisco HQ Facility</span>
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Monitored & Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                      <div>Floor Area: <span className="font-extrabold text-[#152A38]">45,000 sq ft</span></div>
                      <div>Density Index: <span className="font-extrabold text-[#152A38]">0.12 kg/sq ft</span></div>
                      <div>Active Scopes: <span className="font-extrabold text-[#2F5241]">Scope 1 & 2</span></div>
                      <div>Health: <span className="font-extrabold text-emerald-700">Optimal</span></div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "report" && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl bg-[#152A38] text-[#E4E5DB] text-left space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">14-Section ESG Compliance PDF</span>
                      <span className="text-[10px] font-extrabold bg-[#2F5241] text-emerald-300 px-2 py-0.5 rounded-full">
                        CSRD Aligned
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Complete board disclosure generated with line-item utility audit trail, EPA emission factor tables, and reduction benchmarks.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FLOATING INTERACTIVE UI CARDS (NON-COLLIDING POSITIONS) ───── */}
              {/* CARD 1: RECENT AI ANALYSIS (Positioned neatly top-right outside main card content) */}
              <motion.div
                onClick={() => setActiveTab("ocr")}
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -top-7 left-4 bg-white p-3 rounded-2xl border shadow-md flex items-center gap-2.5 z-30 text-left cursor-pointer transition-all ${activeTab === "ocr" ? "border-amber-500 ring-2 ring-amber-200" : "border-[#DDDDD0] hover:border-amber-400"
                  }`}
              >
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#152A38] block leading-none">
                    AI OCR Processed
                  </span>
                  <span className="text-[9px] font-bold text-[#7A8597] block mt-0.5">
                    4,122 kg CO₂e • 98.2% Conf
                  </span>
                </div>
              </motion.div>

              {/* CARD 2: FACILITY ONLINE (Positioned neatly bottom-left) */}
              <motion.div
                onClick={() => setActiveTab("facility")}
                animate={{ y: [3, -3, 3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -bottom-6 right-4 bg-white p-3 rounded-2xl border shadow-md flex items-center gap-2.5 z-30 text-left cursor-pointer transition-all ${activeTab === "facility" ? "border-emerald-500 ring-2 ring-emerald-200" : "border-[#DDDDD0] hover:border-emerald-400"
                  }`}
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#2E7D32] border border-emerald-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#152A38] block leading-none">
                    SF Facility Online
                  </span>
                  <span className="text-[9px] font-bold text-[#2E7D32] block mt-0.5">
                    ● Monitored & Active
                  </span>
                </div>
              </motion.div>

              {/* CARD 3: EXECUTIVE REPORT READY (Positioned right side) */}
              <motion.div
                onClick={() => setActiveTab("report")}
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-1/2 -right-6 sm:-right-8 hidden sm:flex bg-[#152A38] text-[#E4E5DB] p-3 rounded-2xl border shadow-xl items-center gap-2.5 z-30 text-left cursor-pointer transition-all ${activeTab === "report" ? "border-emerald-400 ring-2 ring-emerald-400/30" : "border-[#2F5241]/40 hover:border-emerald-400"
                  }`}
              >
                <div className="w-7 h-7 rounded-xl bg-[#2F5241] text-emerald-300 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold block leading-none">
                    ESG PDF Generated
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                    14 Sections Compliance
                  </span>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
