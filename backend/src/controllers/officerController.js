import bcrypt from "bcryptjs";
import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";

export async function getOfficers(req, res) {
  const store = getStore();
  const { search = "", department_id, status } = req.query;

  let officers = [...store.officers];

  if (department_id && department_id !== "ALL") {
    officers = officers.filter((o) => o.department_id === parseInt(department_id, 10));
  }
  if (status && status !== "ALL") {
    officers = officers.filter((o) => o.status === status);
  }

  const enriched = officers.map((o) => {
    const user = store.users.find((u) => u.id === o.user_id);
    const dept = store.departments.find((d) => d.id === o.department_id);
    const assignedComplaints = store.complaints.filter((c) => c.assigned_officer_id === o.user_id);
    const completedComplaints = assignedComplaints.filter((c) => c.status === "RESOLVED").length;
    const activeComplaints = assignedComplaints.filter((c) => c.status !== "RESOLVED" && c.status !== "REJECTED").length;

    return {
      id: o.id,
      user_id: o.user_id,
      employee_id: o.employee_id,
      designation: o.designation,
      status: o.status,
      full_name: user ? user.full_name : "Officer",
      email: user ? user.email : "",
      phone: user ? user.phone : "",
      department_id: o.department_id,
      department_name: dept ? dept.name : "Unassigned",
      department_code: dept ? dept.code : "",
      assigned_count: assignedComplaints.length,
      active_workload: activeComplaints,
      completed_count: completedComplaints,
      created_at: o.created_at
    };
  });

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    return res.json({
      success: true,
      data: enriched.filter(
        (o) =>
          o.full_name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.employee_id.toLowerCase().includes(q) ||
          o.designation.toLowerCase().includes(q)
      )
    });
  }

  return res.json({
    success: true,
    data: enriched
  });
}

export async function getOfficerById(req, res) {
  const store = getStore();
  const officerId = parseInt(req.params.id, 10);
  const officer = store.officers.find((o) => o.id === officerId);

  if (!officer) {
    return res.status(404).json({
      success: false,
      message: "Officer record not found."
    });
  }

  const user = store.users.find((u) => u.id === officer.user_id);
  const dept = store.departments.find((d) => d.id === officer.department_id);
  const assigned = store.complaints.filter((c) => c.assigned_officer_id === officer.user_id);

  return res.json({
    success: true,
    data: {
      id: officer.id,
      user_id: officer.user_id,
      employee_id: officer.employee_id,
      designation: officer.designation,
      status: officer.status,
      full_name: user ? user.full_name : "",
      email: user ? user.email : "",
      phone: user ? user.phone : "",
      department_id: officer.department_id,
      department: dept || null,
      assigned_complaints: assigned,
      created_at: officer.created_at
    }
  });
}

export async function createOfficer(req, res) {
  const store = getStore();
  const { full_name, email, phone, employee_id, department_id, designation, temporary_password } = req.body;

  if (!full_name || !email || !employee_id || !department_id || !designation) {
    return res.status(400).json({
      success: false,
      message: "Full name, email, employee ID, department, and designation are required."
    });
  }

  // Check unique email in users
  const existingUser = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "A user account with this email already exists."
    });
  }

  // Check unique employee_id in officers
  const existingEmp = store.officers.find((o) => o.employee_id.toLowerCase() === employee_id.trim().toLowerCase());
  if (existingEmp) {
    return res.status(409).json({
      success: false,
      message: "An officer with this Employee ID already exists."
    });
  }

  const dept = store.departments.find((d) => d.id === parseInt(department_id, 10));
  if (!dept) {
    return res.status(400).json({
      success: false,
      message: "Selected department does not exist."
    });
  }

  const password = temporary_password || "Officer@123";
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: store.users.length + 1,
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : "",
    password_hash: passwordHash,
    role: "DEPARTMENT_OFFICER",
    status: "ACTIVE",
    is_flagged: false,
    flag_reason: null,
    admin_remarks: `Created by admin on ${new Date().toISOString().split("T")[0]}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  store.users.push(newUser);

  const newOfficer = {
    id: store.officers.length + 1,
    user_id: newUser.id,
    employee_id: employee_id.trim().toUpperCase(),
    department_id: dept.id,
    designation: designation.trim(),
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  store.officers.push(newOfficer);

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "OFFICER_CREATED",
    entity_type: "OFFICER",
    entity_id: newOfficer.id,
    new_values: {
      user_id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      employee_id: newOfficer.employee_id,
      department_id: dept.id,
      designation: newOfficer.designation
    }
  });

  return res.status(201).json({
    success: true,
    message: "Department officer account created successfully.",
    data: {
      id: newOfficer.id,
      user_id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      employee_id: newOfficer.employee_id,
      department_id: dept.id,
      department_name: dept.name,
      designation: newOfficer.designation,
      status: newOfficer.status
    }
  });
}

export async function updateOfficer(req, res) {
  const store = getStore();
  const officerId = parseInt(req.params.id, 10);
  const officer = store.officers.find((o) => o.id === officerId);

  if (!officer) {
    return res.status(404).json({
      success: false,
      message: "Officer record not found."
    });
  }

  const user = store.users.find((u) => u.id === officer.user_id);
  const { full_name, phone, department_id, designation, status } = req.body;

  if (department_id) {
    const dept = store.departments.find((d) => d.id === parseInt(department_id, 10));
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: "Department does not exist."
      });
    }
    officer.department_id = dept.id;
  }

  if (designation) officer.designation = designation.trim();
  if (status && ["ACTIVE", "INACTIVE"].includes(status)) {
    officer.status = status;
    if (user) user.status = status;
  }
  if (user) {
    if (full_name) user.full_name = full_name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    user.updated_at = new Date().toISOString();
  }
  officer.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "OFFICER_UPDATED",
    entity_type: "OFFICER",
    entity_id: officerId,
    new_values: { officer, user: user ? { full_name: user.full_name, phone: user.phone } : null }
  });

  return res.json({
    success: true,
    message: "Officer details updated successfully.",
    data: {
      ...officer,
      full_name: user ? user.full_name : "",
      email: user ? user.email : "",
      phone: user ? user.phone : ""
    }
  });
}

export async function updateOfficerStatus(req, res) {
  const store = getStore();
  const officerId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be ACTIVE or INACTIVE."
    });
  }

  const officer = store.officers.find((o) => o.id === officerId);
  if (!officer) {
    return res.status(404).json({
      success: false,
      message: "Officer record not found."
    });
  }

  officer.status = status;
  const user = store.users.find((u) => u.id === officer.user_id);
  if (user) {
    user.status = status;
  }

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: `OFFICER_STATUS_${status}`,
    entity_type: "OFFICER",
    entity_id: officerId,
    new_values: { status }
  });

  return res.json({
    success: true,
    message: `Officer account status set to ${status}.`,
    data: officer
  });
}

export async function getOfficerAssignments(req, res) {
  const store = getStore();
  const officerId = parseInt(req.params.id, 10);
  const officer = store.officers.find((o) => o.id === officerId);

  if (!officer) {
    return res.status(404).json({
      success: false,
      message: "Officer not found."
    });
  }

  const assigned = store.complaints.filter((c) => c.assigned_officer_id === officer.user_id);
  return res.json({
    success: true,
    data: assigned
  });
}
