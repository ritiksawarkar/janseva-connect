import { getStore } from "../config/db.js";

export async function getAssignments(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    const officerAssignments = (store.assignments || [])
      .filter((a) => a.officer_id === officerId)
      .map((a) => {
        const complaint = (store.complaints || []).find((c) => c.id === a.complaint_id);
        const dept = (store.departments || []).find((d) => d.id === a.department_id);
        return {
          ...a,
          complaint: complaint || null,
          department_name: dept ? dept.name : "Civic Services"
        };
      })
      .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));

    return res.json({ success: true, data: officerAssignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getNewAssignments(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    // Complaints assigned to officer where status is still ASSIGNED (awaiting acceptance)
    const newAssignments = (store.complaints || [])
      .filter((c) => c.assigned_officer_id === officerId && c.status === "ASSIGNED")
      .map((c) => {
        const assignment = (store.assignments || []).find(
          (a) => a.complaint_id === c.id && a.officer_id === officerId
        );
        const dept = (store.departments || []).find((d) => d.id === c.department_id);

        // SLA calculation
        const priorityHours = { EMERGENCY: 12, HIGH: 24, MEDIUM: 72, LOW: 168 };
        const hours = priorityHours[c.priority] || 48;
        const due = new Date(new Date(c.created_at).getTime() + hours * 3600 * 1000);

        return {
          ...c,
          department_name: dept ? dept.name : "Civic Services",
          assignment_id: assignment ? assignment.id : null,
          assigned_at: assignment ? assignment.assigned_at : c.updated_at,
          admin_remarks: assignment ? assignment.remarks : c.verification_remarks,
          due_at: due.toISOString()
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ success: true, data: newAssignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function acceptAssignment(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const assignmentOrComplaintId = parseInt(req.params.id, 10);
    const { remarks } = req.body;

    // Verify officer active status
    if (req.user.status === "INACTIVE" || req.user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Inactive or suspended officers cannot accept assignments."
      });
    }

    // Find complaint by complaint ID or by assignment ID
    let complaint = (store.complaints || []).find(
      (c) => c.id === assignmentOrComplaintId && c.assigned_officer_id === officerId
    );

    let assignment = null;
    if (!complaint) {
      assignment = (store.assignments || []).find(
        (a) => a.id === assignmentOrComplaintId && a.officer_id === officerId
      );
      if (assignment) {
        complaint = (store.complaints || []).find((c) => c.id === assignment.complaint_id);
      }
    } else {
      assignment = (store.assignments || []).find(
        (a) => a.complaint_id === complaint.id && a.officer_id === officerId
      );
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or you are not authorized to accept it."
      });
    }

    // Safe handling: check if already accepted
    if (complaint.status === "ACCEPTED" || complaint.status === "IN_PROGRESS" || complaint.status === "RESOLUTION_SUBMITTED" || complaint.status === "RESOLVED") {
      return res.status(400).json({
        success: false,
        message: `This assignment has already been accepted (Current status: ${complaint.status}).`
      });
    }

    const nowIso = new Date().toISOString();
    const oldStatus = complaint.status;

    // Transition complaint status to ACCEPTED
    complaint.status = "ACCEPTED";
    complaint.updated_at = nowIso;

    // Update assignment accepted_at
    if (assignment) {
      assignment.accepted_at = nowIso;
      if (remarks) {
        assignment.remarks = assignment.remarks
          ? `${assignment.remarks} | Officer: ${remarks}`
          : remarks;
      }
    }

    // Add record to complaint_history
    const historyId = (store.complaint_history || []).length + 1;
    store.complaint_history.push({
      id: historyId,
      complaint_id: complaint.id,
      old_status: oldStatus,
      new_status: "ACCEPTED",
      changed_by: officerId,
      remarks: remarks || `Assignment formally accepted by Department Officer ${req.user.full_name}. Field investigation initiated.`,
      created_at: nowIso
    });

    // Generate in-app notification for Citizen
    if (complaint.citizen_id) {
      const notifId = (store.notifications || []).length + 1;
      store.notifications.push({
        id: notifId,
        recipient_id: complaint.citizen_id,
        recipient_role: "CITIZEN",
        title: `Assignment Accepted: ${complaint.tracking_id}`,
        message: `Department Officer ${req.user.full_name} has accepted your grievance and scheduled site inspection.`,
        type: "Assignment Accepted",
        delivery_channel: "IN_APP",
        delivery_status: "DELIVERED",
        is_read: false,
        metadata: { complaint_id: complaint.id, tracking_id: complaint.tracking_id },
        created_at: nowIso
      });
    }

    return res.json({
      success: true,
      message: "Assignment accepted successfully.",
      data: {
        complaint_id: complaint.id,
        status: complaint.status,
        accepted_at: nowIso
      }
    });
  } catch (error) {
    console.error("Error in acceptAssignment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function acknowledgeAssignment(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);
    const { remarks } = req.body;

    const complaint = (store.complaints || []).find(
      (c) => c.id === complaintId && c.assigned_officer_id === officerId
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found or not assigned to you."
      });
    }

    const nowIso = new Date().toISOString();
    const historyId = (store.complaint_history || []).length + 1;
    store.complaint_history.push({
      id: historyId,
      complaint_id: complaint.id,
      old_status: complaint.status,
      new_status: complaint.status,
      changed_by: officerId,
      remarks: remarks || `Officer ${req.user.full_name} acknowledged assignment.`,
      created_at: nowIso
    });

    return res.json({
      success: true,
      message: "Assignment acknowledged.",
      data: { complaint_id: complaint.id, acknowledged_at: nowIso }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
