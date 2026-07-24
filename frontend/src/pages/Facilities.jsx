import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { facilityService } from "../services/facilityService";
import { billService } from "../services/billService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  Trash2,
  Edit,
  Upload,
  PieChart,
  ShieldCheck,
  TrendingUp,
  TrendingDown
} from "lucide-react";

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
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Right-Side Sliding Drawer Workspace State
  const [drawerFacilityId, setDrawerFacilityId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Open drawer handler
  const openFacilityDrawer = (facility) => {
    setDrawerFacilityId(facility.id);
    setShowDrawer(true);
    setActiveTab("overview");
  };

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

  // Enriched facilities from real backend aggregated data
  const enrichedFacilities = useMemo(() => {
    return facilities.map((fac) => {
      const carbonEmission = fac.carbonEmission ?? 0;
      const totalBills = fac.totalBills ?? fac.billsCount ?? 0;
      const totalSpend = fac.totalSpend ?? fac.totalAmount ?? 0;
      const dominantUtility = fac.dominantUtility || fac.primaryUtility || "Electricity";
      const aiStatus = fac.aiStatus || "No Bills";
      const pctShare = fac.pctShare || "0.0";
      const trendPct = fac.trendPct ?? 0;
      const trendDirection = fac.trendDirection || "stable";
      const healthStatus = fac.healthStatus || { label: "Healthy", dotClass: "text-emerald-500", color: "green" };
      const aiInsight = fac.aiInsight || (totalBills === 0 ? "No utility bills uploaded yet for this site." : "Electricity usage remained stable.");

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
        bills: fac.bills || [],
        updatedAt: fac.updatedAt || fac.createdAt
      };
    });
  }, [facilities]);

  // Derived totals for header summary
  const summaryMetrics = useMemo(() => {
    const totalFacilities = enrichedFacilities.length;
    const totalCarbon = enrichedFacilities.reduce((sum, f) => sum + (f.carbonEmission || 0), 0);
    const totalBills = enrichedFacilities.reduce((sum, f) => sum + (f.totalBills || 0), 0);

    const sortedSites = [...enrichedFacilities].sort((a, b) => (b.carbonEmission || 0) - (a.carbonEmission || 0));
    const highestSite = sortedSites[0]?.name || "N/A";
    const highestEmission = sortedSites[0]?.carbonEmission || 0;

    // Determine primary utility source based on emissions share
    const utilityEmissions = {};
    enrichedFacilities.forEach((f) => {
      if (f.utilityBreakdown && Array.isArray(f.utilityBreakdown)) {
        f.utilityBreakdown.forEach((u) => {
          utilityEmissions[u.type] = (utilityEmissions[u.type] || 0) + (u.carbonEmission || 0);
        });
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
  }, [enrichedFacilities]);

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
      result.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
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

  // Active drawer facility recalculation
  const drawerFacility = useMemo(() => {
    if (!drawerFacilityId) return null;
    return enrichedFacilities.find((f) => f.id === drawerFacilityId) || null;
  }, [drawerFacilityId, enrichedFacilities]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] py-12 text-[#64748B]">
        <RefreshCw className="w-9 h-9 animate-spin text-[#2E7D32] mb-4" />
        <p className="text-base font-bold">Syncing monitored facilities data from backend...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Monitored Facilities</h1>
          <p className="text-sm font-medium text-[#64748B] mt-1">Track company facility locations, carbon emissions, AI status, and decarbonization insights.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-xs rounded-2xl hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 shadow-xs cursor-pointer" 
            onClick={fetchFacilities}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            className="px-5 py-2.5 bg-[#2E7D32] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#2E7D32]/25 hover:bg-[#256829] transition-colors flex items-center gap-2 cursor-pointer" 
            onClick={openCreateModal}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
          <Zap className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#2E7D32] text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TOP SUMMARY KPI ROW */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
          {/* Total Facilities */}
          <div className="px-3 py-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Total Facilities</span>
            <div className="text-2xl font-extrabold text-[#1E293B]">{summaryMetrics.totalFacilities}</div>
            <span className="text-xs font-semibold text-[#94A3B8] mt-1 block">Monitored sites</span>
          </div>

          {/* Total Carbon */}
          <div className="px-3 py-2 pt-4 md:pt-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Total Carbon Emissions</span>
            <div className="text-2xl font-extrabold text-[#EF4444]">
              {summaryMetrics.totalCarbon > 0 ? `${summaryMetrics.totalCarbon.toFixed(2)} kg` : "0.00 kg"}
            </div>
            <span className="text-xs font-semibold text-[#94A3B8] mt-1 block">Scope 1 & 2 output</span>
          </div>

          {/* Total Bills */}
          <div className="px-3 py-2 pt-4 md:pt-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Total Utility Invoices</span>
            <div className="text-2xl font-extrabold text-[#1E293B]">{summaryMetrics.totalBills}</div>
            <span className="text-xs font-semibold text-[#94A3B8] mt-1 block">Uploaded invoices</span>
          </div>

          {/* Highest Site */}
          <div className="px-3 py-2 pt-4 md:pt-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Highest Emission Site</span>
            <div className="text-2xl font-extrabold text-[#EF4444] truncate px-1" title={summaryMetrics.highestSite}>
              {summaryMetrics.highestSite}
            </div>
            <span className="text-xs font-semibold text-[#94A3B8] mt-1 block">
              {summaryMetrics.highestEmission > 0 ? `${summaryMetrics.highestEmission.toFixed(1)} kg` : "0.0 kg"}
            </span>
          </div>

          {/* Primary Source */}
          <div className="px-3 py-2 pt-4 md:pt-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Primary Utility Source</span>
            <div className="text-2xl font-extrabold text-[#1565C0]">{summaryMetrics.primaryUtility}</div>
            <span className="text-xs font-semibold text-[#94A3B8] mt-1 block">Dominant resource</span>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS BAR */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search facilities by name, type, city, state..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-11 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="ALL">All Status</option>
              <option value="HEALTHY">Healthy</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH IMPACT">High Impact</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="ALL">All Types</option>
              {FACILITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="RECENT">Recently Updated</option>
              <option value="CARBON">Carbon Footprint</option>
              <option value="NAME">Facility Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* FACILITIES STACKED CARDS (Spacious, bold titles, readable text) */}
      {paginatedFacilities.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center text-sm font-medium text-[#94A3B8]">
          No monitored facilities match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedFacilities.map((fac) => (
            <div 
              key={fac.id} 
              className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs hover:border-[#2E7D32]/40 transition-all space-y-6"
            >
              {/* Card Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 
                        onClick={() => navigate(`/facilities/${fac.id}`)}
                        className="text-xl font-extrabold text-[#1E293B] hover:text-[#2E7D32] transition-colors cursor-pointer"
                      >
                        {fac.name}
                      </h3>
                      <span className="text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-3 py-1 rounded-full uppercase">
                        {fac.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#64748B] flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-[#94A3B8]" />
                      <span>{fac.address}, {fac.city}, {fac.state}, {fac.country}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="text-xs font-semibold text-[#94A3B8]">Updated: {formatDate(fac.updatedAt)}</span>
                  <span className="px-3 py-1.5 rounded-full bg-[#E7F3E8] text-[#2E7D32] text-xs font-extrabold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                    {fac.healthStatus.label}
                  </span>
                </div>
              </div>

              {/* Metrics Columns horizontally aligned inside restful background pill */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                {/* Carbon Emission */}
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">CARBON EMISSION</span>
                  <div className="text-base font-extrabold text-[#EF4444]">
                    {fac.carbonEmission > 0 ? `${fac.carbonEmission.toFixed(2)} kg` : "0.00 kg"}
                  </div>
                  <span className="text-xs font-medium text-[#94A3B8]">{fac.pctShare}% of total</span>
                </div>

                {/* Bills */}
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">TOTAL BILLS</span>
                  <div className="text-base font-extrabold text-[#1E293B]">{fac.totalBills} Invoices</div>
                  <span className="text-xs font-medium text-[#94A3B8]">This period</span>
                </div>

                {/* AI Status */}
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">AI STATUS</span>
                  <div className="text-base font-extrabold text-[#2E7D32]">{fac.aiStatus}</div>
                  <span className="text-xs font-medium text-[#94A3B8]">System check</span>
                </div>

                {/* Primary Utility */}
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">PRIMARY UTILITY</span>
                  <div className="text-base font-extrabold text-[#1565C0]">{fac.dominantUtility}</div>
                  <span className="text-xs font-medium text-[#94A3B8]">Dominant resource</span>
                </div>

                {/* Trend */}
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">TREND (MOM)</span>
                  <div className={`text-base font-extrabold ${fac.trendDirection === "up" ? "text-[#EF4444]" : "text-[#2E7D32]"}`}>
                    {fac.trendDirection === "up" ? "▲" : fac.trendDirection === "down" ? "▼" : ""} {fac.trendPct > 0 ? `${fac.trendPct.toFixed(1)}%` : "Stable"}
                  </div>
                  <span className="text-xs font-medium text-[#94A3B8]">vs last month</span>
                </div>
              </div>

              {/* AI INSIGHT BANNER & ACTION BUTTONS */}
              <div className="bg-[#E7F3E8] border border-[#2E7D32]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-[#1E293B] leading-relaxed mb-0">
                    <strong className="text-[#2E7D32] font-extrabold">AI ESG Insight:</strong> {fac.aiInsight}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button 
                    className="px-4 py-2.5 bg-white border border-[#2E7D32] text-[#2E7D32] font-extrabold text-xs rounded-xl hover:bg-[#E7F3E8] transition-colors cursor-pointer"
                    onClick={() => openFacilityDrawer(fac)}
                  >
                    View Details →
                  </button>
                  <button
                    className="px-4 py-2.5 bg-[#2E7D32] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#256829] transition-colors cursor-pointer"
                    onClick={() => navigate(`/facilities/${fac.id}`)}
                  >
                    Full Page →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-xs rounded-xl disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ← Previous
          </button>
          <span className="text-xs font-semibold text-[#64748B]">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-xs rounded-xl disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Facilities;
