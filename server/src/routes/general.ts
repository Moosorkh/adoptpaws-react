import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/settings - Get all settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// GET /api/team - Get team members
router.get('/team', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM team_members WHERE is_active = true ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/history - Get history timeline
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM history_timeline ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/categories - Get categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/contact - Submit contact form
router.post('/contact',
  body('name').isString().trim().isLength({ min: 1, max: 255 }),
  body('email').isEmail().normalizeEmail(),
  body('subject').optional().isString().trim().isLength({ max: 255 }),
  body('message').isString().trim().isLength({ min: 10 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const sanitizedData = sanitizeObject(req.body);
      const { name, email, subject, message } = sanitizedData;

      const result = await pool.query(
        `INSERT INTO contact_submissions (name, email, subject, message) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [name, email, subject || 'General Inquiry', message]
      );

      logger.info(`New contact submission from ${email}`);
      res.status(201).json({ 
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        id: result.rows[0].id
      });
    } catch (error) {
      logger.error('Error submitting contact form:', error);
      res.status(500).json({ error: 'Failed to submit contact form' });
    }
  }
);

// POST /api/adoptions - Submit adoption request (requires authentication)
router.post('/adoptions',
  authenticateToken,
  body('product_id').isString().trim().notEmpty(),
  body('notes').optional().isString().trim(),
  handleValidationErrors,
  async (req: any, res) => {
    try {
      const sanitizedData = sanitizeObject(req.body);
      const { product_id, notes } = sanitizedData;

      // Validate UUID format manually (more lenient)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(product_id)) {
        return res.status(400).json({ error: 'Invalid product_id format' });
      }

      // Check if product exists
      const product = await pool.query('SELECT id, name FROM products WHERE id = $1', [product_id]);
      if (product.rows.length === 0) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      // Check if user already has a pending/approved request for this pet
      const existingRequest = await pool.query(
        `SELECT id, status FROM adoption_requests 
         WHERE user_id = $1 AND product_id = $2 AND status IN ('pending', 'approved')`,
        [req.user.id, product_id]
      );

      if (existingRequest.rows.length > 0) {
        return res.status(400).json({ 
          error: 'You already have a pending or approved adoption request for this pet' 
        });
      }

      const result = await pool.query(
        `INSERT INTO adoption_requests 
         (user_id, product_id, notes, status) 
         VALUES ($1, $2, $3, 'pending') RETURNING *`,
        [req.user.id, product_id, notes || null]
      );

      // Create a notification for admins
      const admins = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
      for (const admin of admins.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type) 
           VALUES ($1, $2, $3, 'info')`,
          [
            admin.id, 
            'New Adoption Request', 
            `${req.user.full_name} has submitted an adoption request for ${product.rows[0].name}`
          ]
        );
      }

      logger.info(`User ${req.user.id} submitted adoption request for product ${product_id}`);
      res.status(201).json({ 
        success: true,
        message: 'Your adoption request has been submitted successfully!',
        request: result.rows[0]
      });
    } catch (error) {
      logger.error('Error submitting adoption request:', error);
      res.status(500).json({ error: 'Failed to submit adoption request' });
    }
  }
);

export default router;
