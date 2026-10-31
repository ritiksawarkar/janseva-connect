import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { initializeDatabase, query } from "./config/db.js";

// Member 1 Routes (Citizen Portal & Complaint Registration)
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import nearbyComplaintRoutes from "./routes/nearbyComplaintRoutes.js";
import complaintSupportRoutes from "./routes/complaintSupportRoutes.js";
import complaintTrackingRoutes from "./routes/complaintTrackingRoutes.js";
import citizenDashboardRoutes from "./routes/citizenDashboardRoutes.js";
import { getCitizenJoinedComplaintsList } from "./controllers/complaintSupportController.js";
import { authenticate } from "./middleware/authMiddleware.js";

// Member 3 Routes (Admin Panel & Platform Management)
import adminRoutes from "./routes/adminRoutes.js";

// Member 4 Routes (Department Officer & Resolution Module)
import officerRoutes from "./routes/officerRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in current directory or backend directory
const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env")
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Static file serving for attachments and evidence uploads
const uploadsPath = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to JanSeva Connect API",
    platform: "Accessible Public Services & Grievance Resolution Portal",
    modules: [
      "Member 1: Citizen Complaints & Community Module",
      "Member 2: Public Services & Schemes Module",
      "Member 3: Admin Panel & Platform Management Module",
      "Member 4: Department Officer & Resolution Module"
    ],
    status: "Running",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "JanSeva Connect backend is healthy",
    timestamp: new Date().toISOString()
  });
});

// Metadata APIs for frontend complaint forms
app.get("/api/departments", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, code, description FROM departments ORDER BY name ASC"
    );
    res.json({ success: true, data: result.rows || [] });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ success: false, message: "Failed to fetch departments." });
  }
});

app.get("/api/complaints/meta/categories", (req, res) => {
  const categories = [
    {
      name: "Sanitation",
      label: "Sanitation & Solid Waste",
      subcategories: ["Garbage Accumulation", "Overflowing Dustbin", "Street Sweeping", "Open Dumping", "Public Toilet Maintenance"]
    },
    {
      name: "Public Works",
      label: "Public Works (PWD) & Roads",
      subcategories: ["Pothole", "Damaged Road", "Footpath Repair", "Open Manhole", "Speed Breaker / Divider"]
    },
    {
      name: "Electrical",
      label: "Electrical & Street Lighting",
      subcategories: ["Streetlight Failure", "Hanging Cable / Wire", "Transformer Issue", "Damaged Electric Pole"]
    },
    {
      name: "Water Supply",
      label: "Water Supply & Sewerage",
      subcategories: ["Pipe Burst", "Water Contamination", "Low Water Pressure", "Water Supply Timing", "Leaking Valve"]
    },
    {
      name: "Drainage",
      label: "Drainage & Stormwater",
      subcategories: ["Blocked Gutter", "Stormwater Overflow", "Open Gutter", "Stagnant Gutter Water"]
    },
    {
      name: "Health",
      label: "Public Health & Environment",
      subcategories: ["Mosquito Breeding / Fogging", "Dead Animal Removal", "Pest Control", "Hospital Hygiene"]
    },
    {
      name: "Other",
      label: "General / Other Civic Issues",
      subcategories: ["Encroachment", "Noise Pollution", "Illegal Hoardings", "Tree Trimming"]
    }
  ];
  res.json({ success: true, data: categories });
});

// Citizen Portal Endpoints (Member 1)
app.use("/api/citizen/dashboard", citizenDashboardRoutes);
app.get("/api/citizen/joined-complaints", authenticate, getCitizenJoinedComplaintsList);
app.use("/api/auth", authRoutes);
app.use("/api/complaints/nearby", nearbyComplaintRoutes);
app.use("/api/complaints", complaintSupportRoutes);
app.use("/api/complaints", complaintTrackingRoutes);
app.use("/api/complaints", complaintRoutes);

// Admin Portal Endpoints (Member 3)
app.use("/api/admin", adminRoutes);

// Department Officer Endpoints (Member 4)
app.use("/api/officer", officerRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Attachment upload error: ${err.message}`
    });
  }
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
    console.log(` Officer API available at http://localhost:${PORT}/api/officer`);
    console.log(` Citizen API available at http://localhost:${PORT}/api/citizen`);
  });
});
