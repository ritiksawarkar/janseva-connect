import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Zap, CheckCircle2, HardHat, Users } from "lucide-react";
import { useOfficerAuth } from "../../context/OfficerAuthContext";

export function OfficerLogin() {
  const [email, setEmail] = useState("officer.sanitation@janseva.gov.in");
  const [password, setPassword] = useState("Officer@123");
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

  const handle1ClickLogin = async (demoEmail, demoPassword = "Officer@123") => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setIsSubmitting(true);

    const res = await login(demoEmail, demoPassword);
    setIsSubmitting(false);

    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(res.message || "Failed to authenticate officer account.");
    }
  };

  const handleQuickFill = (demoEmail, demoPassword = "Officer@123") => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  const officerPresets = [
    {
      title: "Sanitation Officer",
      name: "Rajesh Kumar",
      dept: "Solid Waste Mgmt",
      email: "officer.sanitation@janseva.gov.in"
    },
    {
      title: "PWD Engineer",
      name: "Sunil Shinde",
      dept: "Roads & Civil Infra",
      email: "officer.pwd@janseva.gov.in"
    },
    {
      title: "Water Inspector",
      name: "Meena Iyer",
      dept: "Water Supply & Sewerage",
      email: "officer.water@janseva.gov.in"
    },
    {
      title: "Electrical Engineer",
      name: "Vikas Joshi",
      dept: "Lighting & Power Grid",
      email: "officer.electrical@janseva.gov.in"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base mx-auto mb-3 shadow-md shadow-blue-500/20">
          <HardHat className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Department Officer Portal
        </h2>
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mt-1">
          JanSeva Connect | Grievance Resolution & Work Management
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Assigned field officers, inspectors, and department engineers console.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-sm border border-slate-200">
          {/* Predefined Demo Officer Quick Logins */}
          <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Predefined Demo Officers
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-200 text-blue-800 rounded-md">
                1-Click Ready
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-3">
              Click any department officer below to instantly authenticate into their resolution panel:
            </p>

            <div className="grid grid-cols-2 gap-2 text-left mb-3">
              {officerPresets.map((preset) => (
                <button
                  key={preset.email}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handle1ClickLogin(preset.email, "Officer@123")}
                  className="p-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-600 hover:text-white group text-left transition shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-white transition">
                      {preset.title}
                    </p>
                    <Zap className="w-3 h-3 text-amber-500 group-hover:text-amber-300 fill-current" />
                  </div>
                  <p className="text-[10px] text-slate-500 group-hover:text-blue-100 transition truncate">
                    {preset.name}
                  </p>
                  <p className="text-[9px] font-mono text-blue-600 group-hover:text-blue-200 transition truncate mt-0.5">
                    {preset.dept}
                  </p>
                </button>
              ))}
            </div>

            {/* Credential Cheat Sheet */}
            <div className="bg-white/80 rounded-lg p-2 border border-blue-100 text-[11px] flex items-center justify-between text-slate-600">
              <span>Standard Password:</span>
              <span className="font-mono text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Officer@123</span>
            </div>
          </div>

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
                  className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
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
                  className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* Quick links to Admin & Citizen */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              to="/admin/login"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal →</span>
            </Link>
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          JanSeva Connect Department Resolution Module • Member 4 System
        </p>
      </div>
    </div>
  );
}

export default OfficerLogin;
