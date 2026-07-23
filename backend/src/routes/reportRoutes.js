import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { previewReport, downloadReportPDF } from "../controllers/reportController.js";

const router = express.Router();

router.post("/preview", authenticate, previewReport);
router.post("/generate", authenticate, downloadReportPDF);

export default router;
