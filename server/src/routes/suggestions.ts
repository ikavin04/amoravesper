import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Auto-create suggestions table if not exists
query(`
  CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reader_name VARCHAR(255),
    reader_email VARCHAR(255),
    book_topic VARCHAR(255),
    suggestion TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`).catch(err => console.error('Error creating suggestions table:', err));

// POST /api/suggestions — public reader submission
router.post('/', async (req: Request, res: Response) => {
  try {
    const { reader_name, reader_email, book_topic, suggestion } = req.body;

    if (!suggestion || !suggestion.trim()) {
      res.status(400).json({ error: 'Suggestion text is required' });
      return;
    }

    const result = await query(
      `INSERT INTO suggestions (reader_name, reader_email, book_topic, suggestion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [reader_name || 'Anonymous Reader', reader_email || null, book_topic || 'General Suggestion', suggestion.trim()]
    );

    res.status(201).json({ message: 'Thank you for your suggestion!', suggestion: result.rows[0] });
  } catch (err) {
    console.error('Error saving suggestion:', err);
    res.status(500).json({ error: 'Failed to submit suggestion' });
  }
});

// GET /api/suggestions/admin/all — admin: get all suggestions
router.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM suggestions ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// PUT /api/suggestions/:id/status — admin: update status
router.put('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE suggestions SET status = $1 WHERE id = $2 RETURNING *`,
      [status || 'reviewed', id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating suggestion:', err);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

// DELETE /api/suggestions/:id — admin: delete
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM suggestions WHERE id = $1`, [id]);
    res.json({ message: 'Suggestion deleted' });
  } catch (err) {
    console.error('Error deleting suggestion:', err);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});

export default router;
