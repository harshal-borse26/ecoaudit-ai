import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How does EcoAudit AI process utility invoices using Gemini Vision OCR?",
      a: "EcoAudit AI utilizes Google Gemini Vision AI to parse unstructured utility bills (PDFs, scans, or images). The AI identifies billing cycles, facility identifiers, and usage metrics (kWh, therms, cubic meters), converting them into structured database entities automatically.",
    },
    {
      q: "Which Greenhouse Gas Protocol emission scopes are calculated?",
      a: "The platform models both Scope 1 (Direct emissions from natural gas heating, fuel generators, and mobile combustion) and Scope 2 (Indirect emissions from purchased grid electricity) adhering to location-based and market-based GHG Protocol standards.",
    },
    {
      q: "How does multi-tenant organization isolation work?",
      a: "EcoAudit AI enforces strict multi-tenant database isolation (`ORG_ADMIN`). User accounts, facility networks, utility bills, and ESG reports belong exclusively to your corporate workspace and cannot be accessed across tenant boundaries.",
    },
    {
      q: "Can I export audit-ready 14-section ESG reports for stakeholders?",
      a: "Yes! The platform generates formatted 14-Section Executive ESG Compliance Reports that can be exported directly to PDF. Reports include executive summaries, facility carbon intensity tables, anomaly logs, and decarbonization recommendations.",
    },
    {
      q: "What invoice file formats are supported for upload?",
      a: "You can upload PDF utility statements, scanned paper bills (JPEG, PNG, WEBP), and digital portal receipts up to 25MB per file into your organization ingestion queue.",
    },
    {
      q: "How does the rolling average carbon anomaly model work?",
      a: "The analytics engine calculates 3-period rolling averages across your active timeline. When utility usage exceeds calculated baseline thresholds, the system flags peak-demand charges and HVAC thermal anomalies.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#F7F6EE] border-b border-[#DDDDD0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">

        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold text-[#2F5241] uppercase tracking-wider block font-heading">
            Enterprise Knowledge Base
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#152A38] tracking-tight font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#7A8597] font-medium leading-relaxed">
            Everything you need to know about the EcoAudit AI platform, security architecture, and carbon accounting standards.
          </p>
        </div>

        {/* ACCORDION LIST */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#EEEDDF] rounded-2xl border border-[#DDDDD0] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer focus:outline-none"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-[#152A38] font-heading pr-4">
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-xl bg-[#F7F6EE] border border-[#DDDDD0] flex items-center justify-center text-[#152A38] shrink-0 transition-transform ${isOpen ? "rotate-180 bg-[#152A38] text-white" : ""
                    }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 sm:p-5 pt-0 text-xs text-[#7A8597] font-medium leading-relaxed border-t border-[#DDDDD0]/60">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
