import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Key, Server, Users, FileCode2 } from "lucide-react";

const SecuritySection = () => {
  const features = [
    {
      icon: Users,
      title: "Multi-Tenant Workspace Segregation",
      desc: "Strict logical data separation preventing any cross-organization data leakage. Each enterprise operates in an isolated environment (`ORG_ADMIN`).",
    },
    {
      icon: Key,
      title: "JWT Session Authentication",
      desc: "Stateless bearer token authentication with secure token renewal, HTTP header guards, and automatic invalidation on logout.",
    },
    {
      icon: Lock,
      title: "AES-256 Encrypted Ingestion",
      desc: "Utility bill PDFs and invoice metadata are encrypted at rest using AES-256 algorithms and transmitted via TLS 1.3.",
    },
    {
      icon: Server,
      title: "Isolated RESTful Architecture",
      desc: "Robust Express API backend with CORS origin verification, Helmet security headers, rate limiting, and sanitized database queries.",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access Control",
      desc: "Enforces strict user privilege boundaries across facility creation, bill deletion, analytics configuration, and report exports.",
    },
    {
      icon: FileCode2,
      title: "Zero AI Retention Privacy",
      desc: "Google Gemini AI vision extraction processes utility invoices ephemerally without using your confidential enterprise data for training.",
    },
  ];

  return (
    <section id="security" className="py-16 sm:py-24 bg-[#152A38] text-[#E4E5DB] relative overflow-hidden border-b border-[#2F5241]/40">

      {/* SOFT GLOW */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#2F5241]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#2F5241] text-emerald-300 text-xs font-extrabold inline-flex items-center gap-1.5 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Security & Data Privacy</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Architected for Strict Data Governance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            Protecting corporate sustainability data with multi-tenant workspace isolation, state-of-the-art encryption, and role-based privilege controls.
          </p>
        </div>

        {/* SECURITY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-slate-900/80 p-6 rounded-[28px] border border-slate-800 hover:border-[#2F5241] transition-all text-left space-y-3 shadow-lg group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#2F5241] text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-white font-heading">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SecuritySection;
