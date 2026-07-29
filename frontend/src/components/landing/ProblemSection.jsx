import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2, ArrowRight, FileSpreadsheet, AlertTriangle, Zap, Cpu, FileText, BarChart3 } from "lucide-react";

const ProblemSection = () => {
  const oldSteps = [
    { label: "Paper/PDF Invoices", desc: "Unstructured utility bills" },
    { label: "Excel Spreadsheets", desc: "Manual data entry prone to typos" },
    { label: "Manual Calculations", desc: "Outdated emission factors" },
    { label: "Disjointed Emails", desc: "No central audit trail" },
    { label: "Delayed Reports", desc: "Weeks of manual consolidation" },
    { label: "Human Errors", desc: "Audit vulnerability & compliance risk" },
  ];

  const newSteps = [
    { label: "Invoice Upload", desc: "PDF, PNG, JPG drop queue" },
    { label: "Gemini Vision OCR", desc: "Instant multimodal extraction" },
    { label: "Carbon Engine", desc: "GHG Protocol Scope 1 & 2 conversion" },
    { label: "Real-Time Analytics", desc: "Off-hour baseline & spike detection" },
    { label: "14-Section ESG PDF", desc: "Audit-ready executive report" },
    { label: "Zero Discrepancy", desc: "100% verified compliance record" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#E4E5DB]/30 border-b border-[#DDDDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-[#2F5241] uppercase tracking-wider block font-heading">
            The Carbon Accounting Dilemma
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#152A38] tracking-tight font-heading">
            Why Legacy Sustainability Workflows Fail Enterprise Audits
          </h2>
          <p className="text-xs sm:text-sm text-[#7A8597] font-medium leading-relaxed">
            Manual spreadsheet tracking creates data gaps, delays compliance reporting, and exposes your enterprise to audit vulnerabilities. EcoAudit AI replaces manual entry with automated intelligence.
          </p>
        </div>

        {/* COMPARISON CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* LEFT: LEGACY WORKFLOW */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="dash-card bg-red-50/40 border border-red-200/80 rounded-[28px] p-6 sm:p-8 relative"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200/60">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-950 font-heading">
                  The Legacy Manual Workflow
                </h3>
                <span className="text-xs font-semibold text-red-700 block">
                  High Risk • Slow • Error-Prone
                </span>
              </div>
            </div>

            {/* STEP LIST */}
            <div className="space-y-4">
              {oldSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white/70 p-3 rounded-2xl border border-red-100">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-extrabold text-red-950 block">
                      {step.label}
                    </span>
                    <span className="text-[11px] font-medium text-red-700/80 block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: ECOAUDIT AI WORKFLOW */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="dash-card bg-[#152A38] text-[#E4E5DB] border border-[#2F5241]/40 rounded-[28px] p-6 sm:p-8 relative shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
              <div className="w-10 h-10 rounded-2xl bg-[#2F5241] text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-heading">
                  The EcoAudit AI Platform
                </h3>
                <span className="text-xs font-semibold text-emerald-400 block">
                  Automated • Instant • Audit-Ready
                </span>
              </div>
            </div>

            {/* STEP LIST */}
            <div className="space-y-4">
              {newSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-[#2F5241] text-emerald-300 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-extrabold text-white block">
                      {step.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
