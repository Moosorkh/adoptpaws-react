import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from './auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/preferences - Get user preferences
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create default preferences if none exist
      const newPrefs = await pool.query(
        `INSERT INTO user_preferences (user_id) 
         VALUES ($1) RETURNING *`,
        [req.user.id]
      );
      return res.json(newPrefs.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/preferences - Update user preferences
router.put('/', authenticateToken, async (req: any, res) => {
  try {
    const {
      email_notifications,
      push_notifications,
      sms_notifications,
      marketing_emails,
      adoption_updates,
      message_alerts
    } = req.body;

    // Check if preferences exist
    const existing = await pool.query(
      'SELECT id FROM user_preferences WHERE user_id = $1',
      [req.user.id]
    );

    let result;
    if (existing.rows.length === 0) {
      // Create new preferences
      result = await pool.query(
        `INSERT INTO user_preferences 
         (user_id, email_notifications, push_notifications, sms_notifications, 
          marketing_emails, adoption_updates, message_alerts) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          req.user.id,
          email_notifications ?? true,
          push_notifications ?? true,
          sms_notifications ?? false,
          marketing_emails ?? false,
          adoption_updates ?? true,
          message_alerts ?? true
        ]
      );
    } else {
      // Update existing preferences
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (email_notifications !== undefined) {
        updates.push(`email_notifications = $${paramCount++}`);
        values.push(email_notifications);
      }
      if (push_notifications !== undefined) {
        updates.push(`push_notifications = $${paramCount++}`);
        values.push(push_notifications);
      }
      if (sms_notifications !== undefined) {
        updates.push(`sms_notifications = $${paramCount++}`);
        values.push(sms_notifications);
      }
      if (marketing_emails !== undefined) {
        updates.push(`marketing_emails = $${paramCount++}`);
        values.push(marketing_emails);
      }
      if (adoption_updates !== undefined) {
        updates.push(`adoption_updates = $${paramCount++}`);
        values.push(adoption_updates);
      }
      if (message_alerts !== undefined) {
        updates.push(`message_alerts = $${paramCount++}`);
        values.push(message_alerts);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No preferences provided to update' });
      }

      values.push(req.user.id);
      result = await pool.query(
        `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = $${paramCount} RETURNING *`,
        values
      );
    }

    logger.info(`User ${req.user.id} updated preferences`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
