-- Amora Vesper — PostgreSQL Schema
-- Run this against your Supabase project's SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SETTINGS (key-value store for site config)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('hero_title', 'Stories that breathe.'),
  ('hero_subtitle', 'Author of dark, atmospheric fiction that lingers long after the last page.'),
  ('hero_background_url', ''),
  ('featured_book_id', ''),
  ('announcement_text', ''),
  ('announcement_active', 'false'),
  ('site_tagline', 'Amora Vesper — Official Author Website'),
  ('writing_status', 'Currently writing: Untitled Project'),
  ('writing_progress', '0'),
  ('about_bio', ''),
  ('about_image_url', ''),
  ('social_instagram', ''),
  ('social_threads', ''),
  ('social_tiktok', ''),
  ('social_email', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  description      TEXT,
  synopsis         TEXT,
  genre            VARCHAR(100),
  status           VARCHAR(50) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'upcoming', 'hiatus')),
  reading_time     VARCHAR(50),
  cover_url        TEXT,
  banner_url       TEXT,
  is_featured      BOOLEAN DEFAULT FALSE,
  is_published     BOOLEAN DEFAULT FALSE,
  wattpad_link     TEXT,
  kindle_link      TEXT,
  website_link     TEXT,
  countdown_date   TIMESTAMPTZ,
  sort_order       INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAPTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS chapters (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id        UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title          VARCHAR(255) NOT NULL,
  preview_text   TEXT,
  word_count     INT DEFAULT 0,
  status         VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'preview')),
  is_published   BOOLEAN DEFAULT FALSE,
  author_notes   TEXT,
  release_date   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, chapter_number)
);

-- ============================================================
-- CHARACTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS characters (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(100),
  description TEXT,
  photo_url   TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOK PLAYLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS book_playlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  track_title VARCHAR(255) NOT NULL,
  artist      VARCHAR(255),
  url         TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOK GALLERY (per-book moodboard images)
-- ============================================================
CREATE TABLE IF NOT EXISTS book_gallery (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     VARCHAR(255),
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUOTES / FAVORITE LINES
-- ============================================================
CREATE TABLE IF NOT EXISTS quotes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id              UUID REFERENCES books(id) ON DELETE SET NULL,
  text                 TEXT NOT NULL,
  chapter              VARCHAR(100),
  type                 VARCHAR(20) DEFAULT 'quote' CHECK (type IN ('dialogue', 'quote', 'poetry', 'monologue')),
  background_image_url TEXT,
  is_pinned            BOOLEAN DEFAULT FALSE,
  is_published         BOOLEAN DEFAULT FALSE,
  sort_order           INT DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GALLERY IMAGES (global gallery page)
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(255),
  folder       VARCHAR(100) DEFAULT 'general',
  image_url    TEXT NOT NULL,
  alt_text     VARCHAR(255),
  is_published BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS / NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) UNIQUE NOT NULL,
  content      TEXT,
  excerpt      TEXT,
  cover_url    TEXT,
  category     VARCHAR(100) DEFAULT 'update',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text        TEXT NOT NULL,
  type        VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'event', 'release')),
  is_active   BOOLEAN DEFAULT TRUE,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- READER REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reader_reviews (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id        UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  reviewer_name  VARCHAR(255) NOT NULL,
  platform       VARCHAR(100),
  rating         SMALLINT CHECK (rating BETWEEN 1 AND 5),
  text           TEXT,
  is_published   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAGE VIEWS (basic analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path       VARCHAR(500) NOT NULL,
  referrer   TEXT,
  user_agent TEXT,
  viewed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_is_published ON books(is_published);
CREATE INDEX IF NOT EXISTS idx_books_is_featured ON books(is_featured);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_characters_book_id ON characters(book_id);
CREATE INDEX IF NOT EXISTS idx_quotes_book_id ON quotes(book_id);
CREATE INDEX IF NOT EXISTS idx_quotes_is_published ON quotes(is_published);
CREATE INDEX IF NOT EXISTS idx_quotes_is_pinned ON quotes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_gallery_images_folder ON gallery_images(folder);
CREATE INDEX IF NOT EXISTS idx_gallery_images_is_published ON gallery_images(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_books_fts ON books USING gin(to_tsvector('english', title || ' ' || COALESCE(description,'') || ' ' || COALESCE(synopsis,'')));
CREATE INDEX IF NOT EXISTS idx_quotes_fts ON quotes USING gin(to_tsvector('english', text));
CREATE INDEX IF NOT EXISTS idx_blog_posts_fts ON blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(content,'')));
CREATE INDEX IF NOT EXISTS idx_characters_fts ON characters USING gin(to_tsvector('english', name || ' ' || COALESCE(description,'')));

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
