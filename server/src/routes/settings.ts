import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/settings — public (safe keys only)
const PUBLIC_KEYS = [
  'hero_title', 'hero_subtitle', 'hero_background_url', 'featured_book_id',
  'announcement_text', 'announcement_active', 'site_tagline', 'writing_status',
  'writing_progress', 'about_bio', 'about_image_url', 'social_instagram',
  'social_threads', 'social_tiktok', 'social_email'
];

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT key, value FROM settings WHERE key = ANY($1)`,
      [PUBLIC_KEYS]
    );
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/settings/admin/all — admin
router.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM settings ORDER BY key ASC');
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/settings — admin: upsert settings
router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;

    if (typeof updates !== 'object' || Array.isArray(updates)) {
      res.status(400).json({ error: 'Expected key-value object' });
      return;
    }

    const promises = Object.entries(updates).map(([key, value]) =>
      query(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
        [key, value]
      )
    );

    await Promise.all(promises);
    res.json({ message: 'Settings updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
