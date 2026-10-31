import React, { useState, useEffect } from "react";
import { Menu, Bell, Building2, User, ChevronRight, Check } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useOfficerAuth } from "../context/OfficerAuthContext";
import { officerApi } from "../services/api";

export function OfficerHeader({ onOpenSidebar }) {
  const { officer } = useOfficerAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await officerApi.getNotifications({ limit: 4 });
        if (res.success) {
          setRecentNotifs(res.data || []);
          setUnreadCount(res.unread_count || 0);
        }
      } catch (err) {
        // Silently handle error
      }
    }
    loadNotifications();
  }, [location.pathname]);

  const getPageTitle = (path) => {
    if (path.includes("/dashboard")) return "Dashboard Overview";
    if (path.includes("/assignments/new")) return "New Assignments (Awaiting Action)";
    if (path.includes("/complaints/completed")) return "Completed Work & Closure Log";
    if (path.includes("/progress")) return "Update Work Progress";
    if (path.includes("/resolution")) return "Submit Resolution & Evidence";
    if (path.includes("/complaints/")) return "Grievance Inspection & Details";
    if (path.includes("/complaints")) return "Assigned Public Complaints";
    if (path.includes("/notifications")) return "Department Notifications";
    if (path.includes("/profile")) return "Officer Profile & Performance";
    return "Department Officer Panel";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span>Officer Panel</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-semibold">{getPageTitle(location.pathname)}</span>
          </div>
          <h1 className="text-sm lg:text-base font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      {/* Right: Department Pill, Notifications & Avatar */}
      <div className="flex items-center gap-3">
        {/* Department Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-full border border-slate-200 text-xs text-slate-700 font-medium">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[200px]">{officer?.department_name || "Civic Services"}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-bold text-slate-800">Recent Notifications</span>
                <Link
                  to="/officer/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
                {recentNotifs.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No notifications.</p>
                ) : (
                  recentNotifs.map((n) => (
                    <Link
                      key={n.id}
                      to="/officer/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className={`block p-2 rounded-xl text-xs transition ${
                        n.is_read ? "bg-white hover:bg-slate-50 text-slate-600" : "bg-blue-50/60 text-slate-900 font-medium"
                      }`}
                    >
                      <p className="font-semibold text-xs text-slate-800 truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.message}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Officer Avatar Link */}
        <Link
          to="/officer/profile"
          className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {officer?.full_name?.charAt(0) || "O"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 truncate leading-none">
              {officer?.full_name || "Officer"}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {officer?.employee_id || "OFFICER"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default OfficerHeader;
