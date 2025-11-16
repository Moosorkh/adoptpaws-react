import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from './auth.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/user/adoption-requests - Get user's adoption requests
router.get('/adoption-requests', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, p.name as product_name, p.image_url as product_image
       FROM adoption_requests ar
       LEFT JOIN products p ON ar.product_id = p.id
       WHERE ar.user_id = $1
       ORDER BY ar.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching adoption requests:', error);
    res.status(500).json({ error: 'Failed to fetch adoption requests' });
  }
});

// POST /api/user/adoption-requests - Create adoption request
router.post('/adoption-requests',
  authenticateToken,
  body('product_id').isString().trim().notEmpty(),
  body('notes').optional().isString().trim(),
  handleValidationErrors,
  async (req: any, res) => {
    try {
      const { product_id, notes } = req.body;

      // Validate UUID format manually (more lenient)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(product_id)) {
        return res.status(400).json({ error: 'Invalid product_id format' });
      }

      const result = await pool.query(
        `INSERT INTO adoption_requests (user_id, product_id, customer_name, customer_email, notes, status) 
         VALUES ($1, $2, $3, $4, $5, 'pending') 
         RETURNING *`,
        [req.user.id, product_id, req.user.full_name || 'User', req.user.email, notes || null]
      );

      logger.info(`User ${req.user.id} created adoption request for product ${product_id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Error creating adoption request:', error);
      res.status(500).json({ error: 'Failed to create adoption request' });
    }
  }
);

// GET /api/user/favorites - Get user's favorite pets
router.get('/favorites', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.product_id, f.created_at as added_at,
              p.name as product_name, p.breed as product_breed, 
              p.age as product_age, p.price as product_price,
              p.image_url as product_image
       FROM favorites f
       LEFT JOIN products p ON f.product_id = p.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/user/favorites - Add pet to favorites
router.post('/favorites',
  authenticateToken,
  body('product_id').isString().trim().notEmpty(),
  handleValidationErrors,
  async (req: any, res) => {
    try {
      const { product_id } = req.body;

      // Validate UUID format manually (more lenient)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(product_id)) {
        return res.status(400).json({ error: 'Invalid product_id format' });
      }

      // Check if already favorited
      const existing = await pool.query(
        'SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2',
        [req.user.id, product_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Already in favorites' });
      }

      const result = await pool.query(
        'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *',
        [req.user.id, product_id]
      );

      logger.info(`User ${req.user.id} added product ${product_id} to favorites`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Error adding to favorites:', error);
      res.status(500).json({ error: 'Failed to add to favorites' });
    }
  }
);

// DELETE /api/user/favorites/:id - Remove from favorites
router.delete('/favorites/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    logger.info(`User ${req.user.id} removed favorite ${id}`);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    logger.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// POST /api/user/reviews - Submit a review
router.post('/reviews',
  authenticateToken,
  body('product_id').isString().trim().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().trim(),
  handleValidationErrors,
  async (req: any, res) => {
    try {
      const sanitizedData = sanitizeObject(req.body);
      const { product_id, rating, comment } = sanitizedData;

      // Validate UUID format manually (more lenient)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(product_id)) {
        return res.status(400).json({ error: 'Invalid product_id format' });
      }

      // Check if user has already reviewed this product
      const existing = await pool.query(
        'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
        [req.user.id, product_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'You have already reviewed this pet' });
      }

      const result = await pool.query(
        `INSERT INTO reviews (user_id, product_id, rating, comment) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, product_id, rating, comment || null]
      );

      logger.info(`User ${req.user.id} submitted review for product ${product_id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Error submitting review:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  }
);

// GET /api/user/reviews - Get user's reviews
router.get('/reviews', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.name as product_name, p.image_url as product_image
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
