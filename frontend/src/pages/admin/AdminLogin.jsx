import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

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

  const handleQuickFill = () => {
    setEmail("admin@janseva.gov.in");
    setPassword("Admin@123");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            JanSeva Connect
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
            Administrative Access Portal
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Authorised government administrators and platform operators only.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? "Verifying..." : "Sign in to Admin Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick evaluation preset */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 mb-2">
            Demo Evaluation Mode:
          </p>
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
          >
            Pre-fill Super Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
