import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  BellRing,
  CheckCircle2,
  Clock,
  Camera,
  AlertTriangle,
  Flame,
  ArrowRight,
  Calendar,
  Building2,
  FileCheck2,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { officerApi } from "../../services/api";
import { useOfficerAuth } from "../../context/OfficerAuthContext";
import StatCard from "../../components/officer/StatCard";
import StatusBadge, { PriorityBadge } from "../../components/officer/StatusBadge";
import { LoadingSkeleton, EmptyState, ErrorState } from "../../components/officer/UIFeedback";

export function OfficerDashboard() {
  const { officer } = useOfficerAuth();
  const [timeframe, setTimeframe] = useState("all");
  const [stats, setStats] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [priorityComplaints, setPriorityComplaints] = useState([]);
  const [slaOverview, setSlaOverview] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, recentRes, priorityRes, slaRes, activityRes] = await Promise.all([
        officerApi.getStats({ timeframe }),
        officerApi.getRecentAssignments(),
        officerApi.getPriorityComplaints(),
        officerApi.getSlaOverview(),
        officerApi.getRecentActivity()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (recentRes.success) setRecentAssignments(recentRes.data || []);
      if (priorityRes.success) setPriorityComplaints(priorityRes.data || []);
      if (slaRes.success) setSlaOverview(slaRes.data || []);
      if (activityRes.success) setRecentActivity(activityRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load officer dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner & Timeframe Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Field Officer Operational Portal
            </span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 mt-1">
            Welcome, {officer?.full_name || "Department Officer"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {officer?.department_name} | Employee ID:{" "}
            <span className="font-mono font-semibold text-slate-700">{officer?.employee_id}</span>
          </p>
        </div>

        {/* Timeframe filters */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "7days", label: "Last 7 Days" },
            { id: "30days", label: "Last 30 Days" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeframe === tab.id
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadDashboardData} />}

      {/* 8 Statistic Cards */}
      {isLoading ? (
        <LoadingSkeleton count={8} height="h-24" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assigned"
            value={stats?.total_assigned || 0}
            icon={ClipboardList}
            color="blue"
            subtitle="Cumulative assigned cases"
          />
          <StatCard
            title="New Assignments"
            value={stats?.new_assignments || 0}
            icon={BellRing}
            color="indigo"
            subtitle="Require acceptance"
          />
          <StatCard
            title="Accepted Work"
            value={stats?.accepted_assignments || 0}
            icon={CheckCircle2}
            color="blue"
            subtitle="Ready to commence"
          />
          <StatCard
            title="In Progress"
            value={stats?.in_progress || 0}
            icon={Clock}
            color="amber"
            subtitle="Field work underway"
          />
          <StatCard
            title="Resolution Submitted"
            value={stats?.resolution_submitted || 0}
            icon={Camera}
            color="purple"
            subtitle="Pending admin review"
          />
          <StatCard
            title="Completed & Closed"
            value={stats?.completed_complaints || 0}
            icon={FileCheck2}
            color="emerald"
            subtitle="Verified by admin"
          />
          <StatCard
            title="Overdue SLA"
            value={stats?.overdue_complaints || 0}
            icon={AlertTriangle}
            color="red"
            subtitle="Exceeded target timeline"
          />
          <StatCard
            title="High Priority"
            value={stats?.high_priority || 0}
            icon={Flame}
            color="red"
            subtitle="Emergency / High attention"
          />
        </div>
      )}

      {/* Main 2-Column Split: Work Action Queues & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Priority Complaints & Recent Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: High Priority Requiring Attention */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 lg:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs lg:text-sm font-bold text-slate-900">
                    Complaints Requiring Immediate Attention
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    High & Emergency priority grievances assigned to your desk
                  </p>
                </div>
              </div>

              <Link
                to="/officer/complaints?priority=HIGH"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {priorityComplaints.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No high priority complaints pending at this moment.
                </div>
              ) : (
                priorityComplaints.slice(0, 4).map((c) => (
                  <div key={c.id} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {c.tracking_id}
                        </span>
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.location}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/officer/complaints/${c.id}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition"
                      >
                        Inspect
                      </Link>
                      {c.status === "ASSIGNED" && (
                        <Link
                          to={`/officer/assignments/new`}
                          className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg transition"
                        >
                          Accept
                        </Link>
                      )}
                      {c.status === "ACCEPTED" && (
                        <Link
                          to={`/officer/complaints/${c.id}/progress`}
                          className="px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold rounded-lg transition"
                        >
                          Start Work
                        </Link>
                      )}
                      {c.status === "IN_PROGRESS" && (
                        <Link
                          to={`/officer/complaints/${c.id}/resolution`}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-lg transition"
                        >
                          Submit Resolution
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Recent Assignments */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 lg:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs lg:text-sm font-bold text-slate-900">Recent Assignments</h3>
                  <p className="text-[11px] text-slate-500">Newly assigned public complaints</p>
                </div>
              </div>

              <Link
                to="/officer/complaints"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Full List</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No assigned complaints available.
                </div>
              ) : (
                recentAssignments.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {c.tracking_id}
                        </span>
                        <StatusBadge status={c.status} />
                        <span className="text-[11px] text-slate-400">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 truncate">{c.title}</p>
                    </div>

                    <Link
                      to={`/officer/complaints/${c.id}`}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition flex-shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): SLA Deadlines, Workload & Recent Activity */}
        <div className="space-y-6">
          {/* Upcoming SLA Deadlines */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs lg:text-sm font-bold text-slate-900">Upcoming SLA Deadlines</h3>
            </div>

            <div className="space-y-3">
              {slaOverview.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active SLA timers.</p>
              ) : (
                slaOverview.slice(0, 4).map((item) => {
                  const isBreached = item.remaining_hours < 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition ${
                        isBreached
                          ? "bg-red-50/50 border-red-200"
                          : "bg-slate-50/70 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800 font-mono">
                          {item.tracking_id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isBreached
                              ? "bg-red-600 text-white"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isBreached ? "BREACHED" : `${item.remaining_hours}h left`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{item.title}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Audit / History Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-xs lg:text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Recent Officer Activity</span>
            </h3>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity recorded.</p>
              ) : (
                recentActivity.slice(0, 4).map((act) => (
                  <div key={act.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <p className="font-semibold text-slate-800 truncate">{act.complaint_title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.remarks}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className="font-medium text-blue-600">{act.new_status}</span>
                      <span>
                        {new Date(act.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerDashboard;
