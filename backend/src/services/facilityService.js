import prisma from "../config/prisma.js";

const MONTH_MAP = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

/**
 * Aggregates facility metrics dynamically from stored UtilityBill & BillUtility records in RDS.
 */
const formatFacilityMetrics = (facility, totalCompanyCarbon = 0) => {
  const bills = facility.bills || [];
  const totalBills = bills.length;
  const processedBills = bills.filter((b) => b.status === "COMPLETED").length;
  const failedBills = bills.filter((b) => b.status === "FAILED").length;
  const processingBills = bills.filter((b) => b.status === "PROCESSING").length;

  const totalAmount = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Sum carbon emissions from nested bill.utilities records
  let carbonEmission = 0;
  bills.forEach((b) => {
    if (b.status === "COMPLETED" && Array.isArray(b.utilities)) {
      b.utilities.forEach((u) => {
        carbonEmission += u.carbonEmission || 0;
      });
    }
  });

  // Calculate breakdown by utility type
  const utilityMap = {};
  bills.forEach((b) => {
    if (Array.isArray(b.utilities) && b.utilities.length > 0) {
      b.utilities.forEach((u) => {
        const type = u.utilityType || b.billType || "Electricity";
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

  const utilityBreakdown = Object.values(utilityMap).sort((a, b) => b.carbonEmission - a.carbonEmission);

  // Dominant utility
  let dominantUtility = utilityBreakdown[0]?.type || "Electricity";

  // AI Status
  let aiStatus = "Optimized";
  if (totalBills === 0) aiStatus = "No Bills";
  else if (failedBills > 0) aiStatus = "Needs Review";
  else if (processingBills > 0) aiStatus = "Processing";

  // Company percentage share
  const pctShare = totalCompanyCarbon > 0
    ? ((carbonEmission / totalCompanyCarbon) * 100).toFixed(1)
    : "0.0";

  // Monthly trend calculation
  const trendMap = {};
  bills.forEach((b) => {
    let year = b.billYear || new Date(b.createdAt).getFullYear();
    let month = b.billMonth || new Date(b.createdAt).toLocaleString("en-US", { month: "long" });
    const mIdx = MONTH_MAP[String(month).toLowerCase()] ?? 0;
    const key = `${year}-${String(mIdx + 1).padStart(2, "0")}`;

    if (!trendMap[key]) {
      trendMap[key] = { key, month, year, carbonEmission: 0, totalAmount: 0, billCount: 0 };
    }
    trendMap[key].billCount += 1;
    trendMap[key].totalAmount += b.totalAmount || 0;
    if (Array.isArray(b.utilities)) {
      trendMap[key].carbonEmission += b.utilities.reduce((sum, u) => sum + (u.carbonEmission || 0), 0);
    }
  });

  const monthlyTrend = Object.values(trendMap).sort((a, b) => a.key.localeCompare(b.key));

  let trendPct = 0;
  let trendDirection = "stable";
  if (monthlyTrend.length >= 2) {
    const current = monthlyTrend[monthlyTrend.length - 1].carbonEmission;
    const prev = monthlyTrend[monthlyTrend.length - 2].carbonEmission;
    if (prev > 0) {
      const diff = current - prev;
      trendPct = Number(Math.abs((diff / prev) * 100).toFixed(1));
      trendDirection = diff > 0 ? "up" : diff < 0 ? "down" : "stable";
    }
  }

  // Health status label mapping
  let healthStatus = { label: "Healthy", dotClass: "text-success", color: "green" };
  if (parseFloat(pctShare) > 40) {
    healthStatus = { label: "High Impact", dotClass: "text-danger", color: "red" };
  } else if (parseFloat(pctShare) > 20) {
    healthStatus = { label: "Moderate", dotClass: "text-warning", color: "orange" };
  }

  // Real AI Insight string
  let aiInsight = "Electricity usage remained stable compared with last month. No unusual emission pattern detected.";
  if (totalBills === 0) {
    aiInsight = "No utility bills have been processed for this facility yet.";
  } else if (dominantUtility.toUpperCase().includes("GAS") || dominantUtility.toUpperCase().includes("FUEL")) {
    aiInsight = `${dominantUtility} contributes ${pctShare}% of this facility's emissions. Optimizing fuel consumption will have the highest decarbonization impact.`;
  } else if (trendDirection === "up" && trendPct > 0) {
    aiInsight = `Carbon emissions increased ${trendPct}% compared with the previous reporting period.`;
  } else if (trendDirection === "down" && trendPct > 0) {
    aiInsight = `Carbon emissions decreased ${trendPct}% following reduced energy consumption.`;
  } else if (dominantUtility.toUpperCase().includes("ELEC")) {
    aiInsight = "Electricity consumption represents the primary carbon source for this site.";
  }

  // Last update timestamp
  const latestBillDate = bills.reduce((max, b) => {
    const d = new Date(b.updatedAt || b.createdAt).getTime();
    return d > max ? d : max;
  }, new Date(facility.updatedAt || facility.createdAt).getTime());

  return {
    ...facility,
    billsCount: totalBills,
    totalBills,
    processedBills,
    failedBills,
    processingBills,
    totalAmount,
    totalSpend: totalAmount,
    carbonEmission,
    dominantUtility,
    primaryUtility: dominantUtility,
    aiStatus,
    healthStatus,
    aiInsight,
    pctShare,
    trendPct,
    trendDirection,
    monthlyTrend,
    utilityBreakdown,
    lastUpdated: new Date(latestBillDate).toISOString(),
    updatedAt: new Date(latestBillDate).toISOString(),
  };
};

export const createFacility = async (data, companyId) => {
  const {
    name,
    type,
    address,
    city,
    state,
    country,
    postalCode,
  } = data;

  if (!name || !type || !address || !city || !state || !country) {
    throw new Error("All required fields must be provided");
  }

  const facility = await prisma.facility.create({
    data: {
      name,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      companyId,
    },
  });

  return facility;
};

export const getFacilities = async (companyId) => {
  const facilities = await prisma.facility.findMany({
    where: { companyId },
    include: {
      bills: {
        include: {
          utilities: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate company-wide total carbon emission across all completed bills
  let totalCompanyCarbon = 0;
  facilities.forEach((f) => {
    f.bills.forEach((b) => {
      if (b.status === "COMPLETED" && Array.isArray(b.utilities)) {
        b.utilities.forEach((u) => {
          totalCompanyCarbon += u.carbonEmission || 0;
        });
      }
    });
  });

  return facilities.map((f) => formatFacilityMetrics(f, totalCompanyCarbon));
};

export const getFacilityById = async (id, companyId) => {
  const facility = await prisma.facility.findFirst({
    where: { id, companyId },
    include: {
      bills: {
        include: {
          utilities: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  const allFacilities = await prisma.facility.findMany({
    where: { companyId },
    include: {
      bills: {
        include: { utilities: true },
      },
    },
  });

  let totalCompanyCarbon = 0;
  allFacilities.forEach((f) => {
    f.bills.forEach((b) => {
      if (b.status === "COMPLETED" && Array.isArray(b.utilities)) {
        b.utilities.forEach((u) => {
          totalCompanyCarbon += u.carbonEmission || 0;
        });
      }
    });
  });

  return formatFacilityMetrics(facility, totalCompanyCarbon);
};

export const deleteFacility = async (id, companyId) => {
  const facility = await prisma.facility.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  await prisma.facility.delete({
    where: {
      id,
    },
  });

  return;
};

export const updateFacility = async (id, companyId, data) => {
  const facility = await prisma.facility.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  return await prisma.facility.update({
    where: {
      id,
    },
    data,
  });
};