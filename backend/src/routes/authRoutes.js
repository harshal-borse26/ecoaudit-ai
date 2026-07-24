import express from "express";
import {
  signup,
  login,
  profile,
  me,
  changePassword,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticate, me);
router.get("/profile", authenticate, profile);
router.put("/change-password", authenticate, changePassword);

export default router;  