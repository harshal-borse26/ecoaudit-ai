import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const CTASection = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  return (
    <section className="py-16 sm:py-24 bg-[#E4E5DB]/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="dash-card bg-[#152A38] text-[#E4E5DB] rounded-[36px] p-8 sm:p-14 border border-[#2F5241]/50 relative overflow-hidden text-center shadow-2xl space-y-6">

          {/* AMBIENT SOFT GREEN GLOW */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#2F5241]/25 rounded-full blur-[140px] pointer-events-none" />

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2F5241] text-emerald-300 text-xs font-extrabold border border-emerald-400/30 relative z-10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modernize Corporate Sustainability</span>
          </div>

          {/* HEADLINE */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight font-heading relative z-10">
            Ready to Automate Carbon Accounting Across Your Enterprise?
          </h2>

          {/* SUBTITLE */}
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto leading-relaxed relative z-10">
            Join corporate sustainability managers and facility leads processing utility invoices and generating 14-section ESG compliance disclosures with AI.
          </p>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
            <button
              onClick={() => navigate(token ? "/dashboard" : "/signup")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[#152A38] font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>{token ? "Go to Workspace Dashboard" : "Create Enterprise Account"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <a
              href="#overview"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-decoration-none border border-slate-700"
            >
              <span>Explore Platform Capabilities</span>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Tenant Isolated
            </span>
            <span>•</span>
            <span>Zero Setup Fee</span>
            <span>•</span>
            <span>Audit-Ready PDF Exports</span>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CTASection;
