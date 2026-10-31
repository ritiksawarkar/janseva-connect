import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BellRing,
  CheckCircle2,
  Bell,
  User,
  LogOut,
  Building2,
  ShieldCheck,
  X
} from "lucide-react";
import { useOfficerAuth } from "../context/OfficerAuthContext";
import { officerApi } from "../services/api";

export function OfficerSidebar({ isOpen, onClose }) {
  const { officer, logout } = useOfficerAuth();
  const navigate = useNavigate();
  const [newCount, setNewCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    async function loadBadges() {
      try {
        const [assignmentsRes, notifRes] = await Promise.all([
          officerApi.getNewAssignments(),
          officerApi.getUnreadCount()
        ]);
        if (assignmentsRes.success && Array.isArray(assignmentsRes.data)) {
          setNewCount(assignmentsRes.data.length);
        }
        if (notifRes.success && typeof notifRes.count === "number") {
          setUnreadNotifs(notifRes.count);
        }
      } catch (err) {
        // Silently fail badge load
      }
    }

    loadBadges();
    const interval = setInterval(loadBadges, 30000); // refresh badges every 30s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      to: "/officer/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard"
    },
    {
      to: "/officer/complaints",
      icon: ClipboardList,
      label: "Assigned Complaints"
    },
    {
      to: "/officer/assignments/new",
      icon: BellRing,
      label: "New Assignments",
      badge: newCount > 0 ? newCount : null,
      badgeColor: "bg-blue-600 text-white"
    },
    {
      to: "/officer/complaints/completed",
      icon: CheckCircle2,
      label: "Completed Complaints"
    },
    {
      to: "/officer/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadNotifs > 0 ? unreadNotifs : null,
      badgeColor: "bg-amber-500 text-white"
    },
    {
      to: "/officer/profile",
      icon: User,
      label: "Officer Profile"
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/officer/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              JS
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 tracking-tight block">
                JanSeva Connect
              </span>
              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">
                Officer Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Officer info snippet */}
        <div className="p-4 mx-3 my-3 bg-blue-50/60 rounded-xl border border-blue-100/80">
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
            <span className="text-[11px] font-bold text-blue-900 truncate">
              {officer?.department_name || "Civic Services Department"}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 truncate font-medium">
            {officer?.designation || "Department Officer"}
          </p>
          <span className="mt-1.5 inline-block text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold">
            {officer?.employee_id || "OFFICER"}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                {officer?.full_name?.charAt(0) || "O"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {officer?.full_name || "Department Officer"}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default OfficerSidebar;
