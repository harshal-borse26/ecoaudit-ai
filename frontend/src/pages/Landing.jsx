import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Building2, 
  FileText, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  TrendingUp, 
  Cpu, 
  Globe, 
  Lock,
  Layers,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Landing = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#2E7D32]/10 selection:text-[#2E7D32]">
      
      {/* ── STICKY GLASSMORPHIC NAVBAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* BRAND LOGO */}
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

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#2E7D32] transition-colors text-decoration-none">Platform</a>
            <a href="#workflow" className="hover:text-[#2E7D32] transition-colors text-decoration-none">Workflow</a>
            <a href="#esg" className="hover:text-[#2E7D32] transition-colors text-decoration-none">ESG Reports</a>
            <a href="#security" className="hover:text-[#2E7D32] transition-colors text-decoration-none">Enterprise</a>
          </nav>

          {/* CTA ACTIONS */}
          <div className="flex items-center gap-3">
            {token ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-800"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#0F172A] transition-colors text-decoration-none"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 text-decoration-none cursor-pointer border border-slate-800"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-200/20 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2ED] border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-extrabold mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Corporate Sustainability Platform</span>
          </motion.div>

          {/* HEADLINE */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-[1.15]"
          >
            Automate Utility Bill OCR & <span className="text-[#2E7D32]">Scope 1, 2 & 3</span> Carbon Auditing
          </motion.h1>

          {/* SUBTITLE */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-sm sm:text-base lg:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            EcoAudit AI parses complex energy invoices with Gemini Vision OCR, converts usage metrics into location-based carbon output, and delivers audit-ready ESG sustainability reports.
          </motion.p>

          {/* ACTION BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <button
              onClick={() => navigate(token ? "/dashboard" : "/signup")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-[#0F172A]/15 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-slate-800"
            >
              <span>{token ? "Open Workspace Dashboard" : "Start Corporate Account"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-decoration-none shadow-xs"
            >
              <span>Explore Platform Capabilities</span>
            </a>
          </motion.div>

          {/* METRIC STRIP SHOWCASE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 max-w-5xl mx-auto bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xl shadow-slate-200/50"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="p-3">
                <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-wider block mb-1">OCR Accuracy</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#0F172A] block">96.5%</span>
                <span className="text-[11px] font-medium text-slate-500 block mt-0.5">Gemini Vision Extraction</span>
              </div>
              <div className="p-3 pt-4 sm:pt-3">
                <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-wider block mb-1">Processing Speed</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#0F172A] block">&lt; 3.0 sec</span>
                <span className="text-[11px] font-medium text-slate-500 block mt-0.5">Instant Invoice Parsing</span>
              </div>
              <div className="p-3 pt-4 sm:pt-3">
                <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-wider block mb-1">GHG Standard</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#0F172A] block">Scope 1 & 2</span>
                <span className="text-[11px] font-medium text-slate-500 block mt-0.5">Location & Market-Based</span>
              </div>
              <div className="p-3 pt-4 sm:pt-3">
                <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-wider block mb-1">ESG Compliance</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#0F172A] block">14 Sections</span>
                <span className="text-[11px] font-medium text-slate-500 block mt-0.5">Audit-Ready Export</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── CORE PLATFORM FEATURES Grid ─────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#2E7D32] uppercase tracking-wider block mb-2">Platform Capabilities</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Enterprise Carbon Intelligence Engine
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Everything your corporate sustainability team needs to automate utility data ingestion, track facility emissions, and generate compliance reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* FEATURE 1 */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#2E7D32]/40 transition-all hover:shadow-md group">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2ED] text-[#2E7D32] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0F172A] mb-1.5">Gemini Vision OCR</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Automatically extracts line-item billing periods, electricity kWh, gas therms, and fuel metrics from multi-page PDFs and images.
              </p>
            </div>

            {/* FEATURE 2 */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#2E7D32]/40 transition-all hover:shadow-md group">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2ED] text-[#2E7D32] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0F172A] mb-1.5">Multi-Site Scope Tracking</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Monitor corporate headquarters, manufacturing plants, and regional offices within a centralized, multi-tenant workspace.
              </p>
            </div>

            {/* FEATURE 3 */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#2E7D32]/40 transition-all hover:shadow-md group">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2ED] text-[#2E7D32] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0F172A] mb-1.5">AI Anomaly Diagnostics</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Detects off-hour baseline spikes, peak demand surcharges, and utility billing errors across active monitoring windows.
              </p>
            </div>

            {/* FEATURE 4 */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#2E7D32]/40 transition-all hover:shadow-md group">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2ED] text-[#2E7D32] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0F172A] mb-1.5">14-Section ESG Audit Reports</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Generate comprehensive corporate sustainability disclosure reports formatted for auditor review and stakeholder presentation.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── SIMPLE WORKFLOW SECTION ───────────────────────────────────────── */}
      <section id="workflow" className="py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#2E7D32] uppercase tracking-wider block mb-2">Streamlined Ingestion</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Three Steps to Carbon Clarity
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              No manual spreadsheet entry. Ingest utility invoices and generate audit trail intelligence in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* STEP 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">Upload Utility Invoices</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Drag and drop PDF energy bills, fuel receipts, or scanned utility invoices into your corporate organization queue.
              </p>
            </div>

            {/* STEP 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">Instant AI OCR Extraction</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Gemini Vision parses line items, identifies facility scope, and converts kWh/therms into standard kg CO₂e metrics.
              </p>
            </div>

            {/* STEP 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">Track & Export ESG Reports</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Inspect real-time facility trend lines, receive automated optimization advice, and export audit-ready reports.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ENTERPRISE SECURITY BANNER ───────────────────────────────────── */}
      <section id="security" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0F172A] rounded-3xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
            
            {/* Soft Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-2xl text-left">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-[11px] font-extrabold inline-flex items-center gap-1.5 mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Data Privacy & Security</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Multi-Tenant Isolation & Role-Based Access Control
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                EcoAudit AI enforces organization-level data segregation (`ORG_ADMIN`), AES-256 encrypted invoice storage, and secure JWT session authentication across your company workspace.
              </p>
            </div>

            <div className="shrink-0 w-full lg:w-auto">
              <button
                onClick={() => navigate(token ? "/dashboard" : "/signup")}
                className="w-full lg:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[#0F172A] font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>{token ? "Access Workspace" : "Get Started Now"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800 text-center md:text-left">
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Leaf className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-base font-extrabold tracking-tight">
                EcoAudit <span className="text-emerald-400">AI</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-slate-400">
              <a href="#features" className="hover:text-white transition-colors text-decoration-none">Platform</a>
              <a href="#workflow" className="hover:text-white transition-colors text-decoration-none">Workflow</a>
              <a href="#esg" className="hover:text-white transition-colors text-decoration-none">ESG Standard</a>
              <a href="#security" className="hover:text-white transition-colors text-decoration-none">Security</a>
              <Link to="/login" className="hover:text-white transition-colors text-decoration-none">Sign In</Link>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 EcoAudit AI Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>ESG Compliance</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
