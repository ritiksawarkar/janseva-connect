import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";

export async function getCitizens(req, res) {
  const store = getStore();
  const { search = "", status, page = 1, limit = 10, startDate, endDate } = req.query;

  let citizens = store.users.filter((u) => u.role === "CITIZEN");

  // Filter search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    citizens = citizens.filter(
      (c) =>
        (c.full_name && c.full_name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }

  // Filter status
  if (status && status !== "ALL") {
    citizens = citizens.filter((c) => c.status === status);
  }

  // Filter registration date
  if (startDate) {
    citizens = citizens.filter((c) => new Date(c.created_at) >= new Date(startDate));
  }
  if (endDate) {
    citizens = citizens.filter((c) => new Date(c.created_at) <= new Date(endDate));
  }

  const total = citizens.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = citizens.slice(startIndex, startIndex + l);

  // Attach complaint count
  const data = paginated.map((c) => {
    const complaintCount = store.complaints.filter((comp) => comp.citizen_id === c.id).length;
    return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      is_flagged: c.is_flagged || false,
      flag_reason: c.flag_reason || null,
      admin_remarks: c.admin_remarks || null,
      total_complaints: complaintCount,
      created_at: c.created_at,
      updated_at: c.updated_at
    };
  });

  return res.json({
    success: true,
    data,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    }
  });
}

export async function getCitizenById(req, res) {
  const store = getStore();
  const citizenId = parseInt(req.params.id, 10);
  const citizen = store.users.find((u) => u.id === citizenId && u.role === "CITIZEN");

  if (!citizen) {
    return res.status(404).json({
      success: false,
      message: "Citizen account not found."
    });
  }

  const complaints = store.complaints
    .filter((comp) => comp.citizen_id === citizenId)
    .map((comp) => {
      const dept = store.departments.find((d) => d.id === comp.department_id);
      return {
        id: comp.id,
        tracking_id: comp.tracking_id,
        title: comp.title,
        category: comp.category,
        status: comp.status,
        priority: comp.priority,
        department_name: dept ? dept.name : "Unassigned",
        created_at: comp.created_at,
        resolved_at: comp.resolved_at
      };
    });

  return res.json({
    success: true,
    data: {
      id: citizen.id,
      full_name: citizen.full_name,
      email: citizen.email,
      phone: citizen.phone,
      status: citizen.status,
      is_flagged: citizen.is_flagged || false,
      flag_reason: citizen.flag_reason || null,
      admin_remarks: citizen.admin_remarks || null,
      created_at: citizen.created_at,
      updated_at: citizen.updated_at,
      complaints
    }
  });
}

export async function updateCitizenStatus(req, res) {
  const store = getStore();
  const citizenId = parseInt(req.params.id, 10);
  const { status, remarks } = req.body;

  if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be ACTIVE, INACTIVE, or SUSPENDED."
    });
  }

  const citizen = store.users.find((u) => u.id === citizenId && u.role === "CITIZEN");
  if (!citizen) {
    return res.status(404).json({
      success: false,
      message: "Citizen account not found."
    });
  }

  const oldStatus = citizen.status;
  citizen.status = status;
  if (remarks) {
    citizen.admin_remarks = remarks;
  }
  citizen.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: `CITIZEN_STATUS_${status}`,
    entity_type: "USER",
    entity_id: citizenId,
    old_values: { status: oldStatus },
    new_values: { status, remarks }
  });

  return res.json({
    success: true,
    message: `Citizen status updated to ${status} successfully.`,
    data: citizen
  });
}

export async function flagCitizen(req, res) {
  const store = getStore();
  const citizenId = parseInt(req.params.id, 10);
  const { is_flagged, flag_reason, admin_remarks } = req.body;

  const citizen = store.users.find((u) => u.id === citizenId && u.role === "CITIZEN");
  if (!citizen) {
    return res.status(404).json({
      success: false,
      message: "Citizen account not found."
    });
  }

  const oldFlag = citizen.is_flagged;
  citizen.is_flagged = !!is_flagged;
  citizen.flag_reason = is_flagged ? flag_reason || "Flagged for manual review by administrator" : null;
  if (admin_remarks) {
    citizen.admin_remarks = admin_remarks;
  }
  citizen.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: is_flagged ? "CITIZEN_FLAGGED" : "CITIZEN_UNFLAGGED",
    entity_type: "USER",
    entity_id: citizenId,
    old_values: { is_flagged: oldFlag },
    new_values: { is_flagged, flag_reason, admin_remarks }
  });

  return res.json({
    success: true,
    message: is_flagged ? "Citizen flagged for review." : "Citizen flag cleared.",
    data: citizen
  });
}

export async function getCitizenComplaints(req, res) {
  const store = getStore();
  const citizenId = parseInt(req.params.id, 10);
  const complaints = store.complaints.filter((c) => c.citizen_id === citizenId);

  return res.json({
    success: true,
    data: complaints
  });
}
