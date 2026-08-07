import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/gallery — public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { folder } = req.query;
    let sql = `SELECT * FROM gallery_images WHERE is_published = true`;
    const params: unknown[] = [];

    if (folder) {
      sql += ` AND folder = $1`;
      params.push(folder);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gallery/folders — public: list unique folders
router.get('/folders', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT DISTINCT folder FROM gallery_images WHERE is_published = true ORDER BY folder ASC`
    );
    res.json(result.rows.map((r: { folder: string }) => r.folder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gallery/admin/all — admin
router.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gallery — admin: create
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, folder, image_url, alt_text, is_published, sort_order } = req.body;

    if (!image_url) {
      res.status(400).json({ error: 'image_url required' });
      return;
    }

    const result = await query(`
      INSERT INTO gallery_images (title, folder, image_url, alt_text, is_published, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [title, folder || 'general', image_url, alt_text, is_published || false, sort_order || 0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/gallery/:id — admin: update
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, folder, image_url, alt_text, is_published, sort_order } = req.body;

    const result = await query(`
      UPDATE gallery_images SET
        title=$1, folder=$2, image_url=$3, alt_text=$4, is_published=$5, sort_order=$6
      WHERE id=$7 RETURNING *
    `, [title, folder, image_url, alt_text, is_published, sort_order || 0, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gallery/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM gallery_images WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
