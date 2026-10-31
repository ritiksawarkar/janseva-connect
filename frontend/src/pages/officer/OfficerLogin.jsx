import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { useOfficerAuth } from "../../context/OfficerAuthContext";

export function OfficerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useOfficerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get("redirect") || "/officer/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please provide both officer email and password.");
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(res.message || "Failed to authenticate officer account.");
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Officer@123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base mx-auto mb-3 shadow-md shadow-blue-500/20">
          JS
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Department Officer Portal
        </h2>
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mt-1">
          JanSeva Connect | Grievance Resolution & Work Management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Department Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer.sanitation@janseva.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Officer Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quick Test Fill (Assigned Department Officers):
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickLogin("officer.sanitation@janseva.gov.in")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition"
              >
                <p className="text-[11px] font-bold text-slate-800">Sanitation Officer</p>
                <p className="text-[10px] text-slate-500">Rajesh Kumar (Dept 1)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("officer.pwd@janseva.gov.in")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition"
              >
                <p className="text-[11px] font-bold text-slate-800">PWD Engineer</p>
                <p className="text-[10px] text-slate-500">Sunil Shinde (Dept 2)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("officer.water@janseva.gov.in")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition"
              >
                <p className="text-[11px] font-bold text-slate-800">Water Inspector</p>
                <p className="text-[10px] text-slate-500">Meena Iyer (Dept 3)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("officer.electrical@janseva.gov.in")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition"
              >
                <p className="text-[11px] font-bold text-slate-800">Electrical Engineer</p>
                <p className="text-[10px] text-slate-500">Vikas Joshi (Dept 4)</p>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Password for all test officers: <span className="font-mono text-slate-600 font-semibold">Officer@123</span>
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/admin/login" className="hover:text-blue-600 font-medium">
              Admin Sign In →
            </Link>
            <Link to="/" className="hover:text-blue-600 font-medium">
              Citizen Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerLogin;
