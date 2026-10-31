import { getStore } from "../config/db.js";

// Helper for SLA details
function getSlaDetails(complaintId, store, priority, createdAt) {
  const sla = (store.complaint_sla || []).find((s) => s.complaint_id === complaintId);
  if (sla) {
    const now = new Date();
    const dueAt = new Date(sla.due_at);
    const diffHours = Math.round((dueAt.getTime() - now.getTime()) / (3600 * 1000));
    return {
      due_at: sla.due_at,
      started_at: sla.started_at,
      remaining_hours: diffHours,
      is_overdue: diffHours < 0 && sla.sla_status !== "COMPLIED",
      sla_status: sla.sla_status
    };
  }

  const priorityHours = { EMERGENCY: 12, HIGH: 24, MEDIUM: 72, LOW: 168 };
  const hours = priorityHours[priority] || 48;
  const start = new Date(createdAt || Date.now());
  const due = new Date(start.getTime() + hours * 3600 * 1000);
  const now = new Date();
  const diffHours = Math.round((due.getTime() - now.getTime()) / (3600 * 1000));

  return {
    due_at: due.toISOString(),
    started_at: start.toISOString(),
    remaining_hours: diffHours,
    is_overdue: diffHours < 0,
    sla_status: diffHours < 0 ? "BREACHED" : "RUNNING"
  };
}

export async function getAssignedComplaints(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const { search, status, priority, category, dateFrom, dateTo, sort = "newest", page = 1, limit = 10 } = req.query;

    // Strict ownership enforcement: officer only accesses complaints assigned to them
    let list = (store.complaints || []).filter((c) => c.assigned_officer_id === officerId);

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.tracking_id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.location && c.location.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (status && status !== "ALL") {
      list = list.filter((c) => c.status === status);
    }

    // Priority filter
    if (priority && priority !== "ALL") {
      list = list.filter((c) => c.priority === priority);
    }

    // Category filter
    if (category && category !== "ALL") {
      list = list.filter((c) => c.category === category);
    }

    // Date filters
    if (dateFrom) {
      list = list.filter((c) => new Date(c.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      list = list.filter((c) => new Date(c.created_at) <= toDate);
    }

    // Sorting
    list.sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sort === "priority") {
        const order = { EMERGENCY: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const total = list.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIdx, startIdx + limitNum);

    const enriched = paginated.map((c) => {
      const dept = (store.departments || []).find((d) => d.id === c.department_id);
      const assignment = (store.assignments || []).find(
        (a) => a.complaint_id === c.id && a.officer_id === officerId
      );
      const sla = getSlaDetails(c.id, store, c.priority, c.created_at);

      return {
        ...c,
        department_name: dept ? dept.name : "Civic Services",
        assigned_at: assignment ? assignment.assigned_at : c.updated_at,
        assignment_remarks: assignment ? assignment.remarks : null,
        accepted_at: assignment ? assignment.accepted_at : null,
        sla
      };
    });

    return res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getComplaintDetails(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);

    const complaint = (store.complaints || []).find((c) => c.id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    // Strict ownership / authorization check
    if (complaint.assigned_officer_id !== officerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this complaint. It is assigned to another officer."
      });
    }

    // Citizen details (sanitized: only necessary contact info for field work)
    const citizen = (store.users || []).find((u) => u.id === complaint.citizen_id);
    const citizenInfo = citizen
      ? {
          full_name: citizen.full_name,
          phone: citizen.phone,
          email: citizen.email
        }
      : {
          full_name: "Anonymous Citizen",
          phone: "Not provided",
          email: "Not provided"
        };

    // Department & Officer
    const department = (store.departments || []).find((d) => d.id === complaint.department_id);
    const officerProfile = (store.officers || []).find((o) => o.user_id === officerId);

    // Assignment history
    const assignment = (store.assignments || []).find(
      (a) => a.complaint_id === complaint.id && a.officer_id === officerId
    );

    // SLA Details
    const sla = getSlaDetails(complaint.id, store, complaint.priority, complaint.created_at);

    // Full timeline from complaint_history
    const timeline = (store.complaint_history || [])
      .filter((h) => h.complaint_id === complaint.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((h) => {
        const actor = (store.users || []).find((u) => u.id === h.changed_by);
        return {
          id: h.id,
          old_status: h.old_status,
          new_status: h.new_status,
          remarks: h.remarks,
          actor_name: actor ? actor.full_name : "System",
          actor_role: actor ? actor.role : "SYSTEM",
          created_at: h.created_at
        };
      });

    // Resolution details if submitted
    const resolution = (store.resolutions || []).find((r) => r.complaint_id === complaint.id);
    let resolutionEvidence = [];
    if (resolution) {
      resolutionEvidence = (store.resolution_evidence || []).filter(
        (e) => e.resolution_id === resolution.id
      );
    }

    return res.json({
      success: true,
      data: {
        ...complaint,
        citizen: citizenInfo,
        department: department
          ? { id: department.id, name: department.name, code: department.code, phone: department.phone }
          : null,
        officer: {
          id: req.user.id,
          name: req.user.full_name,
          designation: officerProfile ? officerProfile.designation : "Department Officer",
          employee_id: officerProfile ? officerProfile.employee_id : "OFFICER"
        },
        assignment: assignment
          ? {
              id: assignment.id,
              assigned_at: assignment.assigned_at,
              accepted_at: assignment.accepted_at,
              remarks: assignment.remarks,
              status: assignment.assignment_status
            }
          : null,
        sla,
        timeline,
        resolution: resolution
          ? {
              ...resolution,
              evidence: resolutionEvidence
            }
          : null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCompletedComplaints(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const { search, category, status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    // Completed or Resolution Submitted complaints assigned to this officer
    let list = (store.complaints || []).filter(
      (c) =>
        c.assigned_officer_id === officerId &&
        (c.status === "RESOLUTION_SUBMITTED" || c.status === "RESOLVED")
    );

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.tracking_id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q)
      );
    }

    if (category && category !== "ALL") {
      list = list.filter((c) => c.category === category);
    }

    if (status && status !== "ALL") {
      list = list.filter((c) => c.status === status);
    }

    if (dateFrom) {
      list = list.filter((c) => new Date(c.updated_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      list = list.filter((c) => new Date(c.updated_at) <= toDate);
    }

    list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const total = list.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIdx, startIdx + limitNum);

    const enriched = paginated.map((c) => {
      const resolution = (store.resolutions || []).find((r) => r.complaint_id === c.id);
      const evidence = resolution
        ? (store.resolution_evidence || []).filter((e) => e.resolution_id === resolution.id)
        : [];

      return {
        ...c,
        resolution: resolution || null,
        evidence,
        closure_status: c.status === "RESOLVED" ? "APPROVED" : "PENDING_ADMIN_VERIFICATION",
        resolution_date: resolution ? resolution.submitted_at : c.resolved_at || c.updated_at
      };
    });

    return res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
