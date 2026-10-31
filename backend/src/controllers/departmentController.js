import { getStore } from "../config/db.js";
import { logAdminAction } from "../services/auditService.js";

export async function getDepartments(req, res) {
  const store = getStore();
  const { search = "", status } = req.query;

  let departments = [...store.departments];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    departments = departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }

  if (status && status !== "ALL") {
    departments = departments.filter((d) => d.status === status);
  }

  const enriched = departments.map((d) => {
    const officersCount = store.officers.filter((o) => o.department_id === d.id && o.status === "ACTIVE").length;
    const complaints = store.complaints.filter((c) => c.department_id === d.id);
    const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;
    const pendingCount = complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "REJECTED").length;

    return {
      ...d,
      officers_count: officersCount,
      complaints_count: complaints.length,
      resolved_count: resolvedCount,
      pending_count: pendingCount
    };
  });

  return res.json({
    success: true,
    data: enriched
  });
}

export async function getDepartmentById(req, res) {
  const store = getStore();
  const deptId = parseInt(req.params.id, 10);
  const dept = store.departments.find((d) => d.id === deptId);

  if (!dept) {
    return res.status(404).json({
      success: false,
      message: "Department not found."
    });
  }

  const officers = store.officers
    .filter((o) => o.department_id === deptId)
    .map((o) => {
      const u = store.users.find((user) => user.id === o.user_id);
      return {
        id: o.id,
        user_id: o.user_id,
        employee_id: o.employee_id,
        designation: o.designation,
        status: o.status,
        full_name: u ? u.full_name : "Unknown",
        email: u ? u.email : "",
        phone: u ? u.phone : ""
      };
    });

  const complaints = store.complaints.filter((c) => c.department_id === deptId);

  return res.json({
    success: true,
    data: {
      ...dept,
      officers,
      complaints_count: complaints.length,
      resolved_count: complaints.filter((c) => c.status === "RESOLVED").length
    }
  });
}

export async function createDepartment(req, res) {
  const store = getStore();
  const { name, code, description, email, phone, address, responsible_categories } = req.body;

  if (!name || !code) {
    return res.status(400).json({
      success: false,
      message: "Department name and unique code are required."
    });
  }

  // Check unique
  const existingName = store.departments.find((d) => d.name.toLowerCase() === name.trim().toLowerCase());
  if (existingName) {
    return res.status(409).json({
      success: false,
      message: "A department with this name already exists."
    });
  }

  const existingCode = store.departments.find((d) => d.code.toLowerCase() === code.trim().toLowerCase());
  if (existingCode) {
    return res.status(409).json({
      success: false,
      message: "A department with this code already exists."
    });
  }

  const newDept = {
    id: store.departments.length + 1,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description ? description.trim() : "",
    email: email ? email.trim() : "",
    phone: phone ? phone.trim() : "",
    address: address ? address.trim() : "",
    responsible_categories: Array.isArray(responsible_categories) ? responsible_categories : [],
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  store.departments.push(newDept);

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "DEPARTMENT_CREATED",
    entity_type: "DEPARTMENT",
    entity_id: newDept.id,
    new_values: newDept
  });

  return res.status(201).json({
    success: true,
    message: "Department created successfully.",
    data: newDept
  });
}

export async function updateDepartment(req, res) {
  const store = getStore();
  const deptId = parseInt(req.params.id, 10);
  const dept = store.departments.find((d) => d.id === deptId);

  if (!dept) {
    return res.status(404).json({
      success: false,
      message: "Department not found."
    });
  }

  const { name, code, description, email, phone, address, responsible_categories } = req.body;

  if (name && name.trim().toLowerCase() !== dept.name.toLowerCase()) {
    const existing = store.departments.find(
      (d) => d.id !== deptId && d.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Another department already uses this name."
      });
    }
    dept.name = name.trim();
  }

  if (code && code.trim().toUpperCase() !== dept.code.toUpperCase()) {
    const existing = store.departments.find(
      (d) => d.id !== deptId && d.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Another department already uses this code."
      });
    }
    dept.code = code.trim().toUpperCase();
  }

  if (description !== undefined) dept.description = description.trim();
  if (email !== undefined) dept.email = email.trim();
  if (phone !== undefined) dept.phone = phone.trim();
  if (address !== undefined) dept.address = address.trim();
  if (responsible_categories !== undefined) {
    dept.responsible_categories = Array.isArray(responsible_categories) ? responsible_categories : [];
  }
  dept.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: "DEPARTMENT_UPDATED",
    entity_type: "DEPARTMENT",
    entity_id: deptId,
    new_values: dept
  });

  return res.json({
    success: true,
    message: "Department updated successfully.",
    data: dept
  });
}

export async function updateDepartmentStatus(req, res) {
  const store = getStore();
  const deptId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be ACTIVE or INACTIVE."
    });
  }

  const dept = store.departments.find((d) => d.id === deptId);
  if (!dept) {
    return res.status(404).json({
      success: false,
      message: "Department not found."
    });
  }

  const oldStatus = dept.status;
  dept.status = status;
  dept.updated_at = new Date().toISOString();

  await logAdminAction({
    actor_id: req.user.id,
    actor_name: req.user.full_name,
    actor_role: req.user.role,
    action: `DEPARTMENT_STATUS_${status}`,
    entity_type: "DEPARTMENT",
    entity_id: deptId,
    old_values: { status: oldStatus },
    new_values: { status }
  });

  return res.json({
    success: true,
    message: `Department is now ${status}.`,
    data: dept
  });
}

export async function getDepartmentOfficers(req, res) {
  const store = getStore();
  const deptId = parseInt(req.params.id, 10);

  const officers = store.officers
    .filter((o) => o.department_id === deptId && o.status === "ACTIVE")
    .map((o) => {
      const u = store.users.find((user) => user.id === o.user_id);
      return {
        id: o.id,
        user_id: o.user_id,
        employee_id: o.employee_id,
        designation: o.designation,
        full_name: u ? u.full_name : "Officer",
        email: u ? u.email : "",
        phone: u ? u.phone : ""
      };
    });

  return res.json({
    success: true,
    data: officers
  });
}

export async function getDepartmentComplaints(req, res) {
  const store = getStore();
  const deptId = parseInt(req.params.id, 10);
  const complaints = store.complaints.filter((c) => c.department_id === deptId);

  return res.json({
    success: true,
    data: complaints
  });
}
