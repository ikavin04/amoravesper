import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/blog — public: published posts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let sql = `SELECT id, title, slug, excerpt, cover_url, category, published_at, created_at
               FROM blog_posts WHERE is_published = true`;
    const params: unknown[] = [];

    if (category) {
      sql += ` AND category = $1`;
      params.push(category);
    }

    sql += ' ORDER BY published_at DESC, created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blog/:slug — public
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM blog_posts WHERE slug=$1 AND is_published=true',
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blog/admin/all — admin
router.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blog/admin/:id — admin: single post
router.get('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM blog_posts WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blog — admin: create
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, slug, content, excerpt, cover_url, category, is_published } = req.body;

    if (!title || !slug) {
      res.status(400).json({ error: 'Title and slug required' });
      return;
    }

    const result = await query(`
      INSERT INTO blog_posts (title, slug, content, excerpt, cover_url, category, is_published, published_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [title, slug, content, excerpt, cover_url, category || 'update',
        is_published || false, is_published ? new Date() : null]);

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

// PUT /api/blog/:id — admin: update
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, slug, content, excerpt, cover_url, category, is_published } = req.body;

    // Set published_at on first publish
    const existing = await query('SELECT is_published, published_at FROM blog_posts WHERE id=$1', [req.params.id]);
    const wasPublished = existing.rows[0]?.is_published;
    const publishedAt = (!wasPublished && is_published) ? new Date() : existing.rows[0]?.published_at;

    const result = await query(`
      UPDATE blog_posts SET
        title=$1, slug=$2, content=$3, excerpt=$4, cover_url=$5, category=$6,
        is_published=$7, published_at=$8, updated_at=NOW()
      WHERE id=$9 RETURNING *
    `, [title, slug, content, excerpt, cover_url, category, is_published, publishedAt, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/blog/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM blog_posts WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
