import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { changeLanguage } from '../i18n';
import {
  Menu,
  Globe,
  PlusCircle,
  Search,
  User,
  LogOut,
  Building2,
  CheckCircle2
} from 'lucide-react';

export const CitizenHeader = ({ onToggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleLangChange = (e) => {
    changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/track-complaint');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: Mobile Menu + Brand */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/citizen/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              JS
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                JanSeva <span className="text-blue-600">Connect</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block leading-none">
                Grievance & Public Services Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Actions, Language Switcher, User */}
        <div className="flex items-center space-x-3">
          {/* Quick Track link */}
          <Link
            to="/track-complaint"
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Track Grievance</span>
          </Link>

          {/* Register New Complaint button */}
          <Link
            to="/citizen/complaints/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs md:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Register Grievance</span>
            <span className="sm:hidden">New</span>
          </Link>

          {/* Multilingual Selector */}
          <div className="relative flex items-center">
            <Globe className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={i18n.language}
              onChange={handleLangChange}
              className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-8 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          {/* User Menu / Quick Login */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {user.fullName ? user.fullName[0].toUpperCase() : 'C'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-slate-500 leading-none">
                  {user.role}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default CitizenHeader;

