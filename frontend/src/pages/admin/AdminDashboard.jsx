import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../services/api";
import StatCard from "../../components/admin/StatCard";
import ChartCard, { SimpleBarChart, DistributionList } from "../../components/admin/ChartCard";
import StatusBadge, { PriorityBadge } from "../../components/admin/StatusBadge";
import { LoadingSkeleton, ErrorState } from "../../components/admin/UIControls";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Building2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers
} from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [deptPerformance, setDeptPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState(null);
  const [dateFilter, setDateFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let params = {};
      const now = new Date();
      if (dateFilter === "TODAY") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        params.startDate = today;
      } else if (dateFilter === "7D") {
        const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        params.startDate = past;
      } else if (dateFilter === "30D") {
        const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        params.startDate = past;
      }

      const [statsRes, trendsRes, deptRes, activityRes] = await Promise.all([
        dashboardApi.getStats(params),
        dashboardApi.getTrends(),
        dashboardApi.getDepartmentPerformance(),
        dashboardApi.getRecentActivity()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (deptRes.success) setDeptPerformance(deptRes.data);
      if (activityRes.success) setRecentActivity(activityRes.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !stats) {
    return <LoadingSkeleton rows={10} columns={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  // Prepare chart formats
  const monthlyChartData = trends?.monthlyTrends?.map((m) => ({
    label: m.month.split(" ")[0],
    value: m.submitted,
    color: "bg-blue-600 hover:bg-blue-700"
  })) || [];

  const categoryDistributionData = trends?.categoryDistribution?.map((c, i) => {
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-cyan-500", "bg-rose-500"];
    return {
      label: c.category,
      value: c.count,
      barColor: colors[i % colors.length],
      dotColor: colors[i % colors.length]
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            JanSeva Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time citizen engagement, grievance oversight, and departmental performance metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Timeline:</label>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            {["ALL", "30D", "7D", "TODAY"].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  dateFilter === f
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f === "ALL" ? "All Time" : f === "30D" ? "Last 30 Days" : f === "7D" ? "Last 7 Days" : "Today"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 10 Master Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Citizens"
          value={stats?.totalCitizens}
          icon={Users}
          subtext="Registered civic accounts"
          color="blue"
          onClick={() => navigate("/admin/citizens")}
        />
        <StatCard
          title="Complaints"
          value={stats?.totalComplaints}
          icon={FileText}
          subtext="Total registered grievances"
          color="indigo"
          onClick={() => navigate("/admin/complaints")}
        />
        <StatCard
          title="Verification Pending"
          value={stats?.pendingVerification}
          icon={Clock}
          subtext="Queue awaiting review"
          color="amber"
          onClick={() => navigate("/admin/complaints/verification")}
        />
        <StatCard
          title="Verified"
          value={stats?.verifiedComplaints}
          icon={CheckCircle}
          subtext="Approved for routing"
          color="cyan"
          onClick={() => navigate("/admin/complaints?status=VERIFIED")}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressComplaints}
          icon={RefreshCw}
          subtext="Assigned to field staff"
          color="purple"
          onClick={() => navigate("/admin/complaints?status=IN_PROGRESS")}
        />
        <StatCard
          title="Resolved"
          value={stats?.resolvedComplaints}
          icon={CheckCircle}
          subtext="Fully addressed grievances"
          color="green"
          onClick={() => navigate("/admin/complaints?status=RESOLVED")}
        />
        <StatCard
          title="Rejected"
          value={stats?.rejectedComplaints}
          icon={XCircle}
          subtext="Invalid or out of scope"
          color="red"
          onClick={() => navigate("/admin/complaints?status=REJECTED")}
        />
        <StatCard
          title="Overdue / Escalated"
          value={stats?.overdueComplaints}
          icon={AlertTriangle}
          subtext="Exceeded SLA deadline"
          color="red"
          onClick={() => navigate("/admin/escalations")}
        />
        <StatCard
          title="Departments"
          value={stats?.totalDepartments}
          icon={Building2}
          subtext="Active municipal wings"
          color="blue"
          onClick={() => navigate("/admin/departments")}
        />
        <StatCard
          title="Officers"
          value={stats?.totalOfficers}
          icon={ShieldCheck}
          subtext="Field engineers on duty"
          color="green"
          onClick={() => navigate("/admin/officers")}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Monthly Intake Volume"
          subtitle="Monthly trend of grievances filed by citizens"
          action={<TrendingUp className="w-4 h-4 text-blue-600" />}
        >
          <SimpleBarChart data={monthlyChartData} height={190} />
        </ChartCard>

        <ChartCard
          title="Category Distribution"
          subtitle="Breakdown of grievances across civic categories"
          action={<Layers className="w-4 h-4 text-purple-600" />}
        >
          <DistributionList items={categoryDistributionData} />
        </ChartCard>

        <ChartCard
          title="Status Breakdown"
          subtitle="Proportion of complaints across active lifecycles"
          action={<Activity className="w-4 h-4 text-emerald-600" />}
        >
          <div className="space-y-2 py-1">
            {trends?.statusDistribution?.map((st, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                <StatusBadge status={st.status} />
                <span className="font-bold text-slate-800">{st.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Verification Queue & Overdue Alert split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verification Quick Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pending Verification Queue
              </h3>
              <p className="text-xs text-slate-500">
                Newly submitted complaints requiring human review before routing
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/complaints/verification")}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center"
            >
              View Queue ({recentActivity?.pendingVerification?.length || 0})
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentActivity?.pendingVerification?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Verification queue is clear.</p>
            ) : (
              recentActivity?.pendingVerification?.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {c.tracking_id}
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-xs text-slate-600 truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.category} • {c.location}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/complaints/verification`)}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue / SLA Breached Complaints */}
        <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div>
              <h3 className="text-sm font-bold text-rose-900 flex items-center">
                <AlertTriangle className="w-4 h-4 text-rose-600 mr-1.5" />
                Overdue Complaints Alert
              </h3>
              <p className="text-xs text-slate-500">
                Complaints that breached SLA deadlines or triggered manual escalation
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/escalations")}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center"
            >
              Manage Escalations
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentActivity?.overdueComplaints?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No overdue complaints detected.</p>
            ) : (
              recentActivity?.overdueComplaints?.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {c.tracking_id}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                        OVERDUE
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.category} • {c.location}</p>
                  </div>
                  <button
                    onClick={() => navigate("/admin/escalations")}
                    className="px-2.5 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-semibold shrink-0"
                  >
                    Escalate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department Workload & Resolution Performance
            </h3>
            <p className="text-xs text-slate-500">
              Departmental distribution of active complaints and closure success rates
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/departments")}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center"
          >
            Manage Departments
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Active Officers</th>
                <th className="py-2.5 px-3">Assigned</th>
                <th className="py-2.5 px-3">Pending</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptPerformance.map((d) => (
                <tr key={d.departmentId} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{d.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{d.code}</td>
                  <td className="py-2.5 px-3 text-slate-700">{d.officersCount}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{d.totalAssigned}</td>
                  <td className="py-2.5 px-3 text-amber-600 font-medium">{d.pending}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-medium">{d.resolved}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${d.resolutionRate}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">{d.resolutionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
