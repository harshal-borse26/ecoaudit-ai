import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { facilityService } from "../services/facilityService";
import { billService } from "../services/billService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";

const FACILITY_TYPES = ["Office", "Warehouse", "Manufacturing", "Retail", "Data Center", "Hospital", "Other"];

const emptyForm = {
  name: "",
  type: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

const Facilities = () => {
  const navigate = useNavigate();

  // Core Data States
  const [facilities, setFacilities] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [utilityFilter, setUtilityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RECENT");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Right-Side Sliding Drawer Workspace State
  const [drawerFacilityId, setDrawerFacilityId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch facilities and bills from backend APIs
  const fetchFacilities = async () => {
    setLoading(true);
    setError("");
    try {
      const [facRes, billsRes] = await Promise.all([
        facilityService.getAll(),
        billService.getAll()
      ]);
      if (facRes.data?.success) {
        setFacilities(facRes.data.data || []);
      }
      if (billsRes.data?.success) {
        setAllBills(billsRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sync facilities data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setForm({ ...emptyForm });
    setEditId(null);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (facility) => {
    setModalMode("edit");
    setForm({
      name: facility.name,
      type: facility.type,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      country: facility.country,
      postalCode: facility.postalCode || "",
    });
    setEditId(facility.id);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const payload = { ...form };
      if (!payload.postalCode) delete payload.postalCode;

      if (modalMode === "create") {
        await facilityService.create(payload);
        setSuccessMsg("Facility created successfully!");
      } else {
        await facilityService.update(editId, payload);
        setSuccessMsg("Facility updated successfully!");
      }
      setShowModal(false);
      fetchFacilities();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete facility "${name}"?`)) return;
    try {
      await facilityService.delete(id);
      setSuccessMsg("Facility deleted successfully.");
      setShowDrawer(false);
      setDrawerFacilityId(null);
      fetchFacilities();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete facility.");
    }
  };

  // Enriched facilities with dynamic ESG analytics calculations
  const enrichedFacilities = useMemo(() => {
    const totalCompanyCarbon = allBills
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.carbonEmission || 0), 0) || 1;

    return facilities.map((fac) => {
      const facilityBills = allBills.filter((b) => b.facilityId === fac.id);
      const totalBills = facilityBills.length;
      
      const carbonEmission = facilityBills
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => sum + (b.carbonEmission || 0), 0);

      const totalSpend = facilityBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const hasFailedBills = facilityBills.some((b) => b.status === "FAILED");
      const hasProcessingBills = facilityBills.some((b) => b.status === "PROCESSING");

      const pctShare = ((carbonEmission / totalCompanyCarbon) * 100).toFixed(1);

      // Status indicator dot mappings
      let healthStatus = { label: "Healthy", dotClass: "text-success", color: "green" };
      if (parseFloat(pctShare) > 40) {
        healthStatus = { label: "High Impact", dotClass: "text-danger", color: "red" };
      } else if (parseFloat(pctShare) > 20) {
        healthStatus = { label: "Moderate", dotClass: "text-warning", color: "orange" };
      }

      // Dominant utility
      const utilityCounts = {};
      let dominantUtility = "Electricity";
      let maxCount = 0;
      facilityBills.forEach((b) => {
        if (b.billType) {
          utilityCounts[b.billType] = (utilityCounts[b.billType] || 0) + (b.carbonEmission || 0);
          if (utilityCounts[b.billType] > maxCount) {
            maxCount = utilityCounts[b.billType];
            dominantUtility = b.billType;
          }
        }
      });

      // AI status mapping
      let aiStatus = "Optimized";
      if (totalBills === 0) aiStatus = "No Bills";
      else if (hasFailedBills) aiStatus = "Needs Review";
      else if (hasProcessingBills) aiStatus = "Processing";

      // Calculate Trend (MoM comparison for this facility)
      let trendPct = 0;
      let trendDirection = "stable";
      const sortedBills = [...facilityBills].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      if (sortedBills.length >= 2) {
        const currentEm = sortedBills[sortedBills.length - 1].carbonEmission || 0;
        const prevEm = sortedBills[sortedBills.length - 2].carbonEmission || 0;
        if (prevEm > 0) {
          const diff = currentEm - prevEm;
          trendPct = Math.abs((diff / prevEm) * 100);
          trendDirection = diff > 0 ? "up" : "down";
        }
      }

      // Construct a meaningful ESG AI-generated insight based on facility data
      let aiInsight = "Electricity usage remained stable compared with last month. No unusual emission pattern was detected.";
      if (totalBills === 0) {
        aiInsight = "No utility bills have been processed for this facility yet.";
      } else if (dominantUtility.toUpperCase().includes("GAS") || dominantUtility.toUpperCase().includes("FUEL")) {
        aiInsight = `Natural Gas contributes ${pctShare}% of this facility's emissions. Optimizing fuel consumption will have the greatest impact.`;
      } else if (trendDirection === "up" && trendPct > 5) {
        aiInsight = `Carbon emissions increased ${trendPct.toFixed(0)}% compared with the previous reporting period.`;
      } else if (trendDirection === "down" && trendPct > 5) {
        aiInsight = `Carbon emissions decreased ${trendPct.toFixed(0)}% after reduced electricity consumption.`;
      } else if (dominantUtility.toUpperCase().includes("ELEC")) {
        aiInsight = "Electricity consumption represents the largest carbon source this month.";
      }

      return {
        ...fac,
        totalBills,
        carbonEmission,
        totalSpend,
        healthStatus,
        dominantUtility,
        aiStatus,
        aiInsight,
        pctShare,
        trendPct,
        trendDirection,
        bills: facilityBills,
        updatedAt: fac.updatedAt || fac.createdAt
      };
    });
  }, [facilities, allBills]);

  // Derived totals for header summary (No hardcoding)
  const summaryMetrics = useMemo(() => {
    const totalFacilities = enrichedFacilities.length;
    
    const totalCarbon = enrichedFacilities.reduce((sum, f) => sum + f.carbonEmission, 0);
    const totalBills = enrichedFacilities.reduce((sum, f) => sum + f.totalBills, 0);

    const sortedSites = [...enrichedFacilities].sort((a, b) => b.carbonEmission - a.carbonEmission);
    const highestSite = sortedSites[0]?.name || "N/A";
    const highestEmission = sortedSites[0]?.carbonEmission || 0;

    // Determine primary utility source based on emissions share
    const utilityEmissions = {};
    allBills.forEach((b) => {
      if (b.billType && b.status === "COMPLETED") {
        utilityEmissions[b.billType] = (utilityEmissions[b.billType] || 0) + (b.carbonEmission || 0);
      }
    });
    let primaryUtility = "Electricity";
    let maxEm = 0;
    Object.keys(utilityEmissions).forEach((u) => {
      if (utilityEmissions[u] > maxEm) {
        maxEm = utilityEmissions[u];
        primaryUtility = u;
      }
    });

    return { totalFacilities, totalCarbon, totalBills, highestSite, highestEmission, primaryUtility };
  }, [enrichedFacilities, allBills]);

  // Search & Filter rows mapping
  const filteredAndSorted = useMemo(() => {
    let result = enrichedFacilities.filter((fac) => {
      const matchSearch = fac.name.toLowerCase().includes(search.toLowerCase()) ||
                          fac.city.toLowerCase().includes(search.toLowerCase()) ||
                          fac.type.toLowerCase().includes(search.toLowerCase()) ||
                          fac.state.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === "ALL" || fac.healthStatus.label.toUpperCase() === statusFilter.toUpperCase();
      const matchType = typeFilter === "ALL" || fac.type.toUpperCase() === typeFilter.toUpperCase();
      const matchUtility = utilityFilter === "ALL" || fac.dominantUtility.toUpperCase() === utilityFilter.toUpperCase();

      return matchSearch && matchStatus && matchType && matchUtility;
    });

    if (sortBy === "RECENT") {
      result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else if (sortBy === "CARBON") {
      result.sort((a, b) => b.carbonEmission - a.carbonEmission);
    } else if (sortBy === "NAME") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [enrichedFacilities, search, statusFilter, typeFilter, utilityFilter, sortBy]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedFacilities = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Active drawer facility recalculation from updated state
  const drawerFacility = useMemo(() => {
    if (!drawerFacilityId) return null;
    return enrichedFacilities.find((f) => f.id === drawerFacilityId) || null;
  }, [drawerFacilityId, enrichedFacilities]);

  // SVG curved trend data inside drawer for the selected site
  const drawerCurveData = useMemo(() => {
    if (!drawerFacility || drawerFacility.bills.length < 2) return null;
    const sorted = [...drawerFacility.bills]
      .filter((b) => b.status === "COMPLETED")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-6); // last 6 months

    if (sorted.length < 2) return null;

    const width = 460;
    const height = 150;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...sorted.map((t) => t.carbonEmission || 0)) || 1;

    const points = sorted.map((item, index) => {
      const x = paddingLeft + (index * (chartWidth / (sorted.length - 1)));
      const y = paddingTop + chartHeight - (((item.carbonEmission || 0) / maxVal) * chartHeight);
      return { x, y, val: item.carbonEmission || 0, label: `${item.billMonth} ${item.billYear}` };
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

    return { points, linePath, areaPath, width, height, paddingBottom };
  }, [drawerFacility]);

  if (loading) {
    return (
      <div className="loading-container text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Syncing Facilities Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="facilities-operations-workspace pb-5">
      {/* Header section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.03em" }}>Facilities</h2>
          <p className="text-muted small mb-0">Monitor all company facilities, carbon emissions and AI-powered operational insights.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-secondary-white btn-sm" onClick={fetchFacilities}>
            Refresh
          </button>
          <button className="btn btn-lime shadow-sm" onClick={openCreateModal}>
            + Add Facility
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4 rounded-3">{error}</div>}
      {successMsg && <div className="alert alert-success mb-4 rounded-3">{successMsg}</div>}

      {/* Summary row */}
      <div className="dashboard-section">
        <div className="card-saas bg-white" style={{ padding: "20px 28px" }}>
          <div className="row g-3 text-center">
            {/* Total Facilities */}
            <div className="col-12 col-md-2.4 col-lg">
              <span className="text-muted small d-block mb-1">Total Facilities</span>
              <h3 className="fw-bold text-dark mb-0">{summaryMetrics.totalFacilities}</h3>
              <span className="text-muted font-normal" style={{ fontSize: "0.75rem" }}>Monitored sites</span>
            </div>

            {/* Total Carbon */}
            <div className="col-12 col-md-2.4 col-lg border-start">
              <span className="text-muted small d-block mb-1">Total Carbon Emissions</span>
              <h3 className="fw-bold text-danger mb-0">
                {summaryMetrics.totalCarbon > 0 ? `${summaryMetrics.totalCarbon.toFixed(2)} kg CO₂e` : "0.00 kg CO₂e"}
              </h3>
              <span className="text-muted font-normal" style={{ fontSize: "0.75rem" }}>Enterprise scope</span>
            </div>

            {/* Total Bills */}
            <div className="col-12 col-md-2.4 col-lg border-start">
              <span className="text-muted small d-block mb-1">Total Utility Bills</span>
              <h3 className="fw-bold text-dark mb-0">{summaryMetrics.totalBills}</h3>
              <span className="text-muted font-normal" style={{ fontSize: "0.75rem" }}>Monitored invoices</span>
            </div>

            {/* Highest Site */}
            <div className="col-12 col-md-2.4 col-lg border-start">
              <span className="text-muted small d-block mb-1">Highest Emission Facility</span>
              <h3 className="fw-bold text-danger mb-0 text-truncate px-2" title={summaryMetrics.highestSite}>
                {summaryMetrics.highestSite}
              </h3>
              <span className="text-muted font-normal" style={{ fontSize: "0.75rem" }}>
                {summaryMetrics.highestEmission > 0 ? `${summaryMetrics.highestEmission.toFixed(2)} kg CO₂e` : "0.00 kg CO₂e"}
              </span>
            </div>

            {/* Primary Source */}
            <div className="col-12 col-md-2.4 col-lg border-start">
              <span className="text-muted small d-block mb-1">Primary Utility Source</span>
              <h3 className="fw-bold text-primary mb-0">{summaryMetrics.primaryUtility}</h3>
              <span className="text-muted font-normal" style={{ fontSize: "0.75rem" }}>Dominant resource footprint</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter Row */}
      <div className="dashboard-section">
        <div className="card-saas bg-white p-3">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-md-4">
              <input
                type="text"
                className="form-control bg-light border-0"
                placeholder="🔍 Search facilities by name, type, city, state..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="col-md-2">
              <select className="form-select bg-light border-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="HEALTHY">Healthy</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH IMPACT">High Impact</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="col-md-2">
              <select className="form-select bg-light border-0" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="ALL">All Types</option>
                {FACILITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Utility Filter */}
            <div className="col-md-2">
              <select className="form-select bg-light border-0" value={utilityFilter} onChange={(e) => setUtilityFilter(e.target.value)}>
                <option value="ALL">All Utilities</option>
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
                <option value="Gas">Gas/Fuel</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="col-md-2">
              <select className="form-select bg-light border-0" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="RECENT">Recently Updated</option>
                <option value="CARBON">Carbon Footprint</option>
                <option value="NAME">Facility Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Stacked List */}
      {paginatedFacilities.length === 0 ? (
        <div className="card-saas bg-white p-5 text-center text-muted">
          <p className="mb-0">No monitored facilities match the selected filter query.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {paginatedFacilities.map((fac) => (
            <div key={fac.id} className="card-saas bg-white hover-saas-lift border rounded-4 shadow-sm p-4">
              {/* Header Row */}
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 pb-3 border-bottom mb-3">
                <div className="d-flex align-items-start gap-3">
                  <span className="fs-3">🏭</span>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h4 className="fw-bold text-dark mb-0" style={{ letterSpacing: "-0.02em" }}>{fac.name}</h4>
                      <span className="badge bg-secondary text-dark px-2.5 py-0.5" style={{ fontSize: "0.72rem" }}>
                        {fac.type}
                      </span>
                    </div>
                    <span className="text-muted small">📍 {fac.address}, {fac.city}, {fac.state}, {fac.country}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-4">
                  <span className="text-muted small">
                    Last updated: {formatDate(fac.updatedAt)}
                  </span>
                  <div className="d-flex align-items-center gap-1.5">
                    <span className={fac.healthStatus.dotClass} style={{ fontSize: "0.9rem" }}>●</span>
                    <span className="text-muted small fw-bold">{fac.healthStatus.label}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Columns horizontally aligned */}
              <div className="row g-2 text-center py-2 mb-3">
                {/* Carbon Emission */}
                <div className="col">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>CARBON EMISSION</span>
                  <h4 className="fw-bold text-danger mb-0">
                    {fac.carbonEmission > 0 ? `${fac.carbonEmission.toFixed(2)} kg CO₂e` : "0.00 kg CO₂e"}
                  </h4>
                  <span className="text-muted small" style={{ fontSize: "0.72rem" }}>{fac.pctShare}% of total</span>
                </div>

                {/* Bills */}
                <div className="col border-start">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>TOTAL UTILITY BILLS</span>
                  <h4 className="fw-bold text-dark mb-0">{fac.totalBills} Bills</h4>
                  <span className="text-muted small" style={{ fontSize: "0.72rem" }}>This period</span>
                </div>

                {/* AI Status */}
                <div className="col border-start">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>AI STATUS</span>
                  <h4 className="fw-bold text-dark mb-0">{fac.aiStatus}</h4>
                  <span className="text-muted small" style={{ fontSize: "0.72rem" }}>System check</span>
                </div>

                {/* Primary Utility */}
                <div className="col border-start">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>PRIMARY UTILITY</span>
                  <h4 className="fw-bold text-dark mb-0">{fac.dominantUtility}</h4>
                  <span className="text-muted small" style={{ fontSize: "0.72rem" }}>Dominant resource</span>
                </div>

                {/* Trend */}
                <div className="col border-start">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>TREND (MOM)</span>
                  <h4 className={`fw-bold mb-0 ${fac.trendDirection === "up" ? "text-danger" : "text-success"}`}>
                    {fac.trendDirection === "up" ? "▲" : fac.trendDirection === "down" ? "▼" : ""} {fac.trendPct > 0 ? `${fac.trendPct.toFixed(1)}%` : "Stable"}
                  </h4>
                  <span className="text-muted small" style={{ fontSize: "0.72rem" }}>vs last month</span>
                </div>
              </div>

              {/* AI Insight banner at bottom */}
              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3 border-start border-success border-4">
                <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                  <span className="fs-5">🤖</span>
                  <span className="text-muted small" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                    <strong>AI Insight:</strong> {fac.aiInsight}
                  </span>
                </div>
                <button 
                  className="btn btn-outline-success btn-sm border-2 fw-bold"
                  onClick={() => openFacilityDrawer(fac)}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-5 pt-3">
          <button
            className="btn btn-secondary-white btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ← Previous
          </button>
          <span className="small text-muted">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            className="btn btn-secondary-white btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next →
          </button>
        </div>
      )}

      {/* Right-Side Detailed Drawer Workspace */}
      {showDrawer && drawerFacility && (
        <div 
          className="position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg d-flex flex-column"
          style={{ width: "560px", zIndex: 1100, transition: "transform 250ms ease" }}
        >
          {/* Drawer Header */}
          <div className="p-4 bg-dark text-white d-flex justify-content-between align-items-start flex-shrink-0">
            <div>
              <span className="badge bg-lime text-dark text-uppercase fw-bold mb-2" style={{ fontSize: "0.68rem" }}>
                {drawerFacility.type}
              </span>
              <h3 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>{drawerFacility.name}</h3>
              <span className="text-white-50 small d-block">📍 {drawerFacility.address}, {drawerFacility.city}, {drawerFacility.state}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={drawerFacility.healthStatus.dotClass}>●</span>
              <span className="text-white font-semibold small">{drawerFacility.healthStatus.label}</span>
              <button 
                className="btn btn-close btn-close-white ms-3" 
                onClick={() => {
                  setShowDrawer(false);
                  setDrawerFacilityId(null);
                }}
              />
            </div>
          </div>

          {/* Drawer Tabs */}
          <div className="border-bottom bg-light flex-shrink-0">
            <nav className="nav nav-tabs px-3 border-0">
              <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "overview" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("overview")}>Overview</button>
              <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "bills" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("bills")}>Bills History</button>
              <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "insights" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("insights")}>AI Insights</button>
            </nav>
          </div>

          {/* Drawer Body Scroll Content */}
          <div className="p-4 flex-grow-1" style={{ overflowY: "auto" }}>
            
            {activeTab === "overview" && (
              <div>
                {/* Carbon curve summary metrics grid */}
                <h5 className="fw-bold text-dark mb-3">Facility Performance Overview</h5>
                <div className="row g-2 mb-4 text-center">
                  <div className="col-6 col-md-4">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Carbon Emissions</span>
                      <strong className="text-danger small">{drawerFacility.carbonEmission.toFixed(2)} kg</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Company Share</span>
                      <strong className="text-dark small">{drawerFacility.pctShare}%</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Processed Bills</span>
                      <strong className="text-dark small">{drawerFacility.totalBills} Bills</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 mt-2">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Primary Utility</span>
                      <strong className="text-dark small">{drawerFacility.dominantUtility}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 mt-2">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Billed Spend</span>
                      <strong className="text-dark small">{formatCurrency(drawerFacility.totalSpend)}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 mt-2">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>AI status</span>
                      <strong className="text-dark small">{drawerFacility.aiStatus}</strong>
                    </div>
                  </div>
                </div>

                {/* SVG Curve carbon trend indicator */}
                <h6 className="fw-bold text-dark mb-2">Carbon Trend (Last 6 Months)</h6>
                <div className="p-3 bg-light rounded-3 border mb-4">
                  {drawerCurveData ? (
                    <div>
                      <svg viewBox={`0 0 ${drawerCurveData.width} ${drawerCurveData.height}`} className="w-100 h-auto">
                        <defs>
                          <linearGradient id="drawerChartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#146E45" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#146E45" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={drawerCurveData.areaPath} fill="url(#drawerChartGrad)" />
                        <path d={drawerCurveData.linePath} fill="none" stroke="#146E45" strokeWidth="2.5" />
                        {drawerCurveData.points.map((pt, idx) => (
                          <g key={idx}>
                            <circle cx={pt.x} cy={pt.y} r="4" fill="#146E45" stroke="#FFFFFF" strokeWidth="1.5" />
                            <text x={pt.x} y={pt.y - 8} textAnchor="middle" fill="#1E293B" fontSize="8" fontWeight="700">
                              {pt.val.toFixed(0)}
                            </text>
                            <text x={pt.x} y="142" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="600">
                              {pt.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  ) : (
                    <div className="small text-muted py-4">
                      Not enough historical data.
                    </div>
                  )}
                </div>

                {/* AI recommendation insight */}
                <h5 className="fw-bold text-dark mb-2">AI Sustainability Insights</h5>
                <div className="p-3 bg-light rounded-3 border-start border-success border-4 mb-4 small">
                  {drawerFacility.aiInsight}
                </div>

                {/* Drawer actions workspace */}
                <h5 className="fw-bold text-dark mb-3">Quick Workspace Actions</h5>
                <div className="d-flex flex-column gap-2 mb-3">
                  <button className="btn btn-lime btn-sm shadow-sm py-2" onClick={() => navigate("/bills")}>
                    Upload Utility Bill
                  </button>
                  <button className="btn btn-secondary-white btn-sm py-2" onClick={() => navigate("/reports")}>
                    View Reports
                  </button>
                  <button className="btn btn-secondary-white btn-sm py-2" onClick={() => openEditModal(drawerFacility)}>
                    Edit Facility
                  </button>
                  <button className="btn btn-outline-danger btn-sm py-2 fw-bold" onClick={() => handleDelete(drawerFacility.id, drawerFacility.name)}>
                    Delete Facility
                  </button>
                </div>
              </div>
            )}

            {activeTab === "bills" && (
              <div>
                <h5 className="fw-bold text-dark mb-3">Facility Utility Bill History</h5>
                {drawerFacility.bills && drawerFacility.bills.length > 0 ? (
                  <div className="table-responsive border rounded-3 bg-white">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.825rem" }}>
                      <thead className="table-light">
                        <tr>
                          <th>Utility</th>
                          <th>Period</th>
                          <th>Spend</th>
                          <th>Emissions</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drawerFacility.bills.map((b) => (
                          <tr key={b.id} className="cursor-pointer" onClick={() => navigate("/bills")} title="Click to view details in AI Document Queue">
                            <td><span className="badge bg-secondary">{b.billType}</span></td>
                            <td>{b.billMonth} {b.billYear}</td>
                            <td>{formatCurrency(b.totalAmount)}</td>
                            <td>{b.carbonEmission ? `${b.carbonEmission.toFixed(2)} kg` : "0.00 kg"}</td>
                            <td><span className={getStatusBadgeClass(b.status)}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted small">No bill invoices found.</p>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div>
                <h5 className="fw-bold text-dark mb-3">AI Intelligence insights</h5>
                <div className="p-3 bg-light rounded-3 border mb-3 small">
                  <strong>Recommendation Details:</strong> {drawerFacility.aiInsight}
                </div>
                <div className="p-3 bg-light rounded-3 border small">
                  <strong>ESG Target Action:</strong> Review local parameters for {drawerFacility.dominantUtility} consumption limits to minimize facility emission shares.
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Backdrop overlay for right-side drawer */}
      {showDrawer && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100" 
          style={{ backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1090 }} 
          onClick={() => {
            setShowDrawer(false);
            setDrawerFacilityId(null);
          }}
        />
      )}

      {/* Facility form modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1200 }}>
          <div className="modal-dialog">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalMode === "create" ? "Add Facility Site" : "Edit Facility Site"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Facility Name *</label>
                    <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Type *</label>
                    <select className="form-select" name="type" value={form.type} onChange={handleChange} required>
                      <option value="">Select type...</option>
                      {FACILITY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Address *</label>
                    <input type="text" className="form-control" name="address" value={form.address} onChange={handleChange} required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">City *</label>
                      <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">State *</label>
                      <input type="text" className="form-control" name="state" value={form.state} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Country *</label>
                      <input type="text" className="form-control" name="country" value={form.country} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Postal Code (optional)</label>
                      <input type="text" className="form-control" name="postalCode" value={form.postalCode} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary-white" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime shadow-sm" disabled={submitting}>
                    {submitting ? "Saving..." : modalMode === "create" ? "Create Facility" : "Update Facility"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facilities;
