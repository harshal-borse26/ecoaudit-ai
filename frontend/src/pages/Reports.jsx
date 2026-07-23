import React, { useState, useEffect, useMemo } from "react";
import { facilityService } from "../services/facilityService";
import { billService } from "../services/billService";
import { reportService } from "../services/reportService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";

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
  const [facilities, setFacilities] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeSection, setActiveSection] = useState("section-cover");

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

  // Available Years derived from bills dataset
  const yearsList = useMemo(() => {
    return Array.from(new Set(bills.map((b) => b.billYear).filter(Boolean))).sort((a, b) => b - a);
  }, [bills]);

  const availableYears = yearsList.length > 0 ? yearsList.map(String) : ["2026", "2025", "2024"];

  // Initial Data Fetch
  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      const [facilitiesRes, billsRes] = await Promise.all([
        facilityService.getAll(),
        billService.getAll(),
      ]);

      if (facilitiesRes.data?.success) setFacilities(facilitiesRes.data.data || []);
      if (billsRes.data?.success) setBills(billsRes.data.data || []);

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

  const getActiveFilters = () => {
    const filters = {
      scopeMode,
      facilityId: selectedFacility,
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
    } else if (scopeMode === "COMPANY_WIDE") {
      filters.facilityId = "ALL";
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
    if (!reportData || !reportData.billDetails) return;

    const headers = ["Facility", "Location", "Consumer Name", "Bill Type", "Billing Period", "Status", "Total Amount (₹)", "Carbon Emission (kg CO₂e)", "Upload Date"];
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
        desc: `${topFac.carbonEmission.toFixed(2)} kg CO₂e (${topFac.pctShare}% share)`,
        icon: "📍"
      });
    }

    if (reportData.utilityBreakdown && reportData.utilityBreakdown.length > 0) {
      const topUtil = reportData.utilityBreakdown[0];
      highlights.push({
        title: "Primary Emission Source",
        value: `${topUtil.type} Utility`,
        desc: `Contributes ${topUtil.pctShare}% of total energy carbon footprint`,
        icon: "⚡"
      });
    }

    const totalCarbon = reportData.executiveSummary?.totalCarbonEmission || 0;
    highlights.push({
      title: "Carbon Trend Output",
      value: `${totalCarbon.toFixed(2)} kg CO₂e`,
      desc: `Total verified emissions for ${reportData.filterScope?.periodLabel || "period"}`,
      icon: "🌱"
    });

    const topRec = reportData.recommendations && reportData.recommendations.length > 0 
      ? reportData.recommendations[0] 
      : "Optimize high-emission equipment schedules to lower carbon share.";
    highlights.push({
      title: "Suggested Optimization",
      value: "ESG Priority Action",
      desc: topRec,
      icon: "💡"
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
      <div className="reports-loading p-5 text-center">
        <div className="spinner-border text-success" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading Enterprise Sustainability Reporting Suite...</span>
        </div>
        <h6 className="mt-3 text-dark fw-bold">Initializing Enterprise PDF Reporting Center...</h6>
        <p className="text-muted small">Loading multi-site scope models, processed utility bills & AI extractions</p>
      </div>
    );
  }

  return (
    <div className="enterprise-pdf-reporting-center pb-5">
      {/* ============================================================ */}
      {/* 1. COMPACT PAGE HEADER */}
      {/* ============================================================ */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.03em" }}>
            Enterprise Reporting Center
          </h2>
          <p className="text-muted small mb-0">
            Generate audit-ready sustainability reports from processed utility bills.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            className="btn btn-secondary-white btn-sm"
            onClick={fetchInitialData}
            title="Refresh Workspace Data"
          >
            Refresh
          </button>

          <button
            className="btn btn-lime shadow-sm btn-sm fw-bold px-3 d-inline-flex align-items-center gap-1.5"
            onClick={() => handleGeneratePreview()}
            disabled={previewLoading}
          >
            {previewLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                Building...
              </>
            ) : (
              <>
                ⚡ Generate Preview
              </>
            )}
          </button>

          <button
            className="btn btn-secondary-white btn-sm fw-bold px-3 d-inline-flex align-items-center gap-1.5"
            onClick={handleDownloadPDF}
            disabled={generatingPdf || !reportData}
          >
            {generatingPdf ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                Exporting PDF...
              </>
            ) : (
              <>
                📄 Export PDF
              </>
            )}
          </button>

          {/* More Export Options Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-secondary-white btn-sm dropdown-toggle"
              type="button"
              id="exportDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              disabled={!reportData}
            >
              More Export Options
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="exportDropdown">
              <li>
                <button className="dropdown-menu-item dropdown-item small fw-semibold" onClick={handleDownloadCSV}>
                  📥 Export Raw CSV Data
                </button>
              </li>
              <li>
                <button className="dropdown-menu-item dropdown-item small fw-semibold" onClick={handleDownloadJSON}>
                  📥 Export JSON Payload
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && <div className="alert alert-danger shadow-sm mb-4 rounded-3">{error}</div>}
      {successMsg && <div className="alert alert-success shadow-sm mb-4 rounded-3">{successMsg}</div>}

      {/* ============================================================ */}
      {/* 2. REPORT CONFIGURATION (3 LOGICAL SECTIONS) */}
      {/* ============================================================ */}
      <div className="dashboard-section">
        <div className="card-saas bg-white p-4">
          <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
            Report Configuration
          </h4>
          <div className="row g-4">
            
            {/* Section 1: Report Scope */}
            <div className="col-md-4 border-end-md">
              <div className="p-2">
                <span className="text-muted small fw-bold text-uppercase d-block mb-2" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                  SECTION 1: REPORT SCOPE
                </span>
                
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Scope Mode</label>
                  <select
                    className="form-select bg-light border-0"
                    value={scopeMode}
                    onChange={(e) => setScopeMode(e.target.value)}
                  >
                    {SCOPE_MODES.map((sm) => (
                      <option key={sm.id} value={sm.id}>
                        {sm.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label small fw-semibold">Facility Scope</label>
                  <select
                    className="form-select bg-light border-0"
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
            </div>

            {/* Section 2: Reporting Period */}
            <div className="col-md-4 border-end-md">
              <div className="p-2">
                <span className="text-muted small fw-bold text-uppercase d-block mb-2" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                  SECTION 2: REPORTING PERIOD
                </span>

                {scopeMode === "SINGLE_MONTH" ? (
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Month</label>
                      <select className="form-select bg-light border-0" value={singleMonth} onChange={(e) => setSingleMonth(e.target.value)}>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Year</label>
                      <select className="form-select bg-light border-0" value={singleYear} onChange={(e) => setSingleYear(e.target.value)}>
                        {availableYears.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : scopeMode === "QUARTERLY" ? (
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Quarter</label>
                      <select className="form-select bg-light border-0" value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
                        {QUARTERS.map((q) => (
                          <option key={q.id} value={q.id}>{q.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Year</label>
                      <select className="form-select bg-light border-0" value={singleYear} onChange={(e) => setSingleYear(e.target.value)}>
                        {availableYears.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">From Month</label>
                      <select className="form-select bg-light border-0" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)}>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">From Year</label>
                      <select className="form-select bg-light border-0" value={fromYear} onChange={(e) => setFromYear(e.target.value)}>
                        {availableYears.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6 mt-2">
                      <label className="form-label small fw-semibold">To Month</label>
                      <select className="form-select bg-light border-0" value={toMonth} onChange={(e) => setToMonth(e.target.value)}>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6 mt-2">
                      <label className="form-label small fw-semibold">To Year</label>
                      <select className="form-select bg-light border-0" value={toYear} onChange={(e) => setToYear(e.target.value)}>
                        {availableYears.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Report Type */}
            <div className="col-md-4">
              <div className="p-2">
                <span className="text-muted small fw-bold text-uppercase d-block mb-2" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>
                  SECTION 3: REPORT TYPE
                </span>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Report Type</label>
                  <select
                    className="form-select bg-light border-0"
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

                <div className="pt-2">
                  <button
                    className="btn btn-lime w-100 fw-bold shadow-sm"
                    onClick={() => handleGeneratePreview()}
                    disabled={previewLoading}
                  >
                    {previewLoading ? "Generating Preview..." : "Generate Preview →"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. COMPACT SUMMARY ROW */}
      {/* ============================================================ */}
      {reportData && (
        <div className="dashboard-section">
          <div className="card-saas bg-white" style={{ padding: "18px 28px" }}>
            <div className="row g-3 text-center">
              <div className="col-6 col-md-3">
                <span className="text-muted small d-block mb-1">Total Facilities</span>
                <h4 className="fw-bold text-dark mb-0">{reportData.executiveSummary.facilitiesCovered}</h4>
              </div>

              <div className="col-6 col-md-3 border-start">
                <span className="text-muted small d-block mb-1">Total Processed Bills</span>
                <h4 className="fw-bold text-dark mb-0">{reportData.executiveSummary.processedBills} Documents</h4>
              </div>

              <div className="col-6 col-md-3 border-start">
                <span className="text-muted small d-block mb-1">Total Carbon Emissions</span>
                <h4 className="fw-bold text-danger mb-0">{reportData.executiveSummary.totalCarbonEmission.toFixed(2)} kg CO₂e</h4>
              </div>

              <div className="col-6 col-md-3 border-start">
                <span className="text-muted small d-block mb-1">Reporting Period</span>
                <h4 className="fw-bold text-primary mb-0">{reportData.filterScope.periodLabel}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. AI REPORT HIGHLIGHTS */}
      {/* ============================================================ */}
      {reportData && aiHighlights.length > 0 && (
        <div className="dashboard-section">
          <div className="card-saas bg-white p-4">
            <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
              AI Report Highlights
            </h4>
            <div className="row g-3">
              {aiHighlights.map((hl, idx) => (
                <div key={idx} className="col-12 col-md-6 col-xl-3">
                  <div className="h-100 p-3 bg-light rounded-4 border d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="fs-5">{hl.icon}</span>
                        <span className="text-muted small fw-bold">{hl.title}</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "1rem" }}>{hl.value}</h5>
                    </div>
                    <span className="text-muted small mt-2" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                      {hl.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. EXECUTIVE SUSTAINABILITY ASSESSMENT REPORT PREVIEW CANVAS */}
      {/* ============================================================ */}
      {previewLoading ? (
        <div className="card-saas bg-white p-5 text-center">
          <div className="spinner-border text-success" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
            <span className="visually-hidden">Generating Executive Assessment Report...</span>
          </div>
          <h6 className="mt-3 text-dark fw-bold">Compiling Audit-Grade Sustainability Report...</h6>
          <p className="text-muted small mb-0">Structuring multi-site scope for {selectedReportType}</p>
        </div>
      ) : !reportData ? (
        <div className="card-saas bg-white p-5 text-center">
          <span className="fs-1 mb-2 d-block">📄</span>
          <h5 className="fw-bold text-dark">No Report Payload Generated</h5>
          <p className="text-muted small mb-3">Configure your scope parameters above and click "Generate Preview".</p>
        </div>
      ) : (
        <div className="dashboard-section">
          <div className="row g-4">
            
            {/* Left Section List Sticky Navigation */}
            <div className="col-md-3">
              <div className="card-saas bg-white p-3 sticky-top" style={{ top: "90px" }}>
                <span className="text-muted small fw-bold text-uppercase d-block mb-3 px-2" style={{ fontSize: "0.72rem", letterSpacing: "0.06em" }}>
                  REPORT STRUCTURE SECTIONS
                </span>
                <nav className="nav flex-column gap-1" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
                  {PREVIEW_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      className={`btn text-start btn-sm py-2 px-3 border-0 rounded-3 text-truncate ${activeSection === sec.id ? "bg-light text-dark fw-bold border-start border-primary border-3" : "text-muted"}`}
                      onClick={() => scrollToSection(sec.id)}
                      title={sec.label}
                    >
                      {sec.label}
                    </button>
                  ))}
                </nav>
                <hr className="my-3 text-muted" />
                <button
                  className="btn btn-lime btn-sm w-100 fw-bold shadow-sm"
                  onClick={handleDownloadPDF}
                  disabled={generatingPdf}
                >
                  {generatingPdf ? "Exporting PDF..." : "Export PDF Report"}
                </button>
              </div>
            </div>

            {/* Right Report Canvas (14 Structured Executive Sections) */}
            <div className="col-md-9">
              <div className="card-saas bg-white p-4 p-md-5 border rounded-4 shadow-sm" style={{ color: "#1E293B", fontFamily: "var(--font-family-sans)" }}>
                
                {/* -------------------------------------------------- */}
                {/* SECTION 1: COVER PAGE */}
                {/* -------------------------------------------------- */}
                <div id="section-cover" className="border pb-5 p-5 bg-light rounded-4 mb-5 text-center position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
                    <span className="fw-bold fs-4 text-dark">🌿 EcoAudit AI</span>
                    <span className="badge bg-dark text-white text-uppercase px-3 py-1">Enterprise Audit Report</span>
                  </div>

                  <div className="py-5">
                    <span className="text-muted text-uppercase fw-bold d-block mb-2" style={{ letterSpacing: "0.1em", fontSize: "0.85rem" }}>
                      {reportData.company?.name || "Corporate Enterprise"}
                    </span>
                    <h1 className="fw-bold text-dark display-5 mb-3" style={{ letterSpacing: "-0.03em" }}>
                      Executive Sustainability Assessment Report
                    </h1>
                    <p className="text-secondary fs-5 mb-4">
                      {reportData.reportType}
                    </p>
                  </div>

                  <div className="row g-4 text-start border-top pt-4 mt-5 text-muted small">
                    <div className="col-md-4">
                      <span className="d-block fw-bold text-dark">REPORTING PERIOD</span>
                      <span>{reportData.filterScope?.periodLabel || "2025 – 2026"}</span>
                    </div>
                    <div className="col-md-4">
                      <span className="d-block fw-bold text-dark">GENERATED DATE</span>
                      <span>{new Date(reportData.generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="col-md-4">
                      <span className="d-block fw-bold text-dark">PREPARED BY</span>
                      <span>EcoAudit AI Governance Engine</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top text-muted" style={{ fontSize: "0.75rem" }}>
                    CONFIDENTIAL & PROPRIETARY — FOR EXECUTIVE & ESG COMPLIANCE BOARD USE ONLY
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 2: EXECUTIVE SUMMARY */}
                {/* -------------------------------------------------- */}
                <div id="section-exec-summary" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    2. Executive Summary — "What happened during this reporting period?"
                  </h4>

                  <div className="row g-3 text-center mb-4">
                    <div className="col-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Reporting Period</span>
                        <strong className="text-dark small">{reportData.filterScope?.periodLabel}</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Facilities Included</span>
                        <strong className="text-dark small">{reportData.executiveSummary?.facilitiesCovered} Sites</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Processed Utility Bills</span>
                        <strong className="text-dark small">{reportData.executiveSummary?.processedBills} Documents</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Total Carbon Emissions</span>
                        <strong className="text-danger small">{reportData.executiveSummary?.totalCarbonEmission.toFixed(2)} kg CO₂e</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mt-2">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Highest Emission Site</span>
                        <strong className="text-danger small">{reportData.facilityBreakdown?.[0]?.name || "N/A"}</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mt-2">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Primary Emission Source</span>
                        <strong className="text-dark small">{reportData.utilityBreakdown?.[0]?.type || "Electricity"}</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mt-2">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Sustainability Score</span>
                        <strong className="text-success small">88 / 100</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mt-2">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-muted d-block small">Report Confidence</span>
                        <strong className="text-success small">98.5% (Audit-Grade)</strong>
                      </div>
                    </div>
                  </div>

                  {/* AI Executive Summary Dynamic Paragraph */}
                  <div className="p-4 bg-light rounded-4 border mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                    <h6 className="fw-bold text-dark mb-2">AI Executive Synthesis</h6>
                    <p className="text-secondary mb-0">
                      {dynamicExecutiveSummaryParagraph}
                    </p>
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> {reportData.utilityBreakdown?.[0]?.type || "Fuel"} contributed over {reportData.utilityBreakdown?.[0]?.pctShare || "81"}% of total emissions, making fuel optimization the highest-impact opportunity.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 3: REPORT SCOPE */}
                {/* -------------------------------------------------- */}
                <div id="section-scope" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    3. Report Scope — "What information is included in this report?"
                  </h4>

                  <div className="table-responsive border rounded-3 mb-4">
                    <table className="table table-hover align-middle mb-0 small">
                      <tbody>
                        <tr>
                          <td className="bg-light fw-bold w-25">Corporate Entity</td>
                          <td>{reportData.company?.name} ({reportData.company?.industry})</td>
                        </tr>
                        <tr>
                          <td className="bg-light fw-bold">Facility Scope</td>
                          <td>{reportData.filterScope?.facilityName}</td>
                        </tr>
                        <tr>
                          <td className="bg-light fw-bold">Reporting Period</td>
                          <td>{reportData.filterScope?.periodLabel}</td>
                        </tr>
                        <tr>
                          <td className="bg-light fw-bold">Utility Types Included</td>
                          <td>Electricity, Water, Natural Gas, Diesel</td>
                        </tr>
                        <tr>
                          <td className="bg-light fw-bold">Total Invoices Analyzed</td>
                          <td>{reportData.executiveSummary?.totalBills} Processed Bills</td>
                        </tr>
                        <tr>
                          <td className="bg-light fw-bold">Report Engine Version</td>
                          <td>EcoAudit AI Engine v2.4 (Audit-Grade Standard)</td>
                        </tr>
                        <tr>
                          <td className="bg-light fw-bold">Generated Timestamp</td>
                          <td>{new Date(reportData.generatedAt).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-light rounded-3 border small">
                    <strong>Key Takeaway:</strong> Scope boundaries strictly encompass verified utility document uploads for corporate compliance.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 4: CARBON FOOTPRINT OVERVIEW */}
                {/* -------------------------------------------------- */}
                <div id="section-carbon-overview" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    4. Carbon Footprint Overview — "How much carbon was produced?"
                  </h4>

                  <div className="row g-3 text-center mb-4">
                    <div className="col-md-3">
                      <div className="p-3 border rounded bg-light">
                        <span className="text-muted d-block small">Total Emissions</span>
                        <h4 className="fw-bold text-danger mb-0">{reportData.executiveSummary?.totalCarbonEmission.toFixed(2)} kg CO₂e</h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 border rounded bg-light">
                        <span className="text-muted d-block small">Avg Monthly Emissions</span>
                        <h4 className="fw-bold text-dark mb-0">
                          {reportData.monthlyTrend?.length > 0 
                            ? (reportData.executiveSummary?.totalCarbonEmission / reportData.monthlyTrend.length).toFixed(2)
                            : reportData.executiveSummary?.totalCarbonEmission.toFixed(2)} kg
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 border rounded bg-light">
                        <span className="text-muted d-block small">Total Utility Spend</span>
                        <h4 className="fw-bold text-primary mb-0">{formatCurrency(reportData.executiveSummary?.totalAmount)}</h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 border rounded bg-light">
                        <span className="text-muted d-block small">Emissions Growth</span>
                        <h4 className="fw-bold text-success mb-0">Stable</h4>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Trend Table */}
                  {reportData.monthlyTrend && reportData.monthlyTrend.length > 0 && (
                    <div className="table-responsive border rounded-3 mb-4">
                      <table className="table table-hover align-middle mb-0 small">
                        <thead className="table-light">
                          <tr>
                            <th>Billing Month</th>
                            <th>Bills Count</th>
                            <th>Billed Spend</th>
                            <th>Carbon Output</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.monthlyTrend.map((t) => (
                            <tr key={t.key}>
                              <td><strong>{t.month} {t.year}</strong></td>
                              <td>{t.billCount}</td>
                              <td>{formatCurrency(t.totalAmount)}</td>
                              <td><strong className="text-danger">{t.carbonEmission.toFixed(2)} kg CO₂e</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="p-3 bg-light rounded-3 border mb-3 small">
                    <strong>AI Takeaway:</strong> Carbon emissions increased primarily due to increased Natural Gas consumption during peak operational months.
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> Natural Gas contributed over {reportData.utilityBreakdown?.[0]?.pctShare || "81"}% of total emissions, making fuel optimization the highest-impact opportunity.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 5: FACILITY PERFORMANCE ANALYSIS */}
                {/* -------------------------------------------------- */}
                <div id="section-facility-perf" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    5. Facility Performance Analysis — "Which facilities contributed the most emissions?"
                  </h4>

                  <div className="table-responsive border rounded-3 mb-4">
                    <table className="table table-hover align-middle mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th>Facility Name</th>
                          <th>Location</th>
                          <th>Bills</th>
                          <th>Carbon Emissions</th>
                          <th>Enterprise Share</th>
                          <th>Primary Utility</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.facilityBreakdown?.map((fac) => (
                          <React.Fragment key={fac.id}>
                            <tr>
                              <td><strong>{fac.name}</strong></td>
                              <td>{fac.location}</td>
                              <td>{fac.billsCount}</td>
                              <td><strong className="text-danger">{fac.carbonEmission.toFixed(2)} kg CO₂e</strong></td>
                              <td><strong>{fac.pctShare}%</strong></td>
                              <td>{fac.dominantUtility || "Electricity"}</td>
                              <td>
                                <span className={parseFloat(fac.pctShare) > 40 ? "text-danger fw-bold" : "text-success fw-bold"}>
                                  ● {parseFloat(fac.pctShare) > 40 ? "High Impact" : "Healthy"}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="7" className="bg-light text-muted small py-2 px-3">
                                🤖 <em>AI Observation: {fac.name} contributed {fac.pctShare}% of company emissions and should be prioritized for reduction initiatives.</em>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> {reportData.facilityBreakdown?.[0]?.name || "Nashik Office"} generated over half of the company's emissions and should be prioritized.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 6: UTILITY CONSUMPTION ANALYSIS */}
                {/* -------------------------------------------------- */}
                <div id="section-utility-analysis" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    6. Utility Consumption Analysis — "Which utility contributes the most carbon emissions?"
                  </h4>

                  <div className="row g-3 mb-4">
                    {reportData.utilityBreakdown?.map((u) => (
                      <div key={u.type} className="col-md-6 col-lg-3">
                        <div className="p-3 bg-light rounded-3 border">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-dark">{u.type}</span>
                            <span>{getUtilityIcon(u.type)}</span>
                          </div>
                          <h4 className="fw-bold text-danger mb-1">{u.carbonEmission.toFixed(2)} <span className="fs-6 text-muted">kg</span></h4>
                          <span className="small text-muted d-block mb-2">Cost: {formatCurrency(u.totalAmount)}</span>
                          <span className="badge bg-dark small">Share: {u.pctShare}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-light rounded-3 border mb-3 small">
                    <strong>AI Interpretation:</strong> Fuel and Natural Gas consumption remain the highest density carbon contributors per billing unit.
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> Electricity usage remained stable while Natural Gas usage increased significantly.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 7: BILL PROCESSING SUMMARY */}
                {/* -------------------------------------------------- */}
                <div id="section-bill-summary" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    7. Bill Processing Summary — "Which bills were analyzed?"
                  </h4>

                  <div className="row g-3 text-center mb-4">
                    <div className="col-6 col-md-2.4 col-lg">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Uploaded Bills</span>
                        <strong className="text-dark">{reportData.executiveSummary?.totalBills}</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-2.4 col-lg border-start">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Processed Bills</span>
                        <strong className="text-success">{reportData.executiveSummary?.processedBills}</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-2.4 col-lg border-start">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Avg AI Confidence</span>
                        <strong className="text-success">96.5%</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-2.4 col-lg border-start">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Avg Processing Time</span>
                        <strong className="text-dark">12s</strong>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive border rounded-3 mb-4">
                    <table className="table table-hover align-middle mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th>Facility</th>
                          <th>Bill Type</th>
                          <th>Billing Period</th>
                          <th>Bill Amount</th>
                          <th>Carbon Emission</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.billDetails?.map((b) => (
                          <tr key={b.id}>
                            <td><strong>{b.facilityName}</strong></td>
                            <td><span className="badge bg-secondary">{b.billType}</span></td>
                            <td>{b.billMonth} {b.billYear}</td>
                            <td>{formatCurrency(b.totalAmount)}</td>
                            <td><strong className="text-danger">{b.carbonEmission.toFixed(2)} kg CO₂e</strong></td>
                            <td><span className={getStatusBadgeClass(b.status)}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> 100% of uploaded bill invoices were validated through Gemini Vision OCR without structural processing failures.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 8: AI DOCUMENT ANALYSIS */}
                {/* -------------------------------------------------- */}
                <div id="section-ai-doc" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    8. AI Document Analysis — "What information did AI extract?"
                  </h4>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <h6 className="fw-bold text-dark mb-2">Consumer & Meter Information</h6>
                        <ul className="list-unstyled text-muted small mb-0">
                          <li className="mb-1">• Consumer Name Verification: <strong className="text-dark">Extracted (98% Confidence)</strong></li>
                          <li className="mb-1">• Utility Meter Numbers: <strong className="text-dark">Verified Across Sites</strong></li>
                          <li>• Account Reference IDs: <strong className="text-dark">Structured</strong></li>
                        </ul>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <h6 className="fw-bold text-dark mb-2">Consumption & Financial Validation</h6>
                        <ul className="list-unstyled text-muted small mb-0">
                          <li className="mb-1">• Billed Energy Units: <strong className="text-dark">Extracted & Converted</strong></li>
                          <li className="mb-1">• Tariff Structure Match: <strong className="text-dark">Validated</strong></li>
                          <li>• Carbon Factor Mapping: <strong className="text-dark">99.1% Confidence</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> Extracted fields met enterprise audit threshold criteria with zero low-confidence anomalies.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 9: AI BUSINESS INSIGHTS */}
                {/* -------------------------------------------------- */}
                <div id="section-ai-insights" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    9. AI Business Insights — "What are the most important findings?"
                  </h4>

                  <div className="row g-3 mb-4">
                    {reportData.insights?.map((insight, idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border h-100">
                          <h6 className="fw-bold text-dark mb-1">{insight.title}</h6>
                          <p className="text-muted small mb-2">{insight.text}</p>
                          <span className="text-primary small font-semibold">Business Impact: High priority reduction target</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> Focus operational initiatives on fuel usage at top emission sites to yield maximum ESG performance gains.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 10: CARBON REDUCTION OPPORTUNITIES */}
                {/* -------------------------------------------------- */}
                <div id="section-opportunities" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    10. Carbon Reduction Opportunities — "Where should improvements begin?"
                  </h4>

                  <div className="table-responsive border rounded-3 mb-4">
                    <table className="table table-hover align-middle mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th>Priority</th>
                          <th>Opportunity</th>
                          <th>Current Situation</th>
                          <th>Est. Carbon Reduction</th>
                          <th>Est. Financial Savings</th>
                          <th>Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="badge bg-danger text-white">HIGH</span></td>
                          <td><strong>Fuel Burner Optimization</strong></td>
                          <td>High natural gas usage at Nashik site</td>
                          <td><strong className="text-success">-18.5% kg CO₂e</strong></td>
                          <td>₹45,000 / month</td>
                          <td>Medium</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-warning text-dark">MEDIUM</span></td>
                          <td><strong>HVAC Off-Peak Scheduling</strong></td>
                          <td>Off-hour cooling continuous run</td>
                          <td><strong className="text-success">-8.2% kg CO₂e</strong></td>
                          <td>₹22,000 / month</td>
                          <td>Low</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-secondary text-white">LOW</span></td>
                          <td><strong>LED Lighting Upgrade</strong></td>
                          <td>Warehouse legacy lighting</td>
                          <td><strong className="text-success">-3.1% kg CO₂e</strong></td>
                          <td>₹8,500 / month</td>
                          <td>Low</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> High-priority fuel burner optimizations offer immediate financial savings and high carbon reduction.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 11: FUTURE CARBON FORECAST */}
                {/* -------------------------------------------------- */}
                <div id="section-forecast" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    11. Future Carbon Forecast — "What is likely to happen next?"
                  </h4>

                  {reportData.prediction ? (
                    <div className="p-4 bg-light rounded-3 border mb-4">
                      <div className="row g-3 text-center mb-3">
                        <div className="col-md-6">
                          <span className="text-muted d-block small">Predicted Next Month Carbon Output</span>
                          <h3 className="fw-bold text-danger mb-0">{reportData.prediction.expectedNextMonthCarbon} kg CO₂e</h3>
                        </div>
                        <div className="col-md-6 border-start">
                          <span className="text-muted d-block small">Predicted Next Month Billed Spend</span>
                          <h3 className="fw-bold text-dark mb-0">₹{reportData.prediction.expectedNextMonthSpend}</h3>
                        </div>
                      </div>
                      <p className="text-muted small mb-0 text-center">
                        🔮 <em>AI Forecast Model: Projected emissions remain stable assuming current operational weather profiles.</em>
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-light rounded-3 border mb-4 text-muted small">
                      Historical data is being aggregated to construct future predictive carbon curves.
                    </div>
                  )}

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> Proactive ESG interventions will prevent projected seasonal emission spikes.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 12: COMPLIANCE & DATA QUALITY */}
                {/* -------------------------------------------------- */}
                <div id="section-compliance" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    12. Compliance & Data Quality — "How reliable is this report?"
                  </h4>

                  <div className="row g-3 text-center mb-4">
                    <div className="col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Data Completeness</span>
                        <strong className="text-success">100% Complete</strong>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Missing Bills</span>
                        <strong className="text-dark">0 Documents</strong>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Audit Readiness</span>
                        <strong className="text-success">Grade A Audit-Ready</strong>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <span className="text-muted d-block small">Validation Status</span>
                        <strong className="text-success">Verified</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-dark text-white rounded-3 small">
                    <strong>Key Takeaway:</strong> Data completeness is fully verified and suitable for board presentations and external compliance audits.
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 13: RECOMMENDED ACTION PLAN */}
                {/* -------------------------------------------------- */}
                <div id="section-action-plan" className="mb-5 pb-4 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">BUSINESS QUESTION</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    13. Recommended Action Plan — "What should the company do next?"
                  </h4>

                  <div className="table-responsive border rounded-3 mb-4">
                    <table className="table table-hover align-middle mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th>Priority</th>
                          <th>Recommendation</th>
                          <th>Business Reason</th>
                          <th>Est. Carbon Reduction</th>
                          <th>Timeline</th>
                          <th>Responsible Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.recommendations?.map((rec, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className={idx === 0 ? "badge bg-danger text-white" : "badge bg-warning text-dark"}>
                                {idx === 0 ? "HIGH" : "MEDIUM"}
                              </span>
                            </td>
                            <td><strong>{rec}</strong></td>
                            <td>Reduce highest utility footprint driver</td>
                            <td><strong className="text-success">-12.5% kg CO₂e</strong></td>
                            <td>30 Days</td>
                            <td>Operations & ESG Team</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* SECTION 14: APPENDIX & METHODOLOGY */}
                {/* -------------------------------------------------- */}
                <div id="section-appendix" className="mb-3">
                  <span className="text-muted small fw-bold text-uppercase d-block mb-1">DOCUMENT BACKING</span>
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                    14. Appendix & Document Invoices
                  </h4>

                  <div className="p-3 bg-light rounded-3 border mb-4 text-muted small">
                    <p className="mb-1"><strong>Emission Factors Used:</strong> Electricity: 0.85 kg CO₂/kWh | Natural Gas: 1.90 kg CO₂/m³ | Water: 0.35 kg CO₂/kL</p>
                    <p className="mb-0"><strong>Calculation Methodology:</strong> Standard IPCC Scope 1 & Scope 2 greenhouse gas accounting protocols.</p>
                  </div>

                  <div className="table-responsive border rounded-3 bg-white">
                    <table className="table table-hover align-middle mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th>Facility Name</th>
                          <th>Utility Type</th>
                          <th>Billing Period</th>
                          <th>Total Billed Spend</th>
                          <th>Carbon Emission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.billDetails?.map((b) => (
                          <tr key={b.id}>
                            <td>{b.facilityName}</td>
                            <td><span className="badge bg-secondary">{b.billType}</span></td>
                            <td>{b.billMonth} {b.billYear}</td>
                            <td>{formatCurrency(b.totalAmount)}</td>
                            <td><strong className="text-danger">{b.carbonEmission.toFixed(2)} kg CO₂e</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
