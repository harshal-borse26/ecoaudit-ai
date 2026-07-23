import prisma from "../config/prisma.js";

export const getDashboardSummary = async (companyId) => {
  // Total Facilities
  const totalFacilities = await prisma.facility.count({
    where: {
      companyId,
    },
  });

  // Total Bills
  const totalBills = await prisma.utilityBill.count({
    where: {
      facility: {
        companyId,
      },
    },
  });

  // Total Bill Amount
  const billAmountResult = await prisma.utilityBill.aggregate({
    where: {
      facility: {
        companyId,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Total Carbon Emission
  const carbonResult = await prisma.billUtility.aggregate({
    where: {
      bill: {
        facility: {
          companyId,
        },
      },
    },
    _sum: {
      carbonEmission: true,
    },
  });

  return {
    totalFacilities,
    totalBills,
    totalBillAmount: billAmountResult._sum.totalAmount || 0,
    totalCarbonEmission: carbonResult._sum.carbonEmission || 0,
  };
};

export const getMonthlyCarbonTrend = async (companyId) => {
  const bills = await prisma.utilityBill.findMany({
    where: {
      facility: {
        companyId,
      },
    },
    include: {
      utilities: true,
    },
    orderBy: {
      billDate: "asc",
    },
  });

  const monthlyData = {};

  for (const bill of bills) {
    if (!bill.billDate) continue;

    const year = bill.billDate.getFullYear();
    const month = String(bill.billDate.getMonth() + 1).padStart(2, "0");

    const key = `${year}-${month}`;

    if (!monthlyData[key]) {
      monthlyData[key] = 0;
    }

    const totalCarbon = bill.utilities.reduce(
      (sum, utility) => sum + utility.carbonEmission,
      0,
    );

    monthlyData[key] += totalCarbon;
  }

  return Object.entries(monthlyData).map(([month, carbonEmission]) => ({
    month,
    carbonEmission: Number(carbonEmission.toFixed(2)),
  }));
};

export const getUtilityDistribution = async (companyId) => {
  const utilities = await prisma.billUtility.findMany({
    where: {
      bill: {
        facility: {
          companyId,
        },
      },
    },
    select: {
      utilityType: true,
      carbonEmission: true,
    },
  });

  const distribution = {};

  for (const utility of utilities) {
    if (!distribution[utility.utilityType]) {
      distribution[utility.utilityType] = 0;
    }

    distribution[utility.utilityType] += utility.carbonEmission;
  }

  return Object.entries(distribution).map(([utilityType, carbonEmission]) => ({
    utilityType,
    carbonEmission: Number(carbonEmission.toFixed(2)),
  }));
};

export const getFacilityEmissions = async (companyId) => {
  const facilities = await prisma.facility.findMany({
    where: {
      companyId,
    },
    include: {
      bills: {
        include: {
          utilities: true,
        },
      },
    },
  });

  const result = facilities.map((facility) => {
    let totalCarbonEmission = 0;

    for (const bill of facility.bills) {
      for (const utility of bill.utilities) {
        totalCarbonEmission += utility.carbonEmission;
      }
    }

    return {
      facilityId: facility.id,
      facilityName: facility.name,
      carbonEmission: Number(totalCarbonEmission.toFixed(2)),
    };
  });

  result.sort((a, b) => b.carbonEmission - a.carbonEmission);

  return result;
};


export const getRecentBills = async (companyId) => {

    const bills = await prisma.utilityBill.findMany({
        where: {
            facility: {
                companyId,
            },
        },
        include: {
            facility: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
    });

    return bills.map((bill) => ({
        billId: bill.id,
        facilityName: bill.facility.name,
        consumerName: bill.consumerName,
        billMonth: bill.billMonth,
        billYear: bill.billYear,
        totalAmount: bill.totalAmount,
        status: bill.status,
        createdAt: bill.createdAt,
    }));

};