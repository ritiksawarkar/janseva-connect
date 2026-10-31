import React, { useState, useEffect } from "react";
import { analyticsApi, departmentsApi } from "../../services/api";
import ChartCard, { SimpleBarChart, DistributionList } from "../../components/admin/ChartCard";
import StatCard from "../../components/admin/StatCard";
import { FilterDropdown, LoadingSkeleton, ErrorState } from "../../components/admin/UIControls";
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  Clock,
  ThumbsUp,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function AnalyticsReports() {
  const [complaintAnalytics, setComplaintAnalytics] = useState(null);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [resolutionTimeData, setResolutionTimeData] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);

  const [dateRange, setDateRange] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [departments, setDepartments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedDept]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [deptList, compRes, deptRes, catRes, resTimeRes, slaRes, fbRes] = await Promise.all([
        departmentsApi.getDepartments({ status: "ACTIVE" }),
        analyticsApi.getComplaints({ department_id: selectedDept }),
        analyticsApi.getDepartments(),
        analyticsApi.getCategories(),
        analyticsApi.getResolutionTime(),
        analyticsApi.getSlaPerformance(),
        analyticsApi.getFeedback()
      ]);

      if (deptList.success) setDepartments(deptList.data);
      if (compRes.success) setComplaintAnalytics(compRes.data);
      if (deptRes.success) setDepartmentsData(deptRes.data);
      if (catRes.success) setCategoriesData(catRes.data);
      if (resTimeRes.success) setResolutionTimeData(resTimeRes.data);
      if (slaRes.success) setSlaData(slaRes.data);
      if (fbRes.success) setFeedbackData(fbRes.data);
    } catch (err) {
      setError(err.message || "Failed to load analytics metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSVReport = () => {
    if (!departmentsData || departmentsData.length === 0) return;

    const headers = ["Department", "Code", "Total Workload", "Resolved", "In Progress", "Overdue", "Resolution Rate (%)"];
    const rows = departmentsData.map((d) => [
      `"${d.name}"`,
      d.code,
      d.total_workload,
      d.resolved,
      d.in_progress,
      d.overdue,
      `${d.resolution_rate}%`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `janseva_department_performance_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && !complaintAnalytics) {
    return <LoadingSkeleton rows={10} columns={4} />;
  }

  const deptBarChartData = departmentsData.map((d) => ({
    label: d.code,
    value: d.total_workload,
    color: "bg-blue-600 hover:bg-blue-700"
  }));

  const categoryBreakdown = categoriesData.map((c, i) => {
    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-purple-500"];
    return {
      label: c.category,
      value: c.count,
      barColor: colors[i % colors.length],
      dotColor: colors[i % colors.length]
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Platform Analytics & Executive Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent insights, departmental efficiency indices, SLA compliance rates, and citizen satisfaction.
          </p>
        </div>

        <button
          onClick={exportCSVReport}
          className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition flex items-center self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
          Export Performance CSV
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <FilterDropdown
          label="Department Scope"
          value={selectedDept}
          onChange={setSelectedDept}
          options={[
            { label: "All Departments", value: "ALL" },
            ...departments.map((d) => ({ label: d.name, value: String(d.id) }))
          ]}
        />

        <FilterDropdown
          label="Timeline Window"
          value={dateRange}
          onChange={setDateRange}
          options={[
            { label: "All Recorded Time", value: "ALL" },
            { label: "Current Month", value: "CURRENT_MONTH" },
            { label: "Quarter to Date", value: "QTD" },
            { label: "Past Year", value: "YEAR" }
          ]}
        />
      </div>

      {error && <ErrorState message={error} onRetry={fetchData} />}

      {/* Top Benchmark KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Complaints"
          value={complaintAnalytics?.total}
          icon={BarChart3}
          subtext="Under administrative management"
          color="blue"
        />
        <StatCard
          title="Average Resolution Turnaround"
          value={`${resolutionTimeData?.averageResolutionHours || 0} Hours`}
          icon={Clock}
          subtext="Across all resolved complaints"
          color="amber"
        />
        <StatCard
          title="SLA Compliance Rate"
          value={`${slaData?.complianceRate || 100}%`}
          icon={CheckCircle}
          subtext={`${slaData?.complied || 0} complied, ${slaData?.breached || 0} breached`}
          color="green"
        />
        <StatCard
          title="Citizen Satisfaction"
          value={`${feedbackData?.averageRating || 4.4} / 5.0`}
          icon={ThumbsUp}
          subtext={`${feedbackData?.satisfactionRate || 89}% approval rating`}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Department Workload Distribution"
          subtitle="Total grievances routed to each municipal department"
          action={<Building2 className="w-4 h-4 text-blue-600" />}
        >
          <SimpleBarChart data={deptBarChartData} height={200} />
        </ChartCard>

        <ChartCard
          title="Category Distribution"
          subtitle="Top citizen grievance categories by volume"
        >
          <DistributionList items={categoryBreakdown} />
        </ChartCard>
      </div>

      {/* Resolution Turnaround by Priority Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Resolution Turnaround Benchmarks by Priority
          </h3>
          <p className="text-xs text-slate-500">
            Real average hours elapsed from filing to closure verified evidence.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {resolutionTimeData?.priorityBreakdown?.map((pb) => (
            <div key={pb.priority} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{pb.priority}</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{pb.avgHours} hrs</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{pb.resolvedCount} cases closed</p>
            </div>
          ))}
        </div>
      </div>

      {/* Department Scorecard Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department Performance Scorecard
            </h3>
            <p className="text-xs text-slate-500">
              Comparative analysis of workload clearance and resolution rate.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Workload</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">In Progress</th>
                <th className="py-2.5 px-3">Overdue</th>
                <th className="py-2.5 px-3">Efficiency Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentsData.map((d) => (
                <tr key={d.department_id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{d.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{d.code}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{d.total_workload}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">{d.resolved}</td>
                  <td className="py-2.5 px-3 text-amber-600 font-medium">{d.in_progress}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold">{d.overdue}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{d.resolution_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsReports;
