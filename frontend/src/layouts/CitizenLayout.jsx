import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CitizenHeader from './CitizenHeader';
import CitizenSidebar from './CitizenSidebar';

export const CitizenLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <CitizenHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <CitizenSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 JanSeva Connect. Citizen-Centric Public Services & Grievance Resolution Portal.</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Team: Member 1 (Lead & Grievance Core)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-medium">Core System Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CitizenLayout;

