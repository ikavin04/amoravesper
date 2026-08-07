import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/characters/:bookId — public
router.get('/:bookId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM characters WHERE book_id=$1 ORDER BY sort_order ASC, created_at ASC',
      [req.params.bookId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/characters — admin: create
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { book_id, name, role, description, photo_url, sort_order } = req.body;

    if (!book_id || !name) {
      res.status(400).json({ error: 'book_id and name required' });
      return;
    }

    const result = await query(`
      INSERT INTO characters (book_id, name, role, description, photo_url, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [book_id, name, role, description, photo_url, sort_order || 0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/characters/:id — admin: update
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, role, description, photo_url, sort_order } = req.body;

    const result = await query(`
      UPDATE characters SET name=$1, role=$2, description=$3, photo_url=$4, sort_order=$5
      WHERE id=$6 RETURNING *
    `, [name, role, description, photo_url, sort_order || 0, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/characters/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM characters WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    res.json({ message: 'Character deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
