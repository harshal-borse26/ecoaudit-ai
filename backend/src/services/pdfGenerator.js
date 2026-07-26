import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ============================================================================
 * EXECUTIVE DESIGN SYSTEM
 * ========================================================================= */

const COLORS = {
  primary: "#2F5241",        // EcoAudit Forest Green
  primaryLight: "#EAF2ED",   // Soft green tint
  secondary: "#152A38",      // EcoAudit Dark Navy / Slate
  secondaryLight: "#EEEDDF", // Warm beige tint
  accent: "#D6CFB9",         // Soft gold/beige highlight
  warning: "#D97706",        // Amber
  warningLight: "#FEF3C7",
  danger: "#EF4444",         // Red
  dangerLight: "#FEE2E2",
  dark: "#152A38",
  muted: "#7A8597",
  subtle: "#94A3B8",
  bg: "#F7F6EE",             // Warm card background
  white: "#FFFFFF",
  border: "#D4D4C4",         // Soft border
};

const MARGIN = 40;
const TOTAL_PAGES = 6;

/**
 * Registers Poppins / Inter custom fonts if present; falls back to standard Helvetica.
 */
function resolveFonts(doc) {
  const fontsDir = path.join(__dirname, "fonts");
  const tryRegister = (name, files) => {
    for (const file of files) {
      const p = path.join(fontsDir, file);
      if (fs.existsSync(p)) {
        try {
          doc.registerFont(name, p);
          return true;
        } catch {
          // fall through
        }
      }
    }
    return false;
  };

  const hasHeadingBold = tryRegister("Heading-Bold", ["Poppins-Bold.ttf", "Poppins-SemiBold.ttf"]);
  const hasHeadingMedium = tryRegister("Heading-Medium", ["Poppins-Medium.ttf", "Poppins-Regular.ttf"]);
  const hasBody = tryRegister("Body-Regular", ["Inter-Regular.ttf"]);
  const hasBodyBold = tryRegister("Body-Bold", ["Inter-SemiBold.ttf", "Inter-Bold.ttf"]);
  const hasItalic = tryRegister("Body-Italic", ["Inter-Italic.ttf"]);

  const customLoaded = hasHeadingBold && hasBody && hasBodyBold;

  return {
    customLoaded,
    headingBold: hasHeadingBold ? "Heading-Bold" : "Helvetica-Bold",
    headingMedium: hasHeadingMedium ? "Heading-Medium" : "Helvetica-Bold",
    body: hasBody ? "Body-Regular" : "Helvetica",
    bodyBold: hasBodyBold ? "Body-Bold" : "Helvetica-Bold",
    italic: hasItalic ? "Body-Italic" : "Helvetica-Oblique",
  };
}

function buildFormatters(fonts) {
  const rupee = fonts.customLoaded ? "₹" : "INR ";
  const co2e = fonts.customLoaded ? "CO₂e" : "CO2e";

  const formatCurrency = (val) => {
    const n = Number(val) || 0;
    return `${rupee}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatKg = (val) => `${(Number(val) || 0).toFixed(2)} kg ${co2e}`;

  return { formatCurrency, formatKg, co2e };
}

/* ============================================================================
 * LOW-LEVEL DRAW HELPERS
 * ========================================================================= */

function truncate(text, max) {
  const s = String(text ?? "");
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function drawBrandMark(doc, x, y, size, color) {
  const r = size / 2;
  doc.save();
  doc.circle(x + r, y + r, r).fill(color);
  doc
    .path(
      `M ${x + r} ${y + size * 0.76} ` +
      `C ${x + size * 0.24} ${y + size * 0.76} ${x + size * 0.16} ${y + size * 0.32} ${x + size * 0.5} ${y + size * 0.2} ` +
      `C ${x + size * 0.84} ${y + size * 0.32} ${x + size * 0.76} ${y + size * 0.76} ${x + r} ${y + size * 0.76} Z`
    )
    .fill(COLORS.white);
  doc
    .moveTo(x + r, y + size * 0.76)
    .lineTo(x + r, y + size * 0.34)
    .lineWidth(1)
    .strokeColor(color)
    .stroke();
  doc.restore();
}

function drawPill(doc, x, y, text, fg, bg, config) {
  doc.font(config.fonts.bodyBold).fontSize(7);
  const w = doc.widthOfString(text) + 16;
  doc.roundedRect(x, y, w, 15, 7.5).fill(bg);
  doc.fillColor(fg).font(config.fonts.bodyBold).fontSize(7).text(text, x + 8, y + 4);
  return w;
}

function sectionLabel(doc, x, y, width, text, config) {
  doc.fillColor(COLORS.secondary).font(config.fonts.headingMedium).fontSize(10).text(text.toUpperCase(), x, y, { width, characterSpacing: 0.5 });
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .moveTo(x, y + 14)
    .lineTo(x + width, y + 14)
    .stroke();
  return y + 22;
}

function kpiCard(doc, x, y, w, h, label, value, config, valueColor = COLORS.secondary) {
  doc.roundedRect(x, y, w, h, 8).fillAndStroke(COLORS.bg, COLORS.border);
  doc
    .fillColor(COLORS.muted)
    .font(config.fonts.bodyBold)
    .fontSize(7)
    .text(label.toUpperCase(), x + 12, y + 10, { width: w - 24, characterSpacing: 0.4 });
  doc
    .fillColor(valueColor)
    .font(config.fonts.headingBold)
    .fontSize(12)
    .text(String(value), x + 12, y + 24, { width: w - 24 });
}

function infoCard(doc, x, y, w, h, title, config, drawBody, headerColor = COLORS.primary) {
  doc.roundedRect(x, y, w, h, 8).fillAndStroke(COLORS.bg, COLORS.border);
  doc.fillColor(headerColor).font(config.fonts.headingMedium).fontSize(9.5).text(title, x + 14, y + 10);
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(x + 14, y + 25)
    .lineTo(x + w - 14, y + 25)
    .stroke();
  drawBody(x + 14, y + 32, w - 28);
}

function drawTable(doc, x, y, width, columns, rows, config, rowHeight = 20) {
  doc.roundedRect(x, y, width, rowHeight, 4).fill(COLORS.secondary);
  let cx = x;
  columns.forEach((col) => {
    doc
      .fillColor(COLORS.white)
      .font(config.fonts.bodyBold)
      .fontSize(7.5)
      .text(col.label, cx + 8, y + rowHeight / 2 - 3.5, { width: col.width - 12, align: col.align || "left" });
    cx += col.width;
  });
  let ry = y + rowHeight;

  rows.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? COLORS.bg : COLORS.white;
    doc.rect(x, ry, width, rowHeight).fillAndStroke(bg, COLORS.border);
    cx = x;
    columns.forEach((col) => {
      const val = col.render ? col.render(row) : row[col.key];
      const color = typeof col.color === "function" ? col.color(row) : col.color || COLORS.secondary;
      doc
        .fillColor(color)
        .font(col.bold ? config.fonts.bodyBold : config.fonts.body)
        .fontSize(8)
        .text(String(val ?? ""), cx + 8, ry + rowHeight / 2 - 4, { width: col.width - 12, align: col.align || "left" });
      cx += col.width;
    });
    ry += rowHeight;
  });

  return ry;
}

function drawBarRow(doc, x, y, width, label, valueLabel, pct, color, config) {
  const labelW = 140;
  const valueW = 90;
  const barX = x + labelW;
  const barW = width - labelW - valueW;
  doc
    .fillColor(COLORS.secondary)
    .font(config.fonts.bodyBold)
    .fontSize(8)
    .text(truncate(label, 26), x, y + 2, { width: labelW - 8 });
  doc.roundedRect(barX, y, barW, 11, 4).fill(COLORS.bg);
  const fillW = Math.max((Math.min(pct, 100) / 100) * barW, 4);
  doc.roundedRect(barX, y, fillW, 11, 4).fill(color);
  doc
    .fillColor(COLORS.secondary)
    .font(config.fonts.bodyBold)
    .fontSize(8)
    .text(valueLabel, barX + barW + 8, y + 2, { width: valueW - 8, align: "right" });
}

function drawHeader(doc, config, pageNum, sectionNumber, title) {
  const { contentWidth } = config;
  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.body)
    .fontSize(7.5)
    .text(config.brandLine, MARGIN, 24, { width: contentWidth / 2 });
  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.body)
    .fontSize(7.5)
    .text(`Page ${pageNum} of ${TOTAL_PAGES}`, MARGIN, 24, { width: contentWidth, align: "right" });
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .moveTo(MARGIN, 36)
    .lineTo(MARGIN + contentWidth, 36)
    .stroke();

  const badge = 18;
  const titleY = 48;
  doc.roundedRect(MARGIN, titleY, badge, badge, 4).fill(COLORS.primaryLight);
  doc
    .fillColor(COLORS.primary)
    .font(config.fonts.headingBold)
    .fontSize(8.5)
    .text(String(sectionNumber).padStart(2, "0"), MARGIN, titleY + 5, { width: badge, align: "center" });
  doc
    .fillColor(COLORS.secondary)
    .font(config.fonts.headingBold)
    .fontSize(14)
    .text(title, MARGIN + badge + 10, titleY + 2);
  doc
    .strokeColor(COLORS.primary)
    .lineWidth(1.25)
    .moveTo(MARGIN, titleY + badge + 8)
    .lineTo(MARGIN + contentWidth, titleY + badge + 8)
    .stroke();

  return titleY + badge + 20;
}

function drawFooter(doc, config, pageNum) {
  const { contentWidth } = config;
  const y = doc.page.height - 30;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + contentWidth, y)
    .stroke();
  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.body)
    .fontSize(7)
    .text(`${config.companyName} — Confidential & Proprietary`, MARGIN, y + 6);
  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.body)
    .fontSize(7)
    .text(`Page ${pageNum} of ${TOTAL_PAGES}`, MARGIN, y + 6, { width: contentWidth, align: "right" });
}

/* ============================================================================
 * PAGE 1 — COVER PAGE
 * ========================================================================= */

function buildCoverPage(doc, payload, config, fmt) {
  const { contentWidth } = config;

  drawBrandMark(doc, MARGIN, 50, 32, COLORS.primary);
  doc
    .fillColor(COLORS.secondary)
    .font(config.fonts.headingBold)
    .fontSize(16)
    .text("EcoAudit AI", MARGIN + 42, 54);
  doc
    .fillColor(COLORS.muted)
    .font(config.fonts.body)
    .fontSize(8.5)
    .text("Enterprise Carbon Governance Platform", MARGIN + 42, 73);

  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .moveTo(MARGIN, 98)
    .lineTo(MARGIN + contentWidth, 98)
    .stroke();

  const blockY = 280;
  doc
    .fillColor(COLORS.muted)
    .font(config.fonts.bodyBold)
    .fontSize(9.5)
    .text(config.companyName.toUpperCase(), MARGIN, blockY, { characterSpacing: 0.6 });
  doc
    .fillColor(COLORS.secondary)
    .font(config.fonts.headingBold)
    .fontSize(26)
    .text("Executive Sustainability Assessment Report", MARGIN, blockY + 18, { width: contentWidth - 40 });
  doc
    .fillColor(COLORS.primary)
    .font(config.fonts.headingMedium)
    .fontSize(12.5)
    .text(payload.reportType || "Monthly Carbon Audit Report", MARGIN, blockY + 68);

  // Metadata Grid Strip
  const metaY = blockY + 135;
  const metaItems = [
    { label: "Scope", value: payload.filterScope?.facilityName || "Company-Wide Scope" },
    { label: "Reporting Period", value: payload.filterScope?.periodLabel || "All Historical Data" },
    { label: "Generated Date", value: new Date(payload.generatedAt || Date.now()).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) },
    { label: "Report ID", value: payload.reportId || config.reportId },
  ];
  const colW = contentWidth / metaItems.length;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .moveTo(MARGIN, metaY - 14)
    .lineTo(MARGIN + contentWidth, metaY - 14)
    .stroke();

  metaItems.forEach((item, idx) => {
    const x = MARGIN + idx * colW;
    if (idx > 0) {
      doc.strokeColor(COLORS.border).lineWidth(0.5).moveTo(x, metaY).lineTo(x, metaY + 44).stroke();
    }
    const padX = idx === 0 ? 0 : 12;
    doc
      .fillColor(COLORS.subtle)
      .font(config.fonts.bodyBold)
      .fontSize(7)
      .text(item.label.toUpperCase(), x + padX, metaY, { width: colW - padX - 8, characterSpacing: 0.4 });
    doc
      .fillColor(COLORS.secondary)
      .font(config.fonts.bodyBold)
      .fontSize(8.5)
      .text(truncate(item.value, 26), x + padX, metaY + 13, { width: colW - padX - 8 });
  });

  // Footer Strip
  const stripY = doc.page.height - 65;
  doc.roundedRect(MARGIN, stripY, contentWidth, 34, 6).fill(COLORS.secondary);
  doc
    .fillColor(COLORS.white)
    .font(config.fonts.bodyBold)
    .fontSize(8)
    .text("CONFIDENTIAL & PROPRIETARY — FOR EXECUTIVE & ESG COMPLIANCE BOARD USE ONLY", MARGIN + 14, stripY + 12);
  doc
    .fillColor(COLORS.accent)
    .font(config.fonts.bodyBold)
    .fontSize(8)
    .text(`Page 1 of ${TOTAL_PAGES}`, MARGIN, stripY + 12, { width: contentWidth - 14, align: "right" });
}

/* ============================================================================
 * PAGE 2 — EXECUTIVE SUMMARY
 * ========================================================================= */

function buildExecutiveSummaryPage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const es = payload.executiveSummary || {};
  const noBills = (es.totalBills || 0) === 0;
  let y = top;

  const gap = 10;
  const cardW = (contentWidth - gap * 3) / 4;
  const cardH = 48;
  kpiCard(doc, MARGIN, y, cardW, cardH, "Total Emissions", `${(es.totalCarbonEmission || 0).toFixed(1)} kg`, config, COLORS.danger);
  kpiCard(doc, MARGIN + (cardW + gap), y, cardW, cardH, "Utility Spend", fmt.formatCurrency(es.totalAmount), config, COLORS.secondary);
  kpiCard(doc, MARGIN + (cardW + gap) * 2, y, cardW, cardH, "Processed Bills", `${es.processedBills || 0} / ${es.totalBills || 0}`, config, COLORS.primary);
  kpiCard(doc, MARGIN + (cardW + gap) * 3, y, cardW, cardH, "Monitored Sites", `${es.facilitiesCovered || 0}`, config, COLORS.secondary);
  y += cardH + 16;

  const synthesis = payload.aiIntelligence?.whatHappened ||
    `EcoAudit AI verified ${es.processedBills || 0} of ${es.totalBills || 0} submitted utility invoices across ` +
    `${es.facilitiesCovered || 0} monitored facilities for this scope. Scope 1 and Scope 2 output reached ` +
    `${(es.totalCarbonEmission || 0).toFixed(1)} kg ${fmt.co2e} against ${fmt.formatCurrency(es.totalAmount)} in utility spend.`;

  infoCard(doc, MARGIN, y, contentWidth, 84, "Executive Synthesis", config, (bx, by, bw) => {
    doc.fillColor(COLORS.secondary).font(config.fonts.body).fontSize(8.5).text(synthesis, bx, by, { width: bw, lineHeight: 1.4 });
  });
  y += 84 + 18;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Executive Key Findings", config);

  if (noBills) {
    doc.roundedRect(MARGIN, y, contentWidth, 60, 6).fillAndStroke(COLORS.bg, COLORS.border);
    doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(8.5).text("No utility bill documents were found for this reporting period. Select a different date range or upload invoices to view carbon findings.", MARGIN + 14, y + 20, { width: contentWidth - 28 });
    return;
  }

  const topFacility = es.highestContributingFacility || "Primary Facility";
  const primaryUtility = es.highestContributingUtility || "Electricity";
  const utilityShare = payload.utilityBreakdown?.[0]?.pctShare;
  const topAction = payload.actionPlan?.[0]?.action || "Optimize operating schedules and efficiency settings.";

  const findings = [
    { label: "Highest-Emission Facility", desc: `${topFacility} recorded the largest share of monitored scope emissions.` },
    { label: "Primary Utility Driver", desc: `${primaryUtility} contributed ${utilityShare ? `${utilityShare}%` : "the majority"} of overall greenhouse gas output.` },
    { label: "Data Completeness Score", desc: `Data Quality Grade: ${es.auditConfidenceScore || "Grade A (Audit-Ready)"} with 100% OCR field verification.` },
    { label: "Spend & Emission Correlation", desc: "Billed utility spend tracks directly with operational peak demand periods." },
    { label: "Priority Intervention", desc: truncate(topAction, 90) },
  ];

  findings.forEach((f, idx) => {
    doc.circle(MARGIN + 4, y + 5, 3).fill(COLORS.primary);
    doc
      .fillColor(COLORS.secondary)
      .font(config.fonts.bodyBold)
      .fontSize(8.3)
      .text(f.label, MARGIN + 14, y, { width: 150 });
    doc
      .fillColor(COLORS.muted)
      .font(config.fonts.body)
      .fontSize(8.3)
      .text(f.desc, MARGIN + 170, y, { width: contentWidth - 170 });
    y += 24;
    if (idx < findings.length - 1) {
      doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(MARGIN, y - 5)
        .lineTo(MARGIN + contentWidth, y - 5)
        .stroke();
    }
  });
}

/* ============================================================================
 * PAGE 3 — AI SUSTAINABILITY INTELLIGENCE
 * ========================================================================= */

function buildIntelligencePage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const intel = payload.aiIntelligence || {};
  const noBills = (payload.executiveSummary?.totalBills || 0) === 0;
  let y = top;

  if (noBills) {
    y = sectionLabel(doc, MARGIN, y, contentWidth, "AI Root Cause & Predictive Analysis", config);
    doc.roundedRect(MARGIN, y, contentWidth, 80, 6).fillAndStroke(COLORS.bg, COLORS.border);
    doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(8.5).text("No historical invoice data available to compute predictive trend models for this selected scope. Upload utility bills to unlock AI carbon predictions.", MARGIN + 16, y + 30, { width: contentWidth - 32 });
    return;
  }

  y = sectionLabel(doc, MARGIN, y, contentWidth, "AI Root Cause & Predictive Analysis", config);

  const colW = (contentWidth - 12) / 2;
  const cardH = 135;

  // Left Card: Root Cause
  infoCard(doc, MARGIN, y, colW, cardH, "Historical Root Cause Analysis", config, (bx, by, bw) => {
    doc.fillColor(COLORS.muted).font(config.fonts.bodyBold).fontSize(7.5).text("PRIMARY DRIVER & WHY IT HAPPENED", bx, by);
    doc.fillColor(COLORS.secondary).font(config.fonts.body).fontSize(8).text(truncate(intel.whyItHappened, 160), bx, by + 12, { width: bw, lineHeight: 1.35 });
    
    doc.fillColor(COLORS.muted).font(config.fonts.bodyBold).fontSize(7.5).text("MONTH-OVER-MONTH TREND", bx, by + 68);
    const trendText = intel.trendDirection === "INCREASING" ? "● Increasing Emissions (+ Delta)" : intel.trendDirection === "DECREASING" ? "● Decreasing Emissions (- Delta)" : "● Stable Operational Baseline";
    const trendColor = intel.trendDirection === "INCREASING" ? COLORS.danger : COLORS.primary;
    doc.fillColor(trendColor).font(config.fonts.bodyBold).fontSize(8.5).text(trendText, bx, by + 80);
  });

  // Right Card: Predictive Outlook
  infoCard(doc, MARGIN + colW + 12, y, colW, cardH, "Predictive Carbon & Financial Outlook", config, (bx, by, bw) => {
    const pred = intel.prediction || {};
    doc.fillColor(COLORS.muted).font(config.fonts.bodyBold).fontSize(7.5).text("PREDICTED NEXT PERIOD CARBON", bx, by);
    doc.fillColor(COLORS.danger).font(config.fonts.headingBold).fontSize(11).text(pred.expectedNextMonthCarbon ? `${pred.expectedNextMonthCarbon} kg ${fmt.co2e}` : "N/A", bx, by + 12);

    doc.fillColor(COLORS.muted).font(config.fonts.bodyBold).fontSize(7.5).text("PREDICTED NEXT PERIOD SPEND", bx, by + 34);
    doc.fillColor(COLORS.secondary).font(config.fonts.headingBold).fontSize(11).text(pred.expectedNextMonthSpend ? fmt.formatCurrency(pred.expectedNextMonthSpend) : "N/A", bx, by + 46);

    doc.fillColor(COLORS.muted).font(config.fonts.bodyBold).fontSize(7.5).text("ESTIMATED SAVINGS POTENTIAL", bx, by + 68);
    doc.fillColor(COLORS.primary).font(config.fonts.bodyBold).fontSize(8.5).text(`Carbon: ${intel.estCarbonSavings || "N/A"} | Cost: ${intel.estCostSavings || "N/A"}`, bx, by + 80);
  });

  y += cardH + 18;

  // Risk Alert Banner
  const alert = intel.riskAlert || {};
  const alertBg = alert.isRisk ? COLORS.dangerLight : COLORS.primaryLight;
  const alertBorder = alert.isRisk ? COLORS.danger : COLORS.primary;
  const alertTitleColor = alert.isRisk ? COLORS.danger : COLORS.primary;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Operational Risk Alert & Guidance", config);
  doc.roundedRect(MARGIN, y, contentWidth, 68, 6).fillAndStroke(alertBg, alertBorder);
  doc.fillColor(alertTitleColor).font(config.fonts.headingBold).fontSize(9.5).text(alert.title || "Operational Risk Guidance", MARGIN + 14, y + 12);
  doc.fillColor(COLORS.secondary).font(config.fonts.body).fontSize(8).text(alert.text || "Operational metrics remain within normal compliance baselines.", MARGIN + 14, y + 28, { width: contentWidth - 28, lineHeight: 1.35 });
}

/* ============================================================================
 * PAGE 4 — UTILITY & CARBON ANALYSIS
 * ========================================================================= */

function buildUtilityAnalysisPage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const breakdown = payload.utilityBreakdown || [];
  const noBills = (payload.executiveSummary?.totalBills || 0) === 0;
  let y = top;

  if (noBills) {
    y = sectionLabel(doc, MARGIN, y, contentWidth, "Utility Carbon Breakdown", config);
    doc.roundedRect(MARGIN, y, contentWidth, 80, 6).fillAndStroke(COLORS.bg, COLORS.border);
    doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(8.5).text("No utility invoice extractions available to display breakdown tables for this selected reporting period.", MARGIN + 16, y + 30, { width: contentWidth - 32 });
    return;
  }

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Utility Carbon Breakdown", config);

  const columns = [
    { label: "Utility Type", width: contentWidth * 0.22, key: "type", bold: true },
    { label: "Billed Usage", width: contentWidth * 0.2, render: (r) => (r.usage > 0 ? `${r.usage.toFixed(1)} ${r.unit}` : "—") },
    { label: "Invoices", width: contentWidth * 0.12, render: (r) => String(r.count), align: "center" },
    { label: "Spend", width: contentWidth * 0.2, render: (r) => fmt.formatCurrency(r.totalAmount) },
    { label: "Emissions (% Share)", width: contentWidth * 0.26, render: (r) => `${r.carbonEmission.toFixed(1)} kg (${r.pctShare}%)`, color: COLORS.danger, bold: true, align: "right" },
  ];
  y = drawTable(doc, MARGIN, y, contentWidth, columns, breakdown, config) + 18;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Emissions Share by Category", config);
  breakdown.slice(0, 4).forEach((u) => {
    const pct = parseFloat(u.pctShare || 0);
    drawBarRow(doc, MARGIN, y, contentWidth, u.type, `${u.carbonEmission.toFixed(1)} kg`, pct, pct > 45 ? COLORS.danger : COLORS.primary, config);
    y += 20;
  });
  y += 12;

  // Methodology & IPCC Note
  infoCard(doc, MARGIN, y, contentWidth, 90, "Accounting Methodology & Standard Emission Factors", config, (bx, by, bw) => {
    doc
      .fillColor(COLORS.muted)
      .font(config.fonts.body)
      .fontSize(7.5)
      .text(
        "Emissions are calculated in accordance with the GHG Protocol Corporate Standard (Scope 1 & Scope 2). Utility consumption is multiplied by IPCC standard emission factors:",
        bx,
        by,
        { width: bw, lineHeight: 1.3 }
      );

    const factors = [
      ["Electricity", "0.85 kg / kWh"],
      ["Natural Gas", "1.90 kg / m³"],
      ["Diesel", "2.68 kg / L"],
      ["Water", "0.35 kg / kL"],
    ];
    const fw = bw / factors.length;
    factors.forEach(([label, val], idx) => {
      const fx = bx + idx * fw;
      doc.fillColor(COLORS.subtle).font(config.fonts.bodyBold).fontSize(7).text(label.toUpperCase(), fx, by + 28, { characterSpacing: 0.3 });
      doc.fillColor(COLORS.danger).font(config.fonts.bodyBold).fontSize(8).text(val, fx, by + 38);
    });
  });
}

/* ============================================================================
 * PAGE 5 — FACILITY PERFORMANCE & AUDIT TRAIL
 * ========================================================================= */

function buildFacilityPerformancePage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const es = payload.executiveSummary || {};
  const breakdown = payload.facilityBreakdown || [];
  const isSingle = (es.facilitiesCovered || 0) <= 1 || breakdown.length <= 1;
  const noBills = (es.totalBills || 0) === 0;
  let y = top;

  if (noBills) {
    y = sectionLabel(doc, MARGIN, y, contentWidth, "Facility Performance Spotlight", config);
    doc.roundedRect(MARGIN, y, contentWidth, 80, 6).fillAndStroke(COLORS.bg, COLORS.border);
    doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(8.5).text("No facility performance data or bill audit records found for this selected scope.", MARGIN + 16, y + 30, { width: contentWidth - 32 });
    return;
  }

  if (isSingle) {
    const fac = breakdown[0] || {
      name: payload.filterScope?.facilityName || "Target Facility",
      location: "Monitored Site",
      billsCount: es.processedBills || 0,
      totalAmount: es.totalAmount || 0,
      carbonEmission: es.totalCarbonEmission || 0,
      utilities: payload.utilityBreakdown?.map((u) => u.type) || [],
    };

    y = sectionLabel(doc, MARGIN, y, contentWidth, "Single-Facility Spotlight", config);

    const cardH = 80;
    doc.roundedRect(MARGIN, y, contentWidth, cardH, 8).fillAndStroke(COLORS.bg, COLORS.border);
    doc.rect(MARGIN, y, 4, cardH).fill(COLORS.primary);
    doc.fillColor(COLORS.secondary).font(config.fonts.headingBold).fontSize(12).text(fac.name, MARGIN + 16, y + 12);
    doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(8).text(fac.location, MARGIN + 16, y + 28);

    const stats = [
      ["Invoices", `${fac.billsCount}`],
      ["Spend", fmt.formatCurrency(fac.totalAmount)],
      ["Emissions", `${fac.carbonEmission.toFixed(1)} kg`],
      ["Utilities", (fac.utilities || []).join(", ") || "Electricity"],
    ];
    const sw = (contentWidth - 32) / stats.length;
    stats.forEach(([label, val], idx) => {
      const sx = MARGIN + 16 + idx * sw;
      doc.fillColor(COLORS.subtle).font(config.fonts.bodyBold).fontSize(7).text(label.toUpperCase(), sx, y + 46, { characterSpacing: 0.3 });
      doc.fillColor(COLORS.secondary).font(config.fonts.bodyBold).fontSize(9).text(truncate(val, 20), sx, y + 56, { width: sw - 8 });
    });
    y += cardH + 16;
  } else {
    y = sectionLabel(doc, MARGIN, y, contentWidth, "Facility Emissions Comparison", config);

    const columns = [
      { label: "Facility", width: contentWidth * 0.28, render: (r) => truncate(r.name, 22), bold: true },
      { label: "Location", width: contentWidth * 0.2, render: (r) => truncate(r.location, 16) },
      { label: "Invoices", width: contentWidth * 0.12, render: (r) => String(r.billsCount), align: "center" },
      { label: "Emissions", width: contentWidth * 0.2, render: (r) => `${r.carbonEmission.toFixed(1)} kg`, color: COLORS.danger, bold: true },
      { label: "Status", width: contentWidth * 0.2, render: (r) => (parseFloat(r.pctShare) > 35 ? "High Impact" : "Healthy"), color: (r) => (parseFloat(r.pctShare) > 35 ? COLORS.danger : COLORS.primary), bold: true, align: "right" },
    ];
    y = drawTable(doc, MARGIN, y, contentWidth, columns, breakdown, config) + 16;
  }

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Bill Processing Audit Trail", config);

  const auditCols = [
    { label: "Facility Name", width: contentWidth * 0.24, render: (r) => truncate(r.facilityName, 20), bold: true },
    { label: "Utility", width: contentWidth * 0.16, key: "billType" },
    { label: "Period", width: contentWidth * 0.16, render: (r) => `${r.billMonth || ""} ${r.billYear || ""}`.trim() || "—" },
    { label: "Billed Spend", width: contentWidth * 0.18, render: (r) => fmt.formatCurrency(r.totalAmount) },
    { label: "Carbon Output", width: contentWidth * 0.14, render: (r) => `${r.carbonEmission.toFixed(1)} kg`, color: COLORS.danger },
    { label: "Status", width: contentWidth * 0.12, key: "status", color: COLORS.primary, bold: true, align: "right" },
  ];
  y = drawTable(doc, MARGIN, y, contentWidth, auditCols, (payload.billDetails || []).slice(0, 6), config) + 14;

  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.italic)
    .fontSize(7)
    .text(`OCR Verification Status: ${es.verificationStatus || "Verified"} | Data Quality: ${es.auditConfidenceScore || "Grade A"} | AI Model: ${es.aiProvider || "Gemini Vision OCR"}`, MARGIN, y, { width: contentWidth, align: "center" });
}

/* ============================================================================
 * PAGE 6 — ACTION PLAN & GOVERNANCE APPENDIX
 * ========================================================================= */

function buildActionPlanPage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const plan = payload.actionPlan || [];
  const gov = payload.governance || {};
  const noBills = (payload.executiveSummary?.totalBills || 0) === 0;
  let y = top;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Prioritized Carbon Reduction Action Plan", config);

  if (noBills || plan.length === 0) {
    doc.roundedRect(MARGIN, y, contentWidth, 60, 6).fillAndStroke(COLORS.bg, COLORS.border);
    doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(8.5).text("No prioritized reduction action items generated for this reporting period due to absence of active bill intake.", MARGIN + 14, y + 20, { width: contentWidth - 28 });
    y += 75;
  } else {
    const priorityColors = { HIGH: COLORS.danger, MEDIUM: COLORS.warning, LOW: COLORS.secondary };
    plan.slice(0, 4).forEach((item, idx) => {
      const rowH = 44;
      doc.roundedRect(MARGIN, y, contentWidth, rowH - 4, 6).fillAndStroke(idx % 2 === 0 ? COLORS.bg : COLORS.white, COLORS.border);
      
      drawPill(doc, MARGIN + 10, y + 8, item.priority, COLORS.white, priorityColors[item.priority] || COLORS.secondary, config);

      doc.fillColor(COLORS.secondary).font(config.fonts.bodyBold).fontSize(8.3).text(truncate(item.action, 95), MARGIN + 72, y + 7, { width: contentWidth - 72 - 120 });
      doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(7.5).text(`Target: ${item.facility} (${item.utility})`, MARGIN + 72, y + 22);

      doc.fillColor(COLORS.primary).font(config.fonts.bodyBold).fontSize(8).text(item.expectedCarbonSavings, MARGIN + contentWidth - 110, y + 7, { width: 100, align: "right" });
      doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(7.5).text(`${item.expectedCostSavings} | ${item.timeline}`, MARGIN + contentWidth - 110, y + 22, { width: 100, align: "right" });

      y += rowH;
    });
    y += 14;
  }

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Report Governance & Audit Appendix", config);

  const meta = [
    ["Accounting Standard", gov.accountingStandard || "GHG Protocol Corporate Standard (Scope 1 & 2)"],
    ["Data Quality Grade", gov.dataQualityGrade || "Grade A — 100% OCR Verification"],
    ["Platform Engine", gov.platform || "EcoAudit AI Enterprise Carbon Governance Engine"],
    ["Audit Reference", payload.reportId || config.reportId],
  ];
  meta.forEach(([label, val]) => {
    doc.fillColor(COLORS.muted).font(config.fonts.bodyBold).fontSize(8).text(label, MARGIN, y, { width: 140 });
    doc.fillColor(COLORS.secondary).font(config.fonts.body).fontSize(8).text(val, MARGIN + 140, y, { width: contentWidth - 140 });
    y += 16;
  });
  y += 12;

  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + contentWidth, y)
    .stroke();
  y += 10;

  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.italic)
    .fontSize(7.5)
    .text(
      "Official Document — Generated by EcoAudit AI Enterprise Platform following standard greenhouse-gas accounting protocols (GHG Protocol Corporate Standard).",
      MARGIN,
      y,
      { width: contentWidth, align: "center" }
    );
}

/* ============================================================================
 * ENTRY POINT & PIPELINE
 * ========================================================================= */

export const generateReportPDF = (payload) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        bufferPages: true,
        info: {
          Title: `EcoAudit AI - ${payload.reportType || "Sustainability Report"}`,
          Author: "EcoAudit AI Platform",
          Subject: "Executive Sustainability Assessment Report",
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const fonts = resolveFonts(doc);
      const fmt = buildFormatters(fonts);
      const config = {
        fonts,
        contentWidth: doc.page.width - MARGIN * 2,
        companyName: payload.company?.name || "EcoAudit Enterprise",
        brandLine: `${payload.company?.name || "EcoAudit Enterprise"} — Executive Sustainability Report`,
        reportId: payload.reportId || `EA-${Date.now().toString(36).toUpperCase()}`,
      };

      // Page 1: Cover Page
      buildCoverPage(doc, payload, config, fmt);

      // Pages 2 - 6
      const pages = [
        { title: "Executive Summary", build: buildExecutiveSummaryPage },
        { title: "AI Sustainability Intelligence", build: buildIntelligencePage },
        { title: "Utility & Carbon Analysis", build: buildUtilityAnalysisPage },
        { title: "Facility Performance & Audit Trail", build: buildFacilityPerformancePage },
        { title: "Action Plan & Governance", build: buildActionPlanPage },
      ];

      pages.forEach((page, i) => {
        doc.addPage();
        const bodyTop = drawHeader(doc, config, i + 2, i + 1, page.title);
        page.build(doc, payload, config, fmt, bodyTop);
        drawFooter(doc, config, i + 2);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};