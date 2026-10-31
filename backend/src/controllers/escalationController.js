import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";

export async function getEscalations(req, res) {
  const store = getStore();
  const { department_id, status } = req.query;

  let escalations = [...store.escalations];

  if (status && status !== "ALL") {
    escalations = escalations.filter((e) => e.status === status);
  }

  const enriched = escalations.map((e) => {
    const complaint = store.complaints.find((c) => c.id === e.complaint_id);
    const dept = complaint ? store.departments.find((d) => d.id === complaint.department_id) : null;
    const assignedUser = store.users.find((u) => u.id === e.assigned_to);
    const escalatedByUser = store.users.find((u) => u.id === e.escalated_by);
    const sla = store.complaint_sla.find((s) => s.complaint_id === e.complaint_id);

    return {
      ...e,
      complaint_title: complaint ? complaint.title : "Unknown",
      tracking_id: complaint ? complaint.tracking_id : "Unknown",
      priority: complaint ? complaint.priority : "HIGH",
      category: complaint ? complaint.category : "General",
      department_id: dept ? dept.id : null,
      department_name: dept ? dept.name : "Unassigned",
      assigned_to_name: assignedUser ? assignedUser.full_name : "Unassigned Supervisor",
      escalated_by_name: escalatedByUser ? escalatedByUser.full_name : "System / Admin",
      sla_status: sla ? sla.sla_status : "BREACHED",
      due_at: sla ? sla.due_at : null
    };
  });

  if (department_id && department_id !== "ALL") {
    return res.json({
      success: true,
      data: enriched.filter((e) => e.department_id === parseInt(department_id, 10))
    });
  }

  return res.json({
    success: true,
    data: enriched
  });
}

export async function createEscalation(req, res) {
  const store = getStore();
  const { complaint_id, reason, escalation_level = 1, assigned_to, remarks } = req.body;

  if (!complaint_id || !reason) {
    return res.status(400).json({
      success: false,
      message: "complaint_id and escalation reason are required."
    });
  }

  const complaint = store.complaints.find((c) => c.id === parseInt(complaint_id, 10));
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  const oldStatus = complaint.status;
  complaint.status = "ESCALATED";
  complaint.is_overdue = true;
  if (complaint.priority !== "EMERGENCY") {
    complaint.priority = "HIGH";
  }
  complaint.updated_at = new Date().toISOString();

  const newEscalation = {
    id: store.escalations.length + 1,
    complaint_id: complaint.id,
    escalation_level: parseInt(escalation_level, 10),
    reason: reason.trim(),
    escalated_by: req.user.id,
    assigned_to: assigned_to ? parseInt(assigned_to, 10) : complaint.assigned_officer_id,
    status: "OPEN",
    remarks: remarks || "Escalated by Administrator for immediate intervention.",
    created_at: new Date().toISOString(),
    resolved_at: null
  };

  store.escalations.unshift(newEscalation);

  // Record complaint history
  store.complaint_history.push({
    id: store.complaint_history.length + 1,
    complaint_id: complaint.id,
    old_status: oldStatus,
    new_status: "ESCALATED",
    changed_by: req.user.id,
    remarks: `Escalated: Level ${escalation_level}. Reason: ${reason.trim()}`,
    created_at: new Date().toISOString()
  });

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "COMPLAINT_ESCALATED",
    entity_type: "COMPLAINT",
    entity_id: complaint.id,
    new_values: newEscalation
  });

  // Notify assigned officer
  if (newEscalation.assigned_to) {
    await createNotification({
      recipient_id: newEscalation.assigned_to,
      recipient_role: "DEPARTMENT_OFFICER",
      title: `URGENT Escalation: ${complaint.tracking_id}`,
      message: `Grievance "${complaint.title}" has been escalated to Level ${escalation_level}. Immediate action required.`,
      type: "Complaint Escalated",
      metadata: { complaint_id: complaint.id, escalation_id: newEscalation.id }
    });
  }

  return res.status(201).json({
    success: true,
    message: "Complaint escalated successfully.",
    data: newEscalation
  });
}

export async function getEscalationById(req, res) {
  const store = getStore();
  const escalationId = parseInt(req.params.id, 10);
  const escalation = store.escalations.find((e) => e.id === escalationId);

  if (!escalation) {
    return res.status(404).json({
      success: false,
      message: "Escalation record not found."
    });
  }

  const complaint = store.complaints.find((c) => c.id === escalation.complaint_id);
  const dept = complaint ? store.departments.find((d) => d.id === complaint.department_id) : null;
  const officer = store.users.find((u) => u.id === escalation.assigned_to);

  return res.json({
    success: true,
    data: {
      ...escalation,
      complaint,
      department: dept,
      assigned_officer: officer
    }
  });
}

export async function reassignEscalation(req, res) {
  const store = getStore();
  const escalationId = parseInt(req.params.id, 10);
  const { assigned_to, remarks } = req.body;

  const escalation = store.escalations.find((e) => e.id === escalationId);
  if (!escalation) {
    return res.status(404).json({
      success: false,
      message: "Escalation not found."
    });
  }

  const targetOfficer = store.users.find((u) => u.id === parseInt(assigned_to, 10));
  if (!targetOfficer) {
    return res.status(400).json({
      success: false,
      message: "Target officer account does not exist."
    });
  }

  escalation.assigned_to = targetOfficer.id;
  if (remarks) escalation.remarks = remarks;

  // Also update complaint assigned officer
  const complaint = store.complaints.find((c) => c.id === escalation.complaint_id);
  if (complaint) {
    complaint.assigned_officer_id = targetOfficer.id;
    complaint.updated_at = new Date().toISOString();
  }

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "ESCALATION_REASSIGNED",
    entity_type: "ESCALATION",
    entity_id: escalationId,
    new_values: { assigned_to: targetOfficer.id, officer_name: targetOfficer.full_name }
  });

  return res.json({
    success: true,
    message: "Escalation reassigned successfully.",
    data: escalation
  });
}

export async function resolveEscalation(req, res) {
  const store = getStore();
  const escalationId = parseInt(req.params.id, 10);
  const { resolution_remarks } = req.body;

  const escalation = store.escalations.find((e) => e.id === escalationId);
  if (!escalation) {
    return res.status(404).json({
      success: false,
      message: "Escalation not found."
    });
  }

  escalation.status = "RESOLVED";
  escalation.resolved_at = new Date().toISOString();
  if (resolution_remarks) {
    escalation.remarks = `${escalation.remarks || ""}\nResolved: ${resolution_remarks}`.trim();
  }

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "ESCALATION_RESOLVED",
    entity_type: "ESCALATION",
    entity_id: escalationId,
    new_values: { status: "RESOLVED", remarks: resolution_remarks }
  });

  return res.json({
    success: true,
    message: "Escalation marked as resolved.",
    data: escalation
  });
}
