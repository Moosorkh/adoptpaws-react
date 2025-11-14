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

// GET /api/messages - Get user messages
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
              sender.full_name as sender_name,
              receiver.full_name as receiver_name
       FROM messages m
       LEFT JOIN users sender ON m.sender_id = sender.id
       LEFT JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/conversation/:userId - Get conversation with specific user
router.get('/conversation/:userId', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT m.*, 
              sender.full_name as sender_name,
              receiver.full_name as receiver_name
       FROM messages m
       LEFT JOIN users sender ON m.sender_id = sender.id
       LEFT JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.id, userId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// POST /api/messages - Send message
router.post('/',
  authenticateToken,
  body('receiver_id').isUUID(),
  body('message').isString().trim().isLength({ min: 1 }),
  body('adoption_request_id').optional().isUUID(),
  handleValidationErrors,
  async (req: any, res) => {
    try {
      const sanitizedData = sanitizeObject(req.body);
      const { receiver_id, message, adoption_request_id } = sanitizedData;

      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, message, adoption_request_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, receiver_id, message, adoption_request_id || null]
      );

      // Create notification for receiver
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link) 
         VALUES ($1, $2, $3, $4, $5)`,
        [receiver_id, 'New Message', 'You have a new message', 'info', `/messages`]
      );

      logger.info(`Message sent from ${req.user.id} to ${receiver_id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// PUT /api/messages/:id/read - Mark message as read
router.put('/:id/read', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE id = $1 AND receiver_id = $2 
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

export default router;
