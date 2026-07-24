import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Lock, 
  Leaf, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Award
} from "lucide-react";

const AuthLayout = ({ children, title, subtitle, maxWidth = "max-w-[440px]" }) => {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex font-sans antialiased text-[#1E293B] selection:bg-[#2E7D32]/10 selection:text-[#2E7D32]">
      {/* LEFT PANEL - BRANDING & VALUE PROPOSITION (Desktop 45%) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[44%] relative flex-col justify-between p-10 xl:p-14 bg-[#F8FAFC] border-r border-[#E2E8F0] overflow-hidden">
        {/* Subtle Ambient Background Accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#2E7D32]/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1565C0]/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        {/* Abstract Sustainability & Data Vector Grid Artwork */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          {/* Analytical Trend Lines */}
          <path d="M 0 300 Q 150 250 300 350 T 600 200" fill="none" stroke="#2E7D32" strokeWidth="2" />
          <path d="M 0 450 Q 200 400 400 480 T 800 300" fill="none" stroke="#1565C0" strokeWidth="2" />
        </svg>

        {/* TOP BRANDING & HEADER */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-10 text-decoration-none">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-md shadow-[#2E7D32]/20 group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1E293B] block leading-none">EcoAudit AI</span>
              <span className="text-[11px] font-semibold text-[#2E7D32] tracking-wider uppercase">Carbon Intelligence</span>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl xl:text-4xl font-extrabold text-[#1E293B] tracking-tight leading-[1.15] mb-4">
              Smarter Carbon Intelligence.
            </h1>
            <p className="text-[#64748B] text-[15px] leading-relaxed max-w-lg mb-8">
              Manage facilities, analyze utility bills, monitor emissions, and generate AI-powered sustainability reports from a single platform.
            </p>
          </motion.div>

          {/* 3 FEATURE CARDS */}
          <div className="space-y-3.5 max-w-lg mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-[#2E7D32]/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#2E7D32] group-hover:text-white transition-colors duration-200">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1E293B] flex items-center gap-1.5">
                  AI Bill Processing
                  <span className="text-[10px] font-bold bg-[#E7F3E8] text-[#2E7D32] px-1.5 py-0.5 rounded-full">OCR</span>
                </h4>
                <p className="text-xs text-[#64748B] mt-0.5 leading-normal">
                  Automated OCR extraction from utility invoices using Google Gemini Vision.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-[#2E7D32]/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FB] text-[#1565C0] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1565C0] group-hover:text-white transition-colors duration-200">
                <BarChart3 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1E293B]">Carbon Analytics</h4>
                <p className="text-xs text-[#64748B] mt-0.5 leading-normal">
                  Real-time Scope 1 & Scope 2 greenhouse emissions tracking and breakdown.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-[#2E7D32]/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FDF3E0] text-[#F9A825] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F9A825] group-hover:text-white transition-colors duration-200">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1E293B]">Executive Reports</h4>
                <p className="text-xs text-[#64748B] mt-0.5 leading-normal">
                  Audit-ready PDF assessments suitable for ESG boards and compliance review.
                </p>
              </div>
            </motion.div>
          </div>

          {/* STATISTICS SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm border border-[#E2E8F0] rounded-xl p-4 max-w-lg shadow-sm grid grid-cols-3 gap-2"
          >
            <div className="text-center px-1">
              <div className="text-base xl:text-lg font-extrabold text-[#2E7D32]">98%</div>
              <div className="text-[11px] font-medium text-[#64748B] mt-0.5 leading-tight">Extraction Accuracy</div>
            </div>
            <div className="text-center px-1 border-x border-[#E2E8F0]">
              <div className="text-base xl:text-lg font-extrabold text-[#1565C0]">10K+</div>
              <div className="text-[11px] font-medium text-[#64748B] mt-0.5 leading-tight">Bills Processed</div>
            </div>
            <div className="text-center px-1">
              <div className="text-base xl:text-lg font-extrabold text-[#1E293B]">Grade A</div>
              <div className="text-[11px] font-medium text-[#64748B] mt-0.5 leading-tight">Audit Compliance</div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM TRUST BADGE */}
        <div className="relative z-10 pt-6 border-t border-[#E2E8F0]/80 flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Secure • Private • Enterprise Ready</span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">v2.4 Audit Standard</span>
        </div>
      </div>

      {/* RIGHT PANEL - AUTHENTICATION FORM CARD (55% Desktop, 100% Mobile) */}
      <div className="w-full lg:w-[55%] xl:w-[56%] flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 relative bg-[#F8FAFC]">
        {/* Mobile Header Branding */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-decoration-none">
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-md shadow-[#2E7D32]/20">
              <Leaf className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold text-[#1E293B]">EcoAudit AI</span>
          </Link>
        </div>

        {/* CENTERING WRAPPER WITH EXACT SPECIFIED MAX WIDTH */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full ${maxWidth}`}
        >
          {/* WHITE SURFACE CARD */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-7 sm:p-10 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.04),0_8px_10px_-6px_rgba(15,23,42,0.02)]">
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">{title}</h2>
              <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>
            </div>

            {children}
          </div>

          {/* Footer Sub-links */}
          <div className="mt-8 text-center text-xs text-[#94A3B8] space-x-4">
            <a href="#privacy" className="hover:text-[#64748B] transition-colors text-decoration-none">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-[#64748B] transition-colors text-decoration-none">Terms of Service</a>
            <span>•</span>
            <a href="#support" className="hover:text-[#64748B] transition-colors text-decoration-none">Support</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
