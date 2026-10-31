import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";

export async function getAssignments(req, res) {
  const store = getStore();
  const { department_id, status } = req.query;

  let assignments = [...store.assignments];

  if (department_id && department_id !== "ALL") {
    assignments = assignments.filter((a) => a.department_id === parseInt(department_id, 10));
  }
  if (status && status !== "ALL") {
    assignments = assignments.filter((a) => a.assignment_status === status);
  }

  const enriched = assignments.map((a) => {
    const complaint = store.complaints.find((c) => c.id === a.complaint_id);
    const department = store.departments.find((d) => d.id === a.department_id);
    const officer = store.users.find((u) => u.id === a.officer_id);
    const assigner = store.users.find((u) => u.id === a.assigned_by);

    return {
      ...a,
      complaint_title: complaint ? complaint.title : "Unknown",
      tracking_id: complaint ? complaint.tracking_id : "Unknown",
      priority: complaint ? complaint.priority : "MEDIUM",
      department_name: department ? department.name : "Unknown",
      officer_name: officer ? officer.full_name : "Unknown",
      assigned_by_name: assigner ? assigner.full_name : "Admin"
    };
  });

  return res.json({
    success: true,
    data: enriched
  });
}

export async function createAssignment(req, res) {
  const store = getStore();
  const { complaint_id, department_id, officer_id, priority, remarks } = req.body;

  if (!complaint_id || !department_id) {
    return res.status(400).json({
      success: false,
      message: "complaint_id and department_id are required."
    });
  }

  const complaint = store.complaints.find((c) => c.id === parseInt(complaint_id, 10));
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  // Verify department exists and is ACTIVE
  const dept = store.departments.find((d) => d.id === parseInt(department_id, 10));
  if (!dept || dept.status !== "ACTIVE") {
    return res.status(400).json({
      success: false,
      message: "Selected department does not exist or is inactive."
    });
  }

  // If officer specified, verify officer belongs to department and is active
  let officerUser = null;
  if (officer_id) {
    const offId = parseInt(officer_id, 10);
    const officerProfile = store.officers.find((o) => o.user_id === offId && o.status === "ACTIVE");
    if (!officerProfile || officerProfile.department_id !== dept.id) {
      return res.status(400).json({
        success: false,
        message: "Selected officer does not belong to this department or is inactive."
      });
    }
    officerUser = store.users.find((u) => u.id === offId && u.status === "ACTIVE");
    if (!officerUser) {
      return res.status(400).json({
        success: false,
        message: "Officer user account is inactive."
      });
    }
  }

  const oldStatus = complaint.status;
  const oldDept = complaint.department_id;
  const oldOfficer = complaint.assigned_officer_id;

  // Mark previous active assignments for this complaint as REASSIGNED
  store.assignments.forEach((a) => {
    if (a.complaint_id === complaint.id && a.assignment_status === "ACTIVE") {
      a.assignment_status = "REASSIGNED";
      a.reassigned_at = new Date().toISOString();
    }
  });

  // Create new assignment
  const newAssignment = {
    id: store.assignments.length + 1,
    complaint_id: complaint.id,
    department_id: dept.id,
    officer_id: officerUser ? officerUser.id : null,
    assigned_by: req.user.id,
    assignment_status: "ACTIVE",
    remarks: remarks || "Assigned by Administrator",
    assigned_at: new Date().toISOString(),
    reassigned_at: null
  };
  store.assignments.push(newAssignment);

  // Update complaint
  complaint.department_id = dept.id;
  complaint.assigned_officer_id = officerUser ? officerUser.id : null;
  complaint.status = "ASSIGNED";
  if (priority) {
    complaint.priority = priority;
  }
  complaint.updated_at = new Date().toISOString();

  // Record complaint history
  store.complaint_history.push({
    id: store.complaint_history.length + 1,
    complaint_id: complaint.id,
    old_status: oldStatus,
    new_status: "ASSIGNED",
    changed_by: req.user.id,
    remarks: `Assigned to ${dept.name}${officerUser ? ` (Officer: ${officerUser.full_name})` : ""}. ${remarks || ""}`.trim(),
    created_at: new Date().toISOString()
  });

  // Audit log
  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "COMPLAINT_ASSIGNED",
    entity_type: "COMPLAINT",
    entity_id: complaint.id,
    old_values: { department_id: oldDept, officer_id: oldOfficer, status: oldStatus },
    new_values: { department_id: dept.id, officer_id: officerUser ? officerUser.id : null, status: "ASSIGNED" }
  });

  // Notify officer if assigned
  if (officerUser) {
    await createNotification({
      recipient_id: officerUser.id,
      recipient_role: "DEPARTMENT_OFFICER",
      title: `New Assignment: ${complaint.tracking_id}`,
      message: `Grievance "${complaint.title}" has been assigned to you.`,
      type: "Complaint Assigned",
      metadata: { complaint_id: complaint.id, tracking_id: complaint.tracking_id }
    });
  }

  // Notify citizen
  if (complaint.citizen_id) {
    await createNotification({
      recipient_id: complaint.citizen_id,
      recipient_role: "CITIZEN",
      title: `Grievance Assigned: ${complaint.tracking_id}`,
      message: `Your grievance has been assigned to ${dept.name} for inspection and resolution.`,
      type: "Complaint Assigned",
      metadata: { complaint_id: complaint.id, tracking_id: complaint.tracking_id }
    });
  }

  return res.json({
    success: true,
    message: "Complaint assigned successfully.",
    data: newAssignment
  });
}

export async function reassignComplaint(req, res) {
  const store = getStore();
  const assignmentId = parseInt(req.params.id, 10);
  const { department_id, officer_id, remarks } = req.body;

  const currentAssignment = store.assignments.find((a) => a.id === assignmentId);
  if (!currentAssignment) {
    return res.status(404).json({
      success: false,
      message: "Assignment record not found."
    });
  }

  req.body.complaint_id = currentAssignment.complaint_id;
  return createAssignment(req, res);
}

export async function getAssignmentsForComplaint(req, res) {
  const store = getStore();
  const complaintId = parseInt(req.params.id, 10);
  const list = store.assignments
    .filter((a) => a.complaint_id === complaintId)
    .map((a) => {
      const dept = store.departments.find((d) => d.id === a.department_id);
      const officer = store.users.find((u) => u.id === a.officer_id);
      const assigner = store.users.find((u) => u.id === a.assigned_by);
      return {
        ...a,
        department_name: dept ? dept.name : "Unknown",
        officer_name: officer ? officer.full_name : "Unassigned",
        assigned_by_name: assigner ? assigner.full_name : "Admin"
      };
    });

  return res.json({
    success: true,
    data: list
  });
}
