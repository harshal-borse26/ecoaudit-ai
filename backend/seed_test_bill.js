import dotenv from "dotenv";
dotenv.config();

import prisma from "./src/config/prisma.js";

async function seed() {
  const facility = await prisma.facility.findFirst();
  if (!facility) {
    console.log("No facility found.");
    await prisma.$disconnect();
    return;
  }

  const existingBill = await prisma.utilityBill.findFirst({
    where: { facilityId: facility.id }
  });

  if (existingBill) {
    console.log("Bill already exists:", existingBill.id);
    await prisma.$disconnect();
    return;
  }

  const bill = await prisma.utilityBill.create({
    data: {
      facilityId: facility.id,
      billType: "Electricity",
      billMonth: "July",
      billYear: 2026,
      status: "COMPLETED",
      consumerName: "EcoAudit Corporate HQs",
      meterNumber: "EM-984021",
      totalAmount: 4850.50,
      billFileUrl: "https://ecoaudit-ai-bills.s3.eu-north-1.amazonaws.com/bills/sample_electricity.pdf",
      billFileKey: "bills/sample_electricity.pdf",
      aiExtractedData: {
        billingPeriod: "June 01, 2026 to June 30, 2026",
        tariffCategory: "Commercial HT-II",
        sanctionLoad: "150 kW",
        currentReading: 124500,
        previousReading: 112248,
        powerFactor: 0.98,
        dueDate: "2026-07-20",
        paymentStatus: "Paid"
      },
      utilities: {
        create: [
          {
            utilityType: "Electricity",
            usage: 12252.01,
            unit: "kWh",
            amount: 4850.50,
            carbonEmission: 10414.21
          }
        ]
      }
    }
  });

  console.log("Seeded test bill:", bill.id);
  await prisma.$disconnect();
}

seed();
