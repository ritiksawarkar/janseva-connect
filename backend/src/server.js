import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import nearbyComplaintRoutes from './routes/nearbyComplaintRoutes.js';
import complaintSupportRoutes from './routes/complaintSupportRoutes.js';
import complaintTrackingRoutes from './routes/complaintTrackingRoutes.js';
import citizenDashboardRoutes from './routes/citizenDashboardRoutes.js';
import { getCitizenJoinedComplaintsList } from './controllers/complaintSupportController.js';
import { authenticate } from './middleware/authMiddleware.js';
import { query } from './config/db.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in current directory or backend directory
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env')
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded attachments
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to JanSeva Connect API',
    status: 'Running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString()
  });
});

// Metadata APIs for frontend forms
app.get('/api/departments', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, code, description, contact_email, contact_phone FROM departments WHERE is_active = TRUE ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
});

app.get('/api/complaints/meta/categories', (req, res) => {
  const categories = [
    {
      name: 'Sanitation',
      label: 'Sanitation & Solid Waste',
      subcategories: ['Garbage Accumulation', 'Overflowing Dustbin', 'Street Sweeping', 'Open Dumping', 'Public Toilet Maintenance']
    },
    {
      name: 'Public Works',
      label: 'Public Works (PWD) & Roads',
      subcategories: ['Pothole', 'Damaged Road', 'Footpath Repair', 'Open Manhole', 'Speed Breaker / Divider']
    },
    {
      name: 'Electrical',
      label: 'Electrical & Street Lighting',
      subcategories: ['Streetlight Failure', 'Hanging Cable / Wire', 'Transformer Issue', 'Damaged Electric Pole']
    },
    {
      name: 'Water Supply',
      label: 'Water Supply & Sewerage',
      subcategories: ['Pipe Burst', 'Water Contamination', 'Low Water Pressure', 'Water Supply Timing', 'Leaking Valve']
    },
    {
      name: 'Drainage',
      label: 'Drainage & Stormwater',
      subcategories: ['Blocked Gutter', 'Stormwater Overflow', 'Open Gutter', 'Stagnant Gutter Water']
    },
    {
      name: 'Health',
      label: 'Public Health & Environment',
      subcategories: ['Mosquito Breeding / Fogging', 'Dead Animal Removal', 'Pest Control', 'Hospital Hygiene']
    },
    {
      name: 'Other',
      label: 'General / Other Civic Issues',
      subcategories: ['Encroachment', 'Noise Pollution', 'Illegal Hoardings', 'Tree Trimming']
    }
  ];

  res.json({ success: true, data: categories });
});

// Citizen Dashboard & Joined Complaints Routes
app.use('/api/citizen/dashboard', citizenDashboardRoutes);
app.get('/api/citizen/joined-complaints', authenticate, getCitizenJoinedComplaintsList);

// Core Modules
app.use('/api/auth', authRoutes);
app.use('/api/complaints/nearby', nearbyComplaintRoutes);
app.use('/api/complaints', complaintSupportRoutes);
app.use('/api/complaints', complaintTrackingRoutes);
app.use('/api/complaints', complaintRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Attachment upload error: ${err.message}`
    });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`JanSeva Connect API running on port ${PORT}`);
});
