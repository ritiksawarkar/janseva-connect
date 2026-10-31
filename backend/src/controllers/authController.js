import bcrypt from "bcryptjs";
import { z } from "zod";
import { getStore, query, isDbConnected } from "../config/db.js";
import { generateToken } from "../middleware/authMiddleware.js";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(10, "Phone must be at least 10 digits").optional(),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const register = async (req, res) => {
  try {
    const parseRes = registerSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({
        success: false,
        message: parseRes.error.issues[0].message
      });
    }

    const { fullName, email, phone, password } = parseRes.data;

    if (isDbConnected()) {
      const existing = await query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists."
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userRes = await query(
        `INSERT INTO users (full_name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'CITIZEN')
         RETURNING id, full_name, email, phone, role, created_at;`,
        [fullName, email, phone || null, passwordHash]
      );
      const user = userRes.rows[0];
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: "Citizen account registered successfully.",
        data: {
          token,
          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        }
      });
    }

    // In-memory fallback
    const store = getStore();
    const existing = (store.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newId = (store.users || []).length + 1;
    const newUser = {
      id: newId,
      full_name: fullName,
      email,
      phone: phone || null,
      password_hash: passwordHash,
      role: "CITIZEN",
      status: "ACTIVE",
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: "Citizen account registered successfully.",
      data: {
        token,
        user: {
          id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Registration failed due to an internal server error."
    });
  }
};

export const login = async (req, res) => {
  try {
    const parseRes = loginSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({
        success: false,
        message: parseRes.error.issues[0].message
      });
    }

    const { email, password } = parseRes.data;
    const store = getStore();
    let user = null;

    if (isDbConnected()) {
      const userRes = await query(
        `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role, u.status, u.department_id, d.name AS department_name
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE LOWER(u.email) = LOWER($1);`,
        [email]
      );
      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      }
    } else {
      user = (store.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

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

    const token = generateToken(user);

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
          fullName: user.full_name,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          departmentId: user.department_id,
          departmentName: user.department_name,
          ...(officerInfo || {})
        }
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Sign in failed due to an internal server error."
    });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        fullName: req.user.full_name,
        full_name: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        departmentId: req.user.department_id
      }
    }
  });
};

export const getProfile = async (req, res) => {
  const store = getStore();
  const user = (store.users || []).find((u) => u.id === req.user.id) || req.user;

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
      fullName: user.full_name,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      ...(officerInfo || {})
    }
  });
};

export default {
  register,
  login,
  getMe,
  getProfile
};
