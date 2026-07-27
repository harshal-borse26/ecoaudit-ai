import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Cpu, FileCheck2, Building, Zap, Lock } from "lucide-react";

const TrustSection = () => {
  const trustItems = [
    { icon: Building, title: "Multi-Tenant Workspace", desc: "Corporate Organization Isolation" },
    { icon: ShieldCheck, title: "Enterprise Ready", desc: "Role-Based Access Control" },
    { icon: Cpu, title: "AI Powered OCR", desc: "Gemini Vision Multimodal Ingestion" },
    { icon: FileCheck2, title: "Audit Ready ESG", desc: "14-Section Compliance Reports" },
    { icon: Zap, title: "Real-Time Diagnostics", desc: "Baseline Spike & Anomaly Detection" },
    { icon: Lock, title: "AES-256 Encrypted", desc: "Secure Storage & REST APIs" },
  ];

  return (
    <section className="py-8 bg-[#EEEDDF]/60 border-y border-[#DDDDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-[#F7F6EE] p-3 rounded-2xl border border-[#DDDDD0] flex flex-col items-center text-center shadow-2xs hover:border-[#2F5241]/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#152A38] text-[#E4E5DB] flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-[11px] font-extrabold text-[#152A38] leading-tight font-heading">
                  {item.title}
                </h4>
                <p className="text-[9.5px] font-bold text-[#7A8597] mt-0.5 leading-tight">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
