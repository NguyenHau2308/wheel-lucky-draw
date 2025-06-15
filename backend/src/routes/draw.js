import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/* POST /draw-result  { winner:"B0056", draw_time:"2025-06-05 21:30:56" } */
router.post('/', async (req, res) => {
  const { winner, draw_time } = req.body || {};
  if (!winner || !draw_time)
    return res.status(400).json({ error: 'winner & draw_time required' });

  try {
    await pool.query(
      'INSERT INTO winners(winner, draw_time) VALUES ($1, $2)',
      [winner, draw_time]
    );
    console.log('New draw result added:', { winner, draw_time });
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* GET /draw-result  → list lịch sử */
router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT winner, draw_time FROM winners ORDER BY id DESC'
  );
  res.json(rows);
});

export default router;
