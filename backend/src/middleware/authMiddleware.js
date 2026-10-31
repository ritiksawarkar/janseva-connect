import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'janseva_dev_secret_change_before_production';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in to proceed.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please sign in again.'
      });
    }

    const userRes = await query(
      'SELECT id, full_name, email, phone, role, department_id, created_at FROM users WHERE id = $1',
      [decoded.userId || decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please sign in again.'
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRes = await query(
        'SELECT id, full_name, email, phone, role, department_id FROM users WHERE id = $1',
        [decoded.userId || decoded.id]
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

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
