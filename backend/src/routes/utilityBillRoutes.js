import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  addBill,
  getAllBills,
  getBill,
  editBill,
  removeBill,
  testAI,
  processBill,
  getBillFileUrl,
} from "../controllers/utilityBillController.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    upload.single("billFile"),
    addBill
);
router.get("/", authenticate, getAllBills);
router.get("/:id/file-url", authenticate, getBillFileUrl);
router.get("/:id", authenticate, getBill);
router.put("/:id", authenticate, editBill);
router.delete("/:id", authenticate, removeBill);
router.post("/test-ai", testAI);
router.post("/:id/process", authenticate, processBill);

export default router;