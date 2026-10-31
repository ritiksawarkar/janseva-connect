import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getStore, query, isDbConnected } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name || user.fullName,
      department_id: user.department_id || user.departmentId
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing or invalid format."
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session token. Please sign in again."
      });
    }

    const userId = decoded.userId || decoded.id;

    if (isDbConnected()) {
      const userRes = await query(
        "SELECT id, full_name, email, phone, role, status, department_id, created_at FROM users WHERE id = $1",
        [userId]
      );

      if (userRes.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User account not found. Please sign in again."
        });
      }

      const user = userRes.rows[0];
      if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive or suspended. Contact administration."
        });
      }

      req.user = user;
    } else {
      const store = getStore();
      const user = (store.users || []).find((u) => u.id === userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account no longer exists."
        });
      }

      if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive or suspended. Contact administration."
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

      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        department_id: officerInfo ? officerInfo.department_id : user.department_id,
        ...(officerInfo || {})
      };
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication."
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      const userRes = await query(
        "SELECT id, full_name, email, phone, role, department_id FROM users WHERE id = $1",
        [userId]
      );
      if (userRes.rows.length > 0) {
        req.user = userRes.rows[0];
      } else {
        req.user = null;
      }
    } catch {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
};
