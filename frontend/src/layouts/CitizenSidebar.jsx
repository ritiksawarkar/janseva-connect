import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MapPin,
  Heart,
  Search,
  ExternalLink,
  Users,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const CitizenSidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, quickLogin } = useAuth();

  const navItems = [
    {
      to: '/citizen/dashboard',
      label: t('nav.dashboard', 'Dashboard'),
      icon: LayoutDashboard
    },
    {
      to: '/citizen/complaints',
      label: t('nav.myComplaints', 'My Complaints'),
      icon: FileText
    },
    {
      to: '/citizen/complaints/new',
      label: t('nav.submitComplaint', 'Register Grievance'),
      icon: PlusCircle
    },
    {
      to: '/citizen/nearby-complaints',
      label: t('nav.nearbyComplaints', 'Nearby Complaints'),
      icon: MapPin,
      badge: 'Discovery'
    },
    {
      to: '/citizen/joined-complaints',
      label: t('nav.joinedComplaints', 'Joined Complaints'),
      icon: Heart
    },
    {
      to: '/track-complaint',
      label: t('nav.trackComplaint', 'Track Status'),
      icon: Search
    }
  ];

  const handleDemoSwitch = async (email, pass) => {
    try {
      await quickLogin(email, pass);
    } catch (e) {
      console.error('Demo account switch failed:', e);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Citizen Portal
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Member 2 Integration Section */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Public Services</span>
              <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-normal">Team M2</span>
            </p>
            <div className="space-y-1 text-xs">
              <a
                href="#public-services"
                onClick={(e) => { e.preventDefault(); alert('Member 2 Public Services Module will render here.'); }}
                className="flex items-center justify-between px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Public Services</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="#government-schemes"
                onClick={(e) => { e.preventDefault(); alert('Member 2 Government Schemes Module will render here.'); }}
                className="flex items-center justify-between px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>Government Schemes</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Innovation Box */}
          <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100 rounded-2xl">
            <p className="text-xs font-bold text-blue-900">
              Community Consolidation
            </p>
            <p className="text-[11px] text-blue-800/80 mt-1 leading-relaxed">
              One Problem → One Main Complaint → Multiple Supporting Citizens → Rapid Department Resolution.
            </p>
          </div>
        </div>

        {/* Bottom: Fast Demo Switcher */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Integration Role Switcher
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoSwitch('citizen@janseva.gov.in', 'Citizen@123')}
              className={`p-1.5 rounded-lg border text-left font-medium transition cursor-pointer ${
                user?.email === 'citizen@janseva.gov.in'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Citizen 1 (Ritik)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('priya@janseva.gov.in', 'Citizen@123')}
              className={`p-1.5 rounded-lg border text-left font-medium transition cursor-pointer ${
                user?.email === 'priya@janseva.gov.in'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Citizen 2 (Priya)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('officer@janseva.gov.in', 'Officer@123')}
              className={`p-1.5 rounded-lg border text-left font-medium transition cursor-pointer ${
                user?.email === 'officer@janseva.gov.in'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Officer (Sanitation)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('admin@janseva.gov.in', 'Admin@123')}
              className={`p-1.5 rounded-lg border text-left font-medium transition cursor-pointer ${
                user?.email === 'admin@janseva.gov.in'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Platform Admin
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CitizenSidebar;
