import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Cpu, CheckCircle2, Calculator, BarChart3, FileCheck, ArrowRight, Sparkles } from "lucide-react";

const AISection = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: "Invoice Ingestion",
      icon: Upload,
      detail: "Upload PDF utility statements, scanned paper bills, or portal screenshots into the automated drop queue.",
      metric: "Multi-Format (PDF, PNG, JPG)",
    },
    {
      step: 2,
      title: "Gemini AI Vision Parsing",
      icon: Cpu,
      detail: "Google Gemini Vision AI extracts billing dates, account numbers, kWh, therms, cubic meters, and total costs.",
      metric: "96.5% Extraction Accuracy",
    },
    {
      step: 3,
      title: "Schema Validation",
      icon: CheckCircle2,
      detail: "Automated verification flags unexpected billing anomalies, missing line items, or duplicate invoice submissions.",
      metric: "Zero Duplicate Submissions",
    },
    {
      step: 4,
      title: "Carbon Engine Calculation",
      icon: Calculator,
      detail: "Converts raw energy metrics into location & market Scope 1 & 2 carbon output (kg CO₂e) using EPA/DEFRA emission factors.",
      metric: "GHG Protocol Compliant",
    },
    {
      step: 5,
      title: "Real-Time Analytics Sync",
      icon: BarChart3,
      detail: "Updates executive dashboard KPI cards, updates facility timeline trends, and evaluates rolling average baselines.",
      metric: "< 3.0 sec Processing Speed",
    },
    {
      step: 6,
      title: "14-Section PDF Generation",
      icon: FileCheck,
      detail: "Produces board-ready corporate ESG compliance documentation ready for stakeholder export and auditor review.",
      metric: "Audit-Ready PDF Output",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#152A38] text-[#E4E5DB] relative overflow-hidden border-b border-[#2F5241]/40">

      {/* AMBIENT SOFT GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#2F5241]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-[#2F5241] text-emerald-300 text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Document Intelligence Pipeline</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Automated Multimodal Utility Processing Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            From raw utility statements to verified corporate ESG disclosure in six automated steps. Click any stage to inspect the processing details.
          </p>
        </div>

        {/* PIPELINE PROGRESS INDICATOR BAR */}
        <div className="hidden lg:grid grid-cols-6 gap-3 mb-12 relative">
          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 -z-10" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center ${isActive
                  ? "bg-[#2F5241] text-white border-emerald-400/60 shadow-lg scale-105"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${isActive ? "bg-emerald-400 text-[#152A38]" : "bg-slate-800 text-slate-300"
                  }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold block leading-tight">
                  Step 0{s.step}
                </span>
                <span className="text-[9.5px] font-bold opacity-80 block truncate mt-0.5">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE STEP CARD SHOWCASE */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/90 border border-slate-800 rounded-[32px] p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left"
        >
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2F5241]/40 text-emerald-400 text-xs font-extrabold border border-[#2F5241]">
              <span>Stage 0{activeStep} of 06</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              {steps[activeStep - 1].title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {steps[activeStep - 1].detail}
            </p>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-extrabold text-emerald-400">
              <span>Benchmark Metric:</span>
              <span className="text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                {steps[activeStep - 1].metric}
              </span>
            </div>
          </div>

          <div className="md:col-span-4 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#2F5241]/30 border border-[#2F5241] flex items-center justify-center text-emerald-300 shadow-xl">
              {React.createElement(steps[activeStep - 1].icon, { className: "w-12 h-12 stroke-[2]" })}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AISection;
