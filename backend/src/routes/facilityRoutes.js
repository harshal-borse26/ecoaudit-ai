import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { addFacility, getAllFacilities, getFacility, editFacility, removeFacility} from "../controllers/facilityController.js";

const router = express.Router();

router.post("/", authenticate, addFacility);
router.post("/", authenticate, addFacility);

router.get("/", authenticate, getAllFacilities);

router.get("/:id", authenticate, getFacility);

router.put("/:id", authenticate, editFacility);

router.delete("/:id", authenticate, removeFacility);


export default router;