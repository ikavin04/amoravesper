import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/books — public: all published books
router.get('/', async (req: Request, res: Response) => {
  try {
    const { genre, status } = req.query;
    let sql = `
      SELECT b.*,
        (SELECT COUNT(*) FROM chapters c WHERE c.book_id = b.id AND c.is_published = true) as chapter_count
      FROM books b
      WHERE b.is_published = true
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (genre) { sql += ` AND b.genre = $${idx++}`; params.push(genre); }
    if (status) { sql += ` AND b.status = $${idx++}`; params.push(status); }

    sql += ' ORDER BY b.sort_order ASC, b.created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/books/featured
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT b.*,
        (SELECT COUNT(*) FROM chapters c WHERE c.book_id = b.id AND c.is_published = true) as chapter_count
       FROM books b WHERE b.is_featured = true AND b.is_published = true LIMIT 1`
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/books/:slug — public: single book with all related data
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const bookResult = await query(
      'SELECT * FROM books WHERE slug = $1 AND is_published = true', [slug]
    );
    if (bookResult.rows.length === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    const book = bookResult.rows[0];

    const [chapters, characters, playlist, gallery, reviews] = await Promise.all([
      query(`SELECT * FROM chapters WHERE book_id = $1 AND is_published = true ORDER BY chapter_number ASC`, [book.id]),
      query(`SELECT * FROM characters WHERE book_id = $1 ORDER BY sort_order ASC`, [book.id]),
      query(`SELECT * FROM book_playlists WHERE book_id = $1 ORDER BY sort_order ASC`, [book.id]),
      query(`SELECT * FROM book_gallery WHERE book_id = $1 ORDER BY sort_order ASC`, [book.id]),
      query(`SELECT * FROM reader_reviews WHERE book_id = $1 AND is_published = true ORDER BY created_at DESC`, [book.id]),
    ]);

    res.json({
      ...book,
      chapters: chapters.rows,
      characters: characters.rows,
      playlist: playlist.rows,
      gallery: gallery.rows,
      reviews: reviews.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// GET /api/books/admin/all — admin: all books including drafts
router.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT b.*,
        (SELECT COUNT(*) FROM chapters c WHERE c.book_id = b.id) as chapter_count
      FROM books b ORDER BY b.sort_order ASC, b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/books — admin: create book
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      title, slug, description, synopsis, genre, status,
      reading_time, cover_url, banner_url, is_featured, is_published,
      wattpad_link, kindle_link, website_link, countdown_date, sort_order
    } = req.body;

    if (!title || !slug) {
      res.status(400).json({ error: 'Title and slug required' });
      return;
    }

    const result = await query(`
      INSERT INTO books (title, slug, description, synopsis, genre, status, reading_time,
        cover_url, banner_url, is_featured, is_published, wattpad_link, kindle_link,
        website_link, countdown_date, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [title, slug, description, synopsis, genre, status || 'ongoing', reading_time,
        cover_url, banner_url, is_featured || false, is_published || false,
        wattpad_link, kindle_link, website_link, countdown_date || null, sort_order || 0]);

    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).message?.includes('unique')) {
      res.status(409).json({ error: 'Slug already exists' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/books/:id — admin: update book
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title, slug, description, synopsis, genre, status,
      reading_time, cover_url, banner_url, is_featured, is_published,
      wattpad_link, kindle_link, website_link, countdown_date, sort_order
    } = req.body;

    const result = await query(`
      UPDATE books SET
        title=$1, slug=$2, description=$3, synopsis=$4, genre=$5, status=$6,
        reading_time=$7, cover_url=$8, banner_url=$9, is_featured=$10, is_published=$11,
        wattpad_link=$12, kindle_link=$13, website_link=$14, countdown_date=$15,
        sort_order=$16, updated_at=NOW()
      WHERE id=$17 RETURNING *
    `, [title, slug, description, synopsis, genre, status, reading_time,
        cover_url, banner_url, is_featured, is_published, wattpad_link, kindle_link,
        website_link, countdown_date || null, sort_order || 0, id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/books/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM books WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
