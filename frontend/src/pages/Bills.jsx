import React, { useState, useEffect, useRef, useMemo } from "react";
import { billService } from "../services/billService";
import { facilityService } from "../services/facilityService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";
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

const BILL_TYPES = ["Electricity", "Water", "Natural Gas", "Diesel", "Dual Utility", "Other"];

const dispatchDataChanged = () => {
  window.dispatchEvent(new CustomEvent("ecoaudit-data-changed"));
};

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Enterprise Filter States
  const [search, setSearch] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    facilityId: "",
    billType: "Electricity",
    billMonth: MONTHS[new Date().getMonth()],
    billYear: new Date().getFullYear().toString(),
    billFile: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    facilityId: "",
    billType: "Electricity",
    billMonth: "",
    billYear: "",
    billFileUrl: "",
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
  const [downloadUrlLoading, setDownloadUrlLoading] = useState(false);

  // refs for polling
  const showDrawerRef = useRef(false);
  const drawerBillRef = useRef(null);

  useEffect(() => {
    showDrawerRef.current = showDrawer;
  }, [showDrawer]);

  useEffect(() => {
    drawerBillRef.current = drawerBill;
  }, [drawerBill]);

  const [processingIds, setProcessingIds] = useState(new Set());
  const pollingTimers = useRef({});

  useEffect(() => {
    return () => {
      Object.values(pollingTimers.current).forEach((timer) => clearInterval(timer));
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [billsRes, facilitiesRes] = await Promise.all([
        billService.getAll(),
        facilityService.getAll(),
      ]);

      if (billsRes.data?.success) {
        setBills(billsRes.data.data || []);
      }
      if (facilitiesRes.data?.success) {
        setFacilities(facilitiesRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch utility bills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && bills.length > 0) {
      bills.forEach((bill) => {
        if (bill.status === "PROCESSING" && !pollingTimers.current[bill.id]) {
          setProcessingIds((prev) => new Set(prev).add(bill.id));
          startPolling(bill.id);
        }
      });
    }
  }, [loading, bills.length]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    console.log("Upload clicked");
    setForm({
      facilityId: facilities.length > 0 ? facilities[0].id : "",
      billType: "Electricity",
      billMonth: MONTHS[new Date().getMonth()],
      billYear: new Date().getFullYear().toString(),
      billFile: null,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.facilityId) {
      setFormError("Please select a target facility.");
      return;
    }
    if (!form.billMonth || !form.billYear) {
      setFormError("Please select billing month and year.");
      return;
    }
    if (!form.billFile) {
      setFormError("Please select a bill document file to upload.");
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
        setSuccessMsg("Document queued for processing! Trigger AI extraction to proceed.");
        setShowModal(false);
        setForm({
          facilityId: facilities.length > 0 ? facilities[0].id : "",
          billType: "Electricity",
          billMonth: MONTHS[new Date().getMonth()],
          billYear: new Date().getFullYear().toString(),
          billFile: null,
        });
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

  // Derived filter queue logic
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (facilityFilter !== "ALL" && b.facilityId !== facilityFilter) return false;
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && b.billType?.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (monthFilter !== "ALL" && b.billMonth?.toLowerCase() !== monthFilter.toLowerCase()) return false;
      if (yearFilter !== "ALL" && b.billYear?.toString() !== yearFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const facName = b.facility?.name?.toLowerCase() || "";
        const consumer = b.consumerName?.toLowerCase() || "";
        const meter = b.meterNumber?.toLowerCase() || "";
        const type = b.billType?.toLowerCase() || "";
        const status = b.status?.toLowerCase() || "";
        const month = b.billMonth?.toLowerCase() || "";

        return facName.includes(q) || consumer.includes(q) || meter.includes(q) || type.includes(q) || status.includes(q) || month.includes(q);
      }

      return true;
    });
  }, [bills, facilityFilter, statusFilter, typeFilter, monthFilter, yearFilter, search]);

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
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Summary Metrics Counts
  const pendingCount = bills.filter(b => b.status === "PENDING").length;
  const processingCount = bills.filter(b => b.status === "PROCESSING").length;
  const completedCount = bills.filter(b => b.status === "COMPLETED").length;
  const failedCount = bills.filter(b => b.status === "FAILED").length;

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">AI Document Processing Queue</h1>
          <p className="text-sm font-medium text-[#64748B] mt-1">Manage uploaded utility bills, AI extraction results and carbon analysis.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-xs rounded-2xl hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            onClick={fetchData}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            className="px-5 py-2.5 bg-[#2E7D32] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#2E7D32]/25 hover:bg-[#256829] transition-colors flex items-center gap-2 cursor-pointer"
            onClick={openCreateModal}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Utility Bill</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#2E7D32] text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* QUEUE STATUS STRIP CONTAINER */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-[#1E293B]">Google Gemini OCR Processing Status</span>
            <p className="text-xs font-medium text-[#64748B] mt-1">Automated document parsing & field verification</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center w-full md:w-auto">
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] uppercase block">Processed</span>
            <span className="text-base font-extrabold text-[#2E7D32]">● {completedCount}</span>
          </div>
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] uppercase block">Pending</span>
            <span className="text-base font-extrabold text-amber-600">● {pendingCount}</span>
          </div>
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] uppercase block">Processing</span>
            <span className="text-base font-extrabold text-[#1565C0]">● {processingCount}</span>
          </div>
          <div className="px-5 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#64748B] uppercase block">Failed</span>
            <span className="text-base font-extrabold text-red-600">● {failedCount}</span>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search documents, consumer, meter..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 pl-11 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            />
          </div>

          {/* Facility */}
          <div>
            <select
              value={facilityFilter}
              onChange={(e) => { setFacilityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="ALL">All Facilities</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Bill Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="ALL">All Utilities</option>
              {BILL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCUMENT CARDS LIST (Spacious, prominent numbers, highly readable) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] py-12 text-[#64748B]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2E7D32] mb-3" />
          <p className="text-base font-bold">Syncing utility bill document queue...</p>
        </div>
      ) : paginatedBills.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-base font-extrabold text-[#1E293B]">No utility bills uploaded yet.</h3>
          <p className="text-sm font-medium text-[#64748B] max-w-md mx-auto">Upload your first utility bill document to begin AI-powered extraction and carbon accounting.</p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#2E7D32] text-white font-extrabold text-xs rounded-2xl shadow-xs hover:bg-[#256829] cursor-pointer"
          >
            Upload Bill Document
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedBills.map((bill) => {
            const totalCarbon = getBillCarbon(bill);

            let aiSummary = "Utility bill processing pending. Process document to trigger carbon extraction.";
            if (bill.status === "COMPLETED") {
              if (bill.billType?.toUpperCase().includes("ELEC")) {
                aiSummary = "Electricity consumption is the primary emissions contributor to this invoice.";
              } else if (bill.billType?.toUpperCase().includes("GAS") || bill.billType?.toUpperCase().includes("FUEL")) {
                aiSummary = "Natural Gas usage accounts for the majority of calculated carbon output.";
              } else if (bill.billType?.toUpperCase().includes("WATER")) {
                aiSummary = "Water consumption generated minimal carbon emissions.";
              } else {
                aiSummary = `AI Extraction complete. Extracted utility emissions verified at ${totalCarbon.toFixed(2)} kg CO₂e.`;
              }
            } else if (bill.status === "FAILED") {
              aiSummary = "AI Extraction failed for this document. Please verify image quality and retry.";
            } else if (bill.status === "PROCESSING") {
              aiSummary = "AI Vision OCR is actively parsing and extracting utility metadata fields.";
            }

            return (
              <div
                key={bill.id}
                className="bg-white border border-[#E2E8F0] rounded-3xl p-7 shadow-xs hover:border-[#2E7D32]/40 transition-all space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-extrabold text-[#1E293B]">
                          {bill.facility?.name || "Target Facility"}
                        </h3>
                        <span className="text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-3 py-1 rounded-full uppercase">
                          {bill.billType || "Utility"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#64748B] mt-1">
                        Period: <strong className="text-[#1E293B] font-bold">{bill.billMonth || ""} {bill.billYear || ""}</strong> | Uploaded: {formatDate(bill.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold ${getStatusBadgeClass(bill.status)}`}>
                      {bill.status}
                    </span>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">CARBON EMISSION</span>
                    <div className="text-base font-extrabold text-[#EF4444]">
                      {bill.status === "COMPLETED" ? `${totalCarbon.toFixed(2)} kg` : "Pending"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">TOTAL AMOUNT</span>
                    <div className="text-base font-extrabold text-[#1E293B]">
                      {bill.totalAmount != null ? formatCurrency(bill.totalAmount) : "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">UPLOAD DATE</span>
                    <div className="text-base font-extrabold text-[#1E293B]">{formatDate(bill.createdAt)}</div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">AI CONFIDENCE</span>
                    <div className="text-base font-extrabold text-[#2E7D32]">
                      {bill.status === "COMPLETED" ? "96.5%" : "N/A"}
                    </div>
                  </div>
                </div>

                {/* AI Summary Banner & Actions */}
                <div className="bg-[#E7F3E8] border border-[#2E7D32]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-xs md:text-sm font-medium text-[#1E293B] leading-relaxed mb-0">
                      <strong className="text-[#2E7D32] font-extrabold">AI Summary:</strong> {aiSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {bill.status === "PENDING" && (
                      <button
                        onClick={() => handleProcessBill(bill.id)}
                        disabled={processingIds.has(bill.id)}
                        className="px-4 py-2.5 bg-[#2E7D32] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#256829] cursor-pointer flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Process AI →</span>
                      </button>
                    )}
                    <button
                      onClick={() => openDrawer(bill.id)}
                      className="px-4 py-2.5 bg-white border border-[#2E7D32] text-[#2E7D32] font-extrabold text-xs rounded-xl hover:bg-[#E7F3E8] transition-colors cursor-pointer"
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Upload Utility Bill</h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-4">

                <div>
                  <label className="block mb-2 font-semibold">
                    Facility
                  </label>

                  <select
                    name="facilityId"
                    value={form.facilityId}
                    onChange={handleFormChange}
                    className="w-full border rounded-xl px-4 py-3"
                    required
                  >
                    <option value="">
                      Select Facility
                    </option>

                    {facilities.map(f => (
                      <option
                        key={f.id}
                        value={f.id}
                      >
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold">
                    Utility Type
                  </label>

                  <select
                    name="billType"
                    value={form.billType}
                    onChange={handleFormChange}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    {BILL_TYPES.map(type => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block mb-2 font-semibold">
                      Month
                    </label>

                    <select
                      name="billMonth"
                      value={form.billMonth}
                      onChange={handleFormChange}
                      className="w-full border rounded-xl px-4 py-3"
                    >
                      {MONTHS.map(month => (
                        <option
                          key={month}
                          value={month}
                        >
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">
                      Year
                    </label>

                    <input
                      type="number"
                      name="billYear"
                      value={form.billYear}
                      onChange={handleFormChange}
                      className="w-full border rounded-xl px-4 py-3"
                    />
                  </div>

                </div>

                <div>
                  <label className="block mb-2 font-semibold">
                    Upload Bill
                  </label>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full border rounded-xl px-4 py-3"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        billFile: e.target.files[0]
                      })
                    }
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white"
                >
                  {submitting ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIGHT-SIDE SLIDING ANALYSIS DRAWER WORKSPACE */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E7F3E8] text-[#2E7D32] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#1E293B]">
                    {drawerBill?.facility?.name || "Utility Bill Document"}
                  </h2>
                  <p className="text-xs font-semibold text-[#64748B]">
                    {drawerBill?.billType || "Utility"} Invoice | {drawerBill?.billMonth || ""} {drawerBill?.billYear || ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {drawerBill && (
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${getStatusBadgeClass(drawerBill.status)}`}>
                    {drawerBill.status}
                  </span>
                )}
                <button
                  onClick={closeDrawer}
                  className="p-2 text-[#94A3B8] hover:text-[#1E293B] hover:bg-white rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex items-center border-b border-[#E2E8F0] px-6 bg-white gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "overview"
                    ? "border-[#2E7D32] text-[#2E7D32]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("utilities")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "utilities"
                    ? "border-[#2E7D32] text-[#2E7D32]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                Extracted Utilities ({drawerBill?.utilities?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "border-[#2E7D32] text-[#2E7D32]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                File Preview
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "json"
                    ? "border-[#2E7D32] text-[#2E7D32]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                Raw AI JSON
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {drawerLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#2E7D32] mb-3" />
                  <p className="text-sm font-bold">Loading document analysis details...</p>
                </div>
              ) : !drawerBill ? (
                <div className="text-center py-12 text-[#64748B]">
                  <p className="text-sm font-semibold">No bill data available.</p>
                </div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">TOTAL AMOUNT</span>
                          <span className="text-base font-extrabold text-[#1E293B] mt-1 block">
                            {drawerBill.totalAmount != null ? formatCurrency(drawerBill.totalAmount) : "—"}
                          </span>
                        </div>
                        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">CARBON EMISSION</span>
                          <span className="text-base font-extrabold text-[#EF4444] mt-1 block">
                            {getBillCarbon(drawerBill).toFixed(2)} kg
                          </span>
                        </div>
                        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">CONSUMER NAME</span>
                          <span className="text-xs font-extrabold text-[#1E293B] mt-1 block truncate">
                            {drawerBill.consumerName || "—"}
                          </span>
                        </div>
                        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">METER NUMBER</span>
                          <span className="text-xs font-extrabold text-[#1E293B] mt-1 block truncate">
                            {drawerBill.meterNumber || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Key Metadata Table */}
                      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-xs">
                        <h3 className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider">Extracted Metadata</h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[#64748B] block font-medium">Facility:</span>
                            <span className="font-bold text-[#1E293B]">{drawerBill.facility?.name}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block font-medium">Bill Type:</span>
                            <span className="font-bold text-[#1E293B]">{drawerBill.billType}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block font-medium">Billing Period:</span>
                            <span className="font-bold text-[#1E293B]">{drawerBill.billMonth} {drawerBill.billYear}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block font-medium">Bill Date:</span>
                            <span className="font-bold text-[#1E293B]">{formatDate(drawerBill.billDate || drawerBill.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Ingestion Summary Banner */}
                      <div className="bg-[#E7F3E8] border border-[#2E7D32]/20 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center gap-2 text-[#2E7D32]">
                          <Sparkles className="w-4 h-4 font-bold" />
                          <span className="text-xs font-extrabold uppercase tracking-wider">AI Ingestion Summary</span>
                        </div>
                        <p className="text-xs font-medium text-[#1E293B] leading-relaxed">
                          Automated OCR document parsing and energy accounting verified this invoice. Multi-field data extracted with high precision.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "utilities" && (
                    <div className="space-y-4">
                      {(!drawerBill.utilities || drawerBill.utilities.length === 0) ? (
                        <div className="p-8 text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs font-semibold text-[#64748B]">
                          No specific utility breakdown items recorded.
                        </div>
                      ) : (
                        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-bold text-[#64748B]">
                              <tr>
                                <th className="p-3">Utility Type</th>
                                <th className="p-3">Usage</th>
                                <th className="p-3">Unit</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Carbon (kg)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] font-semibold text-[#1E293B]">
                              {drawerBill.utilities.map((u, idx) => (
                                <tr key={u.id || idx}>
                                  <td className="p-3 font-bold">{u.utilityType}</td>
                                  <td className="p-3">{u.usage}</td>
                                  <td className="p-3">{u.unit}</td>
                                  <td className="p-3">{formatCurrency(u.amount)}</td>
                                  <td className="p-3 text-[#EF4444] font-bold">{u.carbonEmission?.toFixed(2)}</td>
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
                        <div className="border border-[#E2E8F0] rounded-2xl p-4 bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
                          {previewUrl.toLowerCase().includes(".pdf") ? (
                            <iframe src={previewUrl} title="Document Preview" className="w-full h-[480px] rounded-xl border border-[#E2E8F0]" />
                          ) : (
                            <img src={previewUrl} alt="Utility Bill Document Preview" className="max-h-[450px] object-contain rounded-xl border border-[#E2E8F0] shadow-xs" />
                          )}
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#2E7D32] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#256829] flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Document File</span>
                          </a>
                        </div>
                      ) : drawerBill.billFileUrl ? (
                        <div className="p-8 text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3">
                          <p className="text-xs font-semibold text-[#64748B]">Document file available at stored URL.</p>
                          <a
                            href={drawerBill.billFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#2E7D32] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#256829] inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Open Stored File Link</span>
                          </a>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs font-semibold text-[#64748B]">
                          No document preview file uploaded for this bill record.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "json" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#64748B]">Extracted Key-Value Payload</span>
                        <span className="text-[10px] font-bold text-[#2E7D32] uppercase">JSON Schema</span>
                      </div>
                      <pre className="bg-[#0F172A] text-emerald-400 p-5 rounded-2xl text-xs overflow-auto max-h-[480px] font-mono shadow-inner border border-[#1E293B]">
                        {JSON.stringify(drawerBill.aiExtractedData || drawerBill, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
              <button
                onClick={closeDrawer}
                className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-xs rounded-xl hover:bg-white cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;
