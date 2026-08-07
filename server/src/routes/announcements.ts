import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/announcements — public: active announcements
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT * FROM announcements
      WHERE is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/announcements/admin/all — admin
router.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/announcements — admin: create
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { text, type, is_active, expires_at } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text required' });
      return;
    }

    const result = await query(`
      INSERT INTO announcements (text, type, is_active, expires_at)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [text, type || 'info', is_active !== false, expires_at || null]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/announcements/:id — admin
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { text, type, is_active, expires_at } = req.body;

    const result = await query(`
      UPDATE announcements SET text=$1, type=$2, is_active=$3, expires_at=$4
      WHERE id=$5 RETURNING *
    `, [text, type, is_active, expires_at || null, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/announcements/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM announcements WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
