import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { authenticateToken, isAdmin } from './auth.js';
import type { Product, CreateProductDTO, UpdateProductDTO } from '../types/index.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/products - Get all products with optional filtering
router.get('/',
  query('category').optional().isString(),
  query('status').optional().isIn(['available', 'pending', 'adopted']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { category, status } = req.query;
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
);

// GET /api/products/:id - Get single product by ID
router.get('/:id',
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }
);

// POST /api/products - Create new product (Admin only)
router.post('/',
  authenticateToken,
  isAdmin,
  body('name').isString().trim().isLength({ min: 1, max: 255 }),
  body('species').isString().trim(),
  body('breed').optional().isString().trim(),
  body('age').isInt({ min: 0 }),
  body('gender').isIn(['male', 'female', 'unknown']),
  body('price').isFloat({ min: 0 }),
  body('description').isString().trim(),
  body('image_url').optional().isString(),
  body('location').optional().isString().trim(),
  body('medical_history').optional().isString().trim(),
  body('personality_traits').optional().isString().trim(),
  body('category').isString().isIn(['dogs', 'cats', 'special-needs']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const sanitizedData = sanitizeObject(req.body);
      const { 
        name, species, breed, age, gender, price, description, 
        image_url, location, medical_history, personality_traits, category 
      } = sanitizedData;
      
      const result = await pool.query(
        `INSERT INTO products (
          name, species, breed, age, gender, price, description, 
          image_url, location, medical_history, personality_traits, 
          category, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'available') 
        RETURNING *`,
        [
          name, species, breed || null, age, gender, price, description,
          image_url || null, location || null, medical_history || null, 
          personality_traits || null, category
        ]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id',
  authenticateToken,
  isAdmin,
  param('id').isUUID(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('species').optional().isString().trim(),
  body('breed').optional().isString().trim(),
  body('age').optional().isInt({ min: 0 }),
  body('gender').optional().isIn(['male', 'female', 'unknown']),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().isString().trim(),
  body('image_url').optional().isString(),
  body('location').optional().isString().trim(),
  body('medical_history').optional().isString().trim(),
  body('personality_traits').optional().isString().trim(),
  body('category').optional().isString().isIn(['dogs', 'cats', 'special-needs']),
  body('status').optional().isIn(['available', 'pending', 'adopted']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const sanitizedData = sanitizeObject(req.body);
      const updates: UpdateProductDTO = sanitizedData;
      
      const fields = Object.keys(updates);
      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [id, ...fields.map(field => updates[field as keyof UpdateProductDTO])];
      
      const result = await pool.query(
        `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id',
  authenticateToken,
  isAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete related adoption requests first
      await pool.query('DELETE FROM adoption_requests WHERE product_id = $1', [id]);
      
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully', id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
);

export default router;
