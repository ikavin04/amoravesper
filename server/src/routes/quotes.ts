import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/quotes — public: published quotes
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, book_id, pinned } = req.query;
    let sql = `
      SELECT q.*, b.title as book_title, b.slug as book_slug
      FROM quotes q
      LEFT JOIN books b ON b.id = q.book_id
      WHERE q.is_published = true
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (type) { sql += ` AND q.type = $${idx++}`; params.push(type); }
    if (book_id) { sql += ` AND q.book_id = $${idx++}`; params.push(book_id); }
    if (pinned === 'true') { sql += ` AND q.is_pinned = true`; }

    sql += ' ORDER BY q.is_pinned DESC, q.sort_order ASC, q.created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quotes/random — public: random quote
router.get('/random', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT q.*, b.title as book_title FROM quotes q LEFT JOIN books b ON b.id = q.book_id WHERE q.is_published = true ORDER BY RANDOM() LIMIT 1'
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quotes/pinned — public
router.get('/pinned', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT q.*, b.title as book_title FROM quotes q LEFT JOIN books b ON b.id = q.book_id WHERE q.is_pinned = true AND q.is_published = true LIMIT 1'
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/quotes/admin/all
router.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT q.*, b.title as book_title FROM quotes q
      LEFT JOIN books b ON b.id = q.book_id
      ORDER BY q.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quotes — admin: create
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { book_id, text, chapter, type, background_image_url, is_pinned, is_published, sort_order } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Quote text required' });
      return;
    }

    // Only one pinned quote at a time
    if (is_pinned) {
      await query('UPDATE quotes SET is_pinned = false WHERE is_pinned = true');
    }

    const result = await query(`
      INSERT INTO quotes (book_id, text, chapter, type, background_image_url, is_pinned, is_published, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [book_id || null, text, chapter, type || 'quote', background_image_url, is_pinned || false, is_published || false, sort_order || 0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/quotes/:id — admin: update
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { book_id, text, chapter, type, background_image_url, is_pinned, is_published, sort_order } = req.body;

    if (is_pinned) {
      await query('UPDATE quotes SET is_pinned = false WHERE is_pinned = true AND id != $1', [req.params.id]);
    }

    const result = await query(`
      UPDATE quotes SET
        book_id=$1, text=$2, chapter=$3, type=$4, background_image_url=$5,
        is_pinned=$6, is_published=$7, sort_order=$8, updated_at=NOW()
      WHERE id=$9 RETURNING *
    `, [book_id || null, text, chapter, type, background_image_url, is_pinned, is_published, sort_order || 0, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Quote not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/quotes/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM quotes WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Quote not found' });
      return;
    }
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
