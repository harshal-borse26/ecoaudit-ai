import { generateReportPDF } from "../backend/src/services/pdfGenerator.js";
import fs from "fs";

const mockMultiFacility = {
  reportType: "Executive Sustainability Assessment Report",
  scopeMode: "COMPANY_WIDE",
  company: {
    name: "EcoAudit Tech Solutions Ltd.",
    industry: "Information Technology",
    location: "Mumbai, Maharashtra, India",
  },
  filterScope: {
    facilityId: "ALL",
    facilityName: "Company-Wide Scope (All Monitored Facilities)",
    periodLabel: "January 2025 – December 2026",
    scopeMode: "COMPANY_WIDE",
    reportType: "Executive Sustainability Assessment Report",
  },
  generatedAt: new Date().toISOString(),
  executiveSummary: {
    totalBills: 14,
    processedBills: 14,
    pendingBills: 0,
    processingBills: 0,
    failedBills: 0,
    facilitiesCovered: 3,
    totalAmount: 185000,
    totalCarbonEmission: 3120.45,
    highestContributingFacility: "Nashik Regional Center",
    highestContributingUtility: "Electricity",
  },
  facilityBreakdown: [
    {
      id: "fac-1",
      name: "Nashik Regional Center",
      type: "Operations Hub",
      location: "Nashik, Maharashtra",
      billsCount: 7,
      totalAmount: 95000,
      carbonEmission: 1820.50,
      utilities: ["Electricity", "Diesel"],
      pctShare: "58.3",
    },
    {
      id: "fac-2",
      name: "Pune Innovation Lab",
      type: "R&D Facility",
      location: "Pune, Maharashtra",
      billsCount: 5,
      totalAmount: 62000,
      carbonEmission: 980.25,
      utilities: ["Electricity", "Water"],
      pctShare: "31.4",
    },
    {
      id: "fac-3",
      name: "Mumbai Corporate HQ",
      type: "Executive Office",
      location: "Mumbai, Maharashtra",
      billsCount: 2,
      totalAmount: 28000,
      carbonEmission: 319.70,
      utilities: ["Electricity"],
      pctShare: "10.3",
    },
  ],
  utilityBreakdown: [
    {
      type: "Electricity",
      usage: 31500,
      unit: "kWh",
      totalAmount: 145000,
      carbonEmission: 2520.00,
      count: 10,
      pctShare: "80.8",
    },
    {
      type: "Diesel Fuel",
      usage: 190,
      unit: "L",
      totalAmount: 26000,
      carbonEmission: 450.45,
      count: 2,
      pctShare: "14.4",
    },
    {
      type: "Water Supply",
      usage: 420,
      unit: "kL",
      totalAmount: 14000,
      carbonEmission: 150.00,
      count: 2,
      pctShare: "4.8",
    },
  ],
  monthlyTrend: [
    { key: "2025-01", month: "January", year: 2025, carbonEmission: 250, totalAmount: 15000, billCount: 1 },
    { key: "2025-02", month: "February", year: 2025, carbonEmission: 245, totalAmount: 14500, billCount: 1 },
  ],
  billDetails: [
    {
      id: "bill-1",
      facilityName: "Nashik Regional Center",
      billType: "Electricity",
      billMonth: "June",
      billYear: 2026,
      status: "COMPLETED",
      totalAmount: 28500,
      carbonEmission: 480.50,
    },
    {
      id: "bill-2",
      facilityName: "Pune Innovation Lab",
      billType: "Electricity",
      billMonth: "May",
      billYear: 2026,
      status: "COMPLETED",
      totalAmount: 18200,
      carbonEmission: 310.25,
    },
  ],
  insights: [
    {
      severity: "warning",
      title: "Highest Carbon Impact: Nashik Regional Center",
      text: "Nashik Regional Center generated 1820.50 kg CO₂e (58.3% of total scope).",
    },
  ],
  recommendations: [
    "Conduct HVAC equipment audit and optimize off-peak scheduling to curb demand spikes.",
    "Inspect standby diesel generator runtime schedules and fuel burner efficiency.",
    "Install power factor correction units to minimize active line transmission losses.",
    "Automate monthly utility invoice ingestion via AI document intelligence.",
  ],
};

const mockSingleFacility = {
  ...mockMultiFacility,
  filterScope: {
    ...mockMultiFacility.filterScope,
    facilityId: "fac-1",
    facilityName: "Nashik Regional Center",
  },
  executiveSummary: {
    ...mockMultiFacility.executiveSummary,
    facilitiesCovered: 1,
    highestContributingFacility: "Nashik Regional Center",
  },
  facilityBreakdown: [
    {
      id: "fac-1",
      name: "Nashik Regional Center",
      type: "Operations Hub",
      location: "Nashik, Maharashtra",
      billsCount: 7,
      totalAmount: 95000,
      carbonEmission: 1820.50,
      utilities: ["Electricity", "Diesel"],
      pctShare: "100.0",
    },
  ],
};

async function testGen() {
  try {
    const pdfMulti = await generateReportPDF(mockMultiFacility);
    fs.writeFileSync("./scratch/multi_fac_out.pdf", pdfMulti);
    console.log("Multi-facility PDF generated successfully. Size:", pdfMulti.length);

    const pdfSingle = await generateReportPDF(mockSingleFacility);
    fs.writeFileSync("./scratch/single_fac_out.pdf", pdfSingle);
    console.log("Single-facility PDF generated successfully. Size:", pdfSingle.length);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testGen();
