import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
  TrendingDown,
  X
} from "lucide-react";

import { getCache, setCache, invalidateCache } from "../hooks/useCache";
import { useDebounce } from "../hooks/useDebounce";
import {
  SkeletonPageHeader,
  SkeletonKpiGrid,
  SkeletonTableRows,
} from "../components/Skeleton";

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

  const cachedFacs  = getCache("facilities_list");
  const cachedBills = getCache("bills_list");

  // Core Data States
  const [facilities, setFacilities] = useState(cachedFacs || []);
  const [allBills, setAllBills]     = useState(cachedBills || []);
  const [loading, setLoading]       = useState(!cachedFacs);
  const [error, setError]           = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter States
  const [search, setSearch]         = useState("");
  const debouncedSearch             = useDebounce(search, 300);

  const [statusFilter, setStatusFilter]   = useState("ALL");
  const [typeFilter, setTypeFilter]       = useState("ALL");
  const [utilityFilter, setUtilityFilter] = useState("ALL");
  const [sortBy, setSortBy]               = useState("RECENT");

  // Pagination state
  const [currentPage, setCurrentPage]     = useState(1);
  const pageSize = 5;

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm]           = useState({ ...emptyForm });
  const [editId, setEditId]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Right-Side Sliding Drawer Workspace State
  const [drawerFacilityId, setDrawerFacilityId] = useState(null);
  const [showDrawer, setShowDrawer]             = useState(false);
  const [activeTab, setActiveTab]               = useState("overview");

  // Open drawer handler
  const openFacilityDrawer = (facility) => {
    setDrawerFacilityId(facility.id);
    setShowDrawer(true);
    setActiveTab("overview");
  };

  // Fetch facilities and bills from backend APIs
  const fetchFacilities = async (silent = false) => {
    if (!silent && !cachedFacs) setLoading(true);
    setError("");
    try {
      const [facRes, billsRes] = await Promise.all([
        facilityService.getAll(),
        billService.getAll()
      ]);
      if (facRes.data?.success) {
        const fetchedFacs = facRes.data.data || [];
        setFacilities(fetchedFacs);
        setCache("facilities_list", fetchedFacs, 5 * 60 * 1000);
      }
      if (billsRes.data?.success) {
        const fetchedBills = billsRes.data.data || [];
        setAllBills(fetchedBills);
        setCache("bills_list", fetchedBills, 2 * 60 * 1000);
      }
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || "Failed to sync facilities data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities(Boolean(cachedFacs));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    console.log("Button clicked");

    setModalMode("create");
    setForm({ ...emptyForm });
    setEditId(null);
    setFormError("");
    console.log("showModal before:", showModal);
    setShowModal(true);
    setTimeout(() => {
      console.log("Modal should now be open");
    }, 100);
    console.log("Current showModal:", showModal);
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
      const matchSearch =
        fac.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        fac.city.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        fac.type.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        fac.state.toLowerCase().includes(debouncedSearch.toLowerCase());

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
  }, [enrichedFacilities, debouncedSearch, statusFilter, typeFilter, utilityFilter, sortBy]);

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
      <div className="space-y-6">
        <SkeletonPageHeader />
        <SkeletonKpiGrid />
        <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-6 shadow-xs">
          <div className="h-5 w-48 bg-[#EEEDDF] rounded-lg mb-4" />
          <SkeletonTableRows count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dash-animate dash-animate-d1">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4D4C4]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152A38] tracking-tight">Monitored Facilities</h1>
          <p className="text-xs sm:text-sm font-medium text-[#7A8597] mt-1">
            Track corporate facility locations, carbon emissions, AI verification status, and decarbonization insights.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="px-4 py-2.5 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] font-bold text-xs rounded-xl hover:bg-[#EEEDDF] transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            onClick={fetchFacilities}
          >
            <RefreshCw className="w-4 h-4 text-[#2F5241]" />
            <span>Sync Facilities</span>
          </button>
          <button
            className="px-5 py-2.5 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs rounded-full shadow-[0_4px_12px_rgba(47,82,65,0.25)] hover:bg-[#234035] hover:shadow-[0_6px_16px_rgba(47,82,65,0.35)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-3">
          <Zap className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#EAF2ED] border border-[#2F5241]/20 text-[#2F5241] text-xs font-extrabold flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TOP SUMMARY KPI ROW — 5 Distinct Cards matching Dashboard Theme */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Facilities */}
        <div className="bg-[#F7F6EE] border border-[#D4D4C4]/60 rounded-[22px] p-4 shadow-[0_2px_8px_rgba(21,42,56,0.04)] hover:border-[#2F5241]/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider">Total Sites</span>
            <div className="w-7 h-7 rounded-xl bg-[#EAF2ED] flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#2F5241]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#152A38]">{summaryMetrics.totalFacilities}</div>
            <span className="text-[10px] font-semibold text-[#7A8597] mt-0.5 block">Monitored locations</span>
          </div>
        </div>

        {/* Total Carbon */}
        <div className="bg-[#F7F6EE] border border-[#D4D4C4]/60 rounded-[22px] p-4 shadow-[0_2px_8px_rgba(21,42,56,0.04)] hover:border-[#2F5241]/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider">Total Footprint</span>
            <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#EF4444]">
              {summaryMetrics.totalCarbon > 0 ? `${summaryMetrics.totalCarbon.toFixed(1)} kg` : "0.0 kg"}
            </div>
            <span className="text-[10px] font-semibold text-[#7A8597] mt-0.5 block">Scope 1 & 2 output</span>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-[#F7F6EE] border border-[#D4D4C4]/60 rounded-[22px] p-4 shadow-[0_2px_8px_rgba(21,42,56,0.04)] hover:border-[#2F5241]/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider">Utility Invoices</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#152A38]">{summaryMetrics.totalBills}</div>
            <span className="text-[10px] font-semibold text-[#7A8597] mt-0.5 block">Processed bills</span>
          </div>
        </div>

        {/* Highest Site */}
        <div className="bg-[#F7F6EE] border border-[#D4D4C4]/60 rounded-[22px] p-4 shadow-[0_2px_8px_rgba(21,42,56,0.04)] hover:border-[#2F5241]/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider">Peak Site</span>
            <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <div>
            <div className="text-base font-extrabold text-[#EF4444] truncate" title={summaryMetrics.highestSite}>
              {summaryMetrics.highestSite}
            </div>
            <span className="text-[10px] font-semibold text-[#7A8597] mt-0.5 block">
              {summaryMetrics.highestEmission > 0 ? `${summaryMetrics.highestEmission.toFixed(1)} kg` : "0.0 kg"}
            </span>
          </div>
        </div>

        {/* Primary Source */}
        <div className="col-span-2 sm:col-span-1 bg-[#F7F6EE] border border-[#D4D4C4]/60 rounded-[22px] p-4 shadow-[0_2px_8px_rgba(21,42,56,0.04)] hover:border-[#2F5241]/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider">Primary Utility</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <PieChart className="w-3.5 h-3.5 text-[#1565C0]" />
            </div>
          </div>
          <div>
            <div className="text-base font-extrabold text-[#1565C0]">{summaryMetrics.primaryUtility}</div>
            <span className="text-[10px] font-semibold text-[#7A8597] mt-0.5 block">Dominant resource</span>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS BAR */}
      <div className="bg-[#F7F6EE] border border-[#D4D4C4]/70 rounded-[22px] p-4 shadow-[0_2px_8px_rgba(21,42,56,0.04)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by facility name, type, city, or state..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-4 bg-[#EEEDDF] border border-[#D4D4C4] rounded-full text-xs font-medium text-[#152A38] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F5241] focus:ring-4 focus:ring-[#2F5241]/10 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-bold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer"
            >
              <option value="ALL">All Health Statuses</option>
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
              className="w-full h-10 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-bold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer"
            >
              <option value="ALL">All Facility Types</option>
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
              className="w-full h-10 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-bold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer"
            >
              <option value="RECENT">Recently Updated</option>
              <option value="CARBON">Carbon Footprint</option>
              <option value="NAME">Facility Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* FACILITIES STACKED CARDS */}
      {paginatedFacilities.length === 0 ? (
        <div className="bg-[#F7F6EE] border border-[#D4D4C4]/70 rounded-[24px] p-12 text-center text-xs font-bold text-[#7A8597]">
          No monitored facilities match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedFacilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-[#F7F6EE] border border-[#D4D4C4]/70 rounded-[24px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(21,42,56,0.04)] hover:border-[#2F5241]/40 transition-all duration-200 space-y-4"
            >
              {/* Card Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-[#D4D4C4]/60">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#EAF2ED] text-[#2F5241] border border-[#2F5241]/15 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3
                        onClick={() => navigate(`/facilities/${fac.id}`)}
                        className="text-lg font-extrabold text-[#152A38] hover:text-[#2F5241] transition-colors cursor-pointer"
                      >
                        {fac.name}
                      </h3>
                      <span className="text-[10px] font-extrabold bg-[#EEEDDF] border border-[#D4D4C4] text-[#2F5241] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {fac.type}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#7A8597] flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{fac.address}, {fac.city}, {fac.state}, {fac.country}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] font-semibold text-[#7A8597]">Updated: {formatDate(fac.updatedAt)}</span>
                  <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#2F5241] text-[11px] font-extrabold flex items-center gap-1.5 border border-[#2F5241]/10">
                    <span className="w-2 h-2 rounded-full bg-[#2F5241]" />
                    {fac.healthStatus.label}
                  </span>
                </div>
              </div>

              {/* Metrics Columns inside restful background pill */}
              <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {/* Carbon Emission */}
                <div>
                  <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block mb-0.5">CARBON EMISSION</span>
                  <div className="text-sm sm:text-base font-extrabold text-[#EF4444]">
                    {fac.carbonEmission > 0 ? `${fac.carbonEmission.toFixed(1)} kg` : "0.0 kg"}
                  </div>
                  <span className="text-[10px] font-semibold text-[#7A8597]">{fac.pctShare}% of total</span>
                </div>

                {/* Bills */}
                <div>
                  <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block mb-0.5">TOTAL BILLS</span>
                  <div className="text-sm sm:text-base font-extrabold text-[#152A38]">{fac.totalBills} Invoices</div>
                  <span className="text-[10px] font-semibold text-[#7A8597]">This period</span>
                </div>

                {/* AI Status */}
                <div>
                  <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block mb-0.5">AI STATUS</span>
                  <div className="text-sm sm:text-base font-extrabold text-[#2F5241]">{fac.aiStatus}</div>
                  <span className="text-[10px] font-semibold text-[#7A8597]">System check</span>
                </div>

                {/* Primary Utility */}
                <div>
                  <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block mb-0.5">PRIMARY UTILITY</span>
                  <div className="text-sm sm:text-base font-extrabold text-[#1565C0]">{fac.dominantUtility}</div>
                  <span className="text-[10px] font-semibold text-[#7A8597]">Dominant resource</span>
                </div>

                {/* Trend */}
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-extrabold text-[#7A8597] uppercase tracking-wider block mb-0.5">TREND (MOM)</span>
                  <div className={`text-sm sm:text-base font-extrabold ${fac.trendDirection === "up" ? "text-[#EF4444]" : "text-[#2F5241]"}`}>
                    {fac.trendDirection === "up" ? "▲" : fac.trendDirection === "down" ? "▼" : ""} {fac.trendPct > 0 ? `${fac.trendPct.toFixed(1)}%` : "Stable"}
                  </div>
                  <span className="text-[10px] font-semibold text-[#7A8597]">vs last month</span>
                </div>
              </div>

              {/* AI INSIGHT BANNER & ACTION BUTTONS */}
              <div className="bg-[#EAF2ED] border border-[#2F5241]/20 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-7 h-7 rounded-xl bg-[#2F5241] text-[#E4E5DB] flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-[#152A38] leading-relaxed mb-0">
                    <strong className="text-[#2F5241] font-extrabold">AI ESG Insight:</strong> {fac.aiInsight}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    className="px-3.5 py-2 bg-[#EEEDDF] border border-[#D4D4C4] text-[#152A38] font-extrabold text-xs rounded-xl hover:bg-[#EEEDDF]/80 transition-all cursor-pointer active:scale-95"
                    onClick={() => openFacilityDrawer(fac)}
                  >
                    View Details →
                  </button>
                  <button
                    className="px-3.5 py-2 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#234035] transition-all cursor-pointer active:scale-95"
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
        <div className="flex items-center justify-between pt-2">
          <button
            className="px-4 py-2 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] font-extrabold text-xs rounded-xl disabled:opacity-50 cursor-pointer hover:bg-[#EEEDDF]"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ← Previous
          </button>
          <span className="text-xs font-semibold text-[#7A8597]">
            Page <strong className="text-[#152A38]">{currentPage}</strong> of <strong className="text-[#152A38]">{totalPages}</strong>
          </span>
          <button
            className="px-4 py-2 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] font-extrabold text-xs rounded-xl disabled:opacity-50 cursor-pointer hover:bg-[#EEEDDF]"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next →
          </button>
        </div>
      )}

      {/* MODAL WORKSPACE */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-2xl rounded-[24px] bg-[#F7F6EE] border border-[#D4D4C4] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4C4]/60">
                <h2 className="text-base sm:text-lg font-extrabold text-[#152A38]">
                  {modalMode === "create" ? "Add New Monitored Facility" : "Edit Monitored Facility"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#152A38] rounded-xl hover:bg-[#EEEDDF] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-xs font-bold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-[#152A38]">
                  <div className="sm:col-span-2">
                    <label className="block mb-1 font-extrabold">Facility Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Corporate Head Office"
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">Facility Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer"
                    >
                      <option value="">Select Type</option>
                      {FACILITY_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. 400001"
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1 font-extrabold">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 100 Tech Park Way"
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">State</label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1 font-extrabold">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#D4D4C4]/60">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D4D4C4] bg-[#EEEDDF] text-[#152A38] font-bold text-xs hover:bg-[#EEEDDF]/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs shadow-xs hover:bg-[#234035] cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Save Facility"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* RIGHT-SIDE SLIDING FACILITY DETAILS DRAWER WORKSPACE */}
      {showDrawer &&
        drawerFacility &&
        createPortal(
          <div className="fixed inset-0 z-[100] overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
            {/* Backdrop overlay dismiss button */}
            <div
              className="absolute inset-0 bg-transparent cursor-pointer"
              onClick={() => setShowDrawer(false)}
            />

            {/* Sliding Panel Workspace */}
            <div className="relative z-10 w-full sm:w-[500px] md:w-[600px] lg:w-[640px] bg-[#F7F6EE] h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#D4D4C4] transition-all duration-300">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#D4D4C4] flex items-center justify-between bg-[#EEEDDF] shrink-0 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#EAF2ED] text-[#2F5241] flex items-center justify-center font-bold border border-[#2F5241]/15 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-extrabold text-[#152A38] truncate">{drawerFacility.name}</h2>
                    <p className="text-xs font-semibold text-[#7A8597] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                      <span className="truncate">{drawerFacility.address}, {drawerFacility.city}, {drawerFacility.state}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-[#EAF2ED] text-[#2F5241] text-[10px] font-extrabold uppercase border border-[#2F5241]/10 hidden sm:inline-block">
                    {drawerFacility.type}
                  </span>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1.5 text-[#94A3B8] hover:text-[#152A38] hover:bg-[#EEEDDF] rounded-xl border border-[#D4D4C4] transition-colors cursor-pointer"
                    title="Close Workspace"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center border-b border-[#D4D4C4] px-4 sm:px-6 bg-[#EEEDDF]/60 gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-2.5 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                    activeTab === "overview"
                      ? "border-[#2F5241] text-[#2F5241]"
                      : "border-transparent text-[#7A8597] hover:text-[#152A38]"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("bills")}
                  className={`py-2.5 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                    activeTab === "bills"
                      ? "border-[#2F5241] text-[#2F5241]"
                      : "border-transparent text-[#7A8597] hover:text-[#152A38]"
                  }`}
                >
                  Utility Bills ({drawerFacility.totalBills})
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    {/* Summary KPI Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                        <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">CARBON EMISSION</span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#EF4444] mt-0.5 block truncate">
                          {drawerFacility.carbonEmission > 0 ? `${drawerFacility.carbonEmission.toFixed(1)} kg` : "0.0 kg"}
                        </span>
                      </div>
                      <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                        <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">TOTAL INVOICES</span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#152A38] mt-0.5 block truncate">
                          {drawerFacility.totalBills} Bills
                        </span>
                      </div>
                      <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                        <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">PRIMARY UTILITY</span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#1565C0] mt-0.5 block truncate">
                          {drawerFacility.dominantUtility}
                        </span>
                      </div>
                      <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                        <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">HEALTH STATUS</span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#2F5241] mt-0.5 block truncate">
                          {drawerFacility.healthStatus.label}
                        </span>
                      </div>
                    </div>

                    {/* Address & Facility Metadata */}
                    <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-4 space-y-3">
                      <h3 className="text-[11px] font-extrabold text-[#152A38] uppercase tracking-wider">Facility Metadata</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[#7A8597] block font-semibold">Full Address:</span>
                          <span className="font-extrabold text-[#152A38] break-words">{drawerFacility.address}</span>
                        </div>
                        <div>
                          <span className="text-[#7A8597] block font-semibold">City / State:</span>
                          <span className="font-extrabold text-[#152A38] break-words">{drawerFacility.city}, {drawerFacility.state}</span>
                        </div>
                        <div>
                          <span className="text-[#7A8597] block font-semibold">Country / Zip:</span>
                          <span className="font-extrabold text-[#152A38]">{drawerFacility.country} {drawerFacility.postalCode || ""}</span>
                        </div>
                        <div>
                          <span className="text-[#7A8597] block font-semibold">Facility Type:</span>
                          <span className="font-extrabold text-[#152A38]">{drawerFacility.type}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI ESG Insight Banner */}
                    <div className="bg-[#EAF2ED] border border-[#2F5241]/20 rounded-2xl p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-[#2F5241]">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">AI ESG Decarbonization Insight</span>
                      </div>
                      <p className="text-xs font-semibold text-[#152A38] leading-relaxed">
                        {drawerFacility.aiInsight}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "bills" && (
                  <div className="space-y-3">
                    {(!drawerFacility.bills || drawerFacility.bills.length === 0) ? (
                      <div className="p-8 text-center bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl text-xs font-bold text-[#7A8597]">
                        No utility invoices uploaded yet for this site.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {drawerFacility.bills.map((b) => (
                          <div key={b.id} className="p-3.5 bg-[#EEEDDF] border border-[#DDDDD0] rounded-xl flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-extrabold text-[#152A38] block truncate">{b.billType} — {b.billMonth} {b.billYear}</span>
                              <span className="text-[10px] text-[#7A8597] font-semibold block mt-0.5">Uploaded {formatDate(b.createdAt)}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${getStatusBadgeClass(b.status)}`}>
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#D4D4C4] bg-[#EEEDDF] flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => openEditModal(drawerFacility)}
                  className="px-4 py-2 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] font-extrabold text-xs rounded-xl hover:bg-[#EEEDDF] cursor-pointer transition-all active:scale-95"
                >
                  Edit Facility
                </button>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="px-5 py-2 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs rounded-xl hover:bg-[#234035] cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  Close Workspace
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Facilities;
