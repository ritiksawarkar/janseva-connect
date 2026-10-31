import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import citizenDashboardRoutes from "./routes/citizenDashboardRoutes.js";
import complaintTrackingRoutes from "./routes/complaintTrackingRoutes.js";
import complaintSupportRoutes from "./routes/complaintSupportRoutes.js";
import nearbyComplaintRoutes from "./routes/nearbyComplaintRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import schemeRoutes from "./routes/schemeRoutes.js";
import eligibilityRoutes from "./routes/eligibilityRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to JanSeva Connect API",
    status: "Running",
    modules: ["public-services", "government-schemes", "grievance-management"],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Backend is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/citizen", citizenDashboardRoutes);
app.use("/api/tracking", complaintTrackingRoutes);
app.use("/api/support", complaintSupportRoutes);
app.use("/api/nearby", nearbyComplaintRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`JanSeva Connect API running on port ${PORT}`);
});

export default app;
