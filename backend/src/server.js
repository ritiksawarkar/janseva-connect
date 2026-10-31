import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
  })
);

app.use(express.json());

// Mount application routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to JanSeva Connect API",
    platform: "Accessible Public Services & Grievance Resolution Portal",
    module: "Member 3: Admin Panel & Platform Management",
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
