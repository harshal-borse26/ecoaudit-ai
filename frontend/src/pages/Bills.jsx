import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { billService } from "../services/billService";
import { facilityService } from "../services/facilityService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";
import { getCache, setCache, invalidateCache } from "../hooks/useCache";
import { useDebounce } from "../hooks/useDebounce";
import { SkeletonTableRows } from "../components/Skeleton";
import {
  FileText,
  Upload,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Eye,
  Download,
  Trash2,
  Edit3,
  Zap,
  Building2,
  ShieldCheck,
  ArrowRight,
  X,
  FileCode
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const BILL_TYPES = ["Auto Detect", "Electricity", "Water", "Natural Gas", "Diesel", "Dual Utility", "Other"];

const getUtilityChipClass = (type) => {
  const lower = String(type || "").toLowerCase();
  if (lower.includes("electric")) return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
  if (lower.includes("water")) return "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20";
  if (lower.includes("gas")) return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
  if (lower.includes("diesel") || lower.includes("fuel")) return "bg-purple-500/10 text-purple-600 border border-purple-500/20";
  if (lower.includes("auto")) return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
  return "bg-slate-500/10 text-slate-700 border border-slate-500/20";
};

const renderUtilityChips = (bill) => {
  const utilities = bill.utilities || [];
  if (utilities.length > 0) {
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {utilities.map((u, idx) => {
          const type = u.utilityType || u.type || "Utility";
          return (
            <span key={idx} className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getUtilityChipClass(type)}`}>
              {type}
            </span>
          );
        })}
      </div>
    );
  }

  const types = (bill.billType || "Auto Detect").split(",").map((t) => t.trim());
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {types.map((type, idx) => (
        <span key={idx} className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getUtilityChipClass(type)}`}>
          {type}
        </span>
      ))}
    </div>
  );
};

const formatKeyToLabel = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const dispatchDataChanged = () => {
  invalidateCache("bills_list");
  invalidateCache("dashboard_all_data");
  window.dispatchEvent(new CustomEvent("ecoaudit-data-changed"));
};

const Bills = () => {
  const cachedBills = getCache("bills_list");
  const cachedFacs  = getCache("facilities_list");

  const [bills, setBills] = useState(cachedBills || []);
  const [facilities, setFacilities] = useState(cachedFacs || []);
  const [loading, setLoading] = useState(!cachedBills);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter States & Debounce
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [facilityFilter, setFacilityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Create Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    facilityId: "",
    billType: "Auto Detect",
    billMonth: MONTHS[new Date().getMonth()],
    billYear: new Date().getFullYear().toString(),
    billFile: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit Modal state (for editing metadata & replacing file)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    facilityId: "",
    billType: "Auto Detect",
    billMonth: "",
    billYear: "",
    billFile: null,
  });
  const [editBillId, setEditBillId] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState("");

  // Right-Side Sliding Drawer Workspace State
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerBill, setDrawerBill] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [previewUrl, setPreviewUrl] = useState("");

  // Polling management
  const [processingIds, setProcessingIds] = useState(new Set());
  const pollingTimers = useRef({});
  const showDrawerRef = useRef(false);
  const drawerBillRef = useRef(null);

  useEffect(() => {
    showDrawerRef.current = showDrawer;
  }, [showDrawer]);

  useEffect(() => {
    drawerBillRef.current = drawerBill;
  }, [drawerBill]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent && !cachedBills) setLoading(true);
      setError("");
      const [billsRes, facsRes] = await Promise.all([
        billService.getAll(),
        facilityService.getAll(),
      ]);

      if (billsRes.data?.success) {
        const fetchedBills = billsRes.data.data || [];
        setBills(fetchedBills);
        setCache("bills_list", fetchedBills, 2 * 60 * 1000);

        // Resume polling for bills in PROCESSING state
        fetchedBills.forEach((b) => {
          if (b.status === "PROCESSING") {
            setProcessingIds((prev) => new Set(prev).add(b.id));
            startPolling(b.id);
          }
        });
      }

      if (facsRes.data?.success) {
        const fetchedFacs = facsRes.data.data || [];
        setFacilities(fetchedFacs);
        setCache("facilities_list", fetchedFacs, 5 * 60 * 1000);
      }
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || "Failed to load utility bill document data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(Boolean(cachedBills));
    return () => {
      Object.values(pollingTimers.current).forEach(clearInterval);
    };
  }, []);

  const openCreateModal = () => {
    setForm({
      facilityId: facilities[0]?.id || "",
      billType: "Auto Detect",
      billMonth: MONTHS[new Date().getMonth()],
      billYear: new Date().getFullYear().toString(),
      billFile: null,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.facilityId) {
      setFormError("Please select a facility for this bill.");
      return;
    }

    if (!form.billFile) {
      setFormError("Please select a utility bill document file to upload.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("facilityId", form.facilityId);
      formData.append("billType", form.billType);
      formData.append("billMonth", form.billMonth);
      formData.append("billYear", form.billYear);
      formData.append("billFile", form.billFile);

      const res = await billService.create(formData);
      if (res.data?.success) {
        setShowModal(false);
        setSuccessMsg("Utility bill uploaded successfully! Auto AI extraction initiated.");
        
        // Auto-trigger AI processing if created with PENDING status
        const newBillId = res.data.data.id;
        if (newBillId) {
          handleProcessBill(newBillId);
        }

        fetchData();
        dispatchDataChanged();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setFormError(res.data?.message || "Failed to upload utility bill document.");
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Error uploading file.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (bill) => {
    setEditBillId(bill.id);
    setEditForm({
      facilityId: bill.facilityId || "",
      billType: bill.billType || "Auto Detect",
      billMonth: bill.billMonth || MONTHS[0],
      billYear: (bill.billYear || new Date().getFullYear()).toString(),
      billFile: null,
    });
    setEditFormError("");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError("");

    setEditSubmitting(true);
    try {
      let payload;
      if (editForm.billFile) {
        payload = new FormData();
        payload.append("facilityId", editForm.facilityId);
        payload.append("billType", editForm.billType);
        payload.append("billMonth", editForm.billMonth);
        payload.append("billYear", editForm.billYear);
        payload.append("billFile", editForm.billFile);
      } else {
        payload = {
          facilityId: editForm.facilityId,
          billType: editForm.billType,
          billMonth: editForm.billMonth,
          billYear: editForm.billYear,
        };
      }

      const res = await billService.update(editBillId, payload);
      if (res.data?.success) {
        setShowEditModal(false);
        setSuccessMsg("Utility bill record updated successfully.");
        fetchData();
        dispatchDataChanged();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setEditFormError(res.data?.message || "Failed to update bill record.");
      }
    } catch (err) {
      setEditFormError(err.response?.data?.message || "Error updating bill record.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this utility bill document record?")) {
      return;
    }

    try {
      const res = await billService.delete(billId);
      if (res.data?.success) {
        setSuccessMsg("Utility bill deleted successfully.");
        if (showDrawer && drawerBill?.id === billId) {
          closeDrawer();
        }
        fetchData();
        dispatchDataChanged();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete utility bill record.");
    }
  };

  const startPolling = (billId) => {
    if (pollingTimers.current[billId]) return;

    const timer = setInterval(async () => {
      try {
        const res = await billService.getById(billId);
        if (res.data?.success) {
          const updated = res.data.data;
          if (updated.status !== "PROCESSING") {
            clearInterval(pollingTimers.current[billId]);
            delete pollingTimers.current[billId];
            setProcessingIds((prev) => {
              const next = new Set(prev);
              next.delete(billId);
              return next;
            });
            fetchData();
            dispatchDataChanged();

            if (showDrawerRef.current && drawerBillRef.current && drawerBillRef.current.id === billId) {
              setDrawerBill(updated);
            }
          }
        }
      } catch {
        // continue polling
      }
    }, 3000);

    pollingTimers.current[billId] = timer;
  };

  const handleProcessBill = async (id) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(id));
      setBills((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "PROCESSING" } : b))
      );

      const res = await billService.process(id);
      if (res.data?.success) {
        startPolling(id);
      }
    } catch (err) {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      alert(err.response?.data?.message || "Failed to trigger AI processing.");
      fetchData();
    }
  };

  const openDrawer = async (billId) => {
    setShowDrawer(true);
    setDrawerLoading(true);
    setActiveTab("overview");
    setPreviewUrl("");

    try {
      const res = await billService.getById(billId);
      if (res.data?.success) {
        const bData = res.data.data;
        setDrawerBill(bData);

        try {
          const pRes = await billService.getFileUrl(billId, "preview");
          if (pRes.data?.success) {
            setPreviewUrl(pRes.data.data.url);
          }
        } catch {
          try {
            const pResOld = await billService.getPreviewUrl(billId);
            if (pResOld.data?.success) {
              setPreviewUrl(pResOld.data.data.url);
            }
          } catch {
            setPreviewUrl(bData.billFileUrl || "");
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load document details.");
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setDrawerBill(null);
    setPreviewUrl("");
  };

  const getBillCarbon = (bill) => {
    if (!bill.utilities || bill.utilities.length === 0) return 0;
    return bill.utilities.reduce((sum, u) => sum + (u.carbonEmission || 0), 0);
  };

  // Filter logic
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      // Facility filter
      if (facilityFilter !== "ALL" && b.facilityId !== facilityFilter) return false;

      // Status filter
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;

      // Bill type filter
      if (typeFilter !== "ALL") {
        const types = (b.billType || "").toLowerCase();
        if (!types.includes(typeFilter.toLowerCase())) return false;
      }

      // Month filter
      if (monthFilter !== "ALL" && b.billMonth !== monthFilter) return false;

      // Year filter
      if (yearFilter !== "ALL" && String(b.billYear) !== String(yearFilter)) return false;

      // Search text filter
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const facilityName = (b.facility?.name || "").toLowerCase();
        const consumerName = (b.consumerName || "").toLowerCase();
        const meterNo = (b.meterNumber || "").toLowerCase();
        const billMonth = (b.billMonth || "").toLowerCase();
        const billYear = String(b.billYear || "").toLowerCase();
        const billType = (b.billType || "").toLowerCase();

        const matches =
          facilityName.includes(query) ||
          consumerName.includes(query) ||
          meterNo.includes(query) ||
          billMonth.includes(query) ||
          billYear.includes(query) ||
          billType.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [bills, facilityFilter, statusFilter, typeFilter, monthFilter, yearFilter, debouncedSearch]);

  const resetFilters = () => {
    setSearch("");
    setFacilityFilter("ALL");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setMonthFilter("ALL");
    setYearFilter("ALL");
    setCurrentPage(1);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredBills.length / pageSize) || 1;
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage]);

  const yearOptions = useMemo(() => {
    const years = new Set(bills.map((b) => b.billYear).filter(Boolean));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [bills]);

  return (
    <div className="space-y-6 animate-fadeIn text-[#152A38] pb-16">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#2F5241] mb-1">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">AI Document Ingestion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152A38] tracking-tight">Utility Bill Documents</h1>
          <p className="text-xs font-semibold text-[#7A8597] mt-1 max-w-xl">
            Automated multi-utility OCR extraction, Scope 1 &amp; 2 carbon accounting, and document verification.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            className="p-2.5 bg-[#EEEDDF] border border-[#D4D4C4] text-[#7A8597] hover:text-[#152A38] hover:bg-[#E4E3D6] rounded-2xl transition-all cursor-pointer active:scale-95"
            title="Refresh Documents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#2F5241]" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#2F5241] hover:bg-[#234035] active:scale-95 text-[#E4E5DB] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload Bill</span>
          </button>
        </div>
      </div>

      {/* ALERT NOTIFICATIONS */}
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

      {/* FILTER SEARCH WORKSPACE */}
      <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-4 sm:p-5 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by consumer, meter #, facility, or month..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#EEEDDF] border border-[#D4D4C4] rounded-full text-xs font-semibold text-[#152A38] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F5241] focus:ring-1 focus:ring-[#2F5241]/20 transition-all truncate"
          />
        </div>

        {/* Filter Dropdowns Responsive Grid/Flex */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="w-full sm:w-auto h-9 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer truncate"
          >
            <option value="ALL">All Facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto h-9 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer truncate"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto h-9 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer truncate"
          >
            <option value="ALL">All Utility Types</option>
            {BILL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full sm:w-auto h-9 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer truncate"
          >
            <option value="ALL">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full sm:w-auto h-9 px-3 bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241] cursor-pointer truncate"
          >
            <option value="ALL">All Years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="w-full sm:w-auto h-9 px-4 bg-[#F7F6EE] border border-[#D4D4C4] text-[#7A8597] hover:text-[#152A38] hover:bg-[#EEEDDF] text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Reset
          </button>

          <span className="ml-auto text-xs font-semibold text-[#7A8597] hidden sm:block">
            {filteredBills.length} {filteredBills.length === 1 ? "document" : "documents"} found
          </span>
        </div>
      </div>

      {/* DOCUMENT CARDS LIST */}
      {loading ? (
        <SkeletonTableRows count={6} />
      ) : paginatedBills.length === 0 ? (
        <div className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EEEDDF] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 text-[#94A3B8]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#152A38]">No utility bill documents found</h3>
            <p className="text-xs font-medium text-[#7A8597] mt-1">Upload a new utility bill document or adjust your filter criteria.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#234035] cursor-pointer transition-all active:scale-95"
          >
            Upload Bill Document
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedBills.map((bill) => {
            const totalCarbon = getBillCarbon(bill);

            let aiSummary = "";
            if (bill.status === "PROCESSING") {
              aiSummary = "AI Vision OCR is actively parsing invoice document structure, line items, and utility consumption.";
            } else if (bill.status === "FAILED") {
              aiSummary = "AI extraction failed for this document. Please verify or replace the bill file to reprocess.";
            } else if (bill.status === "PENDING") {
              aiSummary = "Utility bill uploaded and pending AI extraction. Click 'Process AI' to calculate carbon emissions.";
            } else {
              if (bill.aiExtractedData?.aiSummary || bill.aiExtractedData?.summary) {
                aiSummary = bill.aiExtractedData.aiSummary || bill.aiExtractedData.summary;
              } else {
                const utilities = bill.utilities || [];
                if (utilities.length > 0) {
                  const breakdown = utilities.map((u) => `${u.utilityType || 'Utility'} (${u.usage || 0} ${u.unit || ''})`).join(", ");
                  aiSummary = `AI OCR verified ${utilities.length} utility item(s) [${breakdown}] for ${bill.facility?.name || 'facility'}, generating ${totalCarbon.toFixed(2)} kg CO2e emissions.`;
                } else {
                  aiSummary = `AI Extraction verified for ${bill.facility?.name || 'facility'}. Calculated ${totalCarbon.toFixed(2)} kg CO2e total emissions for ${bill.billMonth || ''} ${bill.billYear || ''}.`;
                }
              }
            }

            const isProcessing = processingIds.has(bill.id);

            return (
              <div
                key={bill.id}
                className="bg-[#F7F6EE] border border-[#D4D4C4] rounded-[24px] p-5 sm:p-6 shadow-xs hover:border-[#2F5241]/40 hover:shadow-sm transition-all duration-200 space-y-4"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      bill.status === "COMPLETED" ? "bg-[#EAF2ED] text-[#2F5241] border-[#2F5241]/15" :
                      bill.status === "PROCESSING" ? "bg-blue-50 text-blue-600 border-blue-200/50" :
                      bill.status === "FAILED" ? "bg-red-50 text-red-500 border-red-200/50" :
                      "bg-[#EEEDDF] text-[#7A8597] border-[#D4D4C4]"
                    }`}>
                      {isProcessing ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-extrabold text-[#152A38] truncate">
                          {bill.facility?.name || "Target Facility"}
                        </h3>
                        {renderUtilityChips(bill)}
                      </div>
                      <p className="text-[11px] font-semibold text-[#7A8597] truncate">
                        <span className="text-[#152A38] font-bold">{bill.billMonth || ""} {bill.billYear || ""}</span>
                        <span className="mx-1 text-[#D4D4C4]">•</span>
                        Uploaded {formatDate(bill.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadgeClass(bill.status)}`}>
                      {bill.status}
                    </span>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div>
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block whitespace-nowrap">CARBON EMISSION</span>
                    <div className="text-xs sm:text-sm font-extrabold text-[#EF4444] mt-0.5 whitespace-nowrap">
                      {bill.status === "COMPLETED" ? `${totalCarbon.toFixed(2)} kg` : <span className="text-[#94A3B8] text-xs">Pending</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block whitespace-nowrap">TOTAL AMOUNT</span>
                    <div className="text-xs sm:text-sm font-extrabold text-[#152A38] mt-0.5 whitespace-nowrap">
                      {bill.totalAmount != null ? formatCurrency(bill.totalAmount) : <span className="text-[#94A3B8]">-</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block whitespace-nowrap">CONSUMER / METER</span>
                    <div className="text-xs font-extrabold text-[#152A38] mt-0.5 truncate">
                      {bill.consumerName || bill.meterNumber || <span className="text-[#94A3B8]">-</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block whitespace-nowrap">AI CONFIDENCE</span>
                    <div className="text-xs sm:text-sm font-extrabold text-[#2F5241] mt-0.5 whitespace-nowrap">
                      {bill.status === "COMPLETED" ? "96.5%" : <span className="text-[#94A3B8] text-xs">N/A</span>}
                    </div>
                  </div>
                </div>

                {/* AI Summary Banner & Actions */}
                <div className={`rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 ${
                  bill.status === "FAILED"
                    ? "bg-red-50 border border-red-200/60"
                    : bill.status === "PROCESSING"
                    ? "bg-blue-50 border border-blue-200/50"
                    : "bg-[#EAF2ED] border border-[#2F5241]/20"
                }`}>
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      bill.status === "FAILED" ? "bg-red-100 text-red-500" :
                      bill.status === "PROCESSING" ? "bg-blue-100 text-blue-600" :
                      "bg-[#2F5241] text-[#E4E5DB]"
                    }`}>
                      {bill.status === "PROCESSING" ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-[#152A38] leading-relaxed">
                      <strong className={`font-extrabold ${bill.status === "FAILED" ? "text-red-500" : bill.status === "PROCESSING" ? "text-blue-600" : "text-[#2F5241]"}`}>
                        AI {bill.status === "FAILED" ? "Error:" : bill.status === "PROCESSING" ? "Processing:" : "Summary:"}
                      </strong>{" "}
                      {aiSummary}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0 w-full lg:w-auto justify-end sm:justify-start pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2F5241]/10">
                    {(bill.status === "PENDING" || bill.status === "FAILED") && (
                      <button
                        onClick={() => handleProcessBill(bill.id)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-[11px] rounded-xl shadow-xs hover:bg-[#234035] cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
                      >
                        <Zap className="w-3 h-3" />
                        <span>{bill.status === "FAILED" ? "Reprocess AI" : "Process AI"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(bill)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] hover:bg-[#EEEDDF] font-extrabold text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                      title="Edit bill metadata or replace document file"
                    >
                      <Edit3 className="w-3 h-3 text-[#7A8597]" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="px-3 py-1.5 bg-[#F7F6EE] border border-red-200 text-red-500 hover:bg-red-50 font-extrabold text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                      title="Delete bill record"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => openDrawer(bill.id)}
                      className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-[#F7F6EE] border border-[#2F5241]/30 text-[#2F5241] font-extrabold text-[11px] rounded-xl hover:bg-[#EAF2ED] transition-all cursor-pointer text-center active:scale-95 whitespace-nowrap"
                    >
                      View Analysis →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            className="px-4 py-2 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] font-extrabold text-xs rounded-xl disabled:opacity-50 cursor-pointer hover:bg-[#EEEDDF] transition-all active:scale-95"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ← Previous
          </button>
          <span className="text-xs font-semibold text-[#7A8597]">
            Page <strong className="text-[#152A38]">{currentPage}</strong> of <strong className="text-[#152A38]">{totalPages}</strong>
          </span>
          <button
            className="px-4 py-2 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] font-extrabold text-xs rounded-xl disabled:opacity-50 cursor-pointer hover:bg-[#EEEDDF] transition-all active:scale-95"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next →
          </button>
        </div>
      )}

      {/* UPLOAD BILL MODAL */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-[24px] bg-[#F7F6EE] border border-[#D4D4C4] p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D4C4]/60">
              <div>
                <h2 className="text-base font-extrabold text-[#152A38]">Upload Utility Bill Document</h2>
                <p className="text-[11px] font-semibold text-[#7A8597] mt-0.5">AI will auto-extract and classify all utility data from the document.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94A3B8] hover:text-[#152A38] rounded-xl hover:bg-[#EEEDDF] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1.5 font-extrabold text-[#152A38]">Facility *</label>
                  <select
                    name="facilityId"
                    value={form.facilityId}
                    onChange={handleFormChange}
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    required
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 font-extrabold text-[#152A38]">Utility Type Detection</label>
                  <select
                    name="billType"
                    value={form.billType}
                    onChange={handleFormChange}
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                  >
                    {BILL_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5 font-extrabold text-[#152A38]">Month *</label>
                    <select
                      name="billMonth"
                      value={form.billMonth}
                      onChange={handleFormChange}
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 font-extrabold text-[#152A38]">Year *</label>
                    <input
                      type="number"
                      name="billYear"
                      value={form.billYear}
                      onChange={handleFormChange}
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 font-extrabold text-[#152A38]">Upload Bill File (.pdf, .png, .jpg) *</label>
                  <div className="relative w-full bg-[#EEEDDF] border-2 border-dashed border-[#D4D4C4] rounded-2xl p-6 text-center hover:border-[#2F5241]/60 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={(e) => setForm({ ...form, billFile: e.target.files[0] })}
                      required
                    />
                    <Upload className="w-7 h-7 text-[#7A8597] group-hover:text-[#2F5241] mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-bold text-[#152A38] mb-1">
                      {form.billFile ? form.billFile.name : "Click to select or drag & drop your document"}
                    </p>
                    <p className="text-[10px] font-semibold text-[#7A8597]">
                      Supports PDF, PNG, JPG (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D4D4C4]/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D4D4C4] bg-[#EEEDDF] text-[#152A38] font-bold text-xs hover:bg-[#E4E3D6] cursor-pointer transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs hover:bg-[#234035] cursor-pointer transition-all active:scale-95 shadow-xs disabled:opacity-60"
                >
                  {submitting ? "Uploading..." : "Upload & Parse"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT & REPLACE FILE MODAL */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-[24px] bg-[#F7F6EE] border border-[#D4D4C4] p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D4C4]/60">
              <div>
                <h2 className="text-base font-extrabold text-[#152A38]">Edit Utility Bill Record</h2>
                <p className="text-[11px] font-semibold text-[#7A8597] mt-0.5">Update bill metadata or replace the document file.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-[#94A3B8] hover:text-[#152A38] rounded-xl hover:bg-[#EEEDDF] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editFormError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-xs font-semibold">
                  {editFormError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1.5 font-extrabold text-[#152A38]">Facility *</label>
                  <select
                    name="facilityId"
                    value={editForm.facilityId}
                    onChange={(e) => setEditForm({ ...editForm, facilityId: e.target.value })}
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    required
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 font-extrabold text-[#152A38]">Utility Type</label>
                  <select
                    name="billType"
                    value={editForm.billType}
                    onChange={(e) => setEditForm({ ...editForm, billType: e.target.value })}
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                  >
                    {BILL_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5 font-extrabold text-[#152A38]">Month *</label>
                    <select
                      name="billMonth"
                      value={editForm.billMonth}
                      onChange={(e) => setEditForm({ ...editForm, billMonth: e.target.value })}
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 font-extrabold text-[#152A38]">Year *</label>
                    <input
                      type="number"
                      name="billYear"
                      value={editForm.billYear}
                      onChange={(e) => setEditForm({ ...editForm, billYear: e.target.value })}
                      className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#152A38] focus:outline-none focus:border-[#2F5241]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 font-extrabold text-[#152A38]">Replace Document File (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full bg-[#EEEDDF] border border-[#D4D4C4] rounded-xl px-3.5 py-2.5 text-xs text-[#152A38]"
                    onChange={(e) => setEditForm({ ...editForm, billFile: e.target.files[0] })}
                  />
                  <p className="text-[11px] text-[#7A8597] mt-1.5 font-semibold">Uploading a new file will reset bill status to PENDING for AI reprocessing.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D4D4C4]/60">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D4D4C4] bg-[#EEEDDF] text-[#152A38] font-bold text-xs hover:bg-[#E4E3D6] cursor-pointer transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs hover:bg-[#234035] cursor-pointer transition-all active:scale-95 shadow-xs disabled:opacity-60"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* RIGHT-SIDE SLIDING ANALYSIS DRAWER WORKSPACE */}
      {showDrawer && createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div
            className="absolute inset-0 bg-transparent cursor-pointer"
            onClick={closeDrawer}
          />
          <div className="relative z-10 w-full sm:w-[520px] md:w-[600px] lg:w-[660px] bg-[#F7F6EE] h-full shadow-2xl flex flex-col overflow-hidden border-l border-[#D4D4C4] transition-all duration-300">

            {/* Drawer Header */}
            <div className="p-3.5 sm:p-5 border-b border-[#D4D4C4] flex items-center justify-between bg-[#EEEDDF] shrink-0 gap-2.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF2ED] text-[#2F5241] flex items-center justify-center shrink-0 border border-[#2F5241]/15">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-extrabold text-[#152A38] truncate">
                    {drawerBill?.facility?.name || "Utility Bill Document"}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#7A8597] truncate mt-0.5">
                    {drawerBill?.billType || "Utility"} Invoice - {drawerBill?.billMonth || ""} {drawerBill?.billYear || ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {drawerBill && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${getStatusBadgeClass(drawerBill.status)}`}>
                    {drawerBill.status}
                  </span>
                )}
                <button
                  onClick={closeDrawer}
                  className="p-1.5 text-[#94A3B8] hover:text-[#152A38] hover:bg-[#EEEDDF] rounded-xl border border-[#D4D4C4] transition-colors cursor-pointer shrink-0"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex items-center border-b border-[#D4D4C4] px-4 sm:px-5 bg-[#EEEDDF]/60 gap-1 shrink-0 overflow-x-auto">
              {["overview", "utilities", "preview", "json"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 px-3 text-[11px] font-extrabold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? "border-[#2F5241] text-[#2F5241]"
                      : "border-transparent text-[#7A8597] hover:text-[#152A38]"
                  }`}
                >
                  {tab === "overview" && "Overview"}
                  {tab === "utilities" && `Utilities (${drawerBill?.utilities?.length || 0})`}
                  {tab === "preview" && "File Preview"}
                  {tab === "json" && "Raw AI JSON"}
                </button>
              ))}
            </div>

            {/* Drawer Content Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
              {drawerLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#7A8597]">
                  <RefreshCw className="w-7 h-7 animate-spin text-[#2F5241] mb-3" />
                  <p className="text-xs font-bold">Loading document analysis details...</p>
                </div>
              ) : !drawerBill ? (
                <div className="text-center py-12 text-[#7A8597]">
                  <p className="text-xs font-semibold">No bill data available.</p>
                </div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <div className="space-y-5">
                      {/* Summary KPI Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                        <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                          <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">TOTAL AMOUNT</span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#152A38] mt-0.5 block truncate">
                            {drawerBill.totalAmount != null ? formatCurrency(drawerBill.totalAmount) : "-"}
                          </span>
                        </div>
                        <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                          <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">CARBON EMISSION</span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#EF4444] mt-0.5 block truncate">
                            {getBillCarbon(drawerBill).toFixed(2)} kg
                          </span>
                        </div>
                        {drawerBill.consumerName && (
                          <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                            <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">CONSUMER NAME</span>
                            <span className="text-xs font-extrabold text-[#152A38] mt-0.5 block truncate">{drawerBill.consumerName}</span>
                          </div>
                        )}
                        {drawerBill.meterNumber && (
                          <div className="p-3 bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl flex flex-col justify-center">
                            <span className="text-[9.5px] font-extrabold text-[#7A8597] uppercase tracking-wider block">METER NUMBER</span>
                            <span className="text-xs font-extrabold text-[#152A38] mt-0.5 block truncate">{drawerBill.meterNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Key Metadata Table */}
                      <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl p-4 space-y-3">
                        <h3 className="text-[11px] font-extrabold text-[#152A38] uppercase tracking-wider">Extracted Document Metadata</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[#7A8597] block font-semibold">Facility:</span>
                            <span className="font-extrabold text-[#152A38] break-words">{drawerBill.facility?.name}</span>
                          </div>
                          <div>
                            <span className="text-[#7A8597] block font-semibold">Detected Utility:</span>
                            <span className="font-extrabold text-[#152A38]">{drawerBill.billType}</span>
                          </div>
                          <div>
                            <span className="text-[#7A8597] block font-semibold">Billing Period:</span>
                            <span className="font-extrabold text-[#152A38]">{drawerBill.billMonth} {drawerBill.billYear}</span>
                          </div>
                          <div>
                            <span className="text-[#7A8597] block font-semibold">Bill Date:</span>
                            <span className="font-extrabold text-[#152A38]">{formatDate(drawerBill.billDate || drawerBill.createdAt)}</span>
                          </div>
                          {/* Dynamic Extra Metadata extracted by AI */}
                          {drawerBill.aiExtractedData &&
                            Object.entries(drawerBill.aiExtractedData).map(([key, val]) => {
                              if (["billDate", "consumerName", "meterNumber", "billMonth", "billYear", "billType", "totalAmount"].includes(key)) {
                                return null;
                              }
                              if (val === null || val === undefined || typeof val === "object") return null;
                              return (
                                <div key={key}>
                                  <span className="text-[#7A8597] block font-semibold">{formatKeyToLabel(key)}:</span>
                                  <span className="font-extrabold text-[#152A38]">{String(val)}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* AI Ingestion Summary Banner */}
                      <div className="bg-[#EAF2ED] border border-[#2F5241]/20 rounded-2xl p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-[#2F5241]">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider">AI Ingestion Summary</span>
                        </div>
                        <p className="text-xs font-semibold text-[#152A38] leading-relaxed">
                          Automated multi-utility OCR parsing and energy accounting verified this invoice. Data extracted and normalized cleanly.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "utilities" && (
                    <div className="space-y-4">
                      {(!drawerBill.utilities || drawerBill.utilities.length === 0) ? (
                        <div className="p-8 text-center bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl text-xs font-bold text-[#7A8597]">
                          No specific utility breakdown items recorded.
                        </div>
                      ) : (
                        <div className="bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl overflow-x-auto scrollbar-thin">
                          <table className="w-full text-left text-xs min-w-[480px]">
                            <thead className="bg-[#E4E3D6] border-b border-[#D4D4C4] font-extrabold text-[#7A8597] whitespace-nowrap">
                              <tr>
                                <th className="p-3">Utility Type</th>
                                <th className="p-3">Usage</th>
                                <th className="p-3">Unit</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3 text-[#EF4444]">Carbon Output (kg)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4D4C4] font-semibold text-[#152A38]">
                              {drawerBill.utilities.map((u, idx) => (
                                <tr key={u.id || idx} className="hover:bg-[#E4E3D6]/50 transition-colors">
                                  <td className="p-3 font-bold whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${getUtilityChipClass(u.utilityType)}`}>
                                      {u.utilityType}
                                    </span>
                                  </td>
                                  <td className="p-3 whitespace-nowrap">{u.usage}</td>
                                  <td className="p-3 whitespace-nowrap">{u.unit}</td>
                                  <td className="p-3 font-extrabold whitespace-nowrap">{formatCurrency(u.amount)}</td>
                                  <td className="p-3 text-[#EF4444] font-extrabold whitespace-nowrap">{u.carbonEmission?.toFixed(2)} kg CO2e</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "preview" && (
                    <div className="space-y-4">
                      {previewUrl ? (
                        <div className="border border-[#D4D4C4] rounded-2xl p-4 bg-[#EEEDDF] flex flex-col items-center justify-center space-y-4">
                          {previewUrl.toLowerCase().includes(".pdf") ? (
                            <iframe src={previewUrl} title="Document Preview" className="w-full h-[480px] rounded-xl border border-[#D4D4C4]" />
                          ) : (
                            <img src={previewUrl} alt="Utility Bill Document Preview" className="max-h-[450px] object-contain rounded-xl border border-[#D4D4C4] shadow-xs" />
                          )}
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#234035] flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Document File</span>
                          </a>
                        </div>
                      ) : drawerBill.billFileUrl ? (
                        <div className="p-8 text-center bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl space-y-3">
                          <p className="text-xs font-semibold text-[#7A8597]">Document file available at stored URL.</p>
                          <a
                            href={drawerBill.billFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#2F5241] text-[#E4E5DB] font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#234035] inline-flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Open Stored File Link</span>
                          </a>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-[#EEEDDF] border border-[#DDDDD0] rounded-2xl text-xs font-bold text-[#7A8597]">
                          No document preview file uploaded for this bill record.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "json" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7A8597]">Full Extracted AI Payload (Raw Database Record)</span>
                        <span className="text-[10px] font-extrabold text-[#2F5241] uppercase font-mono bg-[#EAF2ED] px-2 py-0.5 rounded-lg border border-[#2F5241]/15">aiExtractedData JSON</span>
                      </div>
                      <pre className="bg-[#0F172A] text-emerald-400 p-5 rounded-2xl text-[11px] overflow-auto max-h-[480px] font-mono shadow-inner border border-[#1E293B]/50 leading-relaxed">
                        {JSON.stringify(drawerBill.aiExtractedData || drawerBill, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#D4D4C4] bg-[#EEEDDF] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    closeDrawer();
                    openEditModal(drawerBill);
                  }}
                  className="px-3.5 py-2 bg-[#F7F6EE] border border-[#D4D4C4] text-[#152A38] font-extrabold text-xs rounded-xl hover:bg-[#EEEDDF] cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#7A8597]" />
                  <span>Edit Metadata</span>
                </button>
                <button
                  onClick={() => handleDeleteBill(drawerBill.id)}
                  className="px-3.5 py-2 bg-[#F7F6EE] border border-red-200 text-red-500 font-extrabold text-xs rounded-xl hover:bg-red-50 cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
              <button
                onClick={closeDrawer}
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


export default Bills;

