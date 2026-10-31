import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import CitizenLayout from '../layouts/CitizenLayout';
import AdminLayout from '../layouts/AdminLayout';
import OfficerLayout from '../layouts/OfficerLayout';

// Citizen Portal Pages (Member 1)
import CitizenDashboard from '../pages/CitizenDashboard';
import MyComplaints from '../pages/MyComplaints';
import SubmitComplaint from '../pages/SubmitComplaint';
import NearbyComplaints from '../pages/NearbyComplaints';
import NearbyComplaintResults from '../pages/NearbyComplaintResults';
import JoinedComplaints from '../pages/JoinedComplaints';
import ComplaintDetails from '../pages/ComplaintDetails';
import TrackComplaint from '../pages/TrackComplaint';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Admin Panel Pages (Member 3 - 16 Pages)
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CitizenManagement from '../pages/admin/CitizenManagement';
import AllComplaints from '../pages/admin/AllComplaints';
import ComplaintVerification from '../pages/admin/ComplaintVerification';
import ComplaintAssignments from '../pages/admin/ComplaintAssignments';
import DepartmentManagement from '../pages/admin/DepartmentManagement';
import OfficerManagement from '../pages/admin/OfficerManagement';
import ServiceManagement from '../pages/admin/ServiceManagement';
import ServiceForm from '../pages/admin/ServiceForm';
import SchemeManagement from '../pages/admin/SchemeManagement';
import SchemeForm from '../pages/admin/SchemeForm';
import SlaManagement from '../pages/admin/SlaManagement';
import EscalationManagement from '../pages/admin/EscalationManagement';
import AnalyticsReports from '../pages/admin/AnalyticsReports';
import NotificationsManagement from '../pages/admin/NotificationsManagement';
import AdminSettings from '../pages/admin/AdminSettings';

// Department Officer Panel Pages (Member 4 - 9 Pages)
import OfficerLogin from '../pages/officer/OfficerLogin';
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import AssignedComplaints from '../pages/officer/AssignedComplaints';
import NewAssignments from '../pages/officer/NewAssignments';
import OfficerComplaintDetails from '../pages/officer/OfficerComplaintDetails';
import UpdateProgress from '../pages/officer/UpdateProgress';
import SubmitResolution from '../pages/officer/SubmitResolution';
import CompletedComplaints from '../pages/officer/CompletedComplaints';
import OfficerNotifications from '../pages/officer/OfficerNotifications';
import OfficerProfile from '../pages/officer/OfficerProfile';

import { Users, HardHat, Shield, ArrowRight } from 'lucide-react';

export function PortalHome() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-2xl w-full text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20 text-lg">
          JS
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          JanSeva Connect
        </h1>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
          Accessible Public Services & Grievance Resolution Portal
        </p>

        <p className="text-slate-500 text-xs mt-3 leading-relaxed max-w-lg mx-auto">
          Unified multi-stakeholder government grievance redressal system. Access the Citizen Public Portal, the Department Officer Field Console, or the Central Administrative Management Suite below.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
          {/* Member 1: Citizen Portal */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Citizen Portal</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Submit complaints, view nearby grievances, join existing community issues, and track resolution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
              <Link
                to="/citizen/dashboard"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>Citizen View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/login" className="text-[11px] text-slate-500 hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          {/* Member 4: Department Officer Portal */}
          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-xs">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Officer Console</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Inspect assigned grievances, update field progress, upload photographic evidence, and submit for closure.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between">
              <Link
                to="/officer/dashboard"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Officer View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/officer/login" className="text-[11px] text-slate-500 hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          {/* Member 3: Admin Management Suite */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Admin Suite</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Citizen management, grievance verification, department routing, SLA monitoring, and platform settings.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <Link
                to="/admin/dashboard"
                className="text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1"
              >
                <span>Admin View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/login" className="text-[11px] text-slate-500 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Government Public Grievance Redressal Infrastructure • Collaborative Engineering
        </div>
      </div>
    </main>
  );
}

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Portal Hub */}
      <Route path="/" element={<PortalHome />} />

      {/* Citizen Portal Layout & Pages (Member 1) */}
      <Route element={<CitizenLayout />}>
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/complaints" element={<MyComplaints />} />
        <Route path="/citizen/complaints/new" element={<SubmitComplaint />} />
        <Route path="/citizen/nearby-complaints" element={<NearbyComplaints />} />
        <Route path="/citizen/nearby-complaints/results" element={<NearbyComplaintResults />} />
        <Route path="/citizen/joined-complaints" element={<JoinedComplaints />} />
        <Route path="/citizen/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/track-complaint" element={<TrackComplaint />} />

        {/* Citizen Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Panel Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Panel Protected Suite (Member 3 - 16 Pages) */}
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

      {/* Department Officer Authentication */}
      <Route path="/officer/login" element={<OfficerLogin />} />

      {/* Department Officer Protected Suite (Member 4 - 9 Pages) */}
      <Route path="/officer" element={<OfficerLayout />}>
        <Route index element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="complaints" element={<AssignedComplaints />} />
        <Route path="assignments/new" element={<NewAssignments />} />
        <Route path="complaints/:id" element={<OfficerComplaintDetails />} />
        <Route path="complaints/:id/progress" element={<UpdateProgress />} />
        <Route path="complaints/:id/resolution" element={<SubmitResolution />} />
        <Route path="complaints/completed" element={<CompletedComplaints />} />
        <Route path="notifications" element={<OfficerNotifications />} />
        <Route path="profile" element={<OfficerProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
