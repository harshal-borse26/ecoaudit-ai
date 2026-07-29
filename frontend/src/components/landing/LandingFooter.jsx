import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const LandingFooter = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  return (
    <footer className="bg-[#152A38] text-[#E4E5DB] relative overflow-hidden pt-12 pb-8 border-t border-[#2F5241]/40 text-left">

      {/* SOFT AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#2F5241]/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">

        {/* ── LAYER 1: ENTERPRISE CTA CONVERSION CARD (UNCHANGED) ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="dash-card bg-gradient-to-b from-[#152A38] to-[#0D1B24] rounded-[36px] p-8 sm:p-14 border border-[#2F5241]/50 shadow-2xl relative overflow-hidden text-center space-y-6"
        >
          {/* Subtle Ambient Radial Inner Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#2F5241]/25 rounded-full blur-[120px] pointer-events-none" />

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2F5241] text-emerald-300 text-xs font-extrabold border border-emerald-400/30 shadow-xs relative z-10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modernize Corporate Sustainability</span>
          </div>

          {/* HEADLINE */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight font-heading relative z-10">
            Ready to Modernize Your Sustainability Reporting?
          </h2>

          {/* SUPPORTING TEXT */}
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed relative z-10">
            Manage facilities, automate utility bill OCR, monitor Scope 1 & 2 emissions, and generate audit-ready ESG reports from one intelligent platform.
          </p>

          {/* BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
            <button
              onClick={() => navigate(token ? "/dashboard" : "/signup")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[#152A38] font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <span>{token ? "Launch Dashboard" : "Launch Platform"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#overview"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-decoration-none border border-slate-700"
            >
              <span>Explore Features</span>
            </a>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10.5px] sm:text-[11px] font-bold text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Ready
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Zero Setup Fee</span>
            <span className="hidden sm:inline">•</span>
            <span>14-Section PDF Exports</span>
          </div>
        </motion.div>

        {/* ── LOWER FOOTER: COMPACT BRAND & 3 SHORT NAVIGATION COLUMNS ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2 items-start">
          
          {/* LEFT: BRAND & BRIEF SUMMARY */}
          <div className="md:col-span-5 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 group text-decoration-none">
              <div className="w-8 h-8 rounded-xl bg-[#2F5241] text-[#E4E5DB] flex items-center justify-center shadow-xs border border-[#2F5241]/40">
                <Leaf className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white block leading-none font-heading">
                EcoAudit <span className="text-emerald-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              Enterprise Scope 1 & 2 carbon accounting platform for automated utility OCR ingestion and audit-ready ESG disclosures.
            </p>
          </div>

          {/* RIGHT: 3 SHORT COLUMNS MAX */}
          <div className="md:col-span-7 grid grid-cols-3 gap-4 sm:gap-8 text-left">
            
            {/* COLUMN 1: PRODUCT */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider block font-heading">
                Product
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400 list-none p-0">
                <li><a href="#overview" className="hover:text-emerald-400 transition-colors text-decoration-none">Dashboard</a></li>
                <li><a href="#overview" className="hover:text-emerald-400 transition-colors text-decoration-none">Facilities</a></li>
                <li><a href="#modules" className="hover:text-emerald-400 transition-colors text-decoration-none">AI Ingestion</a></li>
                <li><a href="#analytics" className="hover:text-emerald-400 transition-colors text-decoration-none">Analytics</a></li>
                <li><a href="#reports" className="hover:text-emerald-400 transition-colors text-decoration-none">ESG Reports</a></li>
              </ul>
            </div>

            {/* COLUMN 2: RESOURCES */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider block font-heading">
                Resources
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400 list-none p-0">
                <li><a href="#security" className="hover:text-emerald-400 transition-colors text-decoration-none">Documentation</a></li>
                <li><a href="#security" className="hover:text-emerald-400 transition-colors text-decoration-none">Security</a></li>
                <li><a href="#technology" className="hover:text-emerald-400 transition-colors text-decoration-none">Tech Stack</a></li>
                <li><a href="#faq" className="hover:text-emerald-400 transition-colors text-decoration-none">Enterprise FAQ</a></li>
              </ul>
            </div>

            {/* COLUMN 3: COMPANY */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider block font-heading">
                Company
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400 list-none p-0">
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors text-decoration-none">Account Login</Link></li>
                <li><Link to="/signup" className="hover:text-emerald-400 transition-colors text-decoration-none">Register</Link></li>
                <li><a href="#security" className="hover:text-emerald-400 transition-colors text-decoration-none">Privacy Policy</a></li>
                <li><a href="#security" className="hover:text-emerald-400 transition-colors text-decoration-none">Terms of Service</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── MINIMAL BOTTOM LEGAL & SYSTEM STRIP ───────────────────── */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-3">
          
          <div className="flex items-center gap-2">
            <p>© 2026 EcoAudit AI Inc. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Operational</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Privacy</a>
            <span>•</span>
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Terms</a>
            <span>•</span>
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Security</a>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
