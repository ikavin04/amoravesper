import { Router, Request, Response } from 'express';
import { query } from '../db/pool';

const router = Router();

// GET /api/search?q=... — global full-text search
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.status(400).json({ error: 'Query must be at least 2 characters' });
      return;
    }

    const searchTerm = q.trim();
    const tsQuery = searchTerm.split(' ').filter(Boolean).join(' & ');

    const [books, quotes, characters, posts] = await Promise.all([
      query(`
        SELECT id, title, slug, description, cover_url, genre, status, 'book' as type
        FROM books
        WHERE is_published = true
          AND to_tsvector('english', title || ' ' || COALESCE(description,'') || ' ' || COALESCE(synopsis,''))
              @@ to_tsquery('english', $1)
        LIMIT 10
      `, [tsQuery]),

      query(`
        SELECT q.id, q.text, q.type, q.background_image_url, b.title as book_title, b.slug as book_slug,
               'quote' as result_type
        FROM quotes q
        LEFT JOIN books b ON b.id = q.book_id
        WHERE q.is_published = true
          AND to_tsvector('english', q.text) @@ to_tsquery('english', $1)
        LIMIT 10
      `, [tsQuery]),

      query(`
        SELECT c.id, c.name, c.role, c.photo_url, b.title as book_title, b.slug as book_slug,
               'character' as type
        FROM characters c
        JOIN books b ON b.id = c.book_id AND b.is_published = true
        WHERE to_tsvector('english', c.name || ' ' || COALESCE(c.description,''))
              @@ to_tsquery('english', $1)
        LIMIT 10
      `, [tsQuery]),

      query(`
        SELECT id, title, slug, excerpt, cover_url, category, 'post' as type
        FROM blog_posts
        WHERE is_published = true
          AND to_tsvector('english', title || ' ' || COALESCE(content,''))
              @@ to_tsquery('english', $1)
        LIMIT 10
      `, [tsQuery]),
    ]);

    res.json({
      query: searchTerm,
      books: books.rows,
      quotes: quotes.rows,
      characters: characters.rows,
      posts: posts.rows,
      total: books.rows.length + quotes.rows.length + characters.rows.length + posts.rows.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
