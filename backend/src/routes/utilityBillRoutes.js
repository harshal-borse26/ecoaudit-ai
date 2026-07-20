import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";

import {
  addBill,
  getAllBills,
  getBill,
  editBill,
  removeBill,
  testAI, processBill
} from "../controllers/utilityBillController.js";

const router = express.Router();

router.post("/", authenticate, addBill);
router.get("/", authenticate, getAllBills);
router.get("/:id", authenticate, getBill);
router.put("/:id", authenticate, editBill);
router.delete("/:id", authenticate, removeBill);
router.post("/test-ai", testAI);
router.post("/:id/process",authenticate,processBill);

export default router;