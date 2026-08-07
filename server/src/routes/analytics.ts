import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview — admin: dashboard stats
router.get('/overview', requireAuth, async (_req: Request, res: Response) => {
  try {
    const [books, quotes, gallery, posts, views] = await Promise.all([
      query('SELECT COUNT(*) FROM books'),
      query('SELECT COUNT(*) FROM quotes WHERE is_published = true'),
      query('SELECT COUNT(*) FROM gallery_images WHERE is_published = true'),
      query('SELECT COUNT(*) FROM blog_posts WHERE is_published = true'),
      query('SELECT COUNT(*) FROM page_views WHERE viewed_at > NOW() - INTERVAL \'30 days\''),
    ]);

    const viewsByPath = await query(`
      SELECT path, COUNT(*) as views
      FROM page_views
      WHERE viewed_at > NOW() - INTERVAL '30 days'
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `);

    const viewsByDay = await query(`
      SELECT DATE_TRUNC('day', viewed_at)::date as date, COUNT(*) as views
      FROM page_views
      WHERE viewed_at > NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `);

    res.json({
      stats: {
        books: parseInt(books.rows[0].count),
        quotes: parseInt(quotes.rows[0].count),
        gallery: parseInt(gallery.rows[0].count),
        posts: parseInt(posts.rows[0].count),
        monthlyViews: parseInt(views.rows[0].count),
      },
      topPages: viewsByPath.rows,
      viewsByDay: viewsByDay.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/analytics/track — public: track page view
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { path } = req.body;
    if (!path) {
      res.status(400).json({ error: 'Path required' });
      return;
    }

    const referrer = req.headers.referer || req.headers.referrer || '';
    const userAgent = req.headers['user-agent'] || '';

    await query(
      'INSERT INTO page_views (path, referrer, user_agent) VALUES ($1,$2,$3)',
      [path.substring(0, 500), String(referrer).substring(0, 500), String(userAgent).substring(0, 500)]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
