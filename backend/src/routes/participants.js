import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/* GET /participants → ["A0001","B0002", ...] */
router.get('/', async (_, res) => {
  const { rows } = await pool.query(
    'SELECT code FROM participants ORDER BY id ASC'
  );
  res.json(rows.map(r => r.code));
});

/* POST /participants  body:{code:"A0123"} */
router.post('/', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });

  try {
    await pool.query(
      'INSERT INTO participants(code) VALUES($1) ON CONFLICT DO NOTHING',
      [code.trim()]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
