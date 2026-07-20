import prisma from "../config/prisma.js";
import { extractBillData } from "./aiService.js";
import { calculateCarbonEmission } from "./carbonService.js";

export const createBill = async (data, companyId) => {
  const {
    utilityType,
    billMonth,
    billYear,
    amount,
    units,
    billFileUrl,
    facilityId,
  } = data;

  if (
    !utilityType ||
    !billMonth ||
    !billYear ||
    !amount ||
    !units ||
    !facilityId
  ) {
    throw new Error("All required fields are required");
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

  return await prisma.utilityBill.create({
    data: {
      utilityType,
      billMonth,
      billYear,
      amount,
      units,
      billFileUrl,
      facilityId,
    },
  });
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

  const extractedData = await extractBillData(bill.billFileUrl);
  console.log(JSON.stringify(extractedData, null, 2));
  console.log(extractedData);
  const carbonEmission = calculateCarbonEmission(
    extractedData.utilityType,
    extractedData.units,
  );

  const updatedBill = await prisma.utilityBill.update({
    where: {
      id: billId,
    },
    data: {
      consumerName: extractedData.consumerName,
      meterNumber: extractedData.meterNumber,
      billDate: extractedData.billDate
        ? new Date(extractedData.billDate)
        : null,
      billMonth: extractedData.billMonth,
      billYear: extractedData.billYear,
      totalAmount: extractedData.totalAmount,
      status: "COMPLETED",
    },
  });

  await prisma.billUtility.deleteMany({
  where: {
    billId,
  },
});

for (const utility of extractedData.utilities) {

  const carbonEmission = calculateCarbonEmission(
    utility.type,
    utility.usage,
    utility.unit
  );

  await prisma.billUtility.create({
    data: {
      utilityType: utility.type,
      usage: utility.usage,
      unit: utility.unit,
      amount: utility.amount,
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
  },
});

return finalBill;
};
