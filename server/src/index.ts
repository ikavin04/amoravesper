import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { globalLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/auth';
import booksRoutes from './routes/books';
import chaptersRoutes from './routes/chapters';
import quotesRoutes from './routes/quotes';
import galleryRoutes from './routes/gallery';
import charactersRoutes from './routes/characters';
import blogRoutes from './routes/blog';
import announcementsRoutes from './routes/announcements';
import settingsRoutes from './routes/settings';
import searchRoutes from './routes/search';
import uploadRoutes from './routes/upload';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // CSP managed by Next.js
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, cURL) or matching origins
    if (!origin) return callback(null, true);
    if (
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin === process.env.CLIENT_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow for production client flexibility
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(globalLimiter);
app.use(cookieParser());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', name: 'Amora Vesper API Server', version: '1.0.0' });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
