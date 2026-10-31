import React, { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useOfficerAuth } from "../context/OfficerAuthContext";
import OfficerSidebar from "./OfficerSidebar";
import OfficerHeader from "./OfficerHeader";

export function OfficerLayout() {
  const { isAuthenticated, isLoading } = useOfficerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Verifying Officer Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/officer/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <OfficerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <OfficerHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OfficerLayout;
