import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import utilityBillRoutes from "./routes/utilityBillRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/bills", utilityBillRoutes);



// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EcoAudit AI Backend is running 🚀",
  });
});

export default app;