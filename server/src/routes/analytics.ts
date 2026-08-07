import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview — admin: dashboard stats
router.get('/overview', requireAuth, async (_req: Request, res: Response) => {
  try {
    let booksCount = 0;
    let quotesCount = 0;
    let galleryCount = 0;
    let postsCount = 0;
    let viewsCount = 0;
    let topPages: any[] = [];
    let viewsByDay: any[] = [];

    try {
      const [books, quotes, gallery, posts, views] = await Promise.all([
        query('SELECT COUNT(*) FROM books').catch(() => ({ rows: [{ count: '0' }] })),
        query('SELECT COUNT(*) FROM quotes WHERE is_published = true').catch(() => ({ rows: [{ count: '0' }] })),
        query('SELECT COUNT(*) FROM gallery_images WHERE is_published = true').catch(() => ({ rows: [{ count: '0' }] })),
        query('SELECT COUNT(*) FROM blog_posts WHERE is_published = true').catch(() => ({ rows: [{ count: '0' }] })),
        query('SELECT COUNT(*) FROM page_views WHERE viewed_at > NOW() - INTERVAL \'30 days\'').catch(() => ({ rows: [{ count: '0' }] })),
      ]);

      booksCount = parseInt(books.rows[0]?.count || '0', 10);
      quotesCount = parseInt(quotes.rows[0]?.count || '0', 10);
      galleryCount = parseInt(gallery.rows[0]?.count || '0', 10);
      postsCount = parseInt(posts.rows[0]?.count || '0', 10);
      viewsCount = parseInt(views.rows[0]?.count || '0', 10);

      const topPagesRes = await query(`
        SELECT path, COUNT(*) as views
        FROM page_views
        WHERE viewed_at > NOW() - INTERVAL '30 days'
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      `).catch(() => ({ rows: [] }));
      topPages = topPagesRes.rows;

      const viewsByDayRes = await query(`
        SELECT DATE_TRUNC('day', viewed_at)::date as date, COUNT(*) as views
        FROM page_views
        WHERE viewed_at > NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date ASC
      `).catch(() => ({ rows: [] }));
      viewsByDay = viewsByDayRes.rows;
    } catch (dbErr) {
      console.warn('Analytics DB query fallback:', dbErr);
    }

    res.json({
      stats: {
        books: booksCount,
        quotes: quotesCount,
        gallery: galleryCount,
        posts: postsCount,
        monthlyViews: viewsCount,
      },
      topPages,
      viewsByDay,
    });
  } catch (err) {
    console.error('Analytics overview route error:', err);
    res.json({
      stats: { books: 0, quotes: 0, gallery: 0, posts: 0, monthlyViews: 0 },
      topPages: [],
      viewsByDay: [],
    });
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
