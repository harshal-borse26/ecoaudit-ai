import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Sparkles } from "lucide-react";

const AuthLayout = ({ children, title, subtitle, maxWidth = "max-w-[420px]" }) => {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-slate-100/90 md:bg-gradient-to-br md:from-emerald-50/60 md:via-slate-100 md:to-teal-50/60 flex items-center justify-center p-3 sm:p-5 lg:p-6 font-sans antialiased text-[#1E293B] selection:bg-[#2E7D32]/10 selection:text-[#2E7D32] relative overflow-x-hidden overflow-y-auto lg:overflow-y-hidden">
      
      {/* SUBTLE BACKGROUND AMBIENT GLOW BLOBS */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-emerald-300/15 rounded-full blur-[130px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-teal-300/15 rounded-full blur-[130px] pointer-events-none translate-y-1/2" />

      {/* COMPACT SPLIT-SCREEN CARD CONTAINER (FITS 1366x768 WITHOUT SCROLLING) */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[1060px] bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.1)] border border-[#E2E8F0] p-3.5 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-5 lg:gap-6 lg:h-[580px] xl:h-[600px] relative overflow-hidden my-auto"
      >
        
        {/* LEFT PANEL - FORM AREA (BRIGHT, MINIMAL, ELEGANT WHITE PANEL) */}
        <div className="w-full lg:w-[50%] xl:w-[48%] flex flex-col justify-between p-3 sm:p-5 lg:p-6 overflow-y-auto">
          
          {/* TOP LOGO */}
          <div className="mb-4 sm:mb-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group text-decoration-none">
              <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-emerald-400 shadow-md shadow-[#0F172A]/15 group-hover:scale-105 transition-transform duration-200">
                <Leaf className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[#0F172A] block leading-none">
                  EcoAudit <span className="text-[#2E7D32]">AI</span>
                </span>
                <span className="text-[10px] font-bold text-[#2E7D32] tracking-wider uppercase mt-0.5 block">
                  Carbon Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* MAIN FORM WRAPPER */}
          <div className={`w-full mx-auto ${maxWidth}`}>
            <div className="mb-4 sm:mb-5 text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {title}
              </h1>
              <p className="text-xs font-medium text-[#64748B] mt-1 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {children}
          </div>

          {/* BOTTOM FOOTER SUB-LINKS */}
          <div className="mt-5 text-center text-[11px] text-[#94A3B8] space-x-3.5">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#64748B] transition-colors text-decoration-none">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#64748B] transition-colors text-decoration-none">Terms of Service</a>
            <span>•</span>
            <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-[#64748B] transition-colors text-decoration-none">Support</a>
          </div>
        </div>

        {/* RIGHT PANEL - CLEANER, MINIMAL FUTURISTIC 3D HERO SHOWCASE */}
        <div className="hidden lg:flex lg:w-[50%] xl:w-[52%] bg-[#0A0F1D] rounded-[24px] sm:rounded-[26px] p-6 xl:p-8 text-white flex-col justify-between items-center text-center relative overflow-hidden shadow-xl border border-slate-800/80">
          
          {/* AMBIENT SOFT RADIAL GREEN GLOW BEHIND CHARACTER */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-[90px] pointer-events-none" />

          {/* TOP ACCENT BADGE */}
          <div className="relative z-10 self-start">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>AI Carbon Intelligence Platform</span>
            </span>
          </div>

          {/* CENTRAL 3D HERO CHARACTER (CLEAN & UNCLUTTERED) */}
          <div className="relative z-10 my-auto py-2 w-full flex items-center justify-center">
            
            {/* 3D CHARACTER IMAGE */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative max-w-[250px] xl:max-w-[280px] w-full"
            >
              <img
                src="/eco_3d_hero_illustration.png"
                alt="EcoAudit AI 3D Carbon Intelligence Analyst"
                className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transform hover:scale-[1.03] transition-transform duration-300"
              />
            </motion.div>
          </div>

          {/* BOTTOM HERO CAPTION & PAGINATION INDICATOR */}
          <div className="relative z-10 w-full space-y-3 pt-1">
            <div>
              <h2 className="text-lg xl:text-xl font-extrabold tracking-tight text-white mb-1">
                Manage Carbon Footprint Anywhere
              </h2>
              <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                AI-powered utility bill OCR, Scope 1 & 2 emissions tracking, and audit-ready ESG reporting on the web.
              </p>
            </div>

            {/* PAGINATION DOTS */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default AuthLayout;
