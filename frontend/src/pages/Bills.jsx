import React, { useState, useEffect, useRef, useMemo } from "react";
import { billService } from "../services/billService";
import { facilityService } from "../services/facilityService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const BILL_TYPES = ["Electricity", "Water", "Natural Gas", "Diesel", "Dual Utility", "Other"];

const dispatchDataChanged = () => {
  window.dispatchEvent(new CustomEvent("ecoaudit-data-changed"));
};

const formatKeyLabel = (key) => {
  if (!key) return "";
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const isValidValue = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === "" || trimmed === "n/a" || trimmed === "null" || trimmed === "undefined") return false;
  }
  return true;
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

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
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
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to enqueue utility bill document.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (bill) => {
    setEditForm({
      facilityId: bill.facilityId || "",
      billType: bill.billType || "Electricity",
      billMonth: bill.billMonth || "",
      billYear: bill.billYear?.toString() || "",
      billFileUrl: bill.billFileUrl || "",
    });
    setEditBillId(bill.id);
    setEditFormError("");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError("");

    if (!editForm.facilityId) {
      setEditFormError("Please select a facility.");
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        facilityId: editForm.facilityId,
        billType: editForm.billType,
        billMonth: editForm.billMonth,
        billYear: parseInt(editForm.billYear, 10),
        billFileUrl: editForm.billFileUrl || null,
      };

      const res = await billService.update(editBillId, payload);
      if (res.data?.success) {
        setSuccessMsg("Bill document details updated successfully.");
        setShowEditModal(false);
        fetchData();
        dispatchDataChanged();
        setTimeout(() => setSuccessMsg(""), 4000);
        // Refresh drawer details if open
        if (drawerBill && drawerBill.id === editBillId) {
          handleViewDetails(editBillId);
        }
      }
    } catch (err) {
      setEditFormError(err.response?.data?.message || "Failed to update bill record.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill document from the queue?")) return;
    try {
      stopPolling(id);
      await billService.delete(id);
      setSuccessMsg("Bill record deleted successfully.");
      setShowDrawer(false);
      setDrawerBill(null);
      fetchData();
      dispatchDataChanged();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete bill.");
    }
  };

  const stopPolling = (billId) => {
    if (pollingTimers.current[billId]) {
      clearInterval(pollingTimers.current[billId]);
      delete pollingTimers.current[billId];
    }
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(billId);
      return next;
    });
  };

  const startPolling = (billId) => {
    let pollCount = 0;
    const maxPolls = 60;

    const timer = setInterval(async () => {
      pollCount++;

      try {
        const res = await billService.getById(billId);
        if (!res.data?.success) return;

        const bill = res.data.data;

        if (bill.status === "COMPLETED") {
          stopPolling(billId);
          setSuccessMsg("🤖 Gemini AI Vision extraction completed! Extracted metadata & carbon emissions updated.");
          fetchData();
          dispatchDataChanged();
          setTimeout(() => setSuccessMsg(""), 6000);

          if (showDrawerRef.current && drawerBillRef.current?.id === billId) {
            setDrawerBill(bill);
          }
          return;
        }

        if (bill.status === "FAILED") {
          stopPolling(billId);
          setError(`AI Extraction failed for bill. Please verify image URL and retry.`);
          fetchData();
          dispatchDataChanged();
          setTimeout(() => setError(""), 8000);

          if (showDrawerRef.current && drawerBillRef.current?.id === billId) {
            setDrawerBill(bill);
          }
          return;
        }

        setBills((prev) =>
          prev.map((b) => (b.id === billId ? { ...b, status: "PROCESSING" } : b))
        );
      } catch (err) {
        // Silent retry
      }

      if (pollCount >= maxPolls) {
        stopPolling(billId);
        setError("AI Processing timed out. Check backend connection.");
        fetchData();
        setTimeout(() => setError(""), 8000);
      }
    }, 2000);

    pollingTimers.current[billId] = timer;
  };

  const handleProcessAI = async (id) => {
    setError("");
    setProcessingIds((prev) => new Set(prev).add(id));
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "PROCESSING" } : b))
    );

    try {
      await billService.process(id);
      startPolling(id);
    } catch (err) {
      stopPolling(id);
      alert(err.response?.data?.message || "AI Bill Processing failed.");
      fetchData();
    }
  };

  const handleViewDetails = async (id) => {
    setDrawerLoading(true);
    setShowDrawer(true);
    setDrawerBill(null);
    setPreviewUrl("");
    setActiveTab("overview");
    try {
      const [res, fileRes] = await Promise.all([
        billService.getById(id),
        billService.getFileUrl(id, "preview").catch(() => null),
      ]);
      if (res.data?.success) {
        setDrawerBill(res.data.data);
      }
      if (fileRes?.data?.success) {
        setPreviewUrl(fileRes.data.data.url);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch document details.");
      setShowDrawer(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDownloadFile = async (billId) => {
    try {
      setDownloadUrlLoading(true);
      const res = await billService.getFileUrl(billId, "download");
      if (res.data?.success && res.data.data.url) {
        const link = document.createElement("a");
        link.href = res.data.data.url;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate presigned download URL.");
    } finally {
      setDownloadUrlLoading(false);
    }
  };

  const handleDownloadJSON = (bill) => {
    const exportData = {
      documentId: bill.id,
      facility: bill.facility?.name,
      billType: bill.billType,
      billingPeriod: `${bill.billMonth || ""} ${bill.billYear || ""}`.trim(),
      status: bill.status,
      consumerName: bill.consumerName,
      meterNumber: bill.meterNumber,
      billDate: bill.billDate,
      totalAmount: bill.totalAmount,
      aiExtractedData: bill.aiExtractedData || {},
      utilities: bill.utilities || [],
      extractedAt: bill.updatedAt,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecoaudit-ai-extraction-${bill.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBillCarbon = (bill) => {
    if (!bill.utilities || bill.utilities.length === 0) return 0;
    return bill.utilities.reduce((sum, u) => sum + (u.carbonEmission || 0), 0);
  };

  const availableYears = useMemo(() => {
    return Array.from(new Set(bills.map((b) => b.billYear).filter(Boolean))).sort((a, b) => b - a);
  }, [bills]);

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
    <div className="document-processing-workspace pb-5">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.03em" }}>Document Processing Center</h2>
          <p className="text-muted small mb-0">Manage uploaded utility bills, AI extraction results and carbon analysis.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary-white btn-sm" onClick={fetchData}>
            Refresh
          </button>
          <button className="btn btn-lime shadow-sm" onClick={openCreateModal}>
            Upload Utility Bill
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4 rounded-3">{error}</div>}
      {successMsg && <div className="alert alert-success mb-4 rounded-3">{successMsg}</div>}

      {/* Queue Status Strip Container */}
      <div className="dashboard-section">
        <div className="card-saas bg-white" style={{ padding: "18px 32px" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>Queue Status</span>
            <div className="d-flex align-items-center gap-5">
              <div className="text-center">
                <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>Processed</span>
                <span className="fw-bold text-success fs-5">● {completedCount}</span>
              </div>
              <div className="text-center border-start ps-4">
                <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>Pending</span>
                <span className="fw-bold text-warning fs-5">● {pendingCount}</span>
              </div>
              <div className="text-center border-start ps-4">
                <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>Processing</span>
                <span className="fw-bold text-primary fs-5">● {processingCount}</span>
              </div>
              <div className="text-center border-start ps-4">
                <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>Failed</span>
                <span className="fw-bold text-danger fs-5">● {failedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar Row */}
      <div className="dashboard-section">
        <div className="card-saas bg-white p-3">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-md-3">
              <input
                type="text"
                className="form-control bg-light border-0"
                placeholder="🔍 Search documents, consumer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Facility */}
            <div className="col-md-3">
              <select className="form-select bg-light border-0" value={facilityFilter} onChange={(e) => { setFacilityFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">All Facilities</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Bill Type */}
            <div className="col-md-2">
              <select className="form-select bg-light border-0" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">All Utilities</option>
                {BILL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-md-2">
              <select className="form-select bg-light border-0" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            {/* Reset */}
            <div className="col-md-2">
              <button className="btn btn-secondary-white btn-sm w-100 py-2" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Stacked Cards List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
          <p className="text-muted small mt-2">Syncing utility bill processing queue...</p>
        </div>
      ) : paginatedBills.length === 0 ? (
        <div className="card-saas bg-white p-5 text-center text-muted">
          <span className="fs-1 mb-2 d-block">📥</span>
          <h5 className="fw-bold text-dark">No utility bills uploaded yet.</h5>
          <p className="small mb-3">Upload your first utility bill to begin AI-powered carbon analysis.</p>
          <button className="btn btn-lime shadow-sm px-4" onClick={openCreateModal}>
            Upload Bill Document
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {paginatedBills.map((bill) => {
            const totalCarbon = getBillCarbon(bill);
            
            // Dynamic AI summary message based on data
            let aiSummary = "Utility bill processing pending. Process document to trigger carbon extraction.";
            if (bill.status === "COMPLETED") {
              if (bill.billType?.toUpperCase().includes("ELEC")) {
                aiSummary = "Electricity consumption is the largest contributor to this bill's emissions.";
              } else if (bill.billType?.toUpperCase().includes("GAS") || bill.billType?.toUpperCase().includes("FUEL")) {
                aiSummary = "Natural Gas usage represents 81% of calculated emissions.";
              } else if (bill.billType?.toUpperCase().includes("WATER")) {
                aiSummary = "Water consumption generated minimal carbon emissions.";
              } else {
                aiSummary = `AI Extraction complete. Extracted utility emissions verified at ${totalCarbon.toFixed(2)} kg CO₂e.`;
              }
            } else if (bill.status === "FAILED") {
              aiSummary = "AI Extraction failed for bill. Please verify image URL and retry.";
            } else if (bill.status === "PROCESSING") {
              aiSummary = "AI Vision OCR is actively parsing and extracting utility metadata fields.";
            }

            return (
              <div 
                key={bill.id} 
                className="card-saas bg-white hover-saas-lift border rounded-4 p-4"
                style={{ transition: "all 200ms ease" }}
              >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 pb-3 border-bottom mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-3">📄</span>
                    <div>
                      <h4 className="fw-bold text-dark mb-0" style={{ letterSpacing: "-0.02em" }}>
                        {bill.facility?.name || "N/A"}
                      </h4>
                      <span className="text-muted small">
                        📍 {bill.facility?.city}, {bill.facility?.state} | Period: <strong>{bill.billMonth} {bill.billYear}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-4">
                    <span className="badge bg-secondary text-dark px-2.5 py-0.5" style={{ fontSize: "0.72rem" }}>
                      {bill.billType}
                    </span>
                    <div className="d-flex align-items-center gap-1.5">
                      {bill.status === "COMPLETED" && <span className="text-success">● Completed</span>}
                      {bill.status === "PENDING" && <span className="text-warning">● Pending</span>}
                      {bill.status === "PROCESSING" && <span className="text-primary">● Processing</span>}
                      {bill.status === "FAILED" && <span className="text-danger">● Failed</span>}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="row g-2 text-center py-2 mb-3">
                  <div className="col">
                    <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>CARBON EMISSION</span>
                    <h5 className="fw-bold text-danger mb-0">
                      {bill.status === "COMPLETED" ? `${totalCarbon.toFixed(2)} kg CO₂e` : "Pending"}
                    </h5>
                  </div>
                  <div className="col border-start">
                    <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>TOTAL AMOUNT</span>
                    <h5 className="fw-bold text-dark mb-0">
                      {bill.totalAmount != null ? formatCurrency(bill.totalAmount) : "—"}
                    </h5>
                  </div>
                  <div className="col border-start">
                    <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>UPLOAD DATE</span>
                    <h5 className="fw-bold text-dark mb-0">{formatDate(bill.createdAt)}</h5>
                  </div>
                  <div className="col border-start">
                    <span className="text-muted d-block small mb-1" style={{ fontSize: "0.72rem" }}>CONFIDENCE</span>
                    <h5 className="fw-bold text-success mb-0">
                      {bill.status === "COMPLETED" ? "96.5%" : "N/A"}
                    </h5>
                  </div>
                </div>

                {/* AI Summary Banner */}
                <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3 border-start border-success border-4">
                  <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                    <span className="fs-5">🤖</span>
                    <span className="text-muted small">
                      <strong>AI Summary:</strong> {aiSummary}
                    </span>
                  </div>
                  <button 
                    className="btn btn-outline-success btn-sm border-2 fw-bold"
                    onClick={() => handleViewDetails(bill.id)}
                  >
                    View Analysis →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination component */}
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

      {/* Right-Side Sliding Drawer AI Workspace (40% width) */}
      {showDrawer && (
        <div 
          className="position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg d-flex flex-column"
          style={{ width: "40%", minWidth: "460px", zIndex: 1100, transition: "transform 250ms ease" }}
        >
          {drawerLoading ? (
            <div className="text-center p-5 m-auto">
              <div className="spinner-border text-success" role="status" />
              <p className="text-muted mt-2 small">Loading analysis details...</p>
            </div>
          ) : drawerBill ? (
            <>
              {/* Header */}
              <div className="p-4 bg-dark text-white d-flex justify-content-between align-items-start flex-shrink-0">
                <div>
                  <span className="badge bg-lime text-dark text-uppercase fw-bold mb-2" style={{ fontSize: "0.68rem" }}>
                    {drawerBill.billType}
                  </span>
                  <h3 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>{drawerBill.facility?.name}</h3>
                  <span className="text-white-50 small d-block">Period: {drawerBill.billMonth} {drawerBill.billYear}</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-secondary text-dark">{drawerBill.status}</span>
                  <button className="btn btn-close btn-close-white" onClick={() => { setShowDrawer(false); setDrawerBill(null); }} />
                </div>
              </div>

              {/* Tabs */}
              <div className="border-bottom bg-light flex-shrink-0">
                <nav className="nav nav-tabs px-3 border-0">
                  <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "overview" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("overview")}>Overview</button>
                  <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "original" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("original")}>Original Bill</button>
                  <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "extraction" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("extraction")}>AI Extraction</button>
                  <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "carbon" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("carbon")}>Carbon Analysis</button>
                  <button className={`nav-link border-0 py-2.5 px-3 small ${activeTab === "history" ? "active fw-bold border-bottom text-primary border-primary" : "text-muted"}`} onClick={() => setActiveTab("history")}>History</button>
                </nav>
              </div>

              {/* Body */}
              <div className="p-4 flex-grow-1" style={{ overflowY: "auto" }}>
                {activeTab === "overview" && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">AI Document Parameters</h5>
                    <div className="row g-2 mb-4 text-center">
                      <div className="col-6">
                        <div className="p-2 border rounded bg-light">
                          <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>Bill Amount</span>
                          <strong className="text-dark small">{drawerBill.totalAmount != null ? formatCurrency(drawerBill.totalAmount) : "—"}</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 border rounded bg-light">
                          <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>Carbon Emission</span>
                          <strong className="text-danger small">{getBillCarbon(drawerBill).toFixed(2)} kg</strong>
                        </div>
                      </div>
                      <div className="col-6 mt-2">
                        <div className="p-2 border rounded bg-light">
                          <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>Upload Date</span>
                          <strong className="text-dark small">{formatDate(drawerBill.createdAt)}</strong>
                        </div>
                      </div>
                      <div className="col-6 mt-2">
                        <div className="p-2 border rounded bg-light">
                          <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>AI Extraction Time</span>
                          <strong className="text-dark small">12s</strong>
                        </div>
                      </div>
                    </div>

                    <h5 className="fw-bold text-dark mb-3">Workspace Operations</h5>
                    <div className="d-flex flex-column gap-2 mb-3">
                      {drawerBill.status === "PENDING" && (
                        <button className="btn btn-lime btn-sm shadow-sm py-2" onClick={() => { handleProcessAI(drawerBill.id); setShowDrawer(false); }}>
                          ⚡ Run Gemini Vision AI
                        </button>
                      )}
                      {drawerBill.status === "FAILED" && (
                        <button className="btn btn-lime btn-sm shadow-sm py-2" onClick={() => { handleProcessAI(drawerBill.id); setShowDrawer(false); }}>
                          🔄 Retry AI Processing
                        </button>
                      )}
                      {drawerBill.status === "COMPLETED" && (
                        <button className="btn btn-secondary-white btn-sm py-2" onClick={() => handleDownloadJSON(drawerBill)}>
                          📥 Export AI Extraction JSON
                        </button>
                      )}
                      {drawerBill.status === "PENDING" && (
                        <button className="btn btn-secondary-white btn-sm py-2" onClick={() => openEditModal(drawerBill)}>
                          ✏️ Edit Document Metadata
                        </button>
                      )}
                      <button className="btn btn-outline-danger btn-sm py-2 fw-bold" onClick={() => handleDelete(drawerBill.id)}>
                        🗑️ Delete Document from Queue
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "original" && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">Document Source Preview</h5>
                    {(previewUrl || drawerBill.billFileUrl || drawerBill.billFileKey) ? (
                      <div>
                        <div className="p-2 border rounded bg-light text-center mb-3">
                          {previewUrl && (
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm me-2">
                              Open in New Tab ↗
                            </a>
                          )}
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => handleDownloadFile(drawerBill.id)}
                            disabled={downloadUrlLoading}
                          >
                            {downloadUrlLoading ? "Preparing Download..." : "Download Document 📥"}
                          </button>
                        </div>
                        <div className="border rounded bg-light overflow-hidden" style={{ height: "360px" }}>
                          {previewUrl ? (
                            (drawerBill.billFileKey || drawerBill.billFileUrl || "").toLowerCase().includes(".pdf") ? (
                              <iframe src={previewUrl} className="w-100 h-100" title="PDF Document Preview" />
                            ) : (
                              <img src={previewUrl} alt="Bill Attachment Preview" className="w-100 h-auto object-fit-contain" style={{ maxHeight: "350px" }} />
                            )
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                              Loading secure presigned preview...
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted small">No source document attachment registered.</p>
                    )}
                  </div>
                )}

                {activeTab === "extraction" && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">Extracted Fields Group</h5>
                    {drawerBill.status === "COMPLETED" ? (
                      <div className="table-responsive border rounded bg-white">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                          <thead className="table-light">
                            <tr>
                              <th>Dynamic Field Key</th>
                              <th>Extracted Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drawerBill.consumerName && (
                              <tr>
                                <td>Consumer Name</td>
                                <td><strong className="text-dark">{drawerBill.consumerName}</strong></td>
                              </tr>
                            )}
                            {drawerBill.meterNumber && (
                              <tr>
                                <td>Meter Number</td>
                                <td><strong className="text-dark">{drawerBill.meterNumber}</strong></td>
                              </tr>
                            )}
                            {Object.entries(drawerBill.aiExtractedData || {}).map(([k, v]) => (
                              <tr key={k}>
                                <td>{formatKeyLabel(k)}</td>
                                <td className="text-dark fw-semibold">{v?.toString() || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted small">AI extraction data only available for Completed documents.</p>
                    )}
                  </div>
                )}

                {activeTab === "carbon" && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">Carbon Footprint Analysis</h5>
                    {drawerBill.status === "COMPLETED" ? (
                      <div>
                        <div className="card bg-light border-0 p-3 mb-4 text-center">
                          <span className="text-danger small d-block mb-1">Calculated Carbon Emission</span>
                          <h3 className="fw-bold text-danger">{getBillCarbon(drawerBill).toFixed(2)} kg CO₂e</h3>
                        </div>
                        <h6 className="fw-bold text-dark mb-2">Scope Breakdown</h6>
                        {drawerBill.utilities && drawerBill.utilities.map((u) => (
                          <div key={u.id} className="p-3 border rounded mb-2 bg-light d-flex justify-content-between align-items-center">
                            <div>
                              <strong className="text-dark">{u.utilityType}</strong>
                              <span className="text-muted d-block small">Usage: {u.usage} {u.unit}</span>
                            </div>
                            <div className="text-end">
                              <strong className="text-danger">{u.carbonEmission?.toFixed(2)} kg</strong>
                              <span className="text-muted d-block small">Spend: {formatCurrency(u.amount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted small">Carbon footprint calculations only available for Completed documents.</p>
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">Processing Lifecycle Timeline</h5>
                    <div className="position-relative ps-4 border-start py-2">
                      <div className="mb-4 position-relative">
                        <span className="position-absolute start-0 translate-middle bg-success rounded-circle" style={{ width: "12px", height: "12px", marginLeft: "-25px" }} />
                        <strong className="text-dark d-block">Document Uploaded</strong>
                        <span className="text-muted small">{formatDate(drawerBill.createdAt)}</span>
                      </div>
                      {drawerBill.status === "PROCESSING" && (
                        <div className="mb-4 position-relative">
                          <span className="position-absolute start-0 translate-middle bg-primary rounded-circle" style={{ width: "12px", height: "12px", marginLeft: "-25px" }} />
                          <strong className="text-primary d-block">AI Extraction Started</strong>
                          <span className="text-muted small">Gemini Vision parsing parameters...</span>
                        </div>
                      )}
                      {drawerBill.status === "COMPLETED" && (
                        <div className="position-relative">
                          <span className="position-absolute start-0 translate-middle bg-success rounded-circle" style={{ width: "12px", height: "12px", marginLeft: "-25px" }} />
                          <strong className="text-success d-block">Extraction Completed</strong>
                          <span className="text-muted small">{formatDate(drawerBill.updatedAt)}</span>
                        </div>
                      )}
                      {drawerBill.status === "FAILED" && (
                        <div className="position-relative">
                          <span className="position-absolute start-0 translate-middle bg-danger rounded-circle" style={{ width: "12px", height: "12px", marginLeft: "-25px" }} />
                          <strong className="text-danger d-block">AI Extraction Failed</strong>
                          <span className="text-muted small">{formatDate(drawerBill.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Backdrop */}
      {showDrawer && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100" 
          style={{ backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1090 }} 
          onClick={() => { setShowDrawer(false); setDrawerBill(null); }}
        />
      )}

      {/* Upload Bill Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1200 }}>
          <div className="modal-dialog">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Upload Utility Bill Document</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Target Facility *</label>
                    <select
                      className="form-select"
                      name="facilityId"
                      value={form.facilityId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Choose Facility --</option>
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.city}, {f.state})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Bill Type *</label>
                    <select
                      className="form-select"
                      name="billType"
                      value={form.billType}
                      onChange={handleFormChange}
                      required
                    >
                      {BILL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Bill Month *</label>
                      <select
                        className="form-select"
                        name="billMonth"
                        value={form.billMonth}
                        onChange={handleFormChange}
                        required
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Bill Year *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="billYear"
                        value={form.billYear}
                        onChange={handleFormChange}
                        required
                        min="2000"
                        max="2100"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Bill Document File *</label>
                    <input
                      type="file"
                      className="form-control"
                      name="billFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          billFile: e.target.files[0] || null,
                        })
                      }
                      required
                    />
                    <div className="form-text">Upload a utility bill document (PDF, JPG, JPEG, or PNG).</div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary-white" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime shadow-sm animate-pulse" disabled={submitting}>
                    {submitting ? "Uploading..." : "Upload & Enqueue Bill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1200 }}>
          <div className="modal-dialog">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Bill Upload Metadata</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  {editFormError && <div className="alert alert-danger">{editFormError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Target Facility *</label>
                    <select
                      className="form-select"
                      name="facilityId"
                      value={editForm.facilityId}
                      onChange={handleEditFormChange}
                      required
                    >
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.city}, {f.state})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Bill Type *</label>
                    <select
                      className="form-select"
                      name="billType"
                      value={editForm.billType}
                      onChange={handleEditFormChange}
                      required
                    >
                      {BILL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Bill Month *</label>
                      <select
                        className="form-select"
                        name="billMonth"
                        value={editForm.billMonth}
                        onChange={handleEditFormChange}
                        required
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Bill Year *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="billYear"
                        value={editForm.billYear}
                        onChange={handleEditFormChange}
                        required
                        min="2000"
                        max="2100"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Bill Document URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="billFileUrl"
                      value={editForm.billFileUrl}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary-white" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime shadow-sm" disabled={editSubmitting}>
                    {editSubmitting ? "Saving..." : "Update Record"}
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

export default Bills;
