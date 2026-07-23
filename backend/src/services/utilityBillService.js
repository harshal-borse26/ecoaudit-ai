import prisma from "../config/prisma.js";
import { extractBillData } from "./aiService.js";
import { calculateCarbonEmission } from "./carbonService.js";

export const createBill = async (data, companyId) => {
  const {
    billMonth,
    billYear,
    billFileUrl,
    billType,
    facilityId,
  } = data;

  if (!billMonth || !billYear || !facilityId) {
    throw new Error("Facility, bill month, and bill year are required");
  }

  // Verify facility belongs to logged-in company
  const facility = await prisma.facility.findFirst({
    where: {
      id: facilityId,
      companyId,
    },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  // AI-first workflow: create bill with PENDING status.
  const bill = await prisma.utilityBill.create({
    data: {
      billFileUrl: billFileUrl || null,
      billMonth,
      billYear: typeof billYear === "string" ? parseInt(billYear, 10) : billYear,
      billType: billType || "Electricity",
      facilityId,
      // status defaults to PENDING via Prisma schema
    },
    include: {
      utilities: true,
      facility: true,
    },
  });

  return bill;
};

export const getBills = async (companyId) => {
  return await prisma.utilityBill.findMany({
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
};

export const getBillById = async (id, companyId) => {
  const bill = await prisma.utilityBill.findFirst({
    where: {
      id,
      facility: {
        companyId,
      },
    },
    include: {
      facility: true,
      utilities: true,
    },
  });

  if (!bill) {
    throw new Error("Utility bill not found");
  }

  return bill;
};

export const updateBill = async (id, companyId, data) => {
  const bill = await prisma.utilityBill.findFirst({
    where: {
      id,
      facility: {
        companyId,
      },
    },
  });

  if (!bill) {
    throw new Error("Utility bill not found");
  }

  return await prisma.utilityBill.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteBill = async (id, companyId) => {
  const bill = await prisma.utilityBill.findFirst({
    where: {
      id,
      facility: {
        companyId,
      },
    },
  });

  if (!bill) {
    throw new Error("Utility bill not found");
  }

  await prisma.utilityBill.delete({
    where: {
      id,
    },
  });
};

// Helper to safely parse date strings without returning Invalid Date objects
const parseValidDate = (rawDate) => {
  if (!rawDate) return null;

  if (rawDate instanceof Date) {
    return isNaN(rawDate.getTime()) ? null : rawDate;
  }

  const str = String(rawDate).trim();
  if (!str) return null;

  // Attempt standard JS Date parsing
  let dateObj = new Date(str);

  // If standard parsing produces Invalid Date, check DD-MM-YYYY or DD/MM/YYYY format
  if (isNaN(dateObj.getTime())) {
    const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
      const year = parseInt(ddmmyyyyMatch[3], 10);
      dateObj = new Date(year, month, day);
    }
  }

  // Ensure only valid Date objects are returned; otherwise null
  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
    return dateObj;
  }

  return null;
};

export const processBillAI = async (billId, companyId) => {
  // Find the bill and verify ownership
  const bill = await prisma.utilityBill.findFirst({
    where: {
      id: billId,
      facility: {
        companyId,
      },
    },
    include: {
      facility: true,
    },
  });

  if (!bill) {
    throw new Error("Utility bill not found");
  }

  await prisma.utilityBill.update({
    where: {
      id: billId,
    },
    data: {
      status: "PROCESSING",
    },
  });

  try {
    const extractedData = await extractBillData(bill.billFileUrl);
    console.log(JSON.stringify(extractedData, null, 2));

    const standardKeys = new Set([
      "consumerName",
      "meterNumber",
      "billDate",
      "billMonth",
      "billYear",
      "billType",
      "totalAmount",
      "utilities",
      "aiExtractedData"
    ]);

    let aiExtractedData = extractedData.aiExtractedData || {};
    if (typeof aiExtractedData !== "object" || aiExtractedData === null) {
      aiExtractedData = {};
    }

    // Preserve original raw billDate in aiExtractedData
    if (extractedData.billDate != null && extractedData.billDate !== "") {
      aiExtractedData.billDate = extractedData.billDate;
    }

    // Also pick up any additional non-standard key-values from top level if present
    Object.keys(extractedData || {}).forEach((key) => {
      if (!standardKeys.has(key) && extractedData[key] !== null && extractedData[key] !== undefined) {
        aiExtractedData[key] = extractedData[key];
      }
    });

    const billType = extractedData.billType || bill.billType || (extractedData.utilities?.[0]?.type) || "Electricity";
    const parsedBillDate = parseValidDate(extractedData.billDate);

    const updatedBill = await prisma.utilityBill.update({
      where: {
        id: billId,
      },
      data: {
        consumerName: extractedData.consumerName || null,
        meterNumber: extractedData.meterNumber || null,
        billDate: parsedBillDate,
        billMonth: extractedData.billMonth || bill.billMonth,
        billYear: Number.isInteger(Number(extractedData.billYear)) && Number(extractedData.billYear) > 1900
          ? Number(extractedData.billYear)
          : bill.billYear,
        billType: billType,
        totalAmount: (extractedData.totalAmount != null && !isNaN(Number(extractedData.totalAmount)))
          ? Number(extractedData.totalAmount)
          : null,
        aiExtractedData: aiExtractedData,
        status: "COMPLETED",
      },
    });

    await prisma.billUtility.deleteMany({
      where: {
        billId,
      },
    });

    const utilitiesList = Array.isArray(extractedData.utilities) ? extractedData.utilities : [];

    for (const utility of utilitiesList) {
      const uType = utility.type || "Electricity";
      const uUsage = !isNaN(Number(utility.usage)) ? Number(utility.usage) : 0;
      const uUnit = utility.unit || "kWh";
      const uAmount = !isNaN(Number(utility.amount)) ? Number(utility.amount) : 0;

      const carbonEmission = calculateCarbonEmission(
        uType,
        uUsage,
        uUnit
      );

      await prisma.billUtility.create({
        data: {
          utilityType: uType,
          usage: uUsage,
          unit: uUnit,
          amount: uAmount,
          carbonEmission,
          billId,
        },
      });
    }

    const finalBill = await prisma.utilityBill.findUnique({
      where: {
        id: billId,
      },
      include: {
        utilities: true,
        facility: true,
      },
    });

    return finalBill;
  } catch (error) {
    // Set bill status to FAILED so frontend polling can detect it
    await prisma.utilityBill.update({
      where: {
        id: billId,
      },
      data: {
        status: "FAILED",
      },
    });
    throw error;
  }
};
