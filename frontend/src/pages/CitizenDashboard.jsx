import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardStats,
  getRecentComplaints,
  getDashboardNearbyComplaints,
  getDashboardActivity,
  joinComplaint
} from '../services/complaintService';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SupporterCount from '../components/SupporterCount';
import NearbyComplaintCard from '../components/NearbyComplaintCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import {
  FileText,
  Clock,
  Search,
  Send,
  Wrench,
  FileCheck,
  CheckCheck,
  Heart,
  PlusCircle,
  MapPin,
  ArrowRight,
  Bell,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [nearbyComplaints, setNearbyComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, recentRes, nearbyRes, activityRes] = await Promise.all([
        getDashboardStats(),
        getRecentComplaints(),
        getDashboardNearbyComplaints(),
        getDashboardActivity()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (recentRes.success) setRecentComplaints(recentRes.data);
      if (nearbyRes.success) setNearbyComplaints(nearbyRes.data);
      if (activityRes.success) setNotifications(activityRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleJoinNearby = async (complaint) => {
    try {
      setJoiningId(complaint.id);
      const res = await joinComplaint(complaint.id);
      if (res.success) {
        showToast(`You have joined ${complaint.trackingId}! Supporter count updated.`);
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join complaint.', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  const statCards = [
    {
      title: t('stats.total', 'Total Complaints'),
      count: stats?.totalComplaints || 0,
      icon: FileText,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      to: '/citizen/complaints'
    },
    {
      title: t('stats.pending', 'Pending Complaints'),
      count: stats?.pendingComplaints || 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      to: '/citizen/complaints?status=SUBMITTED'
    },
    {
      title: t('stats.underVerification', 'Under Verification'),
      count: stats?.underVerification || 0,
      icon: Search,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      to: '/citizen/complaints?status=UNDER_VERIFICATION'
    },
    {
      title: t('stats.assigned', 'Assigned Complaints'),
      count: stats?.assignedComplaints || 0,
      icon: Send,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      to: '/citizen/complaints?status=ASSIGNED'
    },
    {
      title: t('stats.inProgress', 'In Progress'),
      count: stats?.inProgress || 0,
      icon: Wrench,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      to: '/citizen/complaints?status=IN_PROGRESS'
    },
    {
      title: t('stats.resolutionSubmitted', 'Resolution Submitted'),
      count: stats?.resolutionSubmitted || 0,
      icon: FileCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      to: '/citizen/complaints?status=RESOLUTION_SUBMITTED'
    },
    {
      title: t('stats.resolved', 'Resolved Complaints'),
      count: stats?.resolvedComplaints || 0,
      icon: CheckCheck,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      to: '/citizen/complaints?status=RESOLVED'
    },
    {
      title: t('stats.joined', 'Joined Complaints'),
      count: stats?.joinedComplaints || 0,
      icon: Heart,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      to: '/citizen/joined-complaints'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-xs mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Empowering Citizens • Accountable Governance</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Citizen'}!
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Report public grievances, discover and support existing neighborhood complaints to speed up resolution, and track live department progress.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/citizen/complaints/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Grievance</span>
            </Link>
            <Link
              to="/citizen/nearby-complaints"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-800/60 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-medium border border-white/20 backdrop-blur-xs transition"
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>Discover Nearby Complaints</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Complaint Statistics Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Complaint Overview & Statistics
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Live database records for your account
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                to={card.to}
                className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] shadow-2xs flex flex-col justify-between ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{card.title}</span>
                  <Icon className="w-4 h-4 opacity-80" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-bold font-mono">
                    {card.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Quick Actions Grid */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3.5">
          Quick Actions & Services
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <Link
            to="/citizen/complaints/new"
            className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-blue-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 block">Submit Complaint</span>
          </Link>

          <Link
            to="/citizen/complaints"
            className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-blue-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 block">My Complaints</span>
          </Link>

          <Link
            to="/citizen/nearby-complaints"
            className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-blue-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 block">Nearby Complaints</span>
          </Link>

          <Link
            to="/track-complaint"
            className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-blue-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 block">Track Status</span>
          </Link>

          <a
            href="#public-services"
            onClick={(e) => { e.preventDefault(); alert('Member 2 Public Services Directory: Explore municipal & civic services.'); }}
            className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-blue-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 block">Public Services</span>
          </a>

          <a
            href="#government-schemes"
            onClick={(e) => { e.preventDefault(); alert('Member 2 Government Schemes Directory: Explore state and central welfare schemes.'); }}
            className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-blue-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 block">Govt Schemes</span>
          </a>
        </div>
      </section>

      {/* 4. Two Columns: Recent Complaints & Important Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Complaints */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                My Recent Complaints
              </h3>
              <p className="text-xs text-slate-500">
                Latest grievances registered by you
              </p>
            </div>
            <Link
              to="/citizen/complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <EmptyState
              title="No complaints filed yet"
              message="You haven't registered any grievances. Have an issue in your locality?"
              actionLabel="Register Grievance"
              actionLink="/citizen/complaints/new"
            />
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-blue-700">
                        {c.tracking_id}
                      </span>
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <Link
                      to={`/citizen/complaints/${c.id}`}
                      className="text-xs md:text-sm font-semibold text-slate-900 hover:text-blue-600 truncate block"
                    >
                      {c.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {c.area}, {c.district} • {c.category}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <SupporterCount count={c.supporter_count || 0} size="sm" />
                    <Link
                      to={`/citizen/complaints/${c.id}`}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column (1 Col): Notifications & Updates */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Recent Activity & Alerts
            </h3>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No recent notifications.
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 5. Nearby Active Complaints in Neighborhood */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Active Neighborhood Grievances (Nearby)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Support open complaints in your area instead of creating duplicates.
            </p>
          </div>
          <Link
            to="/citizen/nearby-complaints"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Explore All Nearby</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {nearbyComplaints.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No unresolved nearby complaints found within 5km.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyComplaints.slice(0, 4).map((comp) => (
              <NearbyComplaintCard
                key={comp.id}
                complaint={comp}
                onJoin={handleJoinNearby}
                joiningId={joiningId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CitizenDashboard;

