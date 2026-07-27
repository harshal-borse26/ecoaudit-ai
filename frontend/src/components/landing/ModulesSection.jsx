import React from "react";
import { motion } from "framer-motion";
import { Building2, Receipt, TrendingUp, FileText, ShieldCheck, Users, ArrowRight } from "lucide-react";

const ModulesSection = () => {
  const modules = [
    {
      id: "facility",
      icon: Building2,
      title: "Facility Scope Monitoring",
      tagline: "Scope 1 & Scope 2 Real-Time Tracking",
      desc: "Monitor electricity consumption, natural gas therms, and fuel usage across corporate headquarters, manufacturing hubs, and logistics facilities.",
      metrics: ["Multi-Site Isolation", "Energy Density (kg/sq ft)", "Baseline Profiling"],
    },
    {
      id: "ocr",
      icon: Receipt,
      title: "AI Bill Ingestion Engine",
      tagline: "Gemini Vision Multimodal Document OCR",
      desc: "Upload PDF statements, scanned paper receipts, or utility portal screenshots. Automatically extracts line-item metrics with 96.5% AI accuracy.",
      metrics: ["< 3.0 sec OCR Speed", "Multi-Utility Support", "Line-Item Audit Trail"],
    },
    {
      id: "analytics",
      icon: TrendingUp,
      title: "Granular Carbon Analytics",
      tagline: "Rolling Average & Anomaly Model",
      desc: "Identify off-hour baseline demand spikes, peak-shaving opportunities, and tariff mismatches using interactive SVG trend models.",
      metrics: ["Peak & Low Markers", "Rolling Avg Overlay", "Target Benchmark Lines"],
    },
    {
      id: "reports",
      icon: FileText,
      title: "Executive ESG Reporting",
      tagline: "14-Section Audit-Ready Generator",
      desc: "Export board-level corporate sustainability documentation formatted for CSRD, SEC ESG disclosures, and third-party auditor review.",
      metrics: ["14 Mandatory Sections", "One-Click PDF Export", "Executive Summaries"],
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: "Enterprise Security Architecture",
      tagline: "AES-256 Encrypted & Multi-Tenant Isolated",
      desc: "Strict organization-level data boundaries, role-based privileges (`ORG_ADMIN`), and zero-retention AI processing safeguards.",
      metrics: ["ORG_ADMIN Role Isolation", "JWT Bearer Auth", "Encrypted Document Store"],
    },
    {
      id: "workspace",
      icon: Users,
      title: "Organization Workspace Management",
      tagline: "Centralized Corporate Administration",
      desc: "Manage team credentials, assign facility ownership, configure regional emission factor profiles, and maintain audit logs.",
      metrics: ["Tenant Workspace Admin", "Facility Allocation", "Audit History Log"],
    },
  ];

  return (
    <section id="modules" className="py-16 sm:py-24 bg-[#E4E5DB]/40 border-b border-[#DDDDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-[#2F5241] uppercase tracking-wider block font-heading">
            Enterprise Module Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#152A38] tracking-tight font-heading">
            Built for Enterprise Decarbonization Workflows
          </h2>
          <p className="text-xs sm:text-sm text-[#7A8597] font-medium leading-relaxed">
            Six decoupled product modules engineered to streamline utility data collection, carbon footprint calculation, and stakeholder disclosure.
          </p>
        </div>

        {/* MODULE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="dash-card bg-[#F7F6EE] border border-[#DDDDD0] rounded-[28px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(21,42,56,0.04)] hover:shadow-lg hover:border-[#2F5241]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-[#152A38] text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5.5 h-5.5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#2F5241] bg-[#EEEDDF] px-2.5 py-1 rounded-full border border-[#DDDDD0]">
                      MODULE 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38] font-heading mb-1">
                    {mod.title}
                  </h3>
                  <span className="text-[11px] font-bold text-[#2E7D32] block mb-3">
                    {mod.tagline}
                  </span>
                  <p className="text-xs text-[#7A8597] font-medium leading-relaxed mb-6">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DDDDD0]/70 space-y-2">
                  {mod.metrics.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2F5241]" />
                      <span className="text-[11px] font-extrabold text-[#152A38]">
                        {m}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ModulesSection;
