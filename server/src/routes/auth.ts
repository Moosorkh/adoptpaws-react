import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware to verify JWT token
export const authenticateToken = (req: any, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// POST /api/auth/register - Register new user
router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').isString().trim().isLength({ min: 2, max: 255 }),
  body('phone').optional().isString().trim(),
  body('address').optional().isString().trim(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const sanitizedData = sanitizeObject(req.body);
      const { email, password, full_name, phone, address } = sanitizedData;

      // Check if user already exists
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, phone, address) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role`,
        [email, password_hash, full_name, phone || null, address || null]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`New user registered: ${email}`);
      res.status(201).json({ 
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
);

// POST /api/auth/login - Login user
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`User logged in: ${email}`);
      res.json({ 
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          address: user.address
        }
      });
    } catch (error) {
      logger.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
);

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, address, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile',
  authenticateToken,
  body('full_name').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('address').optional().isString().trim(),
  handleValidationErrors,
  async (req: any, res) => {
    try {
      const sanitizedData = sanitizeObject(req.body);
      const { full_name, phone, address } = sanitizedData;

      const result = await pool.query(
        `UPDATE users SET 
         full_name = COALESCE($1, full_name),
         phone = COALESCE($2, phone),
         address = COALESCE($3, address),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, email, full_name, phone, address, role`,
        [full_name, phone, address, req.user.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

export default router;
