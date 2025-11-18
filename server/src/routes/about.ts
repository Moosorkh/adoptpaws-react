import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/about/team - Get all team members
router.get('/team', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM team_members ORDER BY display_order ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/about/history - Get history timeline
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM history_timeline ORDER BY display_order ASC, year ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history timeline:', error);
    res.status(500).json({ error: 'Failed to fetch history timeline' });
  }
});

export default router;
