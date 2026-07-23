import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/dashboardService";
import { billService } from "../services/billService";
import { facilityService } from "../services/facilityService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";

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

  // Facility Drill-Down Drawer State
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showFacilityDrawer, setShowFacilityDrawer] = useState(false);

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

  // Utility carbon helper
  const getUtilityCarbon = (type) => {
    const item = utilityDist.find(
      (u) => u.utilityType?.toUpperCase() === type.toUpperCase()
    );
    return item ? item.carbonEmission : 0;
  };

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

  // Derived Dynamic AI Decision Support Insights (Refined to structured, minimal items)
  const aiInsights = useMemo(() => {
    const insights = [];

    // 1. High Carbon Driving Facility
    if (facilityEmissions && facilityEmissions.length > 0 && summary?.totalCarbonEmission > 0) {
      const topFacility = [...facilityEmissions].sort((a, b) => b.carbonEmission - a.carbonEmission)[0];
      if (topFacility && topFacility.carbonEmission > 0) {
        const pct = ((topFacility.carbonEmission / summary.totalCarbonEmission) * 100).toFixed(1);
        insights.push({
          id: "top-facility",
          icon: "📍",
          title: "Highest Emission Facility",
          description: `${topFacility.facilityName} generated ${pct}% of total emissions this reporting period.`,
          actionLabel: "View Details →",
          onAction: () => {
            const fac = allFacilities.find(f => f.id === topFacility.facilityId || f.name === topFacility.facilityName);
            if (fac) {
              setSelectedFacility(fac);
              setShowFacilityDrawer(true);
            } else {
              const element = document.getElementById("facility-intelligence-section");
              element?.scrollIntoView({ behavior: "smooth" });
            }
          }
        });
      }
    } else {
      insights.push({
        id: "top-facility-fallback",
        icon: "📍",
        title: "Highest Emission Facility",
        description: "No site footprint data available for this reporting period.",
        actionLabel: "View Details →",
        onAction: () => navigate("/facilities")
      });
    }

    // 2. Primary Carbon Source
    if (utilityDist && utilityDist.length > 0) {
      const topUtility = [...utilityDist].sort((a, b) => b.carbonEmission - a.carbonEmission)[0];
      if (topUtility && topUtility.carbonEmission > 0) {
        const totalCarbon = summary?.totalCarbonEmission || 1;
        const pct = ((topUtility.carbonEmission / totalCarbon) * 100).toFixed(1);
        insights.push({
          id: "top-utility",
          icon: "⚡",
          title: "Primary Carbon Source",
          description: `${topUtility.utilityType} contributed ${pct}% of total emissions and remains the largest emission source.`,
          actionLabel: "View Breakdown →",
          onAction: () => {
            const element = document.getElementById("utility-performance-section");
            element?.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    } else {
      insights.push({
        id: "top-utility-fallback",
        icon: "⚡",
        title: "Primary Carbon Source",
        description: "Utility resource carbon footprint split is currently optimal.",
        actionLabel: "View Breakdown →",
        onAction: () => {
          const element = document.getElementById("utility-performance-section");
          element?.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // 3. Monthly Trend
    insights.push({
      id: "trend-info",
      icon: "📈",
      title: "Monthly Trend",
      description: trendAnalytics.isIncrease 
        ? "Carbon emissions increased significantly compared to the previous reporting period. Review high-emission facilities and fuel consumption."
        : "Carbon emissions decreased compared to the previous reporting period. Active ESG optimizations are showing positive impact.",
      actionLabel: "View Analytics →",
      onAction: () => {
        const element = document.getElementById("hero-analytics-section");
        element?.scrollIntoView({ behavior: "smooth" });
      }
    });

    return insights;
  }, [facilityEmissions, summary, utilityDist, trendAnalytics, allFacilities, navigate]);

  // Combined Facilities with Emissions data
  const enrichedFacilities = useMemo(() => {
    return allFacilities.map((fac) => {
      const emissionObj = facilityEmissions.find((fe) => fe.facilityId === fac.id || fe.facilityName?.toLowerCase() === fac.name?.toLowerCase());
      const facilityCarbon = emissionObj ? emissionObj.carbonEmission : 0;
      const facilityBills = allBills.filter((b) => b.facilityId === fac.id);

      const utilityTypes = Array.from(new Set(facilityBills.map((b) => b.billType).filter(Boolean)));
      const dominantUtility = utilityTypes[0] || "Electricity";

      const totalCompanyCarbon = summary?.totalCarbonEmission || 1;
      const pctShare = (facilityCarbon / totalCompanyCarbon) * 100;
      
      // Map health score to status label and dot color
      let healthStatus = { label: "Healthy", dotClass: "text-success" };
      if (pctShare > 40) healthStatus = { label: "High Impact", dotClass: "text-danger" };
      else if (pctShare > 20) healthStatus = { label: "Moderate", dotClass: "text-warning" };

      return {
        ...fac,
        carbonEmission: facilityCarbon,
        billsCount: facilityBills.length,
        dominantUtility,
        healthStatus,
        pctShare: pctShare.toFixed(1),
        bills: facilityBills,
      };
    });
  }, [allFacilities, facilityEmissions, allBills, summary]);

  // Derived Facility Insights Summary Row
  const facilitySummaryRow = useMemo(() => {
    if (enrichedFacilities.length === 0) {
      return { total: 0, highestSite: "N/A", avgCarbon: 0, highestUtility: "N/A" };
    }
    const total = enrichedFacilities.length;
    const sortedSites = [...enrichedFacilities].sort((a, b) => b.carbonEmission - a.carbonEmission);
    const highestSite = sortedSites[0]?.name || "N/A";
    const totalCarbon = enrichedFacilities.reduce((sum, f) => sum + f.carbonEmission, 0);
    const avgCarbon = totalCarbon / total;

    const sortedUtilities = [...utilityDist].sort((a, b) => b.carbonEmission - a.carbonEmission);
    const highestUtility = sortedUtilities[0]?.utilityType || "N/A";

    return { total, highestSite, avgCarbon, highestUtility };
  }, [enrichedFacilities, utilityDist]);

  const openFacilityDrawer = (facility) => {
    setSelectedFacility(facility);
    setShowFacilityDrawer(true);
  };

  // SVG Curved Area Chart computation helper
  const svgChartContent = useMemo(() => {
    if (monthlyTrend.length < 2) return null;
    const sorted = [...monthlyTrend].sort((a, b) => a.month.localeCompare(b.month));
    const width = 800;
    const height = 220;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...sorted.map((t) => t.carbonEmission)) || 1;

    const points = sorted.map((item, index) => {
      const x = paddingLeft + (index * (chartWidth / (sorted.length - 1)));
      const y = paddingTop + chartHeight - ((item.carbonEmission / maxVal) * chartHeight);
      return { x, y, val: item.carbonEmission, label: item.month };
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

    return { points, linePath, areaPath, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, chartHeight };
  }, [monthlyTrend]);

  // Skeleton / Loading State
  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-success" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading Enterprise Sustainability Platform...</span>
        </div>
        <h5 className="mt-3 text-dark fw-bold">Initializing Executive Control Center...</h5>
        <p className="text-muted small">Loading multi-site analytics, AI document queues & facility metrics</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger shadow-sm d-flex justify-content-between align-items-center rounded-3">
        <div>
          <strong>Error Loading Executive Dashboard:</strong> {error}
        </div>
        <button className="btn btn-outline-danger btn-sm" onClick={fetchDashboardData}>
          Retry Connection
        </button>
      </div>
    );
  }

  const isHealthy = billCounts.failed === 0;
  const displayedFacilities = enrichedFacilities.slice(0, 4);

  return (
    <div className="executive-saas-dashboard pb-5">
      {/* ============================================================ */}
      {/* SECTION 1: EXECUTIVE HERO */}
      {/* ============================================================ */}
      <div className="dashboard-section">
        <div className="card-saas bg-white" style={{ padding: "24px 32px" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.03em" }}>
                Executive Sustainability Intelligence
              </h2>
              <p className="text-muted mb-0 small">
                Enterprise Carbon Monitoring Platform
              </p>
            </div>

            <div className="d-flex align-items-center gap-4 flex-wrap">
              <div className="text-end">
                <span className="text-muted d-block" style={{ fontSize: "0.78rem" }}>
                  Last Updated: <strong className="text-dark">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                </span>
                <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                  {lastUpdated.toLocaleDateString(undefined, { day: 'numeric', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-secondary-white btn-sm" onClick={fetchDashboardData}>
                  Refresh
                </button>
                <button className="btn btn-lime btn-sm" onClick={() => navigate("/reports")}>
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PRIMARY KPI ROW */}
      {/* ============================================================ */}
      <div className="dashboard-section">
        <div className="row g-3">
          {/* Card 1: Total Carbon */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card-saas h-100 cursor-pointer bg-white"
              onClick={() => {
                const el = document.getElementById("hero-analytics-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="activity-icon-badge bg-danger bg-opacity-10 text-danger fs-5">🌱</div>
                <span className="badge bg-danger bg-opacity-10 text-danger small">
                  {trendAnalytics.hasPrevious ? `${trendAnalytics.isIncrease ? "▲" : "▼"} ${trendAnalytics.pct.toFixed(1)}%` : "Live"}
                </span>
              </div>
              <span className="text-muted small font-semibold d-block text-uppercase" style={{ letterSpacing: "0.04em" }}>TOTAL CARBON EMISSION</span>
              <h2 className="fw-bold text-danger my-2" style={{ letterSpacing: "-0.03em" }}>
                {summary?.totalCarbonEmission?.toFixed(2) || "0.00"} <span className="fs-6 text-muted font-normal">kg CO₂</span>
              </h2>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <span className="small text-muted">Across all sites</span>
                <span className="small text-primary fw-bold">Analytics →</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Spend */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card-saas h-100 cursor-pointer bg-white"
              onClick={() => navigate("/reports")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="activity-icon-badge bg-primary bg-opacity-10 text-primary fs-5">💰</div>
                <span className="badge bg-primary bg-opacity-10 text-primary small">Expenditure</span>
              </div>
              <span className="text-muted small font-semibold d-block text-uppercase" style={{ letterSpacing: "0.04em" }}>TOTAL UTILITY COST</span>
              <h2 className="fw-bold text-primary my-2" style={{ letterSpacing: "-0.03em" }}>{formatCurrency(summary?.totalBillAmount)}</h2>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <span className="small text-muted">Combined spend</span>
                <span className="small text-primary fw-bold">Reports →</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Bills */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card-saas h-100 cursor-pointer bg-white"
              onClick={() => navigate("/bills")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="activity-icon-badge bg-secondary bg-opacity-10 text-dark fs-5">📄</div>
                <span className="badge bg-secondary bg-opacity-10 text-dark small">Queue</span>
              </div>
              <span className="text-muted small font-semibold d-block text-uppercase" style={{ letterSpacing: "0.04em" }}>TOTAL UTILITY BILLS</span>
              <h2 className="fw-bold text-dark my-2" style={{ letterSpacing: "-0.03em" }}>{summary?.totalBills || 0}</h2>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <span className="small text-muted">Uploaded documents</span>
                <span className="small text-primary fw-bold">View Queue →</span>
              </div>
            </div>
          </div>

          {/* Card 4: Active Facilities */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card-saas h-100 cursor-pointer bg-white"
              onClick={() => {
                const el = document.getElementById("facility-intelligence-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="activity-icon-badge bg-success bg-opacity-10 text-success fs-5">🏭</div>
                <span className="badge bg-success bg-opacity-10 text-success small">Monitored</span>
              </div>
              <span className="text-muted small font-semibold d-block text-uppercase" style={{ letterSpacing: "0.04em" }}>ACTIVE FACILITIES</span>
              <h2 className="fw-bold text-success my-2" style={{ letterSpacing: "-0.03em" }}>{summary?.totalFacilities || 0}</h2>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <span className="small text-muted">Monitored corporate sites</span>
                <span className="small text-primary fw-bold">Inspect →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: AI PROCESSING STATUS MONITOR (Horizontal Bar) */}
      {/* ============================================================ */}
      <div className="dashboard-section">
        <div className="card-saas bg-white" style={{ padding: "18px 32px", minHeight: "90px" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                AI Processing Status
              </span>
              <span className={`fw-bold small ${isHealthy ? "text-success" : "text-danger"}`}>
                ● {isHealthy ? "Healthy" : "Attention Required"}
              </span>
            </div>

            <div className="d-flex align-items-center gap-5">
              <div className="text-center">
                <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>Completed</span>
                <span className="fw-bold text-dark fs-5">{billCounts.completed}</span>
              </div>
              <div className="text-center border-start ps-4">
                <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>Pending</span>
                <span className="fw-bold text-dark fs-5">{billCounts.pending}</span>
              </div>
              <div className="text-center border-start ps-4">
                <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>Processing</span>
                <span className="fw-bold text-dark fs-5">{billCounts.processing}</span>
              </div>
              <div className="text-center border-start ps-4">
                <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>Failed</span>
                <span className={`fw-bold fs-5 ${billCounts.failed > 0 ? "text-danger" : "text-dark"}`}>
                  {billCounts.failed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: UNIFIED ANALYTICS WORKSPACE & AI INSIGHTS */}
      {/* ============================================================ */}
      <div className="dashboard-section" id="hero-analytics-section">
        <div className="card-saas bg-white" style={{ padding: "36px" }}>
          
          {/* Header Row */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: "-0.02em" }}>
              Monthly Carbon Analytics
            </h3>
            <button 
              className="btn btn-link text-primary fw-bold text-decoration-none p-0" 
              style={{ fontSize: "0.9rem" }}
              onClick={() => navigate("/reports")}
            >
              Full Report →
            </button>
          </div>

          {/* Top Compact Summary Metrics */}
          <div className="row g-3 mb-4 text-center">
            {/* Current */}
            <div className="col-6 col-md-3">
              <div className="py-2">
                <span className="text-muted small d-block mb-1">Current</span>
                <h3 className="fw-bold text-danger mb-0">
                  {trendAnalytics.current.toFixed(2)} <span className="fs-6 font-normal text-muted">kg CO₂e</span>
                </h3>
              </div>
            </div>

            {/* Previous */}
            <div className="col-6 col-md-3 border-start">
              <div className="py-2">
                <span className="text-muted small d-block mb-1">Previous</span>
                <h3 className="fw-bold text-dark mb-0">
                  {trendAnalytics.previous.toFixed(2)} <span className="fs-6 font-normal text-muted">kg CO₂e</span>
                </h3>
              </div>
            </div>

            {/* Difference */}
            <div className="col-6 col-md-3 border-start">
              <div className="py-2">
                <span className="text-muted small d-block mb-1">Difference</span>
                <h3 className={`fw-bold mb-0 ${trendAnalytics.isIncrease ? "text-danger" : "text-success"}`}>
                  {trendAnalytics.isIncrease ? "+" : "-"}{trendAnalytics.diff.toFixed(2)} <span className="fs-6 font-normal text-muted">kg CO₂e</span>
                </h3>
              </div>
            </div>

            {/* Trend */}
            <div className="col-6 col-md-3 border-start">
              <div className="py-2">
                <span className="text-muted small d-block mb-1">Trend</span>
                <h3 className={`fw-bold mb-0 ${trendAnalytics.isIncrease ? "text-danger" : "text-success"}`}>
                  {trendAnalytics.isIncrease ? "▲" : "▼"} {trendAnalytics.pct.toFixed(1)}% <span className="fs-7 font-normal text-muted">Change</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Premium Interactive Curved Area Chart (SVG) */}
          <div className="p-3 bg-light rounded-4 border mb-4">
            {svgChartContent ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                  <span className="small font-semibold text-secondary text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.06em" }}>
                    Emissions Over Time
                  </span>
                  <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                    Unit: kg CO₂e
                  </span>
                </div>
                <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
                  <svg 
                    viewBox={`0 0 ${svgChartContent.width} ${svgChartContent.height}`} 
                    className="w-100 h-auto"
                    style={{ minHeight: "220px" }}
                  >
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#146E45" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#146E45" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Subtle grid lines */}
                    <line x1="60" y1="30" x2="760" y2="30" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="60" y1="85" x2="760" y2="85" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="60" y1="140" x2="760" y2="140" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="60" y1="180" x2="760" y2="180" stroke="#E2E8F0" strokeWidth="1" />

                    {/* Area path */}
                    <path d={svgChartContent.areaPath} fill="url(#chartGrad)" />

                    {/* Curved line path */}
                    <path d={svgChartContent.linePath} fill="none" stroke="#146E45" strokeWidth="3.5" />

                    {/* Circles at data points & labels */}
                    {svgChartContent.points.map((pt, idx) => (
                      <g key={idx}>
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="5.5" 
                          fill="#146E45" 
                          stroke="#FFFFFF" 
                          strokeWidth="2.5" 
                          style={{ transition: "r 180ms ease" }}
                        />
                        <text 
                          x={pt.x} 
                          y={pt.y - 12} 
                          textAnchor="middle" 
                          fill="#1E293B" 
                          fontSize="9.5" 
                          fontWeight="700"
                        >
                          {pt.val.toFixed(1)}
                        </text>
                        <text 
                          x={pt.x} 
                          y="204" 
                          textAnchor="middle" 
                          fill="#64748B" 
                          fontSize="9.5"
                          fontWeight="600"
                        >
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center text-muted small">
                Insufficient trend data to render carbon output curves.
              </div>
            )}
          </div>

          {/* Compact Summary Metrics Horizontal Row */}
          <div className="row g-2 text-center text-muted border-bottom pb-4 mb-4" style={{ fontSize: "0.85rem" }}>
            <div className="col-3">
              Highest: <strong className="text-danger">{trendAnalytics.highest.toFixed(2)} kg CO₂e</strong>
            </div>
            <div className="col-3 border-start">
              Lowest: <strong className="text-dark">{trendAnalytics.lowest.toFixed(2)} kg CO₂e</strong>
            </div>
            <div className="col-3 border-start">
              Average: <strong className="text-dark">{trendAnalytics.avg.toFixed(2)} kg CO₂e</strong>
            </div>
            <div className="col-3 border-start">
              Trend: <strong className={trendAnalytics.isIncrease ? "text-danger" : "text-success"}>{trendAnalytics.isIncrease ? "Increasing" : "Stable"}</strong>
            </div>
          </div>

          {/* AI Insights Block */}
          <div className="mt-2">
            <h4 className="fw-bold text-dark mb-4" style={{ letterSpacing: "-0.01em" }}>AI Insights</h4>
            <div className="row g-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="col-md-4">
                  <div className="h-100 p-4 bg-light rounded-4 border d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="fs-5">{insight.icon}</span>
                        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                          {insight.title}
                        </h6>
                      </div>
                      <p className="text-muted small mb-4" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                        {insight.description}
                      </p>
                    </div>
                    <div>
                      <button 
                        className="btn btn-link text-primary fw-bold p-0 text-decoration-none small text-start"
                        onClick={insight.onAction}
                        style={{ fontSize: "0.825rem" }}
                      >
                        {insight.actionLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: REDESIGNED FACILITY INTELLIGENCE */}
      {/* ============================================================ */}
      <div className="dashboard-section" id="facility-intelligence-section">
        <div className="card-saas bg-white" style={{ padding: "36px" }}>
          {/* Clean Section Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: "-0.02em" }}>
              Facility Intelligence
            </h3>
            <button 
              className="btn btn-link text-primary fw-bold text-decoration-none p-0" 
              style={{ fontSize: "0.9rem" }}
              onClick={() => navigate("/facilities")}
            >
              Manage Facilities →
            </button>
          </div>

          {enrichedFacilities.length === 0 ? (
            <div className="p-5 text-center text-muted bg-light rounded-3">
              <p className="mb-2">No corporate facilities monitored.</p>
              <button className="btn btn-lime btn-sm" onClick={() => navigate("/facilities")}>
                + Monitor First Facility
              </button>
            </div>
          ) : (
            <div>
              {/* Facility Insights Summary Row */}
              <div className="row g-2 text-center text-muted border-bottom pb-4 mb-4" style={{ fontSize: "0.85rem" }}>
                <div className="col-3">
                  Total Facilities: <strong className="text-dark">{facilitySummaryRow.total}</strong>
                </div>
                <div className="col-3 border-start">
                  Highest Emission Site: <strong className="text-dark">{facilitySummaryRow.highestSite}</strong>
                </div>
                <div className="col-3 border-start">
                  Average Facility Carbon: <strong className="text-dark">{facilitySummaryRow.avgCarbon.toFixed(2)} kg CO₂e</strong>
                </div>
                <div className="col-3 border-start">
                  Highest Utility: <strong className="text-dark">{facilitySummaryRow.highestUtility}</strong>
                </div>
              </div>

              {/* Responsive Facilities Grid: Desktop (2/row), Laptop (2/row), Tablet (1/row) */}
              <div className="row g-4">
                {displayedFacilities.map((fac) => (
                  <div key={fac.id} className="col-md-6 col-12">
                    <div 
                      className="card-saas bg-white p-4 h-100 cursor-pointer border rounded-4 shadow-sm"
                      onClick={() => openFacilityDrawer(fac)}
                      style={{ cursor: "pointer", transition: "transform 200ms ease, box-shadow 200ms ease" }}
                    >
                      {/* Top Header Row */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-4">🏢</span>
                          <div>
                            <h5 className="fw-bold text-dark mb-0" style={{ fontSize: "1.05rem" }}>{fac.name}</h5>
                            <span className="text-muted small">📍 {fac.city}, {fac.state}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-1.5">
                          <span className={fac.healthStatus.dotClass} style={{ fontSize: "0.85rem" }}>●</span>
                          <span className="text-muted small fw-bold">{fac.healthStatus.label}</span>
                        </div>
                      </div>

                      {/* Center Large Metric and Stats */}
                      <div className="py-2 mb-3">
                        <h2 className="fw-bold text-danger mb-2" style={{ letterSpacing: "-0.03em" }}>
                          {fac.carbonEmission.toFixed(2)} <span className="fs-6 font-normal text-muted">kg CO₂e</span>
                        </h2>
                        
                        <div className="d-flex justify-content-between text-muted small pt-2 border-top">
                          <div>
                            Share: <strong className="text-dark">{fac.pctShare}%</strong>
                          </div>
                          <div>
                            Bills: <strong className="text-dark">{fac.billsCount}</strong>
                          </div>
                          <div>
                            Utility: <strong className="text-dark">{fac.dominantUtility}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer Section */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ fontSize: "0.8rem" }}>
                        <span className="text-muted">Updated {formatDate(fac.updatedAt || fac.createdAt)}</span>
                        <button 
                          className="btn btn-link text-primary fw-bold p-0 text-decoration-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            openFacilityDrawer(fac);
                          }}
                          style={{ fontSize: "0.825rem" }}
                        >
                          Inspect Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show "View All Facilities →" trigger to keep the dashboard compact */}
              {enrichedFacilities.length > 4 && (
                <div className="text-center mt-4 pt-2">
                  <button 
                    className="btn btn-secondary-white btn-sm"
                    onClick={() => navigate("/facilities")}
                  >
                    View All Monitored Facilities →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* UTILITY PERFORMANCE BREAKDOWN */}
      {/* ============================================================ */}
      <div className="dashboard-section" id="utility-performance-section">
        <div className="card-saas bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="badge bg-info bg-opacity-10 text-info border border-info px-3 py-1 mb-1">
                Resource Distribution
              </span>
              <h3 className="fw-bold text-dark mb-0">Utility Performance Breakdown</h3>
            </div>
          </div>

          <div className="row g-4">
            {/* Electricity */}
            <div className="col-md-4">
              <div className="card-saas h-100 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark fs-5">⚡ Electricity</span>
                  <span className="fs-4">💡</span>
                </div>
                <span className="text-muted small d-block mb-1">Carbon Emissions</span>
                <h3 className="fw-bold text-primary mb-2">
                  {getUtilityCarbon("ELECTRICITY").toFixed(2)} <span className="fs-6 text-muted">kg CO₂</span>
                </h3>
                <div className="progress mb-2" style={{ height: "8px", borderRadius: "10px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{
                      width: `${summary?.totalCarbonEmission ? Math.min((getUtilityCarbon("ELECTRICITY") / summary.totalCarbonEmission) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="small text-muted">
                  {summary?.totalCarbonEmission ? ((getUtilityCarbon("ELECTRICITY") / summary.totalCarbonEmission) * 100).toFixed(1) : 0}% of overall footprint
                </span>
              </div>
            </div>

            {/* Water */}
            <div className="col-md-4">
              <div className="card-saas h-100 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark fs-5">💧 Water Utility</span>
                  <span className="fs-4">💧</span>
                </div>
                <span className="text-muted small d-block mb-1">Carbon Emissions</span>
                <h3 className="fw-bold text-info mb-2">
                  {getUtilityCarbon("WATER").toFixed(2)} <span className="fs-6 text-muted">kg CO₂</span>
                </h3>
                <div className="progress mb-2" style={{ height: "8px", borderRadius: "10px" }}>
                  <div
                    className="progress-bar bg-info"
                    style={{
                      width: `${summary?.totalCarbonEmission ? Math.min((getUtilityCarbon("WATER") / summary.totalCarbonEmission) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="small text-muted">
                  {summary?.totalCarbonEmission ? ((getUtilityCarbon("WATER") / summary.totalCarbonEmission) * 100).toFixed(1) : 0}% of overall footprint
                </span>
              </div>
            </div>

            {/* Fuel / Gas */}
            <div className="col-md-4">
              <div className="card-saas h-100 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark fs-5">🔥 Fuel / Natural Gas</span>
                  <span className="fs-4">🔥</span>
                </div>
                <span className="text-muted small d-block mb-1">Carbon Emissions</span>
                <h3 className="fw-bold text-warning mb-2">
                  {getUtilityCarbon("GAS").toFixed(2)} <span className="fs-6 text-muted">kg CO₂</span>
                </h3>
                <div className="progress mb-2" style={{ height: "8px", borderRadius: "10px" }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${summary?.totalCarbonEmission ? Math.min((getUtilityCarbon("GAS") / summary.totalCarbonEmission) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="small text-muted">
                  {summary?.totalCarbonEmission ? ((getUtilityCarbon("GAS") / summary.totalCarbonEmission) * 100).toFixed(1) : 0}% of overall footprint
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RECENT ACTIVITY TIMELINE */}
      {/* ============================================================ */}
      <div className="dashboard-section">
        <div className="card-saas bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="badge bg-secondary bg-opacity-10 text-dark border border-secondary px-3 py-1 mb-1">
                Live Feed
              </span>
              <h3 className="fw-bold text-dark mb-0">Recent Activity Timeline</h3>
            </div>
            <button className="btn btn-secondary-white btn-sm" onClick={() => navigate("/bills")}>
              Full Queue →
            </button>
          </div>

          {recentBills.length === 0 ? (
            <p className="text-muted p-4 text-center mb-0">No recent utility document activity.</p>
          ) : (
            <div className="activity-feed-list">
              {recentBills.map((b) => (
                <div key={b.billId} className="activity-item">
                  <div className="activity-icon-badge bg-light text-dark">📄</div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark">{b.facilityName}</strong>
                      <span className={getStatusBadgeClass(b.status)}>{b.status}</span>
                    </div>
                    <div className="small text-muted">
                      Consumer: <strong>{b.consumerName || "N/A"}</strong> | Period: <strong>{b.billMonth || "N/A"} {b.billYear || ""}</strong> | Billed: <strong>{formatCurrency(b.totalAmount)}</strong>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-muted small d-block mb-1">{formatDate(b.createdAt)}</span>
                    <button className="btn btn-sm btn-secondary-white py-1 px-3" style={{ fontSize: "0.78rem" }} onClick={() => navigate("/bills")}>
                      View Bill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* QUICK ACTIONS WORKFLOW BAR */}
      {/* ============================================================ */}
      <div className="dashboard-section">
        <div className="card-saas bg-white text-center p-5">
          <h4 className="fw-bold text-dark mb-2">Workflow Action Shortcuts</h4>
          <p className="text-muted small mb-4">Execute core sustainability management tasks across your organization</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button className="btn btn-lime shadow-sm px-4 py-2.5" onClick={() => navigate("/bills")}>
              📤 Upload Bill Document
            </button>
            <button className="btn btn-secondary-white px-4 py-2.5" onClick={() => navigate("/reports")}>
              📈 Generate PDF Report
            </button>
            <button className="btn btn-secondary-white px-4 py-2.5" onClick={() => navigate("/facilities")}>
              🏭 Manage Facilities
            </button>
            <button className="btn btn-secondary-white px-4 py-2.5" onClick={() => navigate("/bills")}>
              📋 Review Queue
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FACILITY DRILL-DOWN MODAL DRAWER */}
      {/* ============================================================ */}
      {showFacilityDrawer && selectedFacility && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-dark text-white p-4">
                <div>
                  <h5 className="modal-title fw-bold">🏢 Facility Intelligence: {selectedFacility.name}</h5>
                  <small className="text-white-50">📍 {selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state}, {selectedFacility.country}</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowFacilityDrawer(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4 text-center">
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-muted small d-block mb-1">Total Footprint</span>
                      <h4 className="fw-bold text-danger mb-0">{selectedFacility.carbonEmission?.toFixed(2) || "0.00"} <span className="fs-6 text-muted">kg</span></h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-muted small d-block mb-1">Processed Bills</span>
                      <h4 className="fw-bold text-primary mb-0">{selectedFacility.billsCount || 0}</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-muted small d-block mb-1">Dominant Utility</span>
                      <h5 className="fw-bold text-dark mb-0 mt-1">{selectedFacility.dominantUtility}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-muted small d-block mb-1">Health Score</span>
                      <span className={`badge bg-${selectedFacility.healthStatus?.color} px-2.5 py-1 fs-6 mt-1`}>
                        {selectedFacility.healthStatus?.label}
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-3">📄 Facility Utility Bills Queue</h6>
                {selectedFacility.bills && selectedFacility.bills.length > 0 ? (
                  <div className="table-responsive mb-3 border rounded-3">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Bill Type</th>
                          <th>Period</th>
                          <th>Status</th>
                          <th>Total Amount</th>
                          <th>Upload Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFacility.bills.map((b) => (
                          <tr key={b.id}>
                            <td><span className="badge bg-secondary">{b.billType || "Electricity"}</span></td>
                            <td>{b.billMonth} {b.billYear}</td>
                            <td><span className={getStatusBadgeClass(b.status)}>{b.status}</span></td>
                            <td>{formatCurrency(b.totalAmount)}</td>
                            <td>{formatDate(b.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info py-2 small mb-3">
                    No utility bill records found for this specific facility.
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  className="btn btn-lime"
                  onClick={() => {
                    setShowFacilityDrawer(false);
                    navigate("/bills");
                  }}
                >
                  View in Bills Queue →
                </button>
                <button type="button" className="btn btn-secondary-white" onClick={() => setShowFacilityDrawer(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
