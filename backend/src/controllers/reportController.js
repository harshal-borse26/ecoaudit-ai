import { buildReportPayload } from "../services/reportService.js";
import { generateReportPDF } from "../services/pdfGenerator.js";

/**
 * Controller to generate JSON payload for in-browser report preview.
 */
export const previewReport = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const options = req.body || {};

    const payload = await buildReportPayload(companyId, options);

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate report preview",
    });
  }
};

/**
 * Controller to generate and download a professional PDF report.
 */
export const downloadReportPDF = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const options = req.body || {};

    const payload = await buildReportPayload(companyId, options);

    const pdfBuffer = await generateReportPDF(payload);

    const fileName = `ecoaudit-sustainability-report-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF report",
    });
  }
};
