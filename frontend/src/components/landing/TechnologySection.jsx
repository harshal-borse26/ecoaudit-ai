import React from "react";
import { motion } from "framer-motion";
import { Cpu, Server, Database, Cloud, Code, Sparkles, Layers, Box } from "lucide-react";

const TechnologySection = () => {
  const stack = [
    { name: "React 18", category: "Frontend Engine", desc: "Component-driven reactive user interface architecture", icon: Code },
    { name: "Vite 8", category: "Build Tooling", desc: "Ultra-fast module bundling & optimized production chunks", icon: Box },
    { name: "Node.js & Express", category: "Backend REST API", desc: "High-throughput asynchronous server infrastructure", icon: Server },
    { name: "Prisma ORM", category: "Data Access Layer", desc: "Type-safe database schema modeling & migrations", icon: Database },
    { name: "MySQL / PostgreSQL", category: "Relational Storage", desc: "ACID-compliant enterprise relational database engine", icon: Database },
    { name: "Google Gemini AI", category: "Multimodal Vision", desc: "AI OCR for automated utility bill extraction", icon: Cpu },
    { name: "AWS Cloud", category: "Infrastructure", desc: "Scalable S3 file storage & cloud hosting deployment", icon: Cloud },
    { name: "Tailwind & Framer", category: "Design System", desc: "Enterprise styling tokens & 60 FPS animation framework", icon: Layers },
  ];

  return (
    <section id="technology" className="py-16 sm:py-24 bg-[#E4E5DB]/30 border-b border-[#DDDDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-[#2F5241] uppercase tracking-wider block font-heading">
            Modern Software Stack
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#152A38] tracking-tight font-heading">
            Engineered with Industry-Leading Technologies
          </h2>
          <p className="text-xs sm:text-sm text-[#7A8597] font-medium leading-relaxed">
            Built on top of a battle-tested, high-performance tech stack designed for speed, security, and enterprise scalability.
          </p>
        </div>

        {/* TECH STACK GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stack.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="bg-[#F7F6EE] p-5 rounded-2xl border border-[#DDDDD0] shadow-xs hover:shadow-md hover:border-[#2F5241]/40 transition-all text-left space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#152A38] text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#2F5241] bg-[#EEEDDF] px-2 py-0.5 rounded-full border border-[#DDDDD0]">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[#152A38] font-heading">
                  {item.name}
                </h3>
                <p className="text-[11px] text-[#7A8597] font-medium leading-relaxed">
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

export default TechnologySection;
