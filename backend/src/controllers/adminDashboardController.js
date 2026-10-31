import { getStore } from "../config/db.js";

export async function getDashboardStats(req, res) {
  const store = getStore();
  const { startDate, endDate } = req.query;

  let complaints = store.complaints;
  let citizens = store.users.filter((u) => u.role === "CITIZEN");

  if (startDate) {
    const start = new Date(startDate);
    complaints = complaints.filter((c) => new Date(c.created_at) >= start);
    citizens = citizens.filter((u) => new Date(u.created_at) >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    complaints = complaints.filter((c) => new Date(c.created_at) <= end);
    citizens = citizens.filter((u) => new Date(u.created_at) <= end);
  }

  const totalCitizens = citizens.length;
  const totalComplaints = complaints.length;
  const pendingVerification = complaints.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_VERIFICATION").length;
  const verifiedComplaints = complaints.filter((c) => c.status === "VERIFIED").length;
  const inProgressComplaints = complaints.filter((c) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length;
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED").length;
  const rejectedComplaints = complaints.filter((c) => c.status === "REJECTED").length;
  const overdueComplaints = complaints.filter((c) => c.is_overdue || c.status === "ESCALATED").length;
  const totalDepartments = store.departments.filter((d) => d.status === "ACTIVE").length;
  const totalOfficers = store.officers.filter((o) => o.status === "ACTIVE").length;

  return res.json({
    success: true,
    data: {
      totalCitizens,
      totalComplaints,
      pendingVerification,
      verifiedComplaints,
      inProgressComplaints,
      resolvedComplaints,
      rejectedComplaints,
      overdueComplaints,
      totalDepartments,
      totalOfficers
    }
  });
}

export async function getComplaintTrends(req, res) {
  const store = getStore();

  // Aggregate monthly trends from database
  const monthMap = {};
  store.complaints.forEach((c) => {
    const date = new Date(c.created_at);
    const monthKey = date.toLocaleString("en-US", { month: "short", year: "numeric" });
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { month: monthKey, submitted: 0, resolved: 0, escalated: 0 };
    }
    monthMap[monthKey].submitted += 1;
    if (c.status === "RESOLVED") monthMap[monthKey].resolved += 1;
    if (c.status === "ESCALATED" || c.is_overdue) monthMap[monthKey].escalated += 1;
  });

  const trends = Object.values(monthMap);

  // Status breakdown
  const statusCounts = {};
  store.complaints.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  // Category breakdown
  const categoryCounts = {};
  store.complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  return res.json({
    success: true,
    data: {
      monthlyTrends: trends,
      statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      categoryDistribution: Object.entries(categoryCounts).map(([category, count]) => ({ category, count }))
    }
  });
}

export async function getDepartmentPerformance(req, res) {
  const store = getStore();

  const deptPerf = store.departments.map((d) => {
    const assignedComplaints = store.complaints.filter((c) => c.department_id === d.id);
    const resolved = assignedComplaints.filter((c) => c.status === "RESOLVED").length;
    const pending = assignedComplaints.filter((c) => c.status !== "RESOLVED" && c.status !== "REJECTED").length;
    const officersCount = store.officers.filter((o) => o.department_id === d.id && o.status === "ACTIVE").length;
    const resolutionRate = assignedComplaints.length > 0 ? Math.round((resolved / assignedComplaints.length) * 100) : 100;

    return {
      departmentId: d.id,
      name: d.name,
      code: d.code,
      totalAssigned: assignedComplaints.length,
      resolved,
      pending,
      officersCount,
      resolutionRate
    };
  });

  return res.json({
    success: true,
    data: deptPerf
  });
}

export async function getRecentActivity(req, res) {
  const store = getStore();
  const recentComplaints = store.complaints.slice(0, 5).map((c) => {
    const citizen = store.users.find((u) => u.id === c.citizen_id);
    const dept = store.departments.find((d) => d.id === c.department_id);
    return {
      id: c.id,
      trackingId: c.tracking_id,
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      citizenName: citizen ? citizen.full_name : "Anonymous",
      departmentName: dept ? dept.name : "Unassigned",
      createdAt: c.created_at
    };
  });

  const recentCitizens = store.users
    .filter((u) => u.role === "CITIZEN")
    .slice(0, 5)
    .map((u) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      createdAt: u.created_at
    }));

  const pendingVerification = store.complaints
    .filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_VERIFICATION")
    .slice(0, 5);

  const overdueComplaints = store.complaints
    .filter((c) => c.is_overdue || c.status === "ESCALATED")
    .slice(0, 5);

  const auditHistory = store.audit_logs.slice(0, 10);

  return res.json({
    success: true,
    data: {
      recentComplaints,
      recentCitizens,
      pendingVerification,
      overdueComplaints,
      auditHistory
    }
  });
}
