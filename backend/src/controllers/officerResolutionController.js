import { getStore } from "../config/db.js";

export async function submitResolution(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);

    const {
      resolution_title,
      resolution_description,
      work_completed_details,
      work_completed_at,
      before_photo_url,
      after_photo_url,
      supporting_documents = [],
      officer_remarks
    } = req.body;

    // Strict validation
    if (!resolution_title || !resolution_title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resolution title is required."
      });
    }

    if (!resolution_description || !resolution_description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resolution description is required."
      });
    }

    if (!after_photo_url || !after_photo_url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Work completion evidence (After photograph) is mandatory before submitting for closure."
      });
    }

    const complaint = (store.complaints || []).find((c) => c.id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    // Ownership check
    if (complaint.assigned_officer_id !== officerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit resolution for this complaint."
      });
    }

    // Check allowed status: complaint must not already be closed/resolved
    if (complaint.status === "RESOLVED") {
      return res.status(400).json({
        success: false,
        message: "This complaint is already resolved and closed."
      });
    }

    const nowIso = new Date().toISOString();
    const oldStatus = complaint.status;

    // Transition status to RESOLUTION_SUBMITTED (NOT RESOLVED!)
    complaint.status = "RESOLUTION_SUBMITTED";
    complaint.updated_at = nowIso;

    // Create resolution record in store
    if (!store.resolutions) store.resolutions = [];
    const resolutionId = store.resolutions.length + 1;

    const newResolution = {
      id: resolutionId,
      complaint_id: complaint.id,
      officer_id: officerId,
      resolution_title: resolution_title.trim(),
      resolution_description: resolution_description.trim(),
      work_completed_details: work_completed_details ? work_completed_details.trim() : null,
      work_completed_at: work_completed_at || nowIso,
      officer_remarks: officer_remarks ? officer_remarks.trim() : null,
      status: "SUBMITTED",
      submitted_at: nowIso,
      reviewed_by: null,
      reviewed_at: null,
      review_remarks: null,
      created_at: nowIso,
      updated_at: nowIso
    };

    store.resolutions.push(newResolution);

    // Save evidence records
    if (!store.resolution_evidence) store.resolution_evidence = [];

    // Before photo
    if (before_photo_url) {
      store.resolution_evidence.push({
        id: store.resolution_evidence.length + 1,
        resolution_id: resolutionId,
        complaint_id: complaint.id,
        file_name: "site_condition_before.jpg",
        storage_key: before_photo_url,
        mime_type: "image/jpeg",
        file_size: 1024000,
        evidence_type: "BEFORE",
        uploaded_at: nowIso
      });
    }

    // After photo (Mandatory)
    store.resolution_evidence.push({
      id: store.resolution_evidence.length + 1,
      resolution_id: resolutionId,
      complaint_id: complaint.id,
      file_name: "work_completed_after.jpg",
      storage_key: after_photo_url,
      mime_type: "image/jpeg",
      file_size: 1536000,
      evidence_type: "AFTER",
      uploaded_at: nowIso
    });

    // Supporting documents if provided
    if (Array.isArray(supporting_documents)) {
      supporting_documents.forEach((doc, idx) => {
        if (doc && doc.url) {
          store.resolution_evidence.push({
            id: store.resolution_evidence.length + 1,
            resolution_id: resolutionId,
            complaint_id: complaint.id,
            file_name: doc.name || `supporting_doc_${idx + 1}.pdf`,
            storage_key: doc.url,
            mime_type: doc.type || "application/pdf",
            file_size: doc.size || 512000,
            evidence_type: "SUPPORTING",
            uploaded_at: nowIso
          });
        }
      });
    }

    // Complaint History entry
    const historyId = (store.complaint_history || []).length + 1;
    store.complaint_history.push({
      id: historyId,
      complaint_id: complaint.id,
      old_status: oldStatus,
      new_status: "RESOLUTION_SUBMITTED",
      changed_by: officerId,
      remarks: `Resolution submitted by Officer ${req.user.full_name}: "${resolution_title}". Awaiting administrative verification and closure sign-off.`,
      metadata: {
        resolution_id: resolutionId,
        has_before_photo: !!before_photo_url,
        has_after_photo: !!after_photo_url
      },
      created_at: nowIso
    });

    // Notify Admin Desk for review
    const adminUser = (store.users || []).find((u) => u.role === "ADMIN");
    if (adminUser) {
      store.notifications.push({
        id: (store.notifications || []).length + 1,
        recipient_id: adminUser.id,
        recipient_role: "ADMIN",
        title: `Resolution Submitted: ${complaint.tracking_id}`,
        message: `Officer ${req.user.full_name} submitted completion evidence for ${complaint.tracking_id}. Verification required.`,
        type: "Resolution Submitted",
        delivery_channel: "IN_APP",
        delivery_status: "DELIVERED",
        is_read: false,
        metadata: { complaint_id: complaint.id, tracking_id: complaint.tracking_id, resolution_id: resolutionId },
        created_at: nowIso
      });
    }

    // Notify Citizen
    if (complaint.citizen_id) {
      store.notifications.push({
        id: (store.notifications || []).length + 1,
        recipient_id: complaint.citizen_id,
        recipient_role: "CITIZEN",
        title: `Work Completed: ${complaint.tracking_id}`,
        message: `Department officer has reported completion of work on your grievance. Under final administrative review.`,
        type: "Resolution Submitted",
        delivery_channel: "IN_APP",
        delivery_status: "DELIVERED",
        is_read: false,
        metadata: { complaint_id: complaint.id, tracking_id: complaint.tracking_id },
        created_at: nowIso
      });
    }

    return res.status(201).json({
      success: true,
      message: "Resolution submitted successfully. Complaint forwarded to administration for closure verification.",
      data: {
        resolution_id: resolutionId,
        complaint_id: complaint.id,
        status: complaint.status,
        submitted_at: nowIso
      }
    });
  } catch (error) {
    console.error("Error in submitResolution:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getResolutionDetails(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);

    const complaint = (store.complaints || []).find((c) => c.id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    if (complaint.assigned_officer_id !== officerId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to resolution details." });
    }

    const resolution = (store.resolutions || []).find((r) => r.complaint_id === complaintId);
    if (!resolution) {
      return res.status(404).json({ success: false, message: "No resolution submitted yet for this complaint." });
    }

    const evidence = (store.resolution_evidence || []).filter((e) => e.resolution_id === resolution.id);

    return res.json({
      success: true,
      data: {
        ...resolution,
        evidence
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getComplaintEvidence(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const complaintId = parseInt(req.params.id, 10);

    const complaint = (store.complaints || []).find((c) => c.id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    if (complaint.assigned_officer_id !== officerId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to complaint evidence." });
    }

    // Citizen submitted before evidence
    const citizenEvidence = (complaint.evidence_urls || []).map((url, idx) => ({
      id: `citizen-${idx + 1}`,
      file_name: `citizen_evidence_${idx + 1}.jpg`,
      storage_key: url,
      evidence_type: "BEFORE",
      uploaded_by_role: "CITIZEN",
      uploaded_at: complaint.created_at
    }));

    // Officer submitted resolution evidence
    const resolution = (store.resolutions || []).find((r) => r.complaint_id === complaintId);
    const resolutionEvidence = resolution
      ? (store.resolution_evidence || []).filter((e) => e.resolution_id === resolution.id)
      : [];

    return res.json({
      success: true,
      data: {
        citizen_evidence: citizenEvidence,
        officer_evidence: resolutionEvidence,
        total_evidence_count: citizenEvidence.length + resolutionEvidence.length
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
