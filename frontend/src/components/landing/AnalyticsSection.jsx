import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Layers, Filter, CheckCircle2 } from "lucide-react";

const AnalyticsSection = () => {
  const [timeRange, setTimeRange] = useState("ALL");
  const [granularity, setGranularity] = useState("AUTO");
  const [showRollingAvg, setShowRollingAvg] = useState(true);

  return (
    <section id="analytics" className="py-16 sm:py-24 bg-[#F7F6EE] border-b border-[#DDDDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold text-[#2F5241] uppercase tracking-wider block font-heading">
            Interactive Analytics Canvas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#152A38] tracking-tight font-heading">
            Real-Time Carbon Trend & Anomaly Modeling
          </h2>
          <p className="text-xs sm:text-sm text-[#7A8597] font-medium leading-relaxed">
            Test the live analytics chart controls below. Toggle rolling average overlays, inspect period peaks, and benchmark emissions against corporate targets.
          </p>
        </div>

        {/* DEMO CHART CARD (MATCHING CARBON TREND CHART SECTION UI) */}
        <div className="dash-card bg-[#F7F6EE] border border-[#DDDDD0] rounded-[32px] p-5 sm:p-8 shadow-[0_20px_60px_rgba(21,42,56,0.08)] max-w-5xl mx-auto text-left space-y-5">

          {/* CARD HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDDDD0]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#152A38] text-[#E4E5DB] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-[14px] font-extrabold text-[#152A38] uppercase tracking-wide font-heading">
                  Carbon Emissions Analytics & Trend Model
                </h3>
                <p className="text-[11px] sm:text-xs text-[#7A8597] font-medium mt-0.5">
                  Scalable aggregated timeline with rolling average & facility scope filters
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#2F5241] text-[10px] font-extrabold border border-[#2F5241]/20 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
              Live Analytical Model
            </span>
          </div>

          {/* FILTER CONTROLS TOOLBAR */}
          <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* TIME RANGE */}
              <div className="flex items-center bg-[#F7F6EE] p-1 rounded-xl border border-[#DDDDD0]">
                {["6M", "1Y", "ALL"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === range
                        ? "bg-[#2F5241] text-[#E4E5DB] shadow-xs"
                        : "text-[#7A8597] hover:text-[#152A38]"
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* GRANULARITY */}
              <div className="flex items-center bg-[#F7F6EE] p-1 rounded-xl border border-[#DDDDD0]">
                {["AUTO", "MONTHLY", "WEEKLY"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${granularity === g
                        ? "bg-[#152A38] text-white shadow-xs"
                        : "text-[#7A8597] hover:text-[#152A38]"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* ROLLING AVG TOGGLE */}
            <button
              onClick={() => setShowRollingAvg(!showRollingAvg)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${showRollingAvg
                  ? "bg-[#2F5241]/10 text-[#2F5241] border-[#2F5241]/30 font-extrabold"
                  : "bg-[#F7F6EE] text-[#7A8597] border-[#DDDDD0]"
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Rolling Avg</span>
            </button>
          </div>

          {/* KPI HIGHLIGHTS STRIP */}
          <div className="bg-[#EEEDDF]/70 rounded-2xl p-3.5 border border-[#DDDDD0] grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            <div className="pr-2 border-r border-[#DDDDD0]/70">
              <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Scope Emission</span>
              <span className="text-xs sm:text-base font-extrabold text-[#152A38] block mt-0.5 whitespace-nowrap">
                16,374 kg CO₂e
              </span>
            </div>

            <div className="pr-2 lg:border-r border-[#DDDDD0]/70">
              <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Timeline Direction</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap">
                  ▼ 12.4% vs prev
                </span>
              </div>
            </div>

            <div className="pr-2 border-r border-[#DDDDD0]/70 hidden sm:block">
              <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">Timeline Peak</span>
              <span className="text-xs font-extrabold text-[#B45309] block mt-0.5 truncate">
                24,810 kg (Sep 16)
              </span>
            </div>

            <div className="hidden sm:block">
              <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">
                Granular Period Average
              </span>
              <span className="text-xs font-extrabold text-[#2F5241] block mt-0.5 whitespace-nowrap">
                5,458 kg/period
              </span>
            </div>
          </div>

          {/* SVG INTERACTIVE GRAPH CANVAS */}
          <div className="relative rounded-2xl overflow-hidden bg-[#EEEDDF]/50 p-3 border border-[#DDDDD0]/60 w-full">
            <svg viewBox="0 0 800 240" className="w-full h-auto" style={{ display: "block" }}>
              <defs>
                <linearGradient id="landingTrendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F5241" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2F5241" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[40, 90, 140, 190].map((y, i) => (
                <line key={i} x1="60" y1={y} x2="750" y2={y} stroke="#DDDDD0" strokeWidth="1" strokeDasharray="3 3" />
              ))}

              {/* Target Benchmark Line */}
              <line x1="60" y1="130" x2="750" y2="130" stroke="#2F5241" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5" />
              <rect x="620" y="116" width="120" height="16" rx="4" fill="#EAF2ED" stroke="#2F5241" strokeWidth="0.8" />
              <text x="680" y="127" textAnchor="middle" fill="#2F5241" fontSize="8.5" fontWeight="800">
                TARGET: 14,200 kg
              </text>

              {/* Area & Main Curve */}
              <path d="M 60 170 Q 230 40 400 130 T 750 70 L 750 200 L 60 200 Z" fill="url(#landingTrendAreaGrad)" />

              {showRollingAvg && (
                <path d="M 60 160 Q 230 60 400 120 T 750 85" fill="none" stroke="#B45309" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.8" />
              )}

              <path d="M 60 170 Q 230 40 400 130 T 750 70" fill="none" stroke="#2F5241" strokeWidth="3" strokeLinecap="round" />

              {/* PEAK NODE */}
              <circle cx="230" cy="55" r="7" fill="#FEF3C7" stroke="#B45309" strokeWidth="2.5" />
              <rect x="188" y="25" width="84" height="20" rx="10" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.2" />
              <text x="230" y="38" textAnchor="middle" fill="#B45309" fontSize="8.5" fontWeight="800">
                PEAK 24,810 kg
              </text>

              {/* LOWEST NODE */}
              <circle cx="400" cy="130" r="6" fill="#EAF2ED" stroke="#2F5241" strokeWidth="2.5" />
              <rect x="362" y="145" width="76" height="19" rx="9.5" fill="#EAF2ED" stroke="#2F5241" strokeWidth="1.2" />
              <text x="400" y="158" textAnchor="middle" fill="#2F5241" fontSize="8.5" fontWeight="800">
                LOW 3,120 kg
              </text>

              {/* LATEST NODE */}
              <circle cx="750" cy="70" r="6.5" fill="#2F5241" stroke="#2F5241" strokeWidth="2.5" />
            </svg>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AnalyticsSection;
