import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { facilityService } from "../services/facilityService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/helpers";
import { 
  Building2, 
  MapPin, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  BarChart3, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Trash2, 
  Upload
} from "lucide-react";

const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFacilityDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await facilityService.getById(id);
      if (res.data?.success) {
        setFacility(res.data.data);
      } else {
        setError(res.data?.message || "Failed to load facility details.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Facility not found or access denied.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFacilityDetail();
    }
  }, [id]);

  // SVG Chart points calculation for historical carbon trend
  const chartData = useMemo(() => {
    if (!facility || !facility.bills || facility.bills.length === 0) return null;
    const completedBills = [...facility.bills]
      .filter((b) => b.status === "COMPLETED")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-6);

    if (completedBills.length < 2) return null;

    const width = 500;
    const height = 160;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    // Calculate sum of emissions for each bill
    const billPoints = completedBills.map((b) => {
      let em = 0;
      if (Array.isArray(b.utilities)) {
        em = b.utilities.reduce((sum, u) => sum + (u.carbonEmission || 0), 0);
      }
      return {
        id: b.id,
        label: `${b.billMonth || ""} ${b.billYear || ""}`.trim() || "Period",
        val: em,
      };
    });

    const maxVal = Math.max(...billPoints.map((p) => p.val)) || 1;

    const points = billPoints.map((pt, idx) => {
      const x = paddingLeft + idx * (chartW / (billPoints.length - 1));
      const y = paddingTop + chartH - ((pt.val / maxVal) * chartH);
      return { ...pt, x, y };
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
  }, [facility]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-[#64748B]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2E7D32] mb-3" />
        <p className="text-sm font-semibold">Syncing facility performance data from backend...</p>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error || "Facility not found."}</span>
          </div>
          <button
            onClick={() => navigate("/facilities")}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 font-semibold text-xs rounded-lg hover:bg-red-100 transition-colors"
          >
            ← Back to Facilities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="facilities-detail-page p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* NAVIGATION & ACTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <button
            onClick={() => navigate("/facilities")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2E7D32] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Facilities Workspace</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">{facility.name}</h1>
            <span className="text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] px-3 py-1 rounded-full uppercase tracking-wider">
              {facility.type}
            </span>
          </div>
          <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{facility.address}, {facility.city}, {facility.state}, {facility.country} {facility.postalCode || ""}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFacilityDetail}
            className="px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold text-xs rounded-xl hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate("/bills")}
            className="px-4 py-2 bg-[#2E7D32] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#2E7D32]/20 hover:bg-[#256829] transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Bill</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Carbon Emissions */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Carbon Emissions
          </span>
          <div className="text-2xl font-extrabold text-[#EF4444]">
            {facility.carbonEmission > 0 ? `${facility.carbonEmission.toFixed(2)} kg` : "0.00 kg"}
          </div>
          <span className="text-xs text-[#64748B] mt-1 block">
            {facility.pctShare}% of company total
          </span>
        </div>

        {/* Total Spend */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Total Utility Spend
          </span>
          <div className="text-2xl font-extrabold text-[#1E293B]">
            {formatCurrency(facility.totalSpend)}
          </div>
          <span className="text-xs text-[#64748B] mt-1 block">
            Across {facility.totalBills} utility bills
          </span>
        </div>

        {/* Primary Utility */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Primary Utility Source
          </span>
          <div className="text-2xl font-extrabold text-[#1565C0]">
            {facility.dominantUtility}
          </div>
          <span className="text-xs text-[#64748B] mt-1 block">
            Dominant footprint category
          </span>
        </div>

        {/* AI Status */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            AI Document Status
          </span>
          <div className="text-2xl font-extrabold text-[#2E7D32] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            <span>{facility.aiStatus}</span>
          </div>
          <span className="text-xs text-[#64748B] mt-1 block">
            Automated verification status
          </span>
        </div>
      </div>

      {/* AI INSIGHT BANNER */}
      <div className="bg-[#E7F3E8] border border-[#2E7D32]/20 rounded-xl p-4 flex items-start gap-3 text-xs text-[#1E293B]">
        <div className="w-8 h-8 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-[#2E7D32] block mb-0.5">AI ESG Sustainability Insight:</span>
          <p className="text-[#1E293B] leading-relaxed mb-0">{facility.aiInsight}</p>
        </div>
      </div>

      {/* TWO COLUMN CONTENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: UTILITY SUMMARY & BILLS HISTORY */}
        <div className="lg:col-span-2 space-y-6">
          {/* Utility Summary Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Utility Breakdown</span>
              <span className="text-xs font-normal text-[#64748B]">Real-time resource breakdown</span>
            </h3>

            {facility.utilityBreakdown && facility.utilityBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Utility Type</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Usage</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Invoices</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Total Spend</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B] text-right">Emissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {facility.utilityBreakdown.map((u, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-bold text-[#1E293B]">{u.type}</td>
                        <td className="py-2.5 px-3 text-[#64748B]">{u.usage > 0 ? `${u.usage.toFixed(1)} ${u.unit}` : "—"}</td>
                        <td className="py-2.5 px-3 text-[#64748B]">{u.count}</td>
                        <td className="py-2.5 px-3 text-[#1E293B] font-medium">{formatCurrency(u.totalAmount)}</td>
                        <td className="py-2.5 px-3 font-bold text-[#EF4444] text-right">
                          {u.carbonEmission > 0 ? `${u.carbonEmission.toFixed(2)} kg` : "0.00 kg"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#94A3B8]">
                No utility breakdown data available. Upload utility bills to track usage.
              </div>
            )}
          </div>

          {/* Bills History */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">
                Processed Utility Invoices ({facility.bills ? facility.bills.length : 0})
              </h3>
              <button
                onClick={() => navigate("/bills")}
                className="text-xs font-semibold text-[#2E7D32] hover:underline"
              >
                View in Bills Queue →
              </button>
            </div>

            {facility.bills && facility.bills.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Bill Type</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Billing Period</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Amount</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B]">Emissions</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1E293B] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {facility.bills.map((b) => {
                      let billCarbon = 0;
                      if (Array.isArray(b.utilities)) {
                        billCarbon = b.utilities.reduce((sum, u) => sum + (u.carbonEmission || 0), 0);
                      }
                      return (
                        <tr key={b.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#1E293B]">{b.billType || "Utility"}</td>
                          <td className="py-2.5 px-3 text-[#64748B]">{b.billMonth || ""} {b.billYear || ""}</td>
                          <td className="py-2.5 px-3 font-medium text-[#1E293B]">{formatCurrency(b.totalAmount)}</td>
                          <td className="py-2.5 px-3 font-bold text-[#EF4444]">
                            {billCarbon > 0 ? `${billCarbon.toFixed(2)} kg` : "0.00 kg"}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(b.status)}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#94A3B8] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
                No utility bills uploaded yet for this facility.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 1 COLUMN: HISTORICAL CHART & FACILITY GOVERNANCE */}
        <div className="space-y-6">
          {/* Carbon Curve Chart */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-3">
              Historical Carbon Trend
            </h3>
            {chartData ? (
              <div>
                <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="w-full h-auto">
                  <defs>
                    <linearGradient id="detailChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={chartData.areaPath} fill="url(#detailChartGrad)" />
                  <path d={chartData.linePath} fill="none" stroke="#2E7D32" strokeWidth="2.5" />
                  {chartData.points.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="4" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 8} textAnchor="middle" fill="#1E293B" fontSize="9" fontWeight="700">
                        {pt.val.toFixed(0)}
                      </text>
                      <text x={pt.x} y="152" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="600">
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[#94A3B8] bg-[#F8FAFC] rounded-xl">
                Not enough bill history for trend visualization.
              </div>
            )}
          </div>

          {/* Governance Metadata */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-2">
              Facility Governance
            </h3>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Facility ID:</span>
              <span className="font-mono text-[#1E293B] font-medium">{facility.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Created:</span>
              <span className="text-[#1E293B]">{formatDate(facility.createdAt)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Last Audit Sync:</span>
              <span className="text-[#1E293B]">{formatDate(facility.lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetail;
