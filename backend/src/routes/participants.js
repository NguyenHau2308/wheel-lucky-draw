import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT code FROM participants ORDER BY id');
  res.json(rows.map(r => r.code));
});

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

router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const { rows } = await client.query(
      'DELETE FROM participants WHERE code=$1 RETURNING code',
      [code]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'not found' });
    }
    await client.query(
      'INSERT INTO participants_deleted(code) VALUES($1)',
      [rows[0].code]
    );
    await client.query('COMMIT');
    res.json({ deleted: true });
  } catch (e) {
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    if (client) client.release();
  }
});

export default router;
