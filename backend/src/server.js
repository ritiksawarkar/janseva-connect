import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Static file serving for evidence uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount application routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/officer", officerRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to JanSeva Connect API",
    platform: "Accessible Public Services & Grievance Resolution Portal",
    modules: [
      "Member 1: Citizen Complaints",
      "Member 2: Public Services & Schemes",
      "Member 3: Admin Panel & Platform Management",
      "Member 4: Department Officer & Complaint Resolution"
    ],
    status: "Running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "JanSeva Connect backend is healthy",
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected server error occurred."
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Database connection / seed store before accepting requests
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(` JanSeva Connect API running on port ${PORT}`);
    console.log(` Admin API available at http://localhost:${PORT}/api/admin`);
  });
});
