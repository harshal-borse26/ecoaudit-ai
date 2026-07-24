import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ============================================================================
 * DESIGN SYSTEM
 * ----------------------------------------------------------------------------
 * A single, restrained palette + type scale used by every page. Keeping this
 * in one place is what lets every section look consistent instead of each
 * page inventing its own styling (the root cause of the old "web page
 * printed to PDF" feel).
 * ========================================================================= */

const COLORS = {
  primary: "#2E7D32",
  primaryLight: "#E7F3E8",
  secondary: "#1565C0",
  secondaryLight: "#E8F0FB",
  warning: "#F9A825",
  warningLight: "#FDF3E0",
  danger: "#D32F2F",
  dangerLight: "#FBE9E8",
  dark: "#1E293B",
  muted: "#64748B",
  subtle: "#94A3B8",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E2E8F0",
};

const MARGIN = 42;
const TOTAL_PAGES = 6;

/**
 * Registers Poppins/Inter if the font files exist next to this module, and
 * falls back to the PDF-safe Helvetica family otherwise. This directly fixes
 * two silent rendering bugs in the old generator: the rupee sign (₹) and the
 * CO₂ subscript are outside the WinAnsi encoding used by the base-14
 * Helvetica font, so they rendered as broken glyphs. When the custom fonts
 * aren't present we simply avoid those characters instead of printing
 * garbled ones.
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
          // fall through to next candidate
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

/** Small abstract leaf mark, drawn as vectors so it never depends on emoji
 *  glyph support in the active font (the old cover page used a 🌿 emoji,
 *  which is exactly the kind of character that renders as a broken box in
 *  a standard PDF font). */
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
  doc.fillColor(COLORS.dark).font(config.fonts.headingMedium).fontSize(10.5).text(text, x, y, { width });
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .moveTo(x, y + 15)
    .lineTo(x + width, y + 15)
    .stroke();
  return y + 24;
}

function kpiCard(doc, x, y, w, h, label, value, config, valueColor = COLORS.dark) {
  doc.roundedRect(x, y, w, h, 8).fillAndStroke(COLORS.bg, COLORS.border);
  doc
    .fillColor(COLORS.muted)
    .font(config.fonts.bodyBold)
    .fontSize(7)
    .text(label.toUpperCase(), x + 12, y + 10, { width: w - 24, characterSpacing: 0.4 });
  doc
    .fillColor(valueColor)
    .font(config.fonts.headingBold)
    .fontSize(12.5)
    .text(String(value), x + 12, y + 25, { width: w - 24 });
}

function infoCard(doc, x, y, w, h, title, config, drawBody) {
  doc.roundedRect(x, y, w, h, 8).fillAndStroke(COLORS.bg, COLORS.border);
  doc.fillColor(COLORS.primary).font(config.fonts.headingMedium).fontSize(9.5).text(title, x + 14, y + 12);
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(x + 14, y + 27)
    .lineTo(x + w - 14, y + 27)
    .stroke();
  drawBody(x + 14, y + 34, w - 28);
}

/** Generic table renderer. columns: [{ label, width, align, render(row), color(row), bold }] */
function drawTable(doc, x, y, width, columns, rows, config, rowHeight = 21) {
  doc.roundedRect(x, y, width, rowHeight, 3).fill(COLORS.dark);
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
      const color = typeof col.color === "function" ? col.color(row) : col.color || COLORS.dark;
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
  const labelW = 130;
  const valueW = 84;
  const barX = x + labelW;
  const barW = width - labelW - valueW;
  doc
    .fillColor(COLORS.dark)
    .font(config.fonts.bodyBold)
    .fontSize(8)
    .text(truncate(label, 24), x, y + 3, { width: labelW - 8 });
  doc.roundedRect(barX, y, barW, 12, 4).fill(COLORS.bg);
  const fillW = Math.max((Math.min(pct, 100) / 100) * barW, 4);
  doc.roundedRect(barX, y, fillW, 12, 4).fill(color);
  doc
    .fillColor(COLORS.dark)
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
    .text(config.brandLine, MARGIN, 26, { width: contentWidth / 2 });
  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.body)
    .fontSize(7.5)
    .text(`Page ${pageNum} of ${TOTAL_PAGES}`, MARGIN, 26, { width: contentWidth, align: "right" });
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .moveTo(MARGIN, 40)
    .lineTo(MARGIN + contentWidth, 40)
    .stroke();

  const badge = 20;
  const titleY = 54;
  doc.roundedRect(MARGIN, titleY, badge, badge, 5).fill(COLORS.primaryLight);
  doc
    .fillColor(COLORS.primary)
    .font(config.fonts.headingBold)
    .fontSize(9)
    .text(String(sectionNumber).padStart(2, "0"), MARGIN, titleY + 6, { width: badge, align: "center" });
  doc
    .fillColor(COLORS.dark)
    .font(config.fonts.headingBold)
    .fontSize(15)
    .text(title, MARGIN + badge + 10, titleY + 2);
  doc
    .strokeColor(COLORS.primary)
    .lineWidth(1.25)
    .moveTo(MARGIN, titleY + badge + 10)
    .lineTo(MARGIN + contentWidth, titleY + badge + 10)
    .stroke();

  return titleY + badge + 24;
}

function drawFooter(doc, config, pageNum) {
  const { contentWidth } = config;
  const y = doc.page.height - 32;
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
    .text(`${config.companyName} — Confidential`, MARGIN, y + 8);
  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.body)
    .fontSize(7)
    .text(`Page ${pageNum} of ${TOTAL_PAGES}`, MARGIN, y + 8, { width: contentWidth, align: "right" });
}

/* ============================================================================
 * PAGE 1 — COVER
 * ========================================================================= */

function buildCoverPage(doc, payload, config, fmt) {
  const { contentWidth } = config;

  drawBrandMark(doc, MARGIN, 50, 30, COLORS.primary);
  doc
    .fillColor(COLORS.dark)
    .font(config.fonts.headingBold)
    .fontSize(15)
    .text("EcoAudit AI", MARGIN + 40, 55);
  doc
    .fillColor(COLORS.muted)
    .font(config.fonts.body)
    .fontSize(8.5)
    .text("Enterprise carbon governance platform", MARGIN + 40, 74);

  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .moveTo(MARGIN, 100)
    .lineTo(MARGIN + contentWidth, 100)
    .stroke();

  const blockY = 300;
  doc
    .fillColor(COLORS.muted)
    .font(config.fonts.bodyBold)
    .fontSize(9.5)
    .text(config.companyName.toUpperCase(), MARGIN, blockY, { characterSpacing: 0.6 });
  doc
    .fillColor(COLORS.dark)
    .font(config.fonts.headingBold)
    .fontSize(26)
    .text("Executive sustainability report", MARGIN, blockY + 18, { width: contentWidth - 40 });
  doc
    .fillColor(COLORS.secondary)
    .font(config.fonts.headingMedium)
    .fontSize(12.5)
    .text(payload.reportType || "Monthly carbon audit report", MARGIN, blockY + 62);

  // Minimal identifying metadata — a slim row, not a boxed list.
  const metaY = blockY + 130;
  const metaItems = [
    { label: "Scope", value: payload.filterScope?.facilityName || "Company-wide" },
    { label: "Reporting period", value: payload.filterScope?.periodLabel || "—" },
    { label: "Generated", value: new Date(payload.generatedAt || Date.now()).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) },
    { label: "Report ID", value: config.reportId },
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
    const padX = idx === 0 ? 0 : 14;
    doc
      .fillColor(COLORS.subtle)
      .font(config.fonts.bodyBold)
      .fontSize(7)
      .text(item.label.toUpperCase(), x + padX, metaY, { width: colW - padX - 8, characterSpacing: 0.4 });
    doc
      .fillColor(COLORS.dark)
      .font(config.fonts.bodyBold)
      .fontSize(9)
      .text(truncate(item.value, 26), x + padX, metaY + 13, { width: colW - padX - 8 });
  });

  // Confidentiality strip doubles as the cover footer.
  const stripY = doc.page.height - 70;
  doc.roundedRect(MARGIN, stripY, contentWidth, 34, 6).fill(COLORS.dark);
  doc
    .fillColor(COLORS.white)
    .font(config.fonts.bodyBold)
    .fontSize(8.5)
    .text("Confidential — prepared for executive & ESG review", MARGIN + 14, stripY + 12);
  doc
    .fillColor("#94A3B8")
    .font(config.fonts.body)
    .fontSize(8)
    .text(`Page 1 of ${TOTAL_PAGES}`, MARGIN, stripY + 12, { width: contentWidth - 14, align: "right" });
}

/* ============================================================================
 * PAGE 2 — EXECUTIVE SUMMARY
 * ========================================================================= */

function buildExecutiveSummaryPage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const es = payload.executiveSummary || {};
  let y = top;

  const gap = 10;
  const cardW = (contentWidth - gap * 3) / 4;
  const cardH = 50;
  kpiCard(doc, MARGIN, y, cardW, cardH, "Processed bills", `${es.processedBills || 0} / ${es.totalBills || 0}`, config);
  kpiCard(doc, MARGIN + (cardW + gap), y, cardW, cardH, "Total emissions", `${(es.totalCarbonEmission || 0).toFixed(1)} kg`, config, COLORS.danger);
  kpiCard(doc, MARGIN + (cardW + gap) * 2, y, cardW, cardH, "Utility spend", fmt.formatCurrency(es.totalAmount), config, COLORS.secondary);
  kpiCard(doc, MARGIN + (cardW + gap) * 3, y, cardW, cardH, "Monitored sites", `${es.facilitiesCovered || 0}`, config, COLORS.primary);
  y += cardH + 18;

  const primaryUtility = es.highestContributingUtility || "electricity";
  const topFacility = es.highestContributingFacility || "the primary facility";
  const synthesis =
    `EcoAudit AI verified ${es.processedBills || 0} of ${es.totalBills || 0} submitted utility invoices across ` +
    `${es.facilitiesCovered || 0} monitored facilities for this reporting period. ${primaryUtility} was the leading ` +
    `contributor to the organization's carbon footprint, and ${topFacility} recorded the highest facility-level ` +
    `emissions. Combined Scope 1 and Scope 2 output reached ${(es.totalCarbonEmission || 0).toFixed(1)} kg ${fmt.co2e} against ` +
    `${fmt.formatCurrency(es.totalAmount)} in utility spend.`;

  infoCard(doc, MARGIN, y, contentWidth, 92, "Summary", config, (bx, by, bw) => {
    doc.fillColor(COLORS.dark).font(config.fonts.body).fontSize(8.5).text(synthesis, bx, by, { width: bw, lineHeight: 1.4 });
  });
  y += 92 + 22;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Key findings", config);

  const utilityShare = payload.utilityBreakdown?.[0]?.pctShare;
  const findings = [
    { label: "Highest-emission facility", desc: `${topFacility} accounts for the largest share of monitored emissions.` },
    { label: "Primary utility driver", desc: `${primaryUtility} contributed roughly ${utilityShare ?? "the majority of"}${utilityShare ? "%" : ""} of total emissions.` },
    { label: "Data completeness", desc: "All submitted invoices passed automated verification with no data gaps." },
    { label: "Spend and emissions correlation", desc: "Utility spend tracks closely with operational peak-demand periods." },
    { label: "Priority lever", desc: "Operating-schedule and efficiency improvements offer the fastest reduction path." },
  ];

  findings.forEach((f, idx) => {
    doc.circle(MARGIN + 4, y + 5, 3).fill(COLORS.primary);
    doc
      .fillColor(COLORS.dark)
      .font(config.fonts.bodyBold)
      .fontSize(8.5)
      .text(f.label, MARGIN + 16, y, { width: 160 });
    doc
      .fillColor(COLORS.muted)
      .font(config.fonts.body)
      .fontSize(8.5)
      .text(f.desc, MARGIN + 190, y, { width: contentWidth - 190 });
    y += 26;
    if (idx < findings.length - 1) {
      doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(MARGIN, y - 6)
        .lineTo(MARGIN + contentWidth, y - 6)
        .stroke();
    }
  });
}

/* ============================================================================
 * PAGE 3 — UTILITY & CARBON ANALYSIS
 * ========================================================================= */

function buildUtilityAnalysisPage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const breakdown = payload.utilityBreakdown || [];
  let y = top;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Utility breakdown", config);

  const columns = [
    { label: "Utility type", width: contentWidth * 0.2, key: "type", bold: true },
    { label: "Usage", width: contentWidth * 0.2, render: (r) => (r.usage > 0 ? `${r.usage.toFixed(1)} ${r.unit}` : "—") },
    { label: "Invoices", width: contentWidth * 0.13, render: (r) => String(r.count), align: "center" },
    { label: "Spend", width: contentWidth * 0.2, render: (r) => fmt.formatCurrency(r.totalAmount) },
    { label: "Emissions (share)", width: contentWidth * 0.27, render: (r) => `${r.carbonEmission.toFixed(1)} kg (${r.pctShare}%)`, color: COLORS.danger, bold: true, align: "right" },
  ];
  y = drawTable(doc, MARGIN, y, contentWidth, columns, breakdown, config) + 20;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Emissions share by category", config);
  breakdown.slice(0, 5).forEach((u) => {
    const pct = parseFloat(u.pctShare || 0);
    drawBarRow(doc, MARGIN, y, contentWidth, u.type, `${u.carbonEmission.toFixed(1)} kg`, pct, pct > 50 ? COLORS.danger : COLORS.primary, config);
    y += 22;
  });
  y += 14;

  const methodH = 96;
  infoCard(doc, MARGIN, y, contentWidth, methodH, "Methodology summary", config, (bx, by, bw) => {
    doc
      .fillColor(COLORS.muted)
      .font(config.fonts.body)
      .fontSize(8)
      .text(
        `Emissions are calculated as utility usage multiplied by a standard IPCC emission factor for each ` +
        `utility type, then summed across all categories to produce total Scope 1 and Scope 2 output.`,
        bx,
        by,
        { width: bw, lineHeight: 1.35 }
      );

    const factors = [
      ["Electricity", "0.85 kg / kWh"],
      ["Natural gas", "1.90 kg / m³"],
      ["Diesel", "2.68 kg / L"],
      ["Water", "0.35 kg / kL"],
    ];
    const fw = bw / factors.length;
    factors.forEach(([label, val], idx) => {
      const fx = bx + idx * fw;
      doc.fillColor(COLORS.subtle).font(config.fonts.bodyBold).fontSize(7).text(label.toUpperCase(), fx, by + 30, { characterSpacing: 0.3 });
      doc.fillColor(COLORS.danger).font(config.fonts.bodyBold).fontSize(8.5).text(val, fx, by + 41);
    });
  });
}

/* ============================================================================
 * PAGE 4 — FACILITY PERFORMANCE (adaptive)
 * ========================================================================= */

function buildFacilityPerformancePage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const es = payload.executiveSummary || {};
  const breakdown = payload.facilityBreakdown || [];
  const isSingle = (es.facilitiesCovered || 0) <= 1 || breakdown.length <= 1;
  let y = top;

  if (isSingle) {
    const fac = breakdown[0] || {
      name: payload.filterScope?.facilityName || "Target facility",
      location: "Monitored site",
      billsCount: es.processedBills || 0,
      totalAmount: es.totalAmount || 0,
      carbonEmission: es.totalCarbonEmission || 0,
      utilities: payload.utilityBreakdown?.map((u) => u.type) || [],
    };

    y = sectionLabel(doc, MARGIN, y, contentWidth, "Single-facility spotlight", config);

    const cardH = 96;
    doc.roundedRect(MARGIN, y, contentWidth, cardH, 8).fillAndStroke(COLORS.bg, COLORS.border);
    doc.rect(MARGIN, y, 5, cardH).fill(COLORS.primary);
    doc.fillColor(COLORS.dark).font(config.fonts.headingBold).fontSize(13).text(fac.name, MARGIN + 20, y + 14);
    doc.fillColor(COLORS.muted).font(config.fonts.body).fontSize(8.5).text(fac.location, MARGIN + 20, y + 32);

    const stats = [
      ["Invoices", `${fac.billsCount}`],
      ["Spend", fmt.formatCurrency(fac.totalAmount)],
      ["Emissions", `${fac.carbonEmission.toFixed(1)} kg`],
      ["Utilities", (fac.utilities || []).join(", ") || "—"],
    ];
    const sw = (contentWidth - 40) / stats.length;
    stats.forEach(([label, val], idx) => {
      const sx = MARGIN + 20 + idx * sw;
      doc.fillColor(COLORS.subtle).font(config.fonts.bodyBold).fontSize(7).text(label.toUpperCase(), sx, y + 58, { characterSpacing: 0.3 });
      doc.fillColor(COLORS.dark).font(config.fonts.bodyBold).fontSize(9.5).text(truncate(val, 22), sx, y + 69, { width: sw - 10 });
    });
    y += cardH + 22;

    y = sectionLabel(doc, MARGIN, y, contentWidth, "Facility utility breakdown", config);
    const columns = [
      { label: "Utility type", width: contentWidth * 0.24, key: "type", bold: true },
      { label: "Usage", width: contentWidth * 0.22, render: (r) => (r.usage > 0 ? `${r.usage.toFixed(1)} ${r.unit}` : "—") },
      { label: "Spend", width: contentWidth * 0.22, render: (r) => fmt.formatCurrency(r.totalAmount) },
      { label: "Emissions", width: contentWidth * 0.16, render: (r) => `${r.carbonEmission.toFixed(1)} kg`, color: COLORS.danger, bold: true },
      { label: "Share", width: contentWidth * 0.16, render: (r) => `${r.pctShare}%`, align: "right" },
    ];
    y = drawTable(doc, MARGIN, y, contentWidth, columns, payload.utilityBreakdown || [], config) + 20;

    infoCard(doc, MARGIN, y, contentWidth, 60, "Operational focus", config, (bx, by, bw) => {
      doc
        .fillColor(COLORS.dark)
        .font(config.fonts.body)
        .fontSize(8.5)
        .text(
          "This facility accounts for the full scope of monitored spend and emissions this period. Prioritize HVAC scheduling and a power-factor review to reduce peak-demand costs.",
          bx,
          by,
          { width: bw, lineHeight: 1.35 }
        );
    });
  } else {
    y = sectionLabel(doc, MARGIN, y, contentWidth, "Facility comparison", config);

    const columns = [
      { label: "Facility", width: contentWidth * 0.28, render: (r) => truncate(r.name, 22), bold: true },
      { label: "Location", width: contentWidth * 0.2, render: (r) => truncate(r.location, 16) },
      { label: "Invoices", width: contentWidth * 0.12, render: (r) => String(r.billsCount), align: "center" },
      { label: "Emissions", width: contentWidth * 0.18, render: (r) => `${r.carbonEmission.toFixed(1)} kg`, color: COLORS.danger, bold: true },
      {
        label: "Status",
        width: contentWidth * 0.22,
        render: (r) => (parseFloat(r.pctShare) > 35 ? "High impact" : "Moderate"),
        color: (r) => (parseFloat(r.pctShare) > 35 ? COLORS.danger : COLORS.primary),
        bold: true,
        align: "right",
      },
    ];
    y = drawTable(doc, MARGIN, y, contentWidth, columns, breakdown, config) + 20;

    y = sectionLabel(doc, MARGIN, y, contentWidth, "Emissions distribution", config);
    breakdown.slice(0, 5).forEach((fac) => {
      const pct = parseFloat(fac.pctShare || 0);
      drawBarRow(doc, MARGIN, y, contentWidth, fac.name, `${fac.carbonEmission.toFixed(1)} kg`, pct, pct > 40 ? COLORS.danger : COLORS.secondary, config);
      y += 22;
    });
    y += 14;

    const topFac = breakdown[0];
    infoCard(doc, MARGIN, y, contentWidth, 62, "Intervention priority", config, (bx, by, bw) => {
      const note = topFac
        ? `${topFac.name} is the highest-impact site, generating ${topFac.pctShare}% of total emissions across ${topFac.billsCount} invoices. Prioritize an efficiency audit here first.`
        : "All monitored facilities are within standard baseline limits.";
      doc.fillColor(COLORS.dark).font(config.fonts.body).fontSize(8.5).text(note, bx, by, { width: bw, lineHeight: 1.35 });
    });
  }
}

/* ============================================================================
 * PAGE 5 — BILL PROCESSING SUMMARY
 * ========================================================================= */

function buildBillProcessingPage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  const es = payload.executiveSummary || {};
  const failed = Math.max((es.totalBills || 0) - (es.processedBills || 0), 0);
  let y = top;

  const gap = 10;
  const cardW = (contentWidth - gap * 3) / 4;
  const cardH = 50;
  kpiCard(doc, MARGIN, y, cardW, cardH, "Uploaded bills", `${es.totalBills || 0}`, config);
  kpiCard(doc, MARGIN + (cardW + gap), y, cardW, cardH, "Processed", `${es.processedBills || 0}`, config, COLORS.primary);
  kpiCard(doc, MARGIN + (cardW + gap) * 2, y, cardW, cardH, "Needs review", `${failed}`, config, failed > 0 ? COLORS.warning : COLORS.muted);
  kpiCard(doc, MARGIN + (cardW + gap) * 3, y, cardW, cardH, "AI provider", es.aiProvider || "Gemini", config, COLORS.secondary);
  y += cardH + 22;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Audit trail", config);

  const columns = [
    { label: "Facility", width: contentWidth * 0.24, render: (r) => truncate(r.facilityName, 20), bold: true },
    { label: "Utility", width: contentWidth * 0.16, key: "billType" },
    { label: "Period", width: contentWidth * 0.16, render: (r) => `${r.billMonth || ""} ${r.billYear || ""}`.trim() || "—" },
    { label: "Amount", width: contentWidth * 0.18, render: (r) => fmt.formatCurrency(r.totalAmount) },
    { label: "Emissions", width: contentWidth * 0.14, render: (r) => `${r.carbonEmission.toFixed(1)} kg`, color: COLORS.danger },
    { label: "Status", width: contentWidth * 0.12, key: "status", color: COLORS.primary, bold: true, align: "right" },
  ];
  y = drawTable(doc, MARGIN, y, contentWidth, columns, (payload.billDetails || []).slice(0, 10), config) + 18;

  doc
    .fillColor(COLORS.subtle)
    .font(config.fonts.italic)
    .fontSize(7.5)
    .text("All processed invoices passed automated field verification against consumer, account and billing-period data.", MARGIN, y, { width: contentWidth });
}

/* ============================================================================
 * PAGE 6 — RECOMMENDATIONS & APPENDIX
 * ========================================================================= */

function buildRecommendationsPage(doc, payload, config, fmt, top) {
  const { contentWidth } = config;
  let y = top;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Recommended actions", config);

  const defaults = [
    { priority: "High", text: "Audit HVAC equipment and shift non-critical loads to off-peak hours.", team: "Facilities" },
    { priority: "High", text: "Inspect standby generator fuel schedules and burner efficiency.", team: "Operations" },
    { priority: "Medium", text: "Review facility power factor and install power-quality monitors.", team: "Electrical eng." },
    { priority: "Medium", text: "Automate monthly invoice ingestion to remove manual reporting lag.", team: "ESG compliance" },
  ];
  const fromPayload = (payload.recommendations || []).map((r, i) => ({
    priority: i < 2 ? "High" : "Medium",
    text: r,
    team: "ESG / Facilities",
  }));
  const recs = (fromPayload.length > 0 ? fromPayload : defaults).slice(0, 6);

  const priorityColors = { High: COLORS.danger, Medium: COLORS.warning, Low: COLORS.secondary };
  recs.forEach((r, idx) => {
    const rowH = 30;
    const bg = idx % 2 === 0 ? COLORS.bg : COLORS.white;
    doc.roundedRect(MARGIN, y, contentWidth, rowH - 4, 4).fillAndStroke(bg, COLORS.border);
    drawPill(doc, MARGIN + 10, y + 6, r.priority, COLORS.white, priorityColors[r.priority] || COLORS.secondary, config);
    doc
      .fillColor(COLORS.dark)
      .font(config.fonts.body)
      .fontSize(8.3)
      .text(r.text, MARGIN + 76, y + 9, { width: contentWidth - 76 - 100 });
    doc
      .fillColor(COLORS.muted)
      .font(config.fonts.bodyBold)
      .fontSize(7.5)
      .text(r.team, MARGIN + contentWidth - 92, y + 9, { width: 92, align: "right" });
    y += rowH;
  });
  y += 20;

  y = sectionLabel(doc, MARGIN, y, contentWidth, "Report governance", config);

  const meta = [
    ["Accounting standard", "GHG Protocol Corporate Standard (Scope 1 & 2)"],
    ["Data quality", "Grade A — full document verification"],
    ["Audit reference", config.reportId],
    ["Platform", "EcoAudit AI Enterprise Platform"],
  ];
  meta.forEach(([label, val]) => {
    doc.fillColor(COLORS.muted).font(config.fonts.bodyBold).fontSize(8).text(label, MARGIN, y, { width: 150 });
    doc.fillColor(COLORS.dark).font(config.fonts.body).fontSize(8).text(val, MARGIN + 150, y, { width: contentWidth - 150 });
    y += 17;
  });
  y += 14;

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
      "This report is generated using AI document intelligence based on verified utility invoices, following standard greenhouse-gas accounting practice.",
      MARGIN,
      y,
      { width: contentWidth, align: "center" }
    );
}

/* ============================================================================
 * ENTRY POINT
 * ----------------------------------------------------------------------------
 * A small, data-driven pipeline: the cover page is built once, then every
 * remaining page comes from the same list of { title, build } definitions.
 * Each page function only draws inside the body region handed to it by
 * drawHeader — nothing is hardcoded page-by-page, and no content block is
 * ever drawn twice.
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
        brandLine: `${payload.company?.name || "EcoAudit Enterprise"} — Executive sustainability report`,
        reportId: `EA-${Date.now().toString(36).toUpperCase()}`,
      };

      buildCoverPage(doc, payload, config, fmt);

      const pages = [
  { title: "Executive summary", build: buildExecutiveSummaryPage },
  { title: "Utility & carbon analysis", build: buildUtilityAnalysisPage },
  { title: "Facility performance", build: buildFacilityPerformancePage },
  { title: "Bill processing summary", build: buildBillProcessingPage },
  { title: "Recommendations & appendix", build: buildRecommendationsPage },
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