import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  dashboardSummary,
  monthlyCarbonTrend,
  utilityDistribution,
  facilityEmissions,
  recentBills,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", authenticate, dashboardSummary);
router.get("/monthly-carbon", authenticate, monthlyCarbonTrend);
router.get("/utility-distribution", authenticate, utilityDistribution);
router.get("/facility-emissions", authenticate, facilityEmissions);
router.get("/recent-bills", authenticate, recentBills);

export default router;
