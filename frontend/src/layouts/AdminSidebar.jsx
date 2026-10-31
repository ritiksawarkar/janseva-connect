import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle,
  UserCheck,
  Building2,
  ShieldCheck,
  Compass,
  Award,
  Clock,
  AlertTriangle,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export function AdminSidebar({ isOpen, onClose }) {
  const navSections = [
    {
      heading: "Overview",
      items: [
        { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard }
      ]
    },
    {
      heading: "Citizen & Grievance Ops",
      items: [
        { label: "Citizens", path: "/admin/citizens", icon: Users },
        { label: "All Complaints", path: "/admin/complaints", icon: FileText },
        { label: "Verification Queue", path: "/admin/complaints/verification", icon: CheckCircle },
        { label: "Assignments", path: "/admin/complaints/assignments", icon: UserCheck },
        { label: "Escalations & Overdue", path: "/admin/escalations", icon: AlertTriangle }
      ]
    },
    {
      heading: "Governance & Directory",
      items: [
        { label: "Departments", path: "/admin/departments", icon: Building2 },
        { label: "Department Officers", path: "/admin/officers", icon: ShieldCheck },
        { label: "SLA Timelines", path: "/admin/sla", icon: Clock }
      ]
    },
    {
      heading: "Public Content & Welfare",
      items: [
        { label: "Public Services", path: "/admin/services", icon: Compass },
        { label: "Government Schemes", path: "/admin/schemes", icon: Award }
      ]
    },
    {
      heading: "Intelligence & Platform",
      items: [
        { label: "Analytics & Reports", path: "/admin/analytics", icon: BarChart3 },
        { label: "Notifications & Alerts", path: "/admin/notifications", icon: Bell },
        { label: "Platform Settings", path: "/admin/settings", icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/20">
            JS
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              JanSeva Connect
            </h1>
            <p className="text-[11px] font-medium text-blue-600">
              Admin Management
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx}>
              <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {sec.heading}
              </h2>
              <div className="space-y-0.5">
                {sec.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      end={item.path === "/admin/dashboard"}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 stroke-[2]" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Platform v1.0 • Live Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
