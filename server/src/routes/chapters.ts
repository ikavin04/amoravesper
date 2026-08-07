import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/chapters/:bookId — public: published chapters for a book
router.get('/:bookId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, book_id, chapter_number, title, preview_text, word_count, status, 
              is_published, author_notes, release_date, created_at
       FROM chapters WHERE book_id = $1 AND is_published = true
       ORDER BY chapter_number ASC`,
      [req.params.bookId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chapters/admin/:bookId — admin: all chapters
router.get('/admin/:bookId', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM chapters WHERE book_id = $1 ORDER BY chapter_number ASC`,
      [req.params.bookId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chapters — admin: create chapter
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      book_id, chapter_number, title, preview_text,
      word_count, status, is_published, author_notes, release_date
    } = req.body;

    if (!book_id || !chapter_number || !title) {
      res.status(400).json({ error: 'book_id, chapter_number, and title required' });
      return;
    }

    const result = await query(`
      INSERT INTO chapters (book_id, chapter_number, title, preview_text, word_count, 
        status, is_published, author_notes, release_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [book_id, chapter_number, title, preview_text, word_count || 0,
        status || 'locked', is_published || false, author_notes, release_date || null]);

    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).message?.includes('unique')) {
      res.status(409).json({ error: 'Chapter number already exists for this book' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/chapters/:id — admin: update chapter
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      chapter_number, title, preview_text, word_count,
      status, is_published, author_notes, release_date
    } = req.body;

    const result = await query(`
      UPDATE chapters SET
        chapter_number=$1, title=$2, preview_text=$3, word_count=$4,
        status=$5, is_published=$6, author_notes=$7, release_date=$8, updated_at=NOW()
      WHERE id=$9 RETURNING *
    `, [chapter_number, title, preview_text, word_count,
        status, is_published, author_notes, release_date || null, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/chapters/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM chapters WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.json({ message: 'Chapter deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
