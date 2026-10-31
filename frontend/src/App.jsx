import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";

// 16 Admin Panel Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CitizenManagement from "./pages/admin/CitizenManagement";
import AllComplaints from "./pages/admin/AllComplaints";
import ComplaintVerification from "./pages/admin/ComplaintVerification";
import ComplaintAssignments from "./pages/admin/ComplaintAssignments";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import OfficerManagement from "./pages/admin/OfficerManagement";
import ServiceManagement from "./pages/admin/ServiceManagement";
import ServiceForm from "./pages/admin/ServiceForm";
import SchemeManagement from "./pages/admin/SchemeManagement";
import SchemeForm from "./pages/admin/SchemeForm";
import SlaManagement from "./pages/admin/SlaManagement";
import EscalationManagement from "./pages/admin/EscalationManagement";
import AnalyticsReports from "./pages/admin/AnalyticsReports";
import NotificationsManagement from "./pages/admin/NotificationsManagement";
import AdminSettings from "./pages/admin/AdminSettings";

import { Shield, ArrowRight, ExternalLink } from "lucide-react";

// Home landing preserving shared space for Member 1 (Citizens) and Member 2 (Services)
function PortalHome() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-lg w-full text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-500/20">
          JS
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          JanSeva Connect
        </h1>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
          Accessible Public Services & Grievance Resolution Portal
        </p>

        <p className="text-slate-500 text-xs mt-3 leading-relaxed">
          Integrated multi-role public administration system. Member 3 Admin Management System is active and online.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            to="/admin/dashboard"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2"
          >
            <Shield className="w-4 h-4 mr-1" />
            <span>Launch Admin Management Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/admin/login"
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition block"
          >
            Admin Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Landing */}
          <Route path="/" element={<PortalHome />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Suite (16 Pages) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            {/* Page 1 */}
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* Page 2 */}
            <Route path="citizens" element={<CitizenManagement />} />
            {/* Page 3 */}
            <Route path="complaints" element={<AllComplaints />} />
            {/* Page 4 */}
            <Route path="complaints/verification" element={<ComplaintVerification />} />
            {/* Page 5 */}
            <Route path="complaints/assignments" element={<ComplaintAssignments />} />
            {/* Page 6 */}
            <Route path="departments" element={<DepartmentManagement />} />
            {/* Page 7 */}
            <Route path="officers" element={<OfficerManagement />} />
            {/* Page 8 */}
            <Route path="services" element={<ServiceManagement />} />
            {/* Page 9 */}
            <Route path="services/new" element={<ServiceForm />} />
            <Route path="services/:id/edit" element={<ServiceForm />} />
            {/* Page 10 */}
            <Route path="schemes" element={<SchemeManagement />} />
            {/* Page 11 */}
            <Route path="schemes/new" element={<SchemeForm />} />
            <Route path="schemes/:id/edit" element={<SchemeForm />} />
            {/* Page 12 */}
            <Route path="sla" element={<SlaManagement />} />
            {/* Page 13 */}
            <Route path="escalations" element={<EscalationManagement />} />
            {/* Page 14 */}
            <Route path="analytics" element={<AnalyticsReports />} />
            {/* Page 15 */}
            <Route path="notifications" element={<NotificationsManagement />} />
            {/* Page 16 */}
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
