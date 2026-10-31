import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Zap, CheckCircle2, HardHat, Users } from "lucide-react";

export function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@janseva.gov.in");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate("/admin/dashboard");
    } else {
      setError(res.message || "Failed to log in.");
    }
  };

  const handle1ClickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setIsSubmitting(true);

    const res = await login(demoEmail, demoPassword);
    setIsSubmitting(false);

    if (res.success) {
      navigate("/admin/dashboard");
    } else {
      setError(res.message || "Failed to log in with demo account.");
    }
  };

  const handleFillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
          <Shield className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          JanSeva Connect
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
          Central Administrative Portal
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Authorized government administrators and platform operators only.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-sm border border-slate-200">
          {/* Quick Demo Login Preset Banner */}
          <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Predefined Demo Administrator
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-200 text-blue-800 rounded-md">
                1-Click Ready
              </span>
            </div>

            <div className="bg-white/80 rounded-lg p-2.5 border border-blue-100 text-xs space-y-1 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px]">Email:</span>
                <span className="font-mono text-slate-900 font-bold text-[11px]">admin@janseva.gov.in</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px]">Password:</span>
                <span className="font-mono text-slate-900 font-bold text-[11px]">Admin@123</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px]">Assigned Role:</span>
                <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  SUPER_ADMIN
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handle1ClickLogin("admin@janseva.gov.in", "Admin@123")}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>1-Click Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("admin@janseva.gov.in", "Admin@123")}
                className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold transition flex items-center justify-center"
              >
                Pre-fill Fields
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@janseva.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs hover:shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Admin Console"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick links to Officer & Citizen portals */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              to="/officer/login"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Officer Login →</span>
            </Link>
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Citizen Login</span>
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          JanSeva Connect Administrative Security Core • Member 3 Module
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
