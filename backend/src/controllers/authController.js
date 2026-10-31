import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getStore } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "janseva_connect_jwt_secret_key_2026_super_secure";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  const store = getStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive or suspended. Please contact administrator."
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  let officerInfo = null;
  if (user.role === "DEPARTMENT_OFFICER" && store.officers) {
    const officer = store.officers.find((o) => o.user_id === user.id);
    if (officer) {
      const dept = store.departments ? store.departments.find((d) => d.id === officer.department_id) : null;
      officerInfo = {
        officer_id: officer.id,
        employee_id: officer.employee_id,
        department_id: officer.department_id,
        department_name: dept ? dept.name : "Civic Services",
        department_code: dept ? dept.code : "GEN",
        designation: officer.designation
      };
    }
  }

  return res.json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        ...(officerInfo || {})
      }
    }
  });
}

export async function getProfile(req, res) {
  const store = getStore();
  const user = store.users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  let officerInfo = null;
  if (user.role === "DEPARTMENT_OFFICER" && store.officers) {
    const officer = store.officers.find((o) => o.user_id === user.id);
    if (officer) {
      const dept = store.departments ? store.departments.find((d) => d.id === officer.department_id) : null;
      officerInfo = {
        officer_id: officer.id,
        employee_id: officer.employee_id,
        department_id: officer.department_id,
        department_name: dept ? dept.name : "Civic Services",
        department_code: dept ? dept.code : "GEN",
        designation: officer.designation
      };
    }
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      ...(officerInfo || {})
    }
  });
}
