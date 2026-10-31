import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/db.js';
import { generateToken } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
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

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
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
      message: 'Citizen account registered successfully.',
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
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to an internal server error.'
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

    const userRes = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role, u.department_id, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE LOWER(u.email) = LOWER($1);`,
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          departmentId: user.department_id,
          departmentName: user.department_name
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Sign in failed due to an internal server error.'
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
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        departmentId: req.user.department_id
      }
    }
  });
};
