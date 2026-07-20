import express from "express";
import {
  signup,
  login,
  profile,
  me,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticate, me);

// Protected Route
router.get("/profile", authenticate, profile);

export default router;  