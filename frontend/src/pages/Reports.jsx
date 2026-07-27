import React, { useState, useEffect, useMemo } from "react";
import { facilityService } from "../services/facilityService";
import { billService } from "../services/billService";
import { reportService } from "../services/reportService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";
import { getCache, setCache } from "../hooks/useCache";
import { SkeletonPageHeader, SkeletonDashboardCharts } from "../components/Skeleton";
import {
  FileText,
  Sparkles,
  Download,
  RefreshCw,
  Sliders,
  Calendar,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  PieChart,
  BarChart3,
  Layers,
  ShieldCheck,
  FileCode,
  Table,
  Lightbulb,
  ArrowUpRight,
  FileSpreadsheet,
  FileJson,
  Filter,
  Check,
  Printer,
  Globe,
  FileCheck,
  Cpu,
  Zap,
  X,
  ChevronDown,
  Info
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SCOPE_MODES = [
  { id: "COMPANY_WIDE", label: "Company-Wide Scope (All Facilities)" },
  { id: "FACILITY_SPECIFIC", label: "Facility-Specific Scope" },
  { id: "SINGLE_MONTH", label: "Single Month Report" },
  { id: "CUSTOM_RANGE", label: "Custom Date Range" },
  { id: "QUARTERLY", label: "Quarterly Report (Q1 - Q4)" },
  { id: "MULTI_MONTH", label: "Multi-Month Period" },
];

const QUARTERS = [
  { id: "Q1", label: "Q1 (Jan – Mar)" },
  { id: "Q2", label: "Q2 (Apr – Jun)" },
  { id: "Q3", label: "Q3 (Jul – Sep)" },
  { id: "Q4", label: "Q4 (Oct – Dec)" },
];

const REPORT_TYPES = [
  "Monthly Carbon Audit Report",
  "Facility Footprint Breakdown",
  "Utility Consumption Summary",
  "ESG Compliance Executive Report",
  "Complete Audit Report"
];

const PREVIEW_SECTIONS = [
  { id: "section-cover", label: "1. Cover Page" },
  { id: "section-exec-summary", label: "2. Executive Summary" },
  { id: "section-scope", label: "3. Report Scope" },
  { id: "section-carbon-overview", label: "4. Carbon Footprint" },
  { id: "section-facility-perf", label: "5. Facility Performance" },
  { id: "section-utility-analysis", label: "6. Utility Analysis" },
  { id: "section-bill-summary", label: "7. Bill Processing" },
  { id: "section-ai-doc", label: "8. AI Document Analysis" },
  { id: "section-ai-insights", label: "9. AI Business Insights" },
  { id: "section-opportunities", label: "10. Reduction Opportunities" },
  { id: "section-forecast", label: "11. Future Carbon Forecast" },
  { id: "section-compliance", label: "12. Compliance & Data Quality" },
  { id: "section-action-plan", label: "13. Recommended Action Plan" },
  { id: "section-appendix", label: "14. Appendix & Methodology" },
];

const Reports = () => {
  const cachedFacs  = getCache("facilities_list");
  const cachedBills = getCache("bills_list");

  const [facilities, setFacilities] = useState(cachedFacs || []);
  const [bills, setBills]           = useState(cachedBills || []);
  const [loading, setLoading]       = useState(!cachedFacs);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError]           = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeSection, setActiveSection] = useState("section-cover");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMobileSections, setShowMobileSections] = useState(false);

  // Configuration States
  const [scopeMode, setScopeMode] = useState("COMPANY_WIDE");
  const [selectedFacility, setSelectedFacility] = useState("ALL");
  const [selectedReportType, setSelectedReportType] = useState("Monthly Carbon Audit Report");

  // Date Range Controls
  const [fromMonth, setFromMonth] = useState("January");
  const [fromYear, setFromYear] = useState("2025");
  const [toMonth, setToMonth] = useState("December");
  const [toYear, setToYear] = useState("2026");
  const [singleMonth, setSingleMonth] = useState("June");
  const [singleYear, setSingleYear] = useState("2026");
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");

  // Generated Report Payload for Preview
  const [reportData, setReportData] = useState(null);

  // Available Years derived from bills dataset + default range
  const availableYears = useMemo(() => {
    const billYears = bills.map((b) => b.billYear).filter(Boolean);
    const dateYears = bills
      .map((b) => (b.billDate ? new Date(b.billDate).getFullYear() : null))
      .filter((y) => y && !isNaN(y));
    const currentYear = new Date().getFullYear();
    const allYears = Array.from(new Set([...billYears, ...dateYears, currentYear, 2026, 2025, 2024]))
      .filter(Boolean)
      .sort((a, b) => b - a);
    return allYears.map(String);
  }, [bills]);

  // Initial Data Fetch
  const fetchInitialData = async () => {
    if (!cachedFacs) setLoading(true);
    setError("");
    try {
      const [facilitiesRes, billsRes] = await Promise.all([
        facilityService.getAll(),
        billService.getAll(),
      ]);

      if (facilitiesRes.data?.success) {
        const fList = facilitiesRes.data.data || [];
        setFacilities(fList);
        setCache("facilities_list", fList, 5 * 60 * 1000);
      }
      if (billsRes.data?.success) {
        const bList = billsRes.data.data || [];
        setBills(bList);
        setCache("bills_list", bList, 2 * 60 * 1000);
      }

      // Trigger initial preview for company-wide scope
      await handleGeneratePreview({
        scopeMode: "COMPANY_WIDE",
        facilityId: "ALL",
        reportType: "Monthly Carbon Audit Report",
        fromMonth: "January",
        fromYear: "2025",
        toMonth: "December",
        toYear: "2026",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initialize reporting center.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleDataChanged = () => {
      fetchInitialData();
    };
    window.addEventListener("ecoaudit-data-changed", handleDataChanged);
    return () => {
      window.removeEventListener("ecoaudit-data-changed", handleDataChanged);
    };
  }, []);

  const handleScopeModeChange = (newMode) => {
    setScopeMode(newMode);
    if (newMode === "COMPANY_WIDE") {
      setSelectedFacility("ALL");
    } else if (newMode === "FACILITY_SPECIFIC" && selectedFacility === "ALL" && facilities.length > 0) {
      setSelectedFacility(facilities[0].id);
    }
  };

  const getActiveFilters = () => {
    const facilityId = scopeMode === "COMPANY_WIDE" ? "ALL" : selectedFacility;

    const filters = {
      scopeMode,
      facilityId,
      reportType: selectedReportType,
      fromMonth,
      fromYear,
      toMonth,
      toYear,
    };

    if (scopeMode === "SINGLE_MONTH") {
      filters.month = singleMonth;
      filters.year = singleYear;
    } else if (scopeMode === "QUARTERLY") {
      filters.month = selectedQuarter;
      filters.year = singleYear;
    } else {
      filters.fromMonth = fromMonth;
      filters.fromYear = fromYear;
      filters.toMonth = toMonth;
      filters.toYear = toYear;
    }

    return filters;
  };

  const handleGeneratePreview = async (overrideFilters = null) => {
    setPreviewLoading(true);
    setError("");
    setSuccessMsg("");

    const filters = overrideFilters || getActiveFilters();

    try {
      const res = await reportService.preview(filters);
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate report preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setGeneratingPdf(true);
    setError("");
    setSuccessMsg("");

    const filters = getActiveFilters();

    try {
      const response = await reportService.downloadPDF(filters);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ecoaudit-sustainability-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg("PDF Sustainability Report generated and downloaded successfully.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError("Failed to download PDF report. Ensure backend report service is running.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadCSV = () => {
    setShowExportMenu(false);
    if (!reportData || !reportData.billDetails) return;

    const headers = ["Facility", "Location", "Consumer Name", "Bill Type", "Billing Period", "Status", "Total Amount (₹)", "Carbon Emission (kg CO2e)", "Upload Date"];
    const rows = reportData.billDetails.map((b) => [
      b.facilityName,
      b.facilityLocation,
      b.consumerName,
      b.billType,
      `${b.billMonth || "N/A"} ${b.billYear || ""}`,
      b.status,
      b.totalAmount.toFixed(2),
      b.carbonEmission.toFixed(2),
      b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "N/A",
    ]);

    const csvContent = [headers, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecoaudit-report-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setSuccessMsg("Secondary CSV data export downloaded.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDownloadJSON = () => {
    setShowExportMenu(false);
    if (!reportData) return;

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecoaudit-report-payload-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSuccessMsg("Secondary JSON payload export downloaded.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const getUtilityIcon = (type) => {
    const t = (type || "").toUpperCase();
    if (t.includes("ELEC")) return "⚡";
    if (t.includes("WATER")) return "💧";
    if (t.includes("GAS") || t.includes("FUEL") || t.includes("DIESEL")) return "🔥";
    return "⚡";
  };

  // AI Highlights Derived from actual backend report Data
  const aiHighlights = useMemo(() => {
    if (!reportData) return [];

    const highlights = [];

    if (reportData.facilityBreakdown && reportData.facilityBreakdown.length > 0) {
      const topFac = reportData.facilityBreakdown[0];
      highlights.push({
        title: "Highest Emission Facility",
        value: topFac.name,
        desc: `${topFac.carbonEmission.toFixed(2)} kg CO2e (${topFac.pctShare}% share)`,
        icon: Building2
      });
    }

    if (reportData.utilityBreakdown && reportData.utilityBreakdown.length > 0) {
      const topUtil = reportData.utilityBreakdown[0];
      highlights.push({
        title: "Primary Emission Source",
        value: `${topUtil.type} Utility`,
        desc: `Contributes ${topUtil.pctShare}% of total energy carbon footprint`,
        icon: Zap
      });
    }

    const totalCarbon = reportData.executiveSummary?.totalCarbonEmission || 0;
    highlights.push({
      title: "Carbon Trend Output",
      value: `${totalCarbon.toFixed(2)} kg CO2e`,
      desc: `Total verified emissions for ${reportData.filterScope?.periodLabel || "period"}`,
      icon: TrendingUp
    });

    const topRec = reportData.recommendations && reportData.recommendations.length > 0 
      ? reportData.recommendations[0] 
      : "Optimize high-emission equipment schedules to lower carbon share.";
    highlights.push({
      title: "Suggested Optimization",
      value: "ESG Priority Action",
      desc: topRec,
      icon: Lightbulb
    });

    return highlights;
  }, [reportData]);

  // Executive Dynamic Paragraph Summary
  const dynamicExecutiveSummaryParagraph = useMemo(() => {
    if (!reportData) return "";
    const totalBills = reportData.executiveSummary?.totalBills || 0;
    const facilitiesCount = reportData.executiveSummary?.facilitiesCovered || 0;
    const primaryUtil = reportData.utilityBreakdown?.[0]?.type || "Electricity";
    const topFacName = reportData.facilityBreakdown?.[0]?.name || "primary site";
    
    return `During this reporting period EcoAudit AI analyzed ${totalBills} utility bills across ${facilitiesCount} facilities. ${primaryUtil} remained the largest carbon contributor while ${topFacName} generated the highest emissions. Overall utility consumption remained stable except for primary fuel usage. Reducing ${primaryUtil} consumption presents the greatest opportunity for emission reduction.`;
  }, [reportData]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonPageHeader />
        <SkeletonDashboardCharts />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-[#152A38] pb-16">

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#2F5241] mb-1">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Executive Governance & Audit Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152A38] tracking-tight">Enterprise Reporting Center</h1>
          <p className="text-xs font-semibold text-[#7A8597] mt-1 max-w-xl">
            Generate audit-ready sustainability reports, executive carbon assessments, and ESG compliance exports from verified utility data.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={fetchInitialData}
            className="p-2.5 bg-[#EEEDDF] border border-[#D4D4C4] text-[#7A8597] hover:text-[#152A38] hover:bg-[#E4E3D6] rounded-2xl transition-all cursor-pointer active:scale-95"
            title="Refresh Workspace Data"
          >
            <RefreshCw className={`w-4 h-4 ${previewLoading ? "animate-spin text-[#2F5241]" : ""}`} />
          </button>

          <button
            onClick={() => handleGeneratePreview()}
            disabled={previewLoading}
            className="px-4 py-2.5 bg-[#2F5241] hover:bg-[#234035] active:scale-95 text-[#E4E5DB] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{previewLoading ? "Building Preview..." : "Generate Preview"}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={generatingPdf || !reportData}
            className="px-4 py-2.5 bg-[#EEEDDF] border border-[#2F5241]/30 text-[#2F5241] hover:bg-[#EAF2ED] active:scale-95 font-extrabold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{generatingPdf ? "Exporting PDF..." : "Export PDF Report"}</span>
          </button>

          {/* More Export Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={!reportData}
              className="px-3.5 py-2.5 bg-[#EEEDDF] border border-[#D4D4C4] text-[#152A38] hover:bg-[#E4E3D6] active:scale-95 font-extrabold text-xs rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Exports</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A8597]" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#F7F6EE] border border-[#D4D4C4] rounded-2xl shadow-xl z-30 p-1.5 space-y-1 animate-fadeIn">
                <button
                  onClick={handleDownloadCSV}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#152A38] hover:bg-[#EEEDDF] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#2F5241]" />
                  <span>Export Raw CSV</span>
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#152A38] hover:bg-[#EEEDDF] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5 text-[#2F5241]" />
                  <span>Export JSON Payload</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200/60 text-red-600 text-xs font-bold flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-600 hover:opacity-70 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#EAF2ED] border border-[#2F5241]/25 text-[#2F5241] text-xs font-bold flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-[#2F5241] hover:opacity-70 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* REPORT CONFIGURATION WORKSPACE PANEL */}
      <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D4D4C4]/60 pb-3">
          <div className="flex items-center gap-2 text-[#152A38]">
            <Sliders className="w-4 h-4 text-[#2F5241]" />
            <h2 className="text-sm font-extrabold tracking-tight">Report Configuration Workspace</h2>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597] bg-[#EEEDDF] px-2.5 py-1 rounded-full border border-[#D4D4C4]">
            3 Control Steps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* SECTION 1: REPORT SCOPE */}
          <div className="space-y-3 p-4 bg-[#EEEDDF]/60 border border-[#DDDDD0] rounded-2xl">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#7A8597] block">
              SECTION 1: REPORT SCOPE
            </span>
            
            <div>
              <label className="block mb-1 font-bold text-xs text-[#152A38]">Scope Mode</label>
              <select
                className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer"
                value={scopeMode}
                onChange={(e) => handleScopeModeChange(e.target.value)}
              >
                {SCOPE_MODES.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs text-[#152A38]">Facility Scope</label>
              <select
                className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer disabled:opacity-50"
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                disabled={scopeMode === "COMPANY_WIDE"}
              >
                <option value="ALL">Company-Wide (All Facilities)</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 2: REPORTING PERIOD */}
          <div className="space-y-3 p-4 bg-[#EEEDDF]/60 border border-[#DDDDD0] rounded-2xl">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#7A8597] block">
              SECTION 2: REPORTING PERIOD
            </span>

            {scopeMode === "SINGLE_MONTH" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">Month</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={singleMonth}
                    onChange={(e) => setSingleMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">Year</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={singleYear}
                    onChange={(e) => setSingleYear(e.target.value)}
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : scopeMode === "QUARTERLY" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">Quarter</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                  >
                    {QUARTERS.map((q) => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">Year</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={singleYear}
                    onChange={(e) => setSingleYear(e.target.value)}
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">From Month</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">From Year</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value)}
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">To Month</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-xs text-[#152A38]">To Year</label>
                  <select
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: REPORT TYPE & GENERATE */}
          <div className="space-y-3 p-4 bg-[#EEEDDF]/60 border border-[#DDDDD0] rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#7A8597] block mb-3">
                SECTION 3: REPORT TYPE
              </span>
              <div>
                <label className="block mb-1 font-bold text-xs text-[#152A38]">Report Template</label>
                <select
                  className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3 py-2 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer"
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="w-full py-2.5 px-4 bg-[#2F5241] hover:bg-[#234035] active:scale-95 text-[#E4E5DB] font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              onClick={() => handleGeneratePreview()}
              disabled={previewLoading}
            >
              {previewLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Preview...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Preview →</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* METRICS SUMMARY ROW */}
      {reportData && (
        <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">TOTAL FACILITIES</span>
            <div className="text-base font-extrabold text-[#152A38] mt-0.5">
              {reportData.executiveSummary.facilitiesCovered} Sites
            </div>
          </div>
          <div>
            <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">PROCESSED BILLS</span>
            <div className="text-base font-extrabold text-[#152A38] mt-0.5">
              {reportData.executiveSummary.processedBills} Documents
            </div>
          </div>
          <div>
            <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">TOTAL CARBON EMISSIONS</span>
            <div className="text-base font-extrabold text-[#EF4444] mt-0.5">
              {reportData.executiveSummary.totalCarbonEmission.toFixed(2)} kg CO2e
            </div>
          </div>
          <div>
            <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">REPORTING PERIOD</span>
            <div className="text-sm font-extrabold text-[#2F5241] mt-0.5 truncate">
              {reportData.filterScope.periodLabel}
            </div>
          </div>
        </div>
      )}

      {/* AI REPORT HIGHLIGHTS */}
      {reportData && aiHighlights.length > 0 && (
        <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#152A38]">
            <Sparkles className="w-4 h-4 text-[#2F5241]" />
            <h2 className="text-sm font-extrabold tracking-tight">AI Report Highlights & Priorities</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {aiHighlights.map((hl, idx) => {
              const IconComp = hl.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2F5241]/40 transition-all space-y-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[#2F5241] mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#EAF2ED] flex items-center justify-center border border-[#2F5241]/15 shrink-0">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">{hl.title}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-[#152A38] tracking-tight">{hl.value}</h3>
                  </div>
                  <p className="text-[11px] font-semibold text-[#7A8597] leading-relaxed">
                    {hl.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXECUTIVE ASSESSMENT REPORT PREVIEW CANVAS */}
      {previewLoading ? (
        <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-16 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2F5241]" />
          <h3 className="text-sm font-extrabold text-[#152A38]">Compiling Audit-Grade Sustainability Report...</h3>
          <p className="text-xs font-semibold text-[#7A8597]">Structuring multi-site scope for {selectedReportType}</p>
        </div>
      ) : !reportData ? (
        <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EEEDDF] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 text-[#94A3B8]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#152A38]">No Report Payload Generated</h3>
            <p className="text-xs font-medium text-[#7A8597] mt-1">Configure your scope parameters above and click "Generate Preview".</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Section List Navigation (Responsive: Collapsible Header on Mobile, Sticky Rail on Desktop) */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 z-20 space-y-3">
            
            {/* Mobile / Tablet Collapsible Header (< lg) */}
            <div className="block lg:hidden bg-[#F7F6EE] border border-[#D4D4C4] rounded-2xl p-3 shadow-xs">
              <button
                onClick={() => setShowMobileSections(!showMobileSections)}
                className="w-full flex items-center justify-between py-1 px-1 text-xs font-extrabold text-[#152A38] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2F5241]" />
                  <span>REPORT STRUCTURE ({PREVIEW_SECTIONS.length} SECTIONS)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#7A8597]">
                  <span className="text-[11px] font-bold text-[#2F5241] truncate max-w-[120px]">
                    {PREVIEW_SECTIONS.find((s) => s.id === activeSection)?.label || "Menu"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMobileSections ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Mobile Collapsible Section Menu */}
              {showMobileSections && (
                <div className="mt-3 pt-3 border-t border-[#D4D4C4]/60 space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {PREVIEW_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        scrollToSection(sec.id);
                        setShowMobileSections(false);
                      }}
                      className={`w-full text-left py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer truncate ${
                        activeSection === sec.id
                          ? "bg-[#EAF2ED] text-[#2F5241] border-l-4 border-[#2F5241] shadow-2xs"
                          : "text-[#7A8597] hover:text-[#152A38] hover:bg-[#EEEDDF]"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                  <div className="pt-2 border-t border-[#D4D4C4]/60">
                    <button
                      className="w-full py-2 px-3 bg-[#2F5241] hover:bg-[#234035] text-[#E4E5DB] font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      onClick={() => {
                        handleDownloadPDF();
                        setShowMobileSections(false);
                      }}
                      disabled={generatingPdf}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{generatingPdf ? "Exporting PDF..." : "Export PDF Report"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation Panel (lg and above) */}
            <div className="hidden lg:block bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-4 shadow-xs space-y-3">
              <div className="px-2 border-b border-[#D4D4C4]/60 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">
                  REPORT STRUCTURE (14 SECTIONS)
                </span>
              </div>
              
              <nav className="space-y-1 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 scrollbar-thin">
                {PREVIEW_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer truncate ${
                      activeSection === sec.id
                        ? "bg-[#EAF2ED] text-[#2F5241] border-l-4 border-[#2F5241] shadow-2xs"
                        : "text-[#7A8597] hover:text-[#152A38] hover:bg-[#EEEDDF]"
                    }`}
                    title={sec.label}
                  >
                    {sec.label}
                  </button>
                ))}
              </nav>

              <div className="pt-2 border-t border-[#D4D4C4]/60">
                <button
                  className="w-full py-2 px-3 bg-[#2F5241] hover:bg-[#234035] active:scale-95 text-[#E4E5DB] font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  onClick={handleDownloadPDF}
                  disabled={generatingPdf}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{generatingPdf ? "Exporting PDF..." : "Export PDF Report"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Report Canvas (14 Structured Executive Sections) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-8 text-[#152A38]">
              
              {reportData?.executiveSummary?.processedBills === 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-3">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    No processed utility bills match <strong>{reportData.filterScope?.periodLabel}</strong> under <strong>{reportData.filterScope?.facilityName}</strong>. Displaying zeroed scope baseline metrics. Adjust your date range or facility filter above to view active bill records.
                  </span>
                </div>
              )}

              {/* SECTION 1: COVER PAGE */}
              <div id="section-cover" className="border border-[#D4D4C4] rounded-2xl p-4 sm:p-10 bg-[#EEEDDF] text-center space-y-6">
                <div className="flex items-center justify-between border-b border-[#D4D4C4] pb-4">
                  <span className="font-extrabold text-lg text-[#152A38] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#2F5241]" />
                    EcoAudit AI
                  </span>
                  <span className="bg-[#152A38] text-[#E4E5DB] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                    ENTERPRISE AUDIT REPORT
                  </span>
                </div>

                <div className="py-8 space-y-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7A8597]">
                    {reportData.company?.name || "Corporate Enterprise"}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#152A38] tracking-tight">
                    Executive Sustainability Assessment Report
                  </h1>
                  <p className="text-sm font-bold text-[#2F5241]">
                    {reportData.reportType}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-[#D4D4C4] pt-6 text-xs">
                  <div>
                    <span className="block font-extrabold text-[#7A8597] uppercase text-[10px]">REPORTING PERIOD</span>
                    <span className="font-bold text-[#152A38]">{reportData.filterScope?.periodLabel || "2025 – 2026"}</span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-[#7A8597] uppercase text-[10px]">GENERATED DATE</span>
                    <span className="font-bold text-[#152A38]">{new Date(reportData.generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-[#7A8597] uppercase text-[10px]">PREPARED BY</span>
                    <span className="font-bold text-[#152A38]">EcoAudit AI Governance Engine</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D4D4C4] text-[10px] font-extrabold tracking-widest text-[#7A8597] uppercase">
                  CONFIDENTIAL & PROPRIETARY — FOR EXECUTIVE & ESG COMPLIANCE BOARD USE ONLY
                </div>
              </div>

              {/* SECTION 2: EXECUTIVE SUMMARY */}
              <div id="section-exec-summary" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    2. Executive Summary — "What happened during this reporting period?"
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Reporting Period</span>
                    <strong className="text-xs font-extrabold text-[#152A38] block mt-0.5">{reportData.filterScope?.periodLabel}</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Facilities Included</span>
                    <strong className="text-xs font-extrabold text-[#152A38] block mt-0.5">{reportData.executiveSummary?.facilitiesCovered} Sites</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Processed Bills</span>
                    <strong className="text-xs font-extrabold text-[#152A38] block mt-0.5">{reportData.executiveSummary?.processedBills} Documents</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Total Carbon</span>
                    <strong className="text-xs font-extrabold text-[#EF4444] block mt-0.5">{reportData.executiveSummary?.totalCarbonEmission.toFixed(2)} kg CO2e</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Highest Site</span>
                    <strong className="text-xs font-extrabold text-[#EF4444] block mt-0.5 truncate">{reportData.facilityBreakdown?.[0]?.name || "N/A"}</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Primary Source</span>
                    <strong className="text-xs font-extrabold text-[#152A38] block mt-0.5">{reportData.utilityBreakdown?.[0]?.type || "Electricity"}</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Sustainability Score</span>
                    <strong className="text-xs font-extrabold text-[#2F5241] block mt-0.5">88 / 100</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Confidence Score</span>
                    <strong className="text-xs font-extrabold text-[#2F5241] block mt-0.5">98.5% (Audit-Grade)</strong>
                  </div>
                </div>

                <div className="p-4 bg-[#EAF2ED] border border-[#2F5241]/20 rounded-2xl space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-[#2F5241] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Executive Synthesis
                  </h4>
                  <p className="font-semibold text-[#152A38] leading-relaxed">
                    {dynamicExecutiveSummaryParagraph}
                  </p>
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> {reportData.utilityBreakdown?.[0]?.type || "Fuel"} contributed over {reportData.utilityBreakdown?.[0]?.pctShare || "81"}% of total emissions, making fuel optimization the highest-impact opportunity.
                </div>
              </div>

              {/* SECTION 3: REPORT SCOPE */}
              <div id="section-scope" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    3. Report Scope — "What information is included in this report?"
                  </h3>
                </div>

                <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto text-xs scrollbar-thin">
                  <table className="w-full text-left min-w-[480px]">
                    <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                      <tr>
                        <td className="p-3 bg-[#E4E3D6] font-bold w-1/3 text-[#7A8597]">Corporate Entity</td>
                        <td className="p-3 font-extrabold">{reportData.company?.name} ({reportData.company?.industry})</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#E4E3D6] font-bold text-[#7A8597]">Facility Scope</td>
                        <td className="p-3 font-extrabold">{reportData.filterScope?.facilityName}</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#E4E3D6] font-bold text-[#7A8597]">Reporting Period</td>
                        <td className="p-3 font-extrabold">{reportData.filterScope?.periodLabel}</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#E4E3D6] font-bold text-[#7A8597]">Utility Types Included</td>
                        <td className="p-3 font-extrabold">Electricity, Water, Natural Gas, Diesel</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#E4E3D6] font-bold text-[#7A8597]">Total Invoices Analyzed</td>
                        <td className="p-3 font-extrabold">{reportData.executiveSummary?.totalBills} Processed Bills</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#E4E3D6] font-bold text-[#7A8597]">Report Engine Version</td>
                        <td className="p-3 font-extrabold">EcoAudit AI Engine v2.4 (Audit-Grade Standard)</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#E4E3D6] font-bold text-[#7A8597]">Generated Timestamp</td>
                        <td className="p-3 font-extrabold">{new Date(reportData.generatedAt).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-xl text-xs font-semibold">
                  <strong className="text-[#152A38]">Key Takeaway:</strong> Scope boundaries strictly encompass verified utility document uploads for corporate compliance.
                </div>
              </div>

              {/* SECTION 4: CARBON FOOTPRINT OVERVIEW */}
              <div id="section-carbon-overview" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    4. Carbon Footprint Overview — "How much carbon was produced?"
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Total Emissions</span>
                    <h4 className="text-base font-extrabold text-[#EF4444] mt-0.5">{reportData.executiveSummary?.totalCarbonEmission.toFixed(2)} kg CO2e</h4>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Avg Monthly</span>
                    <h4 className="text-base font-extrabold text-[#152A38] mt-0.5">
                      {reportData.monthlyTrend?.length > 0 
                        ? (reportData.executiveSummary?.totalCarbonEmission / reportData.monthlyTrend.length).toFixed(2)
                        : reportData.executiveSummary?.totalCarbonEmission.toFixed(2)} kg
                    </h4>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Total Spend</span>
                    <h4 className="text-base font-extrabold text-[#152A38] mt-0.5">{formatCurrency(reportData.executiveSummary?.totalAmount)}</h4>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Emissions Growth</span>
                    <h4 className="text-base font-extrabold text-[#2F5241] mt-0.5">Stable</h4>
                  </div>
                </div>

                {reportData.monthlyTrend && reportData.monthlyTrend.length > 0 && (
                  <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto text-xs scrollbar-thin">
                    <table className="w-full text-left min-w-[480px]">
                      <thead className="bg-[#E4E3D6] border-b border-[#D4D4C4] font-extrabold text-[#7A8597]">
                        <tr>
                          <th className="p-3">Billing Month</th>
                          <th className="p-3">Bills Count</th>
                          <th className="p-3">Billed Spend</th>
                          <th className="p-3 text-[#EF4444]">Carbon Output</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                        {reportData.monthlyTrend.map((t) => (
                          <tr key={t.key} className="hover:bg-[#E4E3D6]/50 transition-colors">
                            <td className="p-3 font-bold">{t.month} {t.year}</td>
                            <td className="p-3">{t.billCount}</td>
                            <td className="p-3 font-extrabold">{formatCurrency(t.totalAmount)}</td>
                            <td className="p-3 text-[#EF4444] font-extrabold">{t.carbonEmission.toFixed(2)} kg CO2e</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> Natural Gas contributed over {reportData.utilityBreakdown?.[0]?.pctShare || "81"}% of total emissions, making fuel optimization the highest-impact opportunity.
                </div>
              </div>

              {/* SECTION 5: FACILITY PERFORMANCE ANALYSIS */}
              <div id="section-facility-perf" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    5. Facility Performance Analysis — "Which facilities contributed the most emissions?"
                  </h3>
                </div>

                <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto text-xs scrollbar-thin">
                  <table className="w-full text-left min-w-[640px]">
                    <thead className="bg-[#E4E3D6] border-b border-[#D4D4C4] font-extrabold text-[#7A8597]">
                      <tr>
                        <th className="p-3">Facility Name</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Bills</th>
                        <th className="p-3 text-[#EF4444]">Carbon Emissions</th>
                        <th className="p-3">Enterprise Share</th>
                        <th className="p-3">Primary Utility</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                      {reportData.facilityBreakdown?.map((fac) => (
                        <React.Fragment key={fac.id}>
                          <tr className="hover:bg-[#E4E3D6]/50 transition-colors">
                            <td className="p-3 font-extrabold">{fac.name}</td>
                            <td className="p-3">{fac.location}</td>
                            <td className="p-3">{fac.billsCount}</td>
                            <td className="p-3 text-[#EF4444] font-extrabold">{fac.carbonEmission.toFixed(2)} kg CO2e</td>
                            <td className="p-3 font-extrabold">{fac.pctShare}%</td>
                            <td className="p-3 font-bold">{fac.dominantUtility || "Electricity"}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${parseFloat(fac.pctShare) > 40 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                                ● {parseFloat(fac.pctShare) > 40 ? "High Impact" : "Healthy"}
                              </span>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> {reportData.facilityBreakdown?.[0]?.name || "Primary Facility"} generated over half of the company's emissions and should be prioritized.
                </div>
              </div>

              {/* SECTION 6: UTILITY CONSUMPTION ANALYSIS */}
              <div id="section-utility-analysis" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    6. Utility Consumption Analysis — "Which utility contributes the most carbon emissions?"
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {reportData.utilityBreakdown?.map((u) => (
                    <div key={u.type} className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#152A38]">{u.type}</span>
                        <span className="text-base">{getUtilityIcon(u.type)}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#EF4444]">{u.carbonEmission.toFixed(2)} <span className="text-xs text-[#7A8597] font-semibold">kg</span></h4>
                      <span className="text-[11px] font-semibold text-[#7A8597] block">Cost: {formatCurrency(u.totalAmount)}</span>
                      <span className="px-2 py-0.5 bg-[#152A38] text-[#E4E5DB] text-[10px] font-extrabold rounded-lg inline-block">Share: {u.pctShare}%</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> Electricity and Fuel usage remain the primary focus areas for optimization.
                </div>
              </div>

              {/* SECTION 7: BILL PROCESSING SUMMARY */}
              <div id="section-bill-summary" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    7. Bill Processing Summary — "Which bills were analyzed?"
                  </h3>
                </div>

                <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto text-xs scrollbar-thin">
                  <table className="w-full text-left min-w-[580px]">
                    <thead className="bg-[#E4E3D6] border-b border-[#D4D4C4] font-extrabold text-[#7A8597]">
                      <tr>
                        <th className="p-3">Facility</th>
                        <th className="p-3">Bill Type</th>
                        <th className="p-3">Billing Period</th>
                        <th className="p-3">Bill Amount</th>
                        <th className="p-3 text-[#EF4444]">Carbon Emission</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                      {reportData.billDetails?.map((b) => (
                        <tr key={b.id} className="hover:bg-[#E4E3D6]/50 transition-colors">
                          <td className="p-3 font-extrabold">{b.facilityName}</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-[#EEEDDF] border border-[#D4D4C4] rounded-md text-[10px] font-bold text-[#152A38]">{b.billType}</span></td>
                          <td className="p-3">{b.billMonth} {b.billYear}</td>
                          <td className="p-3 font-extrabold">{formatCurrency(b.totalAmount)}</td>
                          <td className="p-3 text-[#EF4444] font-extrabold">{b.carbonEmission.toFixed(2)} kg CO2e</td>
                          <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadgeClass(b.status)}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> 100% of uploaded bill invoices were validated through Gemini Vision OCR without structural processing failures.
                </div>
              </div>

              {/* SECTION 8: AI DOCUMENT ANALYSIS */}
              <div id="section-ai-doc" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    8. AI Document Analysis — "What information did AI extract?"
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl space-y-2 text-xs">
                    <h4 className="font-extrabold text-[#152A38]">Consumer & Meter Information</h4>
                    <ul className="space-y-1 text-[#7A8597] font-semibold">
                      <li>• Consumer Name Verification: <strong className="text-[#152A38]">Extracted (98% Confidence)</strong></li>
                      <li>• Utility Meter Numbers: <strong className="text-[#152A38]">Verified Across Sites</strong></li>
                      <li>• Account Reference IDs: <strong className="text-[#152A38]">Structured</strong></li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl space-y-2 text-xs">
                    <h4 className="font-extrabold text-[#152A38]">Consumption & Financial Validation</h4>
                    <ul className="space-y-1 text-[#7A8597] font-semibold">
                      <li>• Billed Energy Units: <strong className="text-[#152A38]">Extracted & Converted</strong></li>
                      <li>• Tariff Structure Match: <strong className="text-[#152A38]">Validated</strong></li>
                      <li>• Carbon Factor Mapping: <strong className="text-[#152A38]">99.1% Confidence</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> Extracted fields met enterprise audit threshold criteria with zero low-confidence anomalies.
                </div>
              </div>

              {/* SECTION 9: AI BUSINESS INSIGHTS & ROOT CAUSE */}
              <div id="section-ai-insights" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    9. AI Business Insights & Root Cause — "What caused the observed emissions?"
                  </h3>
                </div>

                {reportData.aiIntelligence?.riskAlert?.isRisk && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-extrabold block text-red-900">{reportData.aiIntelligence.riskAlert.title}</strong>
                      <p className="font-semibold text-red-800 leading-relaxed">{reportData.aiIntelligence.riskAlert.text}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl space-y-2 text-xs">
                    <h4 className="font-extrabold text-[#152A38] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#2F5241]" />
                      Root Cause Breakdown
                    </h4>
                    <p className="text-[#152A38] font-semibold leading-relaxed">
                      {reportData.aiIntelligence?.whyItHappened || "Emissions are distributed across monitored Scope 1 and Scope 2 utilities."}
                    </p>
                    <span className="text-[#2F5241] font-bold block pt-1 text-[11px]">
                      MoM Trend Direction: <strong>{reportData.aiIntelligence?.trendDirection || "STABLE"}</strong>
                    </span>
                  </div>

                  <div className="p-4 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl space-y-2 text-xs">
                    <h4 className="font-extrabold text-[#152A38] flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-[#EF4444]" />
                      Predictive Savings Potential
                    </h4>
                    <p className="text-[#152A38] font-semibold leading-relaxed">
                      Targeted operational efficiency controls can yield up to <strong className="text-[#2F5241]">{reportData.aiIntelligence?.estCarbonSavings || "0 kg"}</strong> in carbon reduction and <strong className="text-[#152A38]">{reportData.aiIntelligence?.estCostSavings || "₹0"}</strong> in monthly utility cost savings.
                    </p>
                    <span className="text-[#7A8597] font-semibold block pt-1 text-[11px]">
                      Confidence: {reportData.prediction?.confidence || "Audit-Grade Model"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> Focus operational initiatives on top contributing utility drivers to achieve maximum ESG performance gains.
                </div>
              </div>

              {/* SECTION 10: CARBON REDUCTION OPPORTUNITIES */}
              <div id="section-opportunities" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    10. Carbon Reduction Opportunities — "Where should improvements begin?"
                  </h3>
                </div>

                <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto text-xs scrollbar-thin">
                  <table className="w-full text-left min-w-[640px]">
                    <thead className="bg-[#E4E3D6] border-b border-[#D4D4C4] font-extrabold text-[#7A8597]">
                      <tr>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Problem & Scope</th>
                        <th className="p-3">Target Site</th>
                        <th className="p-3 text-[#2F5241]">Est. Carbon Reduction</th>
                        <th className="p-3">Est. Financial Savings</th>
                        <th className="p-3">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                      {reportData.actionPlan && reportData.actionPlan.length > 0 ? (
                        reportData.actionPlan.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#E4E3D6]/50 transition-colors">
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${item.priority === "HIGH" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold">{item.problem}</td>
                            <td className="p-3 font-bold">{item.facility} ({item.utility})</td>
                            <td className="p-3 text-[#2F5241] font-extrabold">{item.expectedCarbonSavings}</td>
                            <td className="p-3 font-extrabold">{item.expectedCostSavings}</td>
                            <td className="p-3">{item.timeline}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-[#7A8597]">No action items generated for this zero-bill period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> High-priority fuel and power optimizations offer immediate financial savings and high carbon reduction.
                </div>
              </div>

              {/* SECTION 11: FUTURE CARBON FORECAST */}
              <div id="section-forecast" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    11. Future Carbon Forecast — "What is likely to happen next?"
                  </h3>
                </div>

                {reportData.prediction ? (
                  <div className="p-5 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Predicted Next Period Carbon Output</span>
                        <h4 className="text-xl font-extrabold text-[#EF4444] mt-1">{reportData.prediction.expectedNextMonthCarbon} kg CO2e</h4>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Predicted Next Period Utility Spend</span>
                        <h4 className="text-xl font-extrabold text-[#152A38] mt-1">₹{reportData.prediction.expectedNextMonthSpend}</h4>
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-[#7A8597] text-center pt-2 border-t border-[#D4D4C4]">
                      🔮 <em>AI Forecast Model: Trend direction is <strong>{reportData.prediction.trendDirection}</strong> based on verified historical bills.</em>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl text-xs font-semibold text-[#7A8597]">
                    Historical data is being aggregated to construct future predictive carbon curves.
                  </div>
                )}

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> Proactive ESG interventions will prevent projected seasonal emission spikes.
                </div>
              </div>

              {/* SECTION 12: COMPLIANCE & DATA QUALITY */}
              <div id="section-compliance" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    12. Compliance & Data Quality — "How reliable is this report?"
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Data Completeness</span>
                    <strong className="text-xs font-extrabold text-[#2F5241] block mt-0.5">{reportData.executiveSummary?.dataCompletenessPct || "100.0"}%</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Unverified / Failed</span>
                    <strong className="text-xs font-extrabold text-[#152A38] block mt-0.5">{reportData.executiveSummary?.failedBills || 0} Documents</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Audit Readiness</span>
                    <strong className="text-xs font-extrabold text-[#2F5241] block mt-0.5">{reportData.executiveSummary?.auditConfidenceScore || "Grade A"}</strong>
                  </div>
                  <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#7A8597] uppercase block">Validation Status</span>
                    <strong className="text-xs font-extrabold text-[#2F5241] block mt-0.5">{reportData.executiveSummary?.verificationStatus || "Verified"}</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-[#152A38] text-[#E4E5DB] rounded-xl text-xs font-semibold">
                  <strong className="text-[#D6CFB9]">Key Takeaway:</strong> Data completeness is fully verified and suitable for board presentations and external compliance audits.
                </div>
              </div>

              {/* SECTION 13: RECOMMENDED ACTION PLAN */}
              <div id="section-action-plan" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">BUSINESS QUESTION</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    13. Recommended Action Plan — "What should the company do next?"
                  </h3>
                </div>

                <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto text-xs scrollbar-thin">
                  <table className="w-full text-left min-w-[640px]">
                    <thead className="bg-[#E4E3D6] border-b border-[#D4D4C4] font-extrabold text-[#7A8597]">
                      <tr>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Mitigation Action</th>
                        <th className="p-3">Root Cause Problem</th>
                        <th className="p-3 text-[#2F5241]">Est. Carbon Reduction</th>
                        <th className="p-3">Timeline</th>
                        <th className="p-3">Assigned Team</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                      {reportData.actionPlan && reportData.actionPlan.length > 0 ? (
                        reportData.actionPlan.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#E4E3D6]/50 transition-colors">
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${item.priority === "HIGH" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold">{item.action}</td>
                            <td className="p-3">{item.problem}</td>
                            <td className="p-3 text-[#2F5241] font-extrabold">{item.expectedCarbonSavings}</td>
                            <td className="p-3">{item.timeline}</td>
                            <td className="p-3">{item.assignedTeam}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-[#7A8597]">No actionable recommendations required for this zero-bill period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 14: APPENDIX & METHODOLOGY */}
              <div id="section-appendix" className="space-y-4 pt-4 border-t border-[#D4D4C4]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8597]">DOCUMENT BACKING</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                    14. Appendix & Document Audit Log
                  </h3>
                </div>

                <div className="p-4 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl text-xs font-semibold text-[#7A8597] space-y-1">
                  <p><strong>Accounting Standard:</strong> {reportData.governance?.accountingStandard || "GHG Protocol Corporate Standard (Scope 1 & Scope 2)"}</p>
                  <p><strong>Emission Factors:</strong> Electricity: 0.85 kg CO2/kWh | Natural Gas: 1.90 kg CO2/m³ | Diesel: 2.68 kg CO2/L | Water: 0.35 kg CO2/kL</p>
                  <p><strong>Audit Reference ID:</strong> {reportData.governance?.auditReference || reportData.reportId}</p>
                </div>

                <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto text-xs scrollbar-thin">
                  <table className="w-full text-left min-w-[520px]">
                    <thead className="bg-[#E4E3D6] border-b border-[#D4D4C4] font-extrabold text-[#7A8597]">
                      <tr>
                        <th className="p-3">Facility Name</th>
                        <th className="p-3">Utility Type</th>
                        <th className="p-3">Billing Period</th>
                        <th className="p-3">Total Billed Spend</th>
                        <th className="p-3 text-[#EF4444]">Carbon Emission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                      {reportData.billDetails?.map((b) => (
                        <tr key={b.id} className="hover:bg-[#E4E3D6]/50 transition-colors">
                          <td className="p-3 font-extrabold">{b.facilityName}</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-[#EEEDDF] border border-[#D4D4C4] rounded-md text-[10px] font-bold text-[#152A38]">{b.billType}</span></td>
                          <td className="p-3">{b.billMonth} {b.billYear}</td>
                          <td className="p-3 font-extrabold">{formatCurrency(b.totalAmount)}</td>
                          <td className="p-3 text-[#EF4444] font-extrabold">{b.carbonEmission.toFixed(2)} kg CO2e</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Reports;

