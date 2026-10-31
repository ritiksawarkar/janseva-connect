import { getStore } from "../config/db.js";

export async function addProgressUpdate(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);
    const { progress_description, work_remarks, new_status, progress_photo_url } = req.body;

    if (!progress_description && !work_remarks) {
      return res.status(400).json({
        success: false,
        message: "Progress description or work remarks are required."
      });
    }

    const complaint = (store.complaints || []).find((c) => c.id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    // Strict ownership verification
    if (complaint.assigned_officer_id !== officerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update progress on this complaint."
      });
    }

    // Rules: Officer cannot mark RESOLVED directly
    if (new_status === "RESOLVED") {
      return res.status(400).json({
        success: false,
        message: "Officers cannot mark complaints directly as RESOLVED. Please use the Submit Resolution flow for closure verification."
      });
    }

    const nowIso = new Date().toISOString();
    const oldStatus = complaint.status;

    // Transition status to IN_PROGRESS if previously ACCEPTED or explicitly requested
    let targetStatus = complaint.status;
    if (new_status && ["ACCEPTED", "IN_PROGRESS"].includes(new_status)) {
      targetStatus = new_status;
    } else if (complaint.status === "ACCEPTED" || complaint.status === "ASSIGNED") {
      targetStatus = "IN_PROGRESS";
    }

    complaint.status = targetStatus;
    complaint.updated_at = nowIso;

    // Combine remarks and descriptions
    const combinedRemarks = [progress_description, work_remarks].filter(Boolean).join(" | ");

    // Save history entry with metadata
    const historyId = (store.complaint_history || []).length + 1;
    const historyItem = {
      id: historyId,
      complaint_id: complaint.id,
      old_status: oldStatus,
      new_status: targetStatus,
      changed_by: officerId,
      remarks: combinedRemarks,
      metadata: {
        progress_description,
        work_remarks,
        photo_url: progress_photo_url || null,
        updated_by_officer: req.user.full_name
      },
      created_at: nowIso
    };
    store.complaint_history.push(historyItem);

    // Notify citizen of work progress
    if (complaint.citizen_id) {
      const notifId = (store.notifications || []).length + 1;
      store.notifications.push({
        id: notifId,
        recipient_id: complaint.citizen_id,
        recipient_role: "CITIZEN",
        title: `Progress Update: ${complaint.tracking_id}`,
        message: `Officer ${req.user.full_name} updated progress: "${progress_description || work_remarks}"`,
        type: "Work Progress Updated",
        delivery_channel: "IN_APP",
        delivery_status: "DELIVERED",
        is_read: false,
        metadata: { complaint_id: complaint.id, tracking_id: complaint.tracking_id },
        created_at: nowIso
      });
    }

    return res.json({
      success: true,
      message: "Progress update recorded successfully.",
      data: {
        complaint_id: complaint.id,
        status: complaint.status,
        update: historyItem
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProgressHistory(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);

    const complaint = (store.complaints || []).find((c) => c.id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    if (complaint.assigned_officer_id !== officerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to complaint progress history."
      });
    }

    const updates = (store.complaint_history || [])
      .filter((h) => h.complaint_id === complaint.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((h) => {
        const actor = (store.users || []).find((u) => u.id === h.changed_by);
        return {
          id: h.id,
          old_status: h.old_status,
          new_status: h.new_status,
          remarks: h.remarks,
          metadata: h.metadata || {},
          actor_name: actor ? actor.full_name : "Officer",
          created_at: h.created_at
        };
      });

    return res.json({ success: true, data: updates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateComplaintStatus(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);
    const { status, remarks } = req.body;

    const complaint = (store.complaints || []).find((c) => c.id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    if (complaint.assigned_officer_id !== officerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this complaint's status."
      });
    }

    // Enforce allowed status transitions for officer
    const allowedOfficerStatuses = ["ACCEPTED", "IN_PROGRESS"];
    if (!allowedOfficerStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Officers can only transition status to [${allowedOfficerStatuses.join(", ")}]. For completion, submit a formal resolution.`
      });
    }

    const oldStatus = complaint.status;
    const nowIso = new Date().toISOString();
    complaint.status = status;
    complaint.updated_at = nowIso;

    const historyId = (store.complaint_history || []).length + 1;
    store.complaint_history.push({
      id: historyId,
      complaint_id: complaint.id,
      old_status: oldStatus,
      new_status: status,
      changed_by: officerId,
      remarks: remarks || `Status changed to ${status} by Department Officer ${req.user.full_name}`,
      created_at: nowIso
    });

    return res.json({
      success: true,
      message: `Status updated to ${status}.`,
      data: { complaint_id: complaint.id, status: complaint.status }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
