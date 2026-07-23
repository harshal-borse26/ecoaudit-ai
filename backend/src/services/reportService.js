import prisma from "../config/prisma.js";

const MONTH_MAP = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Converts a (year, monthString/MonthIndex) to an absolute integer key: year * 12 + monthIndex.
 */
const getAbsoluteMonthKey = (year, monthStr) => {
  const y = parseInt(year, 10) || 2000;
  if (!monthStr || monthStr === "All Months" || monthStr === "ALL") {
    return null;
  }
  const mIndex = MONTH_MAP[String(monthStr).toLowerCase().trim()];
  return mIndex !== undefined ? y * 12 + mIndex : null;
};

/**
 * Aggregates report data for a given company, facility, scopeMode, date range, and reportType.
 */
export const buildReportPayload = async (companyId, options = {}) => {
  const {
    facilityId = "ALL",
    scopeMode = "COMPANY_WIDE",
    reportType = "Monthly Carbon Audit Report",
    fromMonth = "January",
    fromYear = "2025",
    toMonth = "December",
    toYear = "2026",
    month = "All Months",
    year = "ALL",
  } = options;

  // 1. Fetch Company Information
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  // 2. Fetch All Facilities for Scope Context & Names
  const allFacilities = await prisma.facility.findMany({
    where: { companyId },
  });

  // 3. Fetch All Company Bills with Relations
  const allBills = await prisma.utilityBill.findMany({
    where: {
      facility: {
        companyId,
      },
    },
    include: {
      facility: true,
      utilities: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 4. Calculate Date Range Bounds (fromKey & toKey)
  let fromKey = null;
  let toKey = null;
  let periodLabel = "All Historical Data";

  if (scopeMode === "SINGLE_MONTH" && month !== "All Months" && year !== "ALL") {
    fromKey = getAbsoluteMonthKey(year, month);
    toKey = fromKey;
    periodLabel = `${month} ${year}`;
  } else if (scopeMode === "CUSTOM_RANGE" || scopeMode === "MULTI_MONTH") {
    const fKey = getAbsoluteMonthKey(fromYear, fromMonth);
    const tKey = getAbsoluteMonthKey(toYear, toMonth);
    if (fKey !== null && tKey !== null) {
      fromKey = Math.min(fKey, tKey);
      toKey = Math.max(fKey, tKey);
      periodLabel = `${fromMonth} ${fromYear} – ${toMonth} ${toYear}`;
    }
  } else if (scopeMode === "QUARTERLY" && year !== "ALL") {
    const qYear = parseInt(year, 10) || 2026;
    if (month.toUpperCase().startsWith("Q1")) {
      fromKey = qYear * 12 + 0; // Jan
      toKey = qYear * 12 + 2;   // Mar
      periodLabel = `Q1 ${qYear} (Jan – Mar)`;
    } else if (month.toUpperCase().startsWith("Q2")) {
      fromKey = qYear * 12 + 3; // Apr
      toKey = qYear * 12 + 5;   // Jun
      periodLabel = `Q2 ${qYear} (Apr – Jun)`;
    } else if (month.toUpperCase().startsWith("Q3")) {
      fromKey = qYear * 12 + 6; // Jul
      toKey = qYear * 12 + 8;   // Sep
      periodLabel = `Q3 ${qYear} (Jul – Sep)`;
    } else if (month.toUpperCase().startsWith("Q4")) {
      fromKey = qYear * 12 + 9;  // Oct
      toKey = qYear * 12 + 11;  // Dec
      periodLabel = `Q4 ${qYear} (Oct – Dec)`;
    }
  } else if (month !== "All Months" || year !== "ALL") {
    if (month !== "All Months" && year !== "ALL") {
      fromKey = getAbsoluteMonthKey(year, month);
      toKey = fromKey;
      periodLabel = `${month} ${year}`;
    } else if (year !== "ALL") {
      fromKey = parseInt(year, 10) * 12 + 0;
      toKey = parseInt(year, 10) * 12 + 11;
      periodLabel = `Full Year ${year}`;
    }
  }

  // 5. Filter Bills by Facility Scope & Date Range Bounds
  const filteredBills = allBills.filter((bill) => {
    // Facility filter
    if (facilityId && facilityId !== "ALL" && bill.facilityId !== facilityId) {
      return false;
    }

    // Date Range bounds check
    if (fromKey !== null && toKey !== null) {
      let billKey = null;
      if (bill.billDate && !isNaN(new Date(bill.billDate).getTime())) {
        const d = new Date(bill.billDate);
        billKey = d.getFullYear() * 12 + d.getMonth();
      } else if (bill.billYear && bill.billMonth) {
        const mIndex = MONTH_MAP[String(bill.billMonth).toLowerCase().trim()];
        if (mIndex !== undefined) {
          billKey = bill.billYear * 12 + mIndex;
        }
      }

      if (billKey !== null) {
        if (billKey < fromKey || billKey > toKey) {
          return false;
        }
      }
    }

    return true;
  });

  // 6. Executive Summary Metrics
  const totalBills = filteredBills.length;
  const processedBills = filteredBills.filter((b) => b.status === "COMPLETED").length;
  const pendingBills = filteredBills.filter((b) => b.status === "PENDING").length;
  const processingBills = filteredBills.filter((b) => b.status === "PROCESSING").length;
  const failedBills = filteredBills.filter((b) => b.status === "FAILED").length;
  const totalAmount = filteredBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const totalCarbonEmission = filteredBills.reduce((sum, b) => {
    if (!b.utilities || b.utilities.length === 0) return sum;
    const billCarbon = b.utilities.reduce((uSum, u) => uSum + (u.carbonEmission || 0), 0);
    return sum + billCarbon;
  }, 0);

  const uniqueFacilityIds = new Set(filteredBills.map((b) => b.facilityId).filter(Boolean));
  const facilitiesCovered = uniqueFacilityIds.size;

  // 7. Facility-level Aggregations
  const facilityMap = {};
  allFacilities.forEach((f) => {
    facilityMap[f.id] = {
      id: f.id,
      name: f.name,
      type: f.type,
      location: `${f.city}, ${f.state}`,
      billsCount: 0,
      totalAmount: 0,
      carbonEmission: 0,
      utilities: new Set(),
    };
  });

  filteredBills.forEach((b) => {
    if (facilityMap[b.facilityId]) {
      facilityMap[b.facilityId].billsCount += 1;
      facilityMap[b.facilityId].totalAmount += b.totalAmount || 0;
      if (b.billType) facilityMap[b.facilityId].utilities.add(b.billType);
      if (b.utilities) {
        const c = b.utilities.reduce((sum, u) => sum + (u.carbonEmission || 0), 0);
        facilityMap[b.facilityId].carbonEmission += c;
      }
    }
  });

  const facilityBreakdown = Object.values(facilityMap)
    .filter((f) => facilityId === "ALL" || f.id === facilityId)
    .map((f) => ({
      ...f,
      utilities: Array.from(f.utilities),
      pctShare: totalCarbonEmission > 0 ? ((f.carbonEmission / totalCarbonEmission) * 100).toFixed(1) : "0.0",
    }))
    .sort((a, b) => b.carbonEmission - a.carbonEmission);

  const highestContributingFacility = facilityBreakdown[0] || null;

  // 8. Utility-level Aggregations
  const utilityMap = {};
  filteredBills.forEach((b) => {
    if (b.utilities && b.utilities.length > 0) {
      b.utilities.forEach((u) => {
        const type = u.utilityType || "Electricity";
        if (!utilityMap[type]) {
          utilityMap[type] = { type, usage: 0, unit: u.unit || "", totalAmount: 0, carbonEmission: 0, count: 0 };
        }
        utilityMap[type].usage += u.usage || 0;
        utilityMap[type].totalAmount += u.amount || 0;
        utilityMap[type].carbonEmission += u.carbonEmission || 0;
        utilityMap[type].count += 1;
      });
    } else if (b.billType) {
      const type = b.billType;
      if (!utilityMap[type]) {
        utilityMap[type] = { type, usage: 0, unit: "", totalAmount: b.totalAmount || 0, carbonEmission: 0, count: 1 };
      } else {
        utilityMap[type].totalAmount += b.totalAmount || 0;
        utilityMap[type].count += 1;
      }
    }
  });

  const utilityBreakdown = Object.values(utilityMap)
    .map((u) => ({
      ...u,
      pctShare: totalCarbonEmission > 0 ? ((u.carbonEmission / totalCarbonEmission) * 100).toFixed(1) : "0.0",
    }))
    .sort((a, b) => b.carbonEmission - a.carbonEmission);

  const highestContributingUtility = utilityBreakdown[0] || null;

  // 9. Time-Series Monthly Trend Aggregation for Scope Range
  const trendMap = {};
  filteredBills.forEach((b) => {
    let year = b.billYear || 2026;
    let monthName = b.billMonth || "January";
    if (b.billDate && !isNaN(new Date(b.billDate).getTime())) {
      const d = new Date(b.billDate);
      year = d.getFullYear();
      monthName = MONTH_NAMES[d.getMonth()];
    }
    const key = `${year}-${String(MONTH_MAP[monthName.toLowerCase()] + 1).padStart(2, "0")}`;
    if (!trendMap[key]) {
      trendMap[key] = { key, month: monthName, year, carbonEmission: 0, totalAmount: 0, billCount: 0 };
    }
    trendMap[key].billCount += 1;
    trendMap[key].totalAmount += b.totalAmount || 0;
    if (b.utilities) {
      trendMap[key].carbonEmission += b.utilities.reduce((sum, u) => sum + (u.carbonEmission || 0), 0);
    }
  });

  const monthlyTrend = Object.values(trendMap).sort((a, b) => a.key.localeCompare(b.key));

  // 10. Formatted Bill-by-Bill Breakdown with Structured AI Extraction Data
  const billDetails = filteredBills.map((b) => {
    const billCarbon = b.utilities?.reduce((sum, u) => sum + (u.carbonEmission || 0), 0) || 0;
    const rawAi = b.aiExtractedData && typeof b.aiExtractedData === "object" ? b.aiExtractedData : {};

    const formattedAiExtractions = [];
    const knownKeys = [
      { key: "consumerName", label: "Consumer / Customer Name" },
      { key: "consumerNumber", label: "Consumer Number" },
      { key: "accountNumber", label: "Account Number" },
      { key: "invoiceNumber", label: "Invoice Number" },
      { key: "meterNumber", label: "Meter Number" },
      { key: "billDate", label: "Bill Date" },
      { key: "dueDate", label: "Due Date" },
      { key: "billingPeriod", label: "Billing Period" },
      { key: "paymentStatus", label: "Payment Status" },
      { key: "branchName", label: "Branch Name" },
      { key: "collectionCenter", label: "Collection Center" },
      { key: "tariffCategory", label: "Tariff Category" },
      { key: "monthlyAverage", label: "Monthly Average Usage" },
    ];

    knownKeys.forEach(({ key, label }) => {
      const val = rawAi[key] || b[key];
      if (val !== undefined && val !== null && val !== "") {
        formattedAiExtractions.push({ label, value: String(val) });
      }
    });

    Object.keys(rawAi).forEach((k) => {
      if (!knownKeys.some((x) => x.key === k) && k !== "utilities" && k !== "aiExtractedData") {
        const val = rawAi[k];
        if (val !== undefined && val !== null && val !== "" && typeof val !== "object") {
          const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
          formattedAiExtractions.push({ label, value: String(val) });
        }
      }
    });

    return {
      id: b.id,
      facilityName: b.facility?.name || "N/A",
      facilityLocation: b.facility ? `${b.facility.city}, ${b.facility.state}` : "N/A",
      billType: b.billType || "Electricity",
      billMonth: b.billMonth,
      billYear: b.billYear,
      status: b.status,
      consumerName: b.consumerName || "N/A",
      totalAmount: b.totalAmount || 0,
      carbonEmission: billCarbon,
      billFileUrl: b.billFileUrl || null,
      createdAt: b.createdAt,
      aiExtractions: formattedAiExtractions,
      utilities: b.utilities.map((u) => ({
        type: u.utilityType,
        usage: u.usage,
        unit: u.unit,
        amount: u.amount,
        carbonEmission: u.carbonEmission,
      })),
    };
  });

  // 11. Derive AI Insights
  const insights = [];
  if (failedBills > 0) {
    insights.push({
      severity: "danger",
      title: "Failed Document Processing Detected",
      text: `${failedBills} utility document(s) failed Gemini AI extraction in the selected scope. Review queue records.`,
    });
  }

  if (highestContributingFacility && highestContributingFacility.carbonEmission > 0) {
    insights.push({
      severity: "warning",
      title: `Highest Carbon Impact: ${highestContributingFacility.name}`,
      text: `${highestContributingFacility.name} generated ${highestContributingFacility.carbonEmission.toFixed(2)} kg CO₂e (${highestContributingFacility.pctShare}% of total scope).`,
    });
  }

  if (highestContributingUtility && highestContributingUtility.carbonEmission > 0) {
    insights.push({
      severity: "info",
      title: `Primary Carbon Utility Driver: ${highestContributingUtility.type}`,
      text: `${highestContributingUtility.type} consumption accounts for ${highestContributingUtility.carbonEmission.toFixed(2)} kg CO₂e across monitored scope.`,
    });
  }

  if (monthlyTrend.length > 1) {
    const firstMonth = monthlyTrend[0];
    const lastMonth = monthlyTrend[monthlyTrend.length - 1];
    const diff = lastMonth.carbonEmission - firstMonth.carbonEmission;
    if (diff > 0) {
      insights.push({
        severity: "warning",
        title: "Emissions Trend Spike",
        text: `Emissions increased by ${diff.toFixed(2)} kg CO₂e between ${firstMonth.month} ${firstMonth.year} and ${lastMonth.month} ${lastMonth.year}.`,
      });
    } else if (diff < 0) {
      insights.push({
        severity: "success",
        title: "Emissions Trend Reduction",
        text: `Emissions dropped by ${Math.abs(diff).toFixed(2)} kg CO₂e between ${firstMonth.month} ${firstMonth.year} and ${lastMonth.month} ${lastMonth.year}.`,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      severity: "success",
      title: "Optimal Operations",
      text: "All utility bill extractions in this scope are completed with zero operational anomalies.",
    });
  }

  // 12. Derive Actionable Recommendations
  const recommendations = [];
  if (highestContributingUtility?.type?.toUpperCase().includes("ELEC")) {
    recommendations.push("Conduct HVAC efficiency audit and optimize off-peak equipment scheduling to reduce power spikes.");
    recommendations.push("Review facility power factor and install power quality monitors to mitigate line loss.");
  }
  if (highestContributingUtility?.type?.toUpperCase().includes("WATER") || utilityBreakdown.some((u) => u.type.toUpperCase().includes("WATER"))) {
    recommendations.push("Inspect facility water lines for unmetered flow or potential leaks during non-operational hours.");
  }
  if (highestContributingUtility?.type?.toUpperCase().includes("GAS") || highestContributingUtility?.type?.toUpperCase().includes("FUEL")) {
    recommendations.push("Inspect boiler burner efficiency and generator runtime schedules to reduce fuel emissions.");
  }
  recommendations.push("Set up automated monthly utility bill OCR ingestion to maintain zero-lag ESG carbon accounting.");

  // 13. Prediction Section (If historical data spans multi-months)
  let prediction = null;
  if (filteredBills.length >= 2 && totalCarbonEmission > 0) {
    const avgCarbonPerBill = totalCarbonEmission / filteredBills.length;
    const avgSpendPerBill = totalAmount / filteredBills.length;
    prediction = {
      expectedNextMonthCarbon: Number((avgCarbonPerBill * (filteredBills.length / Math.max(facilitiesCovered, 1))).toFixed(2)),
      expectedNextMonthSpend: Number((avgSpendPerBill * (filteredBills.length / Math.max(facilitiesCovered, 1))).toFixed(2)),
      trendDirection: monthlyTrend.length > 1 && monthlyTrend[monthlyTrend.length - 1].carbonEmission > monthlyTrend[0].carbonEmission ? "INCREASING" : "STABLE",
      confidence: "High (Derived from scope dataset)",
    };
  }

  const facilityScopeName = facilityId && facilityId !== "ALL"
    ? (allFacilities.find((f) => f.id === facilityId)?.name || "Target Facility")
    : "Company-Wide Scope (All Monitored Facilities)";

  return {
    reportType,
    scopeMode,
    company: {
      name: company?.companyName || "EcoAudit AI Enterprise",
      industry: company?.industry || "Corporate",
      location: `${company?.city || ""}, ${company?.state || ""}, ${company?.country || ""}`.replace(/^, |, $/g, ""),
    },
    filterScope: {
      facilityId,
      facilityName: facilityScopeName,
      periodLabel,
      scopeMode,
      fromMonth,
      fromYear,
      toMonth,
      toYear,
      reportType,
    },
    generatedAt: new Date().toISOString(),
    executiveSummary: {
      totalBills,
      processedBills,
      pendingBills,
      processingBills,
      failedBills,
      facilitiesCovered,
      totalAmount,
      totalCarbonEmission,
      highestContributingFacility: highestContributingFacility?.name || "N/A",
      highestContributingUtility: highestContributingUtility?.type || "N/A",
    },
    facilityBreakdown,
    utilityBreakdown,
    monthlyTrend,
    billDetails,
    insights,
    recommendations,
    prediction,
  };
};
