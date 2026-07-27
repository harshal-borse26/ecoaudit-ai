import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, ArrowUpRight } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="bg-[#152A38] text-[#E4E5DB] py-14 border-t border-[#2F5241]/40 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* TOP BRAND & COLUMNS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          
          {/* BRAND COLUMN */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group text-decoration-none">
              <div className="w-9 h-9 rounded-xl bg-[#2F5241] text-[#E4E5DB] flex items-center justify-center shadow-xs">
                <Leaf className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-none font-heading">
                  EcoAudit <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[9.5px] font-bold text-[#7A8597] tracking-wider uppercase mt-0.5 block">
                  Carbon Intelligence
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              Enterprise AI carbon accounting, multimodal utility invoice OCR, Scope 1 & 2 emissions tracking, and 14-section ESG compliance reporting.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant Enterprise Isolation</span>
            </div>
          </div>

          {/* COLUMN 1: PRODUCT */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-heading">
              Platform Modules
            </span>
            <ul className="space-y-2 text-xs font-bold text-slate-300 list-none p-0">
              <li><a href="#overview" className="hover:text-emerald-400 transition-colors text-decoration-none">Executive Dashboard</a></li>
              <li><a href="#modules" className="hover:text-emerald-400 transition-colors text-decoration-none">Facility Scope Monitoring</a></li>
              <li><a href="#modules" className="hover:text-emerald-400 transition-colors text-decoration-none">AI Utility Bill OCR</a></li>
              <li><a href="#analytics" className="hover:text-emerald-400 transition-colors text-decoration-none">Carbon Trend Analytics</a></li>
              <li><a href="#reports" className="hover:text-emerald-400 transition-colors text-decoration-none">14-Section ESG Generator</a></li>
            </ul>
          </div>

          {/* COLUMN 2: RESOURCES */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-heading">
              Architecture & Security
            </span>
            <ul className="space-y-2 text-xs font-bold text-slate-300 list-none p-0">
              <li><a href="#security" className="hover:text-emerald-400 transition-colors text-decoration-none">ORG_ADMIN Multi-Tenant Guard</a></li>
              <li><a href="#security" className="hover:text-emerald-400 transition-colors text-decoration-none">AES-256 File Encryption</a></li>
              <li><a href="#technology" className="hover:text-emerald-400 transition-colors text-decoration-none">Tech Stack Overview</a></li>
              <li><a href="#faq" className="hover:text-emerald-400 transition-colors text-decoration-none">Enterprise Knowledge Base</a></li>
            </ul>
          </div>

          {/* COLUMN 3: AUTH */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-heading">
              Access
            </span>
            <ul className="space-y-2 text-xs font-bold text-slate-300 list-none p-0">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors text-decoration-none">Account Login</Link></li>
              <li><Link to="/signup" className="hover:text-emerald-400 transition-colors text-decoration-none">Register Organization</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT STRIP */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-4">
          <p>© 2026 EcoAudit AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Privacy Policy</a>
            <span>•</span>
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Terms of Service</a>
            <span>•</span>
            <a href="#reports" className="hover:text-white transition-colors text-decoration-none">GHG Protocol Standard</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
