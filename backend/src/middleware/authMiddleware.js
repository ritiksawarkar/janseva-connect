import jwt from "jsonwebtoken";
import { getStore } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "janseva_connect_jwt_secret_key_2026_super_secure";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing or invalid format."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const store = getStore();

    // Verify user still exists and is not deactivated/suspended
    if (store && store.users) {
      const user = store.users.find((u) => u.id === decoded.id);
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
        ...(officerInfo || {})
      };
    } else {
      req.user = decoded;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session token. Please log in again."
    });
  }
}
