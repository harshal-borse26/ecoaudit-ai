import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Award
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const HeroSection = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-28 overflow-hidden bg-[#E4E5DB]/40"
    >
      {/* AMBIENT SOFT BACKGROUND GLOWS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#2F5241]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#2E7D32]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: ENTERPRISE COPY & CTAS */}
          <div className="lg:col-span-6 text-left space-y-6">
            
            {/* ENTERPRISE BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEEDDF] border border-[#DDDDD0] text-[#2F5241] text-xs font-extrabold shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="tracking-wide">Enterprise Carbon Intelligence Platform</span>
            </motion.div>

            {/* POWERFUL HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-[#152A38] leading-[1.15] font-heading"
            >
              Carbon Intelligence.<br />
              Utility Analytics.<br />
              <span className="text-[#2F5241] underline decoration-[#2E7D32]/30 underline-offset-4">
                Executive ESG Reporting.
              </span>
            </motion.h1>

            {/* SHORT DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs sm:text-sm text-[#7A8597] font-medium leading-relaxed max-w-xl"
            >
              EcoAudit AI automates energy invoice extraction with Gemini AI Vision, calculates location & market Scope 1 & 2 carbon output across facility networks, and delivers audit-ready executive ESG reports.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
            >
              <button
                onClick={() => navigate(token ? "/dashboard" : "/signup")}
                className="px-6 py-3.5 rounded-2xl bg-[#152A38] hover:bg-[#2F5241] text-[#E4E5DB] hover:text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-[#2F5241]/30 group"
              >
                <span>{token ? "Open Workspace Dashboard" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#overview"
                className="px-6 py-3.5 rounded-2xl bg-[#EEEDDF] hover:bg-[#E4E3D6] border border-[#DDDDD0] text-[#152A38] font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-decoration-none"
              >
                <span>Explore Platform</span>
              </a>
            </motion.div>

            {/* TRUST BADGES STRIP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 border-t border-[#DDDDD0]/70 grid grid-cols-3 gap-3 text-left"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[11px] font-extrabold text-[#152A38] block leading-tight">
                  GHG Protocol Standard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[11px] font-extrabold text-[#152A38] block leading-tight">
                  96.5% OCR Accuracy
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[11px] font-extrabold text-[#152A38] block leading-tight">
                  Multi-Tenant Isolation
                </span>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE PRODUCT PREVIEW MOCKUP */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                transform: `rotateY(${mousePos.x * 0.3}deg) rotateX(${-mousePos.y * 0.3}deg)`,
                transformStyle: "preserve-3d",
              }}
              className="dash-card bg-[#F7F6EE] border border-[#DDDDD0] rounded-[28px] p-5 shadow-[0_20px_50px_rgba(21,42,56,0.12)] relative transition-transform duration-200"
            >
              
              {/* TOP APPLICATION HEADER BAR */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#DDDDD0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#152A38] text-emerald-400 flex items-center justify-center text-xs font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#152A38] uppercase tracking-wide block">
                      EcoAudit AI Dashboard
                    </span>
                    <span className="text-[9.5px] font-bold text-[#7A8597] block">
                      Monitored Enterprise Network
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2ED] text-[#2F5241] text-[10px] font-extrabold border border-[#2F5241]/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* KPI STATS ROW */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#EEEDDF] p-3 rounded-2xl border border-[#DDDDD0]">
                  <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Scope 1 & 2 Emissions</span>
                  <span className="text-sm sm:text-base font-extrabold text-[#152A38] block mt-0.5">16,374 kg CO₂e</span>
                </div>
                <div className="bg-[#EEEDDF] p-3 rounded-2xl border border-[#DDDDD0]">
                  <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Timeline Direction</span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                    ▼ 12.4% vs prev
                  </span>
                </div>
              </div>

              {/* GRAPH CANVAS SIMULATION */}
              <div className="bg-[#EEEDDF]/60 p-3 rounded-2xl border border-[#DDDDD0]/70 mb-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#7A8597] mb-2">
                  <span>Carbon Emission Analytics</span>
                  <span className="text-[#2F5241] font-extrabold">TARGET: 14,200 kg</span>
                </div>
                
                {/* SVG Curve */}
                <svg viewBox="0 0 400 120" className="w-full h-auto">
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F5241" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2F5241" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 10 90 Q 100 20 200 70 T 390 40 L 390 110 L 10 110 Z" fill="url(#heroGrad)" />
                  <path d="M 10 90 Q 100 20 200 70 T 390 40" fill="none" stroke="#2F5241" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="200" cy="70" r="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
                  <circle cx="390" cy="40" r="4" fill="#2F5241" stroke="#E4E5DB" strokeWidth="2" />
                </svg>
              </div>

              {/* FLOATING UI CARD 1: RECENT AI ANALYSIS */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 sm:-left-6 bg-white p-3 rounded-2xl border border-[#DDDDD0] shadow-lg flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
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

              {/* FLOATING UI CARD 2: FACILITY ONLINE */}
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 sm:-right-6 bg-white p-3 rounded-2xl border border-[#DDDDD0] shadow-lg flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2E7D32] border border-emerald-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
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

              {/* FLOATING UI CARD 3: EXECUTIVE REPORT READY */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -right-6 sm:-right-8 hidden sm:flex bg-[#152A38] text-[#E4E5DB] p-3 rounded-2xl border border-[#2F5241]/40 shadow-xl items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-[#2F5241] text-emerald-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold block leading-none">
                    ESG PDF Generated
                  </span>
                  <span className="text-[9px] font-bold text-[#7A8597] block mt-0.5">
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
