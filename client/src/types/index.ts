// Shared TypeScript interfaces for the entire application

export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  synopsis: string | null;
  genre: string | null;
  status: 'ongoing' | 'completed' | 'upcoming' | 'hiatus';
  reading_time: string | null;
  cover_url: string | null;
  banner_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  wattpad_link: string | null;
  kindle_link: string | null;
  website_link: string | null;
  countdown_date: string | null;
  sort_order: number;
  chapter_count?: number;
  created_at: string;
  updated_at: string;
  // Populated in detail view
  chapters?: Chapter[];
  characters?: Character[];
  playlist?: PlaylistTrack[];
  gallery?: BookGalleryImage[];
  reviews?: Review[];
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  preview_text: string | null;
  word_count: number;
  status: 'locked' | 'preview';
  is_published: boolean;
  author_notes: string | null;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  book_id: string;
  name: string;
  role: string | null;
  description: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface PlaylistTrack {
  id: string;
  book_id: string;
  track_title: string;
  artist: string | null;
  url: string | null;
  sort_order: number;
  created_at: string;
}

export interface BookGalleryImage {
  id: string;
  book_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Quote {
  id: string;
  book_id: string | null;
  text: string;
  chapter: string | null;
  type: 'dialogue' | 'quote' | 'poetry' | 'monologue';
  background_image_url: string | null;
  is_pinned: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  book_title?: string;
  book_slug?: string;
}

export interface GalleryImage {
  id: string;
  title: string | null;
  folder: string;
  image_url: string;
  alt_text: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_url: string | null;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'event' | 'release';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  book_id: string;
  reviewer_name: string;
  platform: string | null;
  rating: number;
  text: string | null;
  is_published: boolean;
  created_at: string;
}

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_background_url: string;
  featured_book_id: string;
  announcement_text: string;
  announcement_active: string;
  site_tagline: string;
  writing_status: string;
  writing_progress: string;
  about_bio: string;
  about_image_url: string;
  social_instagram: string;
  social_threads: string;
  social_tiktok: string;
  social_email: string;
}

export interface SearchResults {
  query: string;
  books: Array<Book & { type: 'book' }>;
  quotes: Array<Quote & { result_type: 'quote' }>;
  characters: Array<Character & { type: 'character'; book_title: string; book_slug: string }>;
  posts: Array<BlogPost & { type: 'post' }>;
  total: number;
}

export interface AnalyticsOverview {
  stats: {
    books: number;
    quotes: number;
    gallery: number;
    posts: number;
    monthlyViews: number;
  };
  topPages: Array<{ path: string; views: number }>;
  viewsByDay: Array<{ date: string; views: number }>;
}
