import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, quickLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.data.user.fullName}!`);
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setLoading(true);
      const res = await quickLogin(demoEmail, demoPass);
      if (res.success) {
        showToast(`Logged in as ${res.data.user.fullName}`);
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      showToast('Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto font-bold text-lg shadow-xs">
            JS
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sign In to JanSeva Connect
          </h1>
          <p className="text-xs text-slate-500">
            Access your grievance dashboard, track complaints, and discover public services.
          </p>
        </div>

        {/* Quick Demo Buttons for Instant Team Testing */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 block">
            ⚡ Quick Demo Accounts (1-Click Login):
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('citizen@janseva.gov.in', 'Citizen@123')}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:border-blue-500 text-left transition font-medium text-slate-800"
            >
              Citizen (Ritik)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('priya@janseva.gov.in', 'Citizen@123')}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:border-blue-500 text-left transition font-medium text-slate-800"
            >
              Citizen (Priya)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('officer@janseva.gov.in', 'Officer@123')}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:border-purple-500 text-left transition font-medium text-slate-800"
            >
              Dept Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@janseva.gov.in', 'Admin@123')}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:border-slate-800 text-left transition font-medium text-slate-800"
            >
              Admin Panel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="citizen@janseva.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs md:text-sm pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs md:text-sm pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
