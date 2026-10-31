import { getStore } from "../config/db.js";

// Helper: Calculate remaining SLA hours/days
function calculateSlaInfo(complaint, store) {
  const slaRecord = (store.complaint_sla || []).find((s) => s.complaint_id === complaint.id);
  if (!slaRecord) {
    // Generate default based on priority
    const priorityDurations = { EMERGENCY: 12, HIGH: 24, MEDIUM: 72, LOW: 168 };
    const hours = priorityDurations[complaint.priority] || 48;
    const createdAt = new Date(complaint.created_at || Date.now());
    const dueAt = new Date(createdAt.getTime() + hours * 3600 * 1000);
    const now = new Date();
    const remainingMs = dueAt.getTime() - now.getTime();
    const remainingHours = Math.round(remainingMs / (3600 * 1000));
    return {
      due_at: dueAt.toISOString(),
      remaining_hours: remainingHours,
      is_overdue: remainingHours < 0 && complaint.status !== "RESOLVED",
      status: remainingHours < 0 ? "BREACHED" : "RUNNING"
    };
  }

  const now = new Date();
  const dueAt = new Date(slaRecord.due_at);
  const remainingMs = dueAt.getTime() - now.getTime();
  const remainingHours = Math.round(remainingMs / (3600 * 1000));

  return {
    due_at: slaRecord.due_at,
    remaining_hours: remainingHours,
    is_overdue: (remainingHours < 0 || slaRecord.sla_status === "BREACHED") && complaint.status !== "RESOLVED",
    status: slaRecord.sla_status
  };
}

export async function getDashboardStats(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const timeframe = req.query.timeframe || "all"; // 'today', '7days', '30days', 'all'

    // Filter complaints assigned to this officer
    let officerComplaints = (store.complaints || []).filter(
      (c) => c.assigned_officer_id === officerId
    );

    // Apply timeframe filter based on created_at or assigned_at
    if (timeframe !== "all") {
      const now = new Date();
      let cutoff = new Date();
      if (timeframe === "today") {
        cutoff.setHours(0, 0, 0, 0);
      } else if (timeframe === "7days") {
        cutoff.setDate(now.getDate() - 7);
      } else if (timeframe === "30days") {
        cutoff.setDate(now.getDate() - 30);
      }
      officerComplaints = officerComplaints.filter((c) => new Date(c.created_at) >= cutoff);
    }

    const totalAssigned = officerComplaints.length;
    const newAssignments = officerComplaints.filter((c) => c.status === "ASSIGNED").length;
    const acceptedAssignments = officerComplaints.filter((c) => c.status === "ACCEPTED").length;
    const inProgress = officerComplaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolutionSubmitted = officerComplaints.filter((c) => c.status === "RESOLUTION_SUBMITTED").length;
    const completedComplaints = officerComplaints.filter((c) => c.status === "RESOLVED").length;

    // Overdue calculation
    const overdueComplaints = officerComplaints.filter((c) => {
      if (c.status === "RESOLVED") return false;
      const sla = calculateSlaInfo(c, store);
      return sla.is_overdue || c.is_overdue;
    }).length;

    const highPriority = officerComplaints.filter(
      (c) => (c.priority === "HIGH" || c.priority === "EMERGENCY") && c.status !== "RESOLVED"
    ).length;

    return res.json({
      success: true,
      data: {
        total_assigned: totalAssigned,
        new_assignments: newAssignments,
        accepted_assignments: acceptedAssignments,
        in_progress: inProgress,
        resolution_submitted: resolutionSubmitted,
        completed_complaints: completedComplaints,
        overdue_complaints: overdueComplaints,
        high_priority: highPriority,
        active_workload: newAssignments + acceptedAssignments + inProgress + resolutionSubmitted
      }
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRecentAssignments(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    const recent = (store.complaints || [])
      .filter((c) => c.assigned_officer_id === officerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
      .map((c) => {
        const sla = calculateSlaInfo(c, store);
        const dept = (store.departments || []).find((d) => d.id === c.department_id);
        return {
          ...c,
          department_name: dept ? dept.name : "Civic Services",
          sla
        };
      });

    return res.json({ success: true, data: recent });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPriorityComplaints(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    const priorityItems = (store.complaints || [])
      .filter(
        (c) =>
          c.assigned_officer_id === officerId &&
          (c.priority === "EMERGENCY" || c.priority === "HIGH") &&
          c.status !== "RESOLVED"
      )
      .sort((a, b) => {
        if (a.priority === "EMERGENCY" && b.priority !== "EMERGENCY") return -1;
        if (b.priority === "EMERGENCY" && a.priority !== "EMERGENCY") return 1;
        return new Date(a.created_at) - new Date(b.created_at);
      })
      .slice(0, 6)
      .map((c) => {
        const sla = calculateSlaInfo(c, store);
        return { ...c, sla };
      });

    return res.json({ success: true, data: priorityItems });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSlaOverview(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    const activeComplaints = (store.complaints || [])
      .filter((c) => c.assigned_officer_id === officerId && c.status !== "RESOLVED")
      .map((c) => {
        const sla = calculateSlaInfo(c, store);
        return {
          id: c.id,
          tracking_id: c.tracking_id,
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          created_at: c.created_at,
          due_at: sla.due_at,
          remaining_hours: sla.remaining_hours,
          is_overdue: sla.is_overdue,
          sla_status: sla.status
        };
      })
      .sort((a, b) => a.remaining_hours - b.remaining_hours);

    return res.json({ success: true, data: activeComplaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRecentActivity(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    // Get complaint IDs assigned to officer
    const myComplaintIds = new Set(
      (store.complaints || []).filter((c) => c.assigned_officer_id === officerId).map((c) => c.id)
    );

    const activities = (store.complaint_history || [])
      .filter((h) => myComplaintIds.has(h.complaint_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map((h) => {
        const complaint = (store.complaints || []).find((c) => c.id === h.complaint_id);
        const user = (store.users || []).find((u) => u.id === h.changed_by);
        return {
          id: h.id,
          complaint_id: h.complaint_id,
          tracking_id: complaint ? complaint.tracking_id : `ID-${h.complaint_id}`,
          complaint_title: complaint ? complaint.title : "Civic Complaint",
          old_status: h.old_status,
          new_status: h.new_status,
          remarks: h.remarks,
          actor_name: user ? user.full_name : "System Administrator",
          created_at: h.created_at
        };
      });

    return res.json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
