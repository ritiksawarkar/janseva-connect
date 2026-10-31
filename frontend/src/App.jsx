import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OfficerAuthProvider } from "./context/OfficerAuthContext";
import AdminLayout from "./layouts/AdminLayout";
import OfficerLayout from "./layouts/OfficerLayout";

// 16 Admin Panel Pages (Member 3)
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

// 9 Department Officer Panel Pages (Member 4)
import OfficerLogin from "./pages/officer/OfficerLogin";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import AssignedComplaints from "./pages/officer/AssignedComplaints";
import NewAssignments from "./pages/officer/NewAssignments";
import OfficerComplaintDetails from "./pages/officer/OfficerComplaintDetails";
import UpdateProgress from "./pages/officer/UpdateProgress";
import SubmitResolution from "./pages/officer/SubmitResolution";
import CompletedComplaints from "./pages/officer/CompletedComplaints";
import OfficerNotifications from "./pages/officer/OfficerNotifications";
import OfficerProfile from "./pages/officer/OfficerProfile";

import { Shield, ArrowRight, Building2, UserCheck, HardHat } from "lucide-react";

// Home landing preserving shared space for all team members
function PortalHome() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-xl w-full text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20 text-lg">
          JS
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          JanSeva Connect
        </h1>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
          Accessible Public Services & Grievance Resolution Portal
        </p>

        <p className="text-slate-500 text-xs mt-3 leading-relaxed max-w-md mx-auto">
          Multi-role government grievance redressal platform. Integrated modules for Platform Administration and Department Officer Field Resolution are live.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          {/* Member 4: Officer Portal Card */}
          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-xs">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Department Officer Portal</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Inspect assigned complaints, update field progress, upload resolution photos, and submit for closure.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between">
              <Link
                to="/officer/dashboard"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Officer Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/officer/login" className="text-[11px] text-slate-500 hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          {/* Member 3: Admin Portal Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Admin Management Suite</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Citizen management, grievance verification, department routing, SLA monitoring, and closure approval.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <Link
                to="/admin/dashboard"
                className="text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1"
              >
                <span>Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/login" className="text-[11px] text-slate-500 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Government of Maharashtra & Urban Local Bodies Public Redressal Infrastructure
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <OfficerAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Portal Landing */}
            <Route path="/" element={<PortalHome />} />

            {/* Authentication Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/officer/login" element={<OfficerLogin />} />

            {/* Protected Admin Suite (Member 3 - 16 Pages) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="citizens" element={<CitizenManagement />} />
              <Route path="complaints" element={<AllComplaints />} />
              <Route path="complaints/verification" element={<ComplaintVerification />} />
              <Route path="complaints/assignments" element={<ComplaintAssignments />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="officers" element={<OfficerManagement />} />
              <Route path="services" element={<ServiceManagement />} />
              <Route path="services/new" element={<ServiceForm />} />
              <Route path="services/:id/edit" element={<ServiceForm />} />
              <Route path="schemes" element={<SchemeManagement />} />
              <Route path="schemes/new" element={<SchemeForm />} />
              <Route path="schemes/:id/edit" element={<SchemeForm />} />
              <Route path="sla" element={<SlaManagement />} />
              <Route path="escalations" element={<EscalationManagement />} />
              <Route path="analytics" element={<AnalyticsReports />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Protected Department Officer Suite (Member 4 - 9 Pages) */}
            <Route path="/officer" element={<OfficerLayout />}>
              <Route index element={<Navigate to="/officer/dashboard" replace />} />
              {/* Page 1 */}
              <Route path="dashboard" element={<OfficerDashboard />} />
              {/* Page 2 */}
              <Route path="complaints" element={<AssignedComplaints />} />
              {/* Page 3 */}
              <Route path="assignments/new" element={<NewAssignments />} />
              {/* Page 4 */}
              <Route path="complaints/:id" element={<OfficerComplaintDetails />} />
              {/* Page 5 */}
              <Route path="complaints/:id/progress" element={<UpdateProgress />} />
              {/* Page 6 */}
              <Route path="complaints/:id/resolution" element={<SubmitResolution />} />
              {/* Page 7 */}
              <Route path="complaints/completed" element={<CompletedComplaints />} />
              {/* Page 8 */}
              <Route path="notifications" element={<OfficerNotifications />} />
              {/* Page 9 */}
              <Route path="profile" element={<OfficerProfile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </OfficerAuthProvider>
    </AuthProvider>
  );
}

export default App;
