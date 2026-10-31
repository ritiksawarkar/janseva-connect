import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";

export async function getComplaints(req, res) {
  const store = getStore();
  const {
    search = "",
    category,
    department_id,
    status,
    priority,
    is_overdue,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc"
  } = req.query;

  let complaints = [...store.complaints];

  // Search filter
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    complaints = complaints.filter((c) => {
      const citizen = store.users.find((u) => u.id === c.citizen_id);
      const citizenName = citizen ? citizen.full_name.toLowerCase() : "";
      return (
        c.tracking_id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        citizenName.includes(q)
      );
    });
  }

  // Category
  if (category && category !== "ALL") {
    complaints = complaints.filter((c) => c.category === category);
  }

  // Department
  if (department_id && department_id !== "ALL") {
    const deptId = parseInt(department_id, 10);
    complaints = complaints.filter((c) => c.department_id === deptId);
  }

  // Status
  if (status && status !== "ALL") {
    complaints = complaints.filter((c) => c.status === status);
  }

  // Priority
  if (priority && priority !== "ALL") {
    complaints = complaints.filter((c) => c.priority === priority);
  }

  // Overdue
  if (is_overdue === "true" || is_overdue === true) {
    complaints = complaints.filter((c) => c.is_overdue || c.status === "ESCALATED");
  }

  // Dates
  if (startDate) {
    complaints = complaints.filter((c) => new Date(c.created_at) >= new Date(startDate));
  }
  if (endDate) {
    complaints = complaints.filter((c) => new Date(c.created_at) <= new Date(endDate));
  }

  // Sorting
  complaints.sort((a, b) => {
    let valA = a[sortBy] || "";
    let valB = b[sortBy] || "";
    if (sortBy === "created_at") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (sortOrder === "asc") {
      return valA > valB ? 1 : -1;
    }
    return valA < valB ? 1 : -1;
  });

  const total = complaints.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = complaints.slice(startIndex, startIndex + l);

  const formatted = paginated.map((c) => {
    const citizen = store.users.find((u) => u.id === c.citizen_id);
    const department = store.departments.find((d) => d.id === c.department_id);
    const officer = store.users.find((u) => u.id === c.assigned_officer_id);

    return {
      id: c.id,
      tracking_id: c.tracking_id,
      title: c.title,
      description: c.description,
      category: c.category,
      location: c.location,
      priority: c.priority,
      status: c.status,
      is_overdue: c.is_overdue,
      supporters_count: c.supporters_count,
      citizen_name: citizen ? citizen.full_name : "Citizen",
      citizen_email: citizen ? citizen.email : "",
      citizen_phone: citizen ? citizen.phone : "",
      department_name: department ? department.name : "Unassigned",
      department_code: department ? department.code : "",
      officer_name: officer ? officer.full_name : "Unassigned",
      created_at: c.created_at,
      resolved_at: c.resolved_at
    };
  });

  return res.json({
    success: true,
    data: formatted,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    }
  });
}

export async function getPendingVerification(req, res) {
  const store = getStore();
  const pending = store.complaints
    .filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_VERIFICATION")
    .map((c) => {
      const citizen = store.users.find((u) => u.id === c.citizen_id);
      const similar = store.complaints.filter(
        (other) => other.id !== c.id && other.category === c.category && other.status !== "REJECTED"
      );

      return {
        id: c.id,
        tracking_id: c.tracking_id,
        title: c.title,
        description: c.description,
        category: c.category,
        location: c.location,
        priority: c.priority,
        status: c.status,
        evidence_urls: c.evidence_urls || [],
        supporters_count: c.supporters_count || 0,
        duplicate_warning: c.duplicate_warning || similar.length > 0,
        similar_count: similar.length,
        citizen: {
          id: citizen ? citizen.id : null,
          full_name: citizen ? citizen.full_name : "Citizen",
          email: citizen ? citizen.email : "",
          phone: citizen ? citizen.phone : "",
          is_flagged: citizen ? citizen.is_flagged : false
        },
        created_at: c.created_at
      };
    });

  return res.json({
    success: true,
    data: pending
  });
}

export async function getComplaintById(req, res) {
  const store = getStore();
  const complaintId = parseInt(req.params.id, 10);
  const complaint = store.complaints.find((c) => c.id === complaintId);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  const citizen = store.users.find((u) => u.id === complaint.citizen_id);
  const department = store.departments.find((d) => d.id === complaint.department_id);
  const officer = store.users.find((u) => u.id === complaint.assigned_officer_id);
  const history = store.complaint_history
    .filter((h) => h.complaint_id === complaintId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const assignments = store.assignments
    .filter((a) => a.complaint_id === complaintId)
    .map((a) => {
      const dept = store.departments.find((d) => d.id === a.department_id);
      const off = store.users.find((u) => u.id === a.officer_id);
      const assigner = store.users.find((u) => u.id === a.assigned_by);
      return {
        ...a,
        department_name: dept ? dept.name : "Unknown",
        officer_name: off ? off.full_name : "Unknown",
        assigned_by_name: assigner ? assigner.full_name : "Admin"
      };
    });

  const sla = store.complaint_sla.find((s) => s.complaint_id === complaintId);
  const escalations = store.escalations.filter((e) => e.complaint_id === complaintId);

  return res.json({
    success: true,
    data: {
      ...complaint,
      citizen: citizen
        ? {
            id: citizen.id,
            full_name: citizen.full_name,
            email: citizen.email,
            phone: citizen.phone,
            is_flagged: citizen.is_flagged
          }
        : null,
      department: department || null,
      officer: officer
        ? {
            id: officer.id,
            full_name: officer.full_name,
            email: officer.email,
            phone: officer.phone
          }
        : null,
      history,
      assignments,
      sla,
      escalations
    }
  });
}

export async function verifyComplaint(req, res) {
  const store = getStore();
  const complaintId = parseInt(req.params.id, 10);
  const { remarks, recommended_department_id, priority } = req.body;

  const complaint = store.complaints.find((c) => c.id === complaintId);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  const oldStatus = complaint.status;
  complaint.status = "VERIFIED";
  complaint.verification_remarks = remarks || "Complaint verified as genuine by administrator.";
  if (recommended_department_id) {
    complaint.department_id = parseInt(recommended_department_id, 10);
  }
  if (priority) {
    complaint.priority = priority;
  }
  complaint.updated_at = new Date().toISOString();

  // Create complaint history record
  store.complaint_history.push({
    id: store.complaint_history.length + 1,
    complaint_id: complaintId,
    old_status: oldStatus,
    new_status: "VERIFIED",
    changed_by: req.user.id,
    remarks: remarks || "Complaint verified by admin.",
    created_at: new Date().toISOString()
  });

  // Audit log
  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "COMPLAINT_VERIFIED",
    entity_type: "COMPLAINT",
    entity_id: complaintId,
    old_values: { status: oldStatus },
    new_values: { status: "VERIFIED", remarks }
  });

  // Notify citizen
  if (complaint.citizen_id) {
    await createNotification({
      recipient_id: complaint.citizen_id,
      recipient_role: "CITIZEN",
      title: `Grievance Verified: ${complaint.tracking_id}`,
      message: `Your grievance has been verified and approved for departmental assignment.`,
      type: "Complaint Verified",
      metadata: { complaint_id: complaintId, tracking_id: complaint.tracking_id }
    });
  }

  return res.json({
    success: true,
    message: "Complaint verified successfully.",
    data: complaint
  });
}

export async function rejectComplaint(req, res) {
  const store = getStore();
  const complaintId = parseInt(req.params.id, 10);
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason is mandatory."
    });
  }

  const complaint = store.complaints.find((c) => c.id === complaintId);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  const oldStatus = complaint.status;
  complaint.status = "REJECTED";
  complaint.rejection_reason = reason.trim();
  complaint.updated_at = new Date().toISOString();

  store.complaint_history.push({
    id: store.complaint_history.length + 1,
    complaint_id: complaintId,
    old_status: oldStatus,
    new_status: "REJECTED",
    changed_by: req.user.id,
    remarks: `Rejected: ${reason.trim()}`,
    created_at: new Date().toISOString()
  });

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "COMPLAINT_REJECTED",
    entity_type: "COMPLAINT",
    entity_id: complaintId,
    old_values: { status: oldStatus },
    new_values: { status: "REJECTED", reason: reason.trim() }
  });

  if (complaint.citizen_id) {
    await createNotification({
      recipient_id: complaint.citizen_id,
      recipient_role: "CITIZEN",
      title: `Grievance Update: ${complaint.tracking_id}`,
      message: `Your grievance could not be processed. Reason: ${reason.trim()}`,
      type: "Complaint Rejected",
      metadata: { complaint_id: complaintId, tracking_id: complaint.tracking_id }
    });
  }

  return res.json({
    success: true,
    message: "Complaint rejected with reason recorded.",
    data: complaint
  });
}

export async function requestInformation(req, res) {
  const store = getStore();
  const complaintId = parseInt(req.params.id, 10);
  const { explanation } = req.body;

  if (!explanation || !explanation.trim()) {
    return res.status(400).json({
      success: false,
      message: "Explanation is required when requesting more information."
    });
  }

  const complaint = store.complaints.find((c) => c.id === complaintId);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  const oldStatus = complaint.status;
  complaint.status = "NEEDS_INFORMATION";
  complaint.info_request_reason = explanation.trim();
  complaint.updated_at = new Date().toISOString();

  store.complaint_history.push({
    id: store.complaint_history.length + 1,
    complaint_id: complaintId,
    old_status: oldStatus,
    new_status: "NEEDS_INFORMATION",
    changed_by: req.user.id,
    remarks: `More information requested: ${explanation.trim()}`,
    created_at: new Date().toISOString()
  });

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "COMPLAINT_NEEDS_INFO",
    entity_type: "COMPLAINT",
    entity_id: complaintId,
    old_values: { status: oldStatus },
    new_values: { status: "NEEDS_INFORMATION", explanation: explanation.trim() }
  });

  if (complaint.citizen_id) {
    await createNotification({
      recipient_id: complaint.citizen_id,
      recipient_role: "CITIZEN",
      title: `Additional Information Needed: ${complaint.tracking_id}`,
      message: `Administrator requested more details: ${explanation.trim()}`,
      type: "Needs Information",
      metadata: { complaint_id: complaintId, tracking_id: complaint.tracking_id }
    });
  }

  return res.json({
    success: true,
    message: "Information request sent to citizen.",
    data: complaint
  });
}

export async function getComplaintHistory(req, res) {
  const store = getStore();
  const complaintId = parseInt(req.params.id, 10);
  const history = store.complaint_history
    .filter((h) => h.complaint_id === complaintId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return res.json({
    success: true,
    data: history
  });
}
