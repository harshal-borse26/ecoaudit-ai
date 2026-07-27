import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Cpu, 
  Lock, 
  Database, 
  Globe, 
  Check 
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const LandingFooter = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const trustBadges = [
    { label: "AES-256 Encryption", icon: Lock },
    { label: "Role-Based Access (ORG_ADMIN)", icon: ShieldCheck },
    { label: "Multi-Tenant Isolation", icon: Globe },
    { label: "Google Gemini 1.5 Vision", icon: Cpu },
    { label: "React 18 & Node.js API", icon: Database },
    { label: "Audit-Ready Compliance", icon: CheckCircle2 },
  ];

  return (
    <footer className="bg-[#152A38] text-[#E4E5DB] relative overflow-hidden pt-16 pb-12 border-t border-[#2F5241]/40 text-left">
      
      {/* SOFT AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2F5241]/15 rounded-full blur-[160px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* ── LAYER 1: ENTERPRISE CTA CONVERSION CARD ─────────────────────── */}
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

          <div className="pt-4 flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Ready
            </span>
            <span>•</span>
            <span>Zero Setup Fee</span>
            <span>•</span>
            <span>14-Section PDF Exports</span>
          </div>
        </motion.div>

        {/* ── LAYER 2 & 3: BRAND STORYTELLING & PRODUCT NAVIGATION ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          
          {/* LEFT: BRAND STORYTELLING & TRUST CHECKLIST */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* LOGO & TYPOGRAPHY */}
            <Link to="/" className="inline-flex items-center gap-3 group text-decoration-none">
              <div className="w-10 h-10 rounded-xl bg-[#2F5241] text-[#E4E5DB] flex items-center justify-center shadow-xs border border-[#2F5241]/40">
                <Leaf className="w-5 h-5 text-emerald-300 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block leading-none font-heading">
                  EcoAudit <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5 block">
                  Carbon Intelligence Platform
                </span>
              </div>
            </Link>

            {/* BRAND DESCRIPTION */}
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-sm">
              EcoAudit AI is an enterprise-grade carbon accounting platform that transforms raw utility invoices into verified Scope 1 & Scope 2 greenhouse gas intelligence and audit-ready compliance disclosures.
            </p>

            {/* TRUST CHECKLIST BADGES */}
            <div className="space-y-2 pt-1 text-xs font-extrabold text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enterprise Multi-Tenant Isolation (`ORG_ADMIN`)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gemini Vision Multimodal OCR Ingestion</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>14-Section ESG Compliance Engine</span>
              </div>
            </div>

          </div>

          {/* RIGHT: STRUCTURED NAVIGATION COLUMNS (4 COLUMNS) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            
            {/* COLUMN 1: PLATFORM */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block font-heading">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400 list-none p-0">
                <li><a href="#overview" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Dashboard</a></li>
                <li><a href="#overview" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Facilities</a></li>
                <li><a href="#modules" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">AI OCR Ingestion</a></li>
                <li><a href="#analytics" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Carbon Analytics</a></li>
                <li><a href="#reports" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">ESG Reports</a></li>
              </ul>
            </div>

            {/* COLUMN 2: RESOURCES & ARCHITECTURE */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block font-heading">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400 list-none p-0">
                <li><a href="#security" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Documentation</a></li>
                <li><a href="#security" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Security Governance</a></li>
                <li><a href="#technology" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Technology Stack</a></li>
                <li><a href="#faq" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Enterprise FAQ</a></li>
                <li><a href="#workflow" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Platform Roadmap</a></li>
              </ul>
            </div>

            {/* COLUMN 3: DEVELOPERS & DATA */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block font-heading">
                Developers
              </h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400 list-none p-0">
                <li><a href="#security" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">REST API Spec</a></li>
                <li><a href="#security" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">JWT Bearer Auth</a></li>
                <li><a href="#technology" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Gemini Vision AI</a></li>
                <li><a href="#technology" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Prisma ORM Store</a></li>
                <li><a href="#technology" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">AWS Infrastructure</a></li>
              </ul>
            </div>

            {/* COLUMN 4: COMPANY & ACCESS */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block font-heading">
                Company & Access
              </h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400 list-none p-0">
                <li><Link to="/login" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Account Login</Link></li>
                <li><Link to="/signup" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Register Enterprise</Link></li>
                <li><a href="#security" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Privacy Policy</a></li>
                <li><a href="#security" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Terms of Service</a></li>
                <li><a href="#security" className="hover:text-emerald-400 hover:translate-x-0.5 transition-all inline-block text-decoration-none">Cookie Preferences</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── LAYER 4: TRUST & COMPLIANCE BADGE ROW ────────────────────────── */}
        <div className="pt-8 border-t border-slate-800/80">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-4 font-heading text-center sm:text-left">
            Enterprise Security & Standards Compliance
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 hover:border-[#2F5241] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── LAYER 5: MINIMAL BOTTOM LEGAL & SYSTEM STRIP ───────────────────── */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-4">
          
          <div className="flex items-center gap-3">
            <p>© 2026 EcoAudit AI Inc. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
              v1.0.4 Enterprise
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Operational</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Privacy Policy</a>
            <span>•</span>
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Terms of Service</a>
            <span>•</span>
            <a href="#security" className="hover:text-white transition-colors text-decoration-none">Security Disclosure</a>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
