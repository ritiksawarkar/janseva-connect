import bcrypt from "bcryptjs";
import { getStore } from "../config/db.js";

export async function getOfficerProfile(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;

    const user = (store.users || []).find((u) => u.id === officerId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Officer account not found." });
    }

    const officer = (store.officers || []).find((o) => o.user_id === officerId);
    const department = officer && store.departments
      ? store.departments.find((d) => d.id === officer.department_id)
      : null;

    // Calculate actual workload statistics
    const myComplaints = (store.complaints || []).filter((c) => c.assigned_officer_id === officerId);
    const totalAssigned = myComplaints.length;
    const pendingWork = myComplaints.filter((c) => ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(c.status)).length;
    const underReview = myComplaints.filter((c) => c.status === "RESOLUTION_SUBMITTED").length;
    const completedWork = myComplaints.filter((c) => c.status === "RESOLVED").length;

    // Recent activity on officer's complaints
    const recentActivity = (store.complaint_history || [])
      .filter((h) => h.changed_by === officerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "Not specified",
        role: user.role,
        account_status: user.status,
        joining_date: user.created_at,
        officer: {
          employee_id: officer ? officer.employee_id : "N/A",
          designation: officer ? officer.designation : "Department Officer",
          department_id: department ? department.id : null,
          department_name: department ? department.name : "Civic Services",
          department_code: department ? department.code : "GEN",
          status: officer ? officer.status : "ACTIVE"
        },
        workload: {
          total_assigned: totalAssigned,
          pending_work: pendingWork,
          under_review: underReview,
          completed_work: completedWork,
          completion_rate: totalAssigned > 0 ? Math.round((completedWork / totalAssigned) * 100) : 100
        },
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateOfficerProfile(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const { full_name, phone, role, department_id, employee_id, status } = req.body;

    // Security check: Reject self-service privilege modification
    if (role || department_id || employee_id || status) {
      return res.status(403).json({
        success: false,
        message: "Officers cannot modify their assigned role, department, employee ID, or account status. Contact Administrator."
      });
    }

    const user = (store.users || []).find((u) => u.id === officerId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Officer not found." });
    }

    if (full_name && full_name.trim()) {
      user.full_name = full_name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
    }
    user.updated_at = new Date().toISOString();

    return res.json({
      success: true,
      message: "Personal details updated successfully.",
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function changeOfficerPassword(req, res) {
  try {
    const store = getStore();
    const officerId = req.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required."
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long."
      });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match."
      });
    }

    const user = (store.users || []).find((u) => u.id === officerId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Officer not found." });
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    user.password_hash = newHash;
    user.updated_at = new Date().toISOString();

    return res.json({
      success: true,
      message: "Password changed successfully. Please keep your credentials secure."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
