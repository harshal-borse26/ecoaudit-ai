import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/dashboardService";
import { billService } from "../services/billService";
import { facilityService } from "../services/facilityService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  FileText, 
  Building2, 
  ShieldCheck, 
  PieChart, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Lightbulb,
  Check,
  ArrowRight
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  // Primary Data States (Preserving 100% of existing backend state and logic)
  const [summary, setSummary] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [utilityDist, setUtilityDist] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [facilityEmissions, setFacilityEmissions] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
  const [allBills, setAllBills] = useState([]);
  
  const [billCounts, setBillCounts] = useState({ pending: 0, processing: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all backend metrics
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        summaryRes,
        recentBillsRes,
        utilityDistRes,
        monthlyTrendRes,
        facilityEmissionsRes,
        allBillsRes,
        facilitiesRes
      ] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentBills(),
        dashboardService.getUtilityDistribution(),
        dashboardService.getMonthlyCarbonTrend(),
        dashboardService.getFacilityEmissions(),
        billService.getAll(),
        facilityService.getAll(),
      ]);

      if (summaryRes.data?.success) setSummary(summaryRes.data.data);
      if (recentBillsRes.data?.success) setRecentBills(recentBillsRes.data.data);
      if (utilityDistRes.data?.success) setUtilityDist(utilityDistRes.data.data);
      if (monthlyTrendRes.data?.success) setMonthlyTrend(monthlyTrendRes.data.data);
      if (facilityEmissionsRes.data?.success) setFacilityEmissions(facilityEmissionsRes.data.data);
      if (facilitiesRes.data?.success) setAllFacilities(facilitiesRes.data.data || []);

      if (allBillsRes.data?.success) {
        const bills = allBillsRes.data.data || [];
        setAllBills(bills);
        const pending = bills.filter((b) => b.status === "PENDING").length;
        const processing = bills.filter((b) => b.status === "PROCESSING").length;
        const completed = bills.filter((b) => b.status === "COMPLETED").length;
        const failed = bills.filter((b) => b.status === "FAILED").length;
        setBillCounts({ pending, processing, completed, failed });
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load executive sustainability metrics from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync re-fetch on cross-page data changes
  useEffect(() => {
    const handleDataChanged = () => {
      fetchDashboardData();
    };
    window.addEventListener("ecoaudit-data-changed", handleDataChanged);
    return () => {
      window.removeEventListener("ecoaudit-data-changed", handleDataChanged);
    };
  }, []);

  // Derived Monthly Trend Analytics (Current vs Previous Month)
  const trendAnalytics = useMemo(() => {
    if (!monthlyTrend || monthlyTrend.length === 0) {
      return { current: 0, previous: 0, diff: 0, pct: 0, isIncrease: false, highest: 0, lowest: 0, avg: 0 };
    }
    const sorted = [...monthlyTrend].sort((a, b) => a.month.localeCompare(b.month));
    const current = sorted[sorted.length - 1]?.carbonEmission || 0;
    const previous = sorted.length > 1 ? sorted[sorted.length - 2]?.carbonEmission || 0 : 0;
    const diff = current - previous;
    const pct = previous > 0 ? (diff / previous) * 100 : 0;

    const values = sorted.map((s) => s.carbonEmission);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

    return {
      current,
      previous,
      diff: Math.abs(diff),
      pct: Math.abs(pct),
      isIncrease: diff > 0,
      hasPrevious: sorted.length > 1,
      highest,
      lowest,
      avg,
    };
  }, [monthlyTrend]);

  // Derived SVG Chart Path Data
  const chartPathData = useMemo(() => {
    if (!monthlyTrend || monthlyTrend.length < 2) return null;
    const sorted = [...monthlyTrend].sort((a, b) => a.month.localeCompare(b.month));

    const width = 650;
    const height = 220;
    const paddingLeft = 55;
    const paddingRight = 25;
    const paddingTop = 35;
    const paddingBottom = 45;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...sorted.map((s) => s.carbonEmission || 0)) || 1;

    const points = sorted.map((item, idx) => {
      const x = paddingLeft + idx * (chartW / (sorted.length - 1));
      const y = paddingTop + chartH - (((item.carbonEmission || 0) / maxVal) * chartH);
      return { x, y, val: item.carbonEmission || 0, label: item.month };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    return { points, linePath, areaPath, width, height };
  }, [monthlyTrend]);

  // Dynamic Decarbonization Action Plan Solutions
  const decarbonizationSolutions = useMemo(() => {
    const totalCarbon = summary?.totalCarbonEmission || 0;
    const topFacility = facilityEmissions && facilityEmissions.length > 0
      ? [...facilityEmissions].sort((a, b) => b.carbonEmission - a.carbonEmission)[0]
      : null;

    const topUtility = utilityDist && utilityDist.length > 0
      ? [...utilityDist].sort((a, b) => b.carbonEmission - a.carbonEmission)[0]
      : null;

    return [
      {
        priority: "High Priority",
        priorityClass: "bg-red-100 text-red-800 border-red-200",
        title: "HVAC Scheduling & Off-Peak Load Shifting",
        solution: topFacility
          ? `Shift non-critical thermal cooling cycles at ${topFacility.facilityName} away from peak utility tariff windows to lower Scope 2 electricity emissions.`
          : "Audit central HVAC operating timers and reschedule heavy cooling equipment to off-peak tariff periods.",
        targetImpact: "-15% Scope 2 Output",
        assignedTeam: "Facilities Engineering",
      },
      {
        priority: "High Priority",
        priorityClass: "bg-red-100 text-red-800 border-red-200",
        title: "Power Factor & Voltage Quality Optimization",
        solution: topUtility
          ? `${topUtility.utilityType} consumption represents the largest carbon share. Installing power-factor capacitors will reduce reactive energy line losses.`
          : "Conduct a site-wide power quality check to minimize reactive energy line losses.",
        targetImpact: "-5% Transmission Loss",
        assignedTeam: "Electrical Lead",
      },
      {
        priority: "Medium Priority",
        priorityClass: "bg-amber-100 text-amber-900 border-amber-200",
        title: "Stationary Genset Burner Efficiency Inspection",
        solution: "Inspect standby diesel generator air-to-fuel combustion ratios to optimize Scope 1 stationary fuel consumption.",
        targetImpact: "-12% Fuel Emissions",
        assignedTeam: "Operations Team",
      },
      {
        priority: "Medium Priority",
        priorityClass: "bg-blue-100 text-blue-900 border-blue-200",
        title: "Automate Invoice Ingestion to Remove Reporting Lag",
        solution: "Configure monthly utility bills to upload automatically via S3 presigned URLs into Gemini AI to eliminate manual audit latency.",
        targetImpact: "Zero-Lag Auditing",
        assignedTeam: "ESG Compliance",
      },
    ];
  }, [summary, facilityEmissions, utilityDist]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] py-12 text-[#64748B]">
        <RefreshCw className="w-9 h-9 animate-spin text-[#2E7D32] mb-4" />
        <p className="text-base font-bold">Syncing executive sustainability intelligence from backend...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ERROR ALERT */}
      {error && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchDashboardData} className="font-extrabold underline cursor-pointer">Retry Sync</button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Executive Sustainability Intelligence</h1>
          <p className="text-sm font-medium text-[#64748B] mt-1">Enterprise Carbon Monitoring & AI Document Parsing Platform</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-[#94A3B8]">Last Synced:</div>
            <div className="text-sm font-extrabold text-[#1E293B]">{formatDate(lastUpdated)}</div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-xs rounded-2xl hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="px-5 py-2.5 bg-[#2E7D32] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#2E7D32]/25 hover:bg-[#256829] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PieChart className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 CORE EXECUTIVE KPI CARDS (Spacious, prominent numbers & easy to read) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Carbon */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs hover:border-[#2E7D32]/30 transition-all flex flex-col justify-between min-h-[170px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Carbon Emission</span>
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#EF4444] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#EF4444] tracking-tight">
              {summary?.totalCarbonEmission ? `${summary.totalCarbonEmission.toFixed(2)} kg` : "0.00 kg"}
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold">Across all sites</span>
            <button onClick={() => navigate("/facilities")} className="text-[#2E7D32] font-extrabold hover:underline cursor-pointer">
              Analytics →
            </button>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs hover:border-[#2E7D32]/30 transition-all flex flex-col justify-between min-h-[170px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Utility Spend</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1565C0] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1565C0] tracking-tight">
              {formatCurrency(summary?.totalAmount)}
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold">Combined spend</span>
            <button onClick={() => navigate("/reports")} className="text-[#1565C0] font-extrabold hover:underline cursor-pointer">
              Reports →
            </button>
          </div>
        </div>

        {/* Total Bills */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs hover:border-[#2E7D32]/30 transition-all flex flex-col justify-between min-h-[170px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Utility Invoices</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1E293B] tracking-tight">
              {summary?.totalBills || 0} Invoices
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold">{billCounts.completed} Done • {billCounts.pending} Pending</span>
            <button onClick={() => navigate("/bills")} className="text-[#2E7D32] font-extrabold hover:underline cursor-pointer">
              Queue →
            </button>
          </div>
        </div>

        {/* Active Facilities */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs hover:border-[#2E7D32]/30 transition-all flex flex-col justify-between min-h-[170px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Monitored Facilities</span>
              <div className="w-10 h-10 rounded-2xl bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#2E7D32] tracking-tight">
              {summary?.facilitiesCovered || 0} Sites
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold">Corporate sites</span>
            <button onClick={() => navigate("/facilities")} className="text-[#2E7D32] font-extrabold hover:underline cursor-pointer">
              Inspect →
            </button>
          </div>
        </div>
      </div>

      {/* AI DOCUMENT QUEUE PROCESSING STATUS BAR */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-[#1E293B]">AI Ingestion Engine Status</span>
              <span className="px-3 py-1 rounded-full bg-[#E7F3E8] text-[#2E7D32] text-xs font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                System Optimal
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 font-medium">Google Gemini OCR multi-field extraction queue</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center w-full md:w-auto">
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] block uppercase">Completed</span>
            <span className="text-base font-extrabold text-[#2E7D32]">{billCounts.completed}</span>
          </div>
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] block uppercase">Pending</span>
            <span className="text-base font-extrabold text-amber-600">{billCounts.pending}</span>
          </div>
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] block uppercase">Processing</span>
            <span className="text-base font-extrabold text-[#1565C0]">{billCounts.processing}</span>
          </div>
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] block uppercase">Failed</span>
            <span className="text-base font-extrabold text-red-600">{billCounts.failed}</span>
          </div>
        </div>
      </div>

      {/* AI SUSTAINABILITY INSIGHTS & DECARBONIZATION SOLUTIONS SECTION */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1E293B] uppercase tracking-wider">
                AI Sustainability Insights & Decarbonization Plan
              </h3>
              <p className="text-xs text-[#64748B] font-medium">Actionable ESG solutions to systematically decrease your carbon footprint</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/reports")} 
            className="text-xs font-extrabold text-[#2E7D32] hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>Full Strategy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decarbonizationSolutions.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between hover:border-[#2E7D32]/40 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${item.priorityClass}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs font-bold text-[#2E7D32] bg-[#E7F3E8] px-3 py-1 rounded-full">
                    {item.targetImpact}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2E7D32] shrink-0 stroke-[3]" />
                  <span>{item.title}</span>
                </h4>
                <p className="text-xs md:text-sm text-[#475569] leading-relaxed font-medium">
                  {item.solution}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Assigned: <strong className="text-[#1E293B] font-bold">{item.assignedTeam}</strong></span>
                <span className="text-[#2E7D32] font-extrabold">Active Objective</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN GRID: CARBON TREND CHART & UTILITY SHARE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: MONTHLY CARBON TREND */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1E293B] uppercase tracking-wider">Monthly Carbon Emissions Trend</h3>
              <p className="text-xs text-[#64748B] font-medium">Scope 1 & Scope 2 output across reporting months</p>
            </div>
            <button onClick={() => navigate("/reports")} className="text-xs font-extrabold text-[#2E7D32] hover:underline cursor-pointer">
              Full Analytics →
            </button>
          </div>

          {/* KPI Mini Breakdown Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase block">Current Period</span>
              <span className="text-sm font-extrabold text-[#1E293B]">{trendAnalytics.current.toFixed(1)} kg</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase block">Previous Period</span>
              <span className="text-sm font-extrabold text-[#1E293B]">{trendAnalytics.previous.toFixed(1)} kg</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase block">Net Difference</span>
              <span className="text-sm font-extrabold text-[#EF4444]">{trendAnalytics.diff.toFixed(1)} kg</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase block">MoM Direction</span>
              <span className={`text-sm font-extrabold ${trendAnalytics.isIncrease ? "text-red-600" : "text-[#2E7D32]"}`}>
                {trendAnalytics.isIncrease ? "▲ Up" : "▼ Down"} {trendAnalytics.pct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* SVG Area Chart */}
          {chartPathData ? (
            <div>
              <svg viewBox={`0 0 ${chartPathData.width} ${chartPathData.height}`} className="w-full h-auto">
                <defs>
                  <linearGradient id="dashChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={chartPathData.areaPath} fill="url(#dashChartGrad)" />
                <path d={chartPathData.linePath} fill="none" stroke="#2E7D32" strokeWidth="3" />
                {chartPathData.points.map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#1E293B" fontSize="11" fontWeight="800">
                      {pt.val.toFixed(0)} kg
                    </text>
                    <text x={pt.x} y="205" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="700">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div className="text-center py-14 text-sm font-semibold text-[#94A3B8] bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0]">
              Not enough monthly bill history for trend visualization.
            </div>
          )}
        </div>

        {/* RIGHT 1 COLUMN: UTILITY SHARE BREAKDOWN */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h3 className="text-base font-extrabold text-[#1E293B] uppercase tracking-wider">Utility Footprint Share</h3>
            <p className="text-xs text-[#64748B] font-medium">Resource emissions contribution</p>
          </div>

          {utilityDist && utilityDist.length > 0 ? (
            <div className="space-y-5">
              {utilityDist.map((u, idx) => {
                const totalC = summary?.totalCarbonEmission || 1;
                const pct = Math.min(((u.carbonEmission / totalC) * 100), 100);
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#1E293B]">{u.utilityType}</span>
                      <span className="text-[#EF4444]">{u.carbonEmission.toFixed(1)} kg ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-sm font-semibold text-[#94A3B8] bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0]">
              No utility distribution data available.
            </div>
          )}

          <div className="pt-3 border-t border-[#E2E8F0]">
            <div className="p-4 bg-[#E7F3E8] rounded-2xl border border-[#2E7D32]/20 flex items-start gap-3 text-xs md:text-sm font-medium">
              <Sparkles className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
              <span className="text-[#1E293B] leading-relaxed">
                Electricity remains the top emission category. Conduct peak-demand audits to reduce Scope 2 output.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT INVOICES AUDIT LOG */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#1E293B] uppercase tracking-wider">Recent Invoices Audit Log</h3>
            <p className="text-xs text-[#64748B] font-medium">Latest verified utility bill extractions</p>
          </div>
          <button onClick={() => navigate("/bills")} className="text-xs font-extrabold text-[#2E7D32] hover:underline cursor-pointer">
            View All Invoices →
          </button>
        </div>

        {recentBills && recentBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="py-3.5 px-4 font-bold text-[#1E293B]">Facility</th>
                  <th className="py-3.5 px-4 font-bold text-[#1E293B]">Utility</th>
                  <th className="py-3.5 px-4 font-bold text-[#1E293B]">Period</th>
                  <th className="py-3.5 px-4 font-bold text-[#1E293B]">Amount</th>
                  <th className="py-3.5 px-4 font-bold text-[#1E293B]">Emissions</th>
                  <th className="py-3.5 px-4 font-bold text-[#1E293B] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentBills.slice(0, 5).map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate("/bills")}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-extrabold text-[#1E293B]">{b.facilityName}</td>
                    <td className="py-4 px-4 font-medium text-[#64748B]">{b.billType || "Utility"}</td>
                    <td className="py-4 px-4 font-medium text-[#64748B]">{b.billMonth || ""} {b.billYear || ""}</td>
                    <td className="py-4 px-4 font-bold text-[#1E293B]">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-4 px-4 font-extrabold text-[#EF4444]">
                      {b.carbonEmission ? `${b.carbonEmission.toFixed(2)} kg` : "0.00 kg"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${getStatusBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs md:text-sm font-semibold text-[#94A3B8] bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0]">
            No recent bills found. Upload invoices to populate audit log.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
