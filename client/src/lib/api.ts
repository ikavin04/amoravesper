import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization header if token stored in localStorage
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('amora_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Books ────────────────────────────────────────────────────────────────────
export const booksApi = {
  getAll: (params?: { genre?: string; status?: string }) =>
    api.get('/api/books', { params }).then(r => r.data),

  getFeatured: () =>
    api.get('/api/books/featured').then(r => r.data),

  getBySlug: (slug: string) =>
    api.get(`/api/books/${slug}`).then(r => r.data),

  // Admin
  getAllAdmin: () =>
    api.get('/api/books/admin/all').then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post('/api/books', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/books/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/books/${id}`).then(r => r.data),
};

// ─── Chapters ─────────────────────────────────────────────────────────────────
export const chaptersApi = {
  getByBook: (bookId: string) =>
    api.get(`/api/chapters/${bookId}`).then(r => r.data),

  getAllAdmin: (bookId: string) =>
    api.get(`/api/chapters/admin/${bookId}`).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post('/api/chapters', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/chapters/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/chapters/${id}`).then(r => r.data),
};

// ─── Quotes ───────────────────────────────────────────────────────────────────
export const quotesApi = {
  getAll: (params?: { type?: string; book_id?: string; pinned?: string }) =>
    api.get('/api/quotes', { params }).then(r => r.data),

  getRandom: () =>
    api.get('/api/quotes/random').then(r => r.data),

  getPinned: () =>
    api.get('/api/quotes/pinned').then(r => r.data),

  getAllAdmin: () =>
    api.get('/api/quotes/admin/all').then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post('/api/quotes', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/quotes/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/quotes/${id}`).then(r => r.data),
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const galleryApi = {
  getAll: (folder?: string) =>
    api.get('/api/gallery', { params: folder ? { folder } : {} }).then(r => r.data),

  getFolders: () =>
    api.get('/api/gallery/folders').then(r => r.data),

  getAllAdmin: () =>
    api.get('/api/gallery/admin/all').then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post('/api/gallery', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/gallery/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/gallery/${id}`).then(r => r.data),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogApi = {
  getAll: (category?: string) =>
    api.get('/api/blog', { params: category ? { category } : {} }).then(r => r.data),

  getBySlug: (slug: string) =>
    api.get(`/api/blog/${slug}`).then(r => r.data),

  getAllAdmin: () =>
    api.get('/api/blog/admin/all').then(r => r.data),

  getAdminById: (id: string) =>
    api.get(`/api/blog/admin/${id}`).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post('/api/blog', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/blog/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/blog/${id}`).then(r => r.data),
};

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcementsApi = {
  getActive: () =>
    api.get('/api/announcements').then(r => r.data),

  getAllAdmin: () =>
    api.get('/api/announcements/admin/all').then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post('/api/announcements', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/announcements/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/announcements/${id}`).then(r => r.data),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  getPublic: () =>
    api.get('/api/settings').then(r => r.data),

  getAllAdmin: () =>
    api.get('/api/settings/admin/all').then(r => r.data),

  update: (data: Record<string, string>) =>
    api.put('/api/settings', data).then(r => r.data),
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string) =>
    api.get('/api/search', { params: { q } }).then(r => r.data),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }).then(r => {
      if (r.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('amora_auth_token', r.data.token);
      }
      return r.data;
    }),

  logout: () =>
    api.post('/api/auth/logout').then(r => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('amora_auth_token');
      }
      return r.data;
    }),

  me: () =>
    api.get('/api/auth/me').then(r => r.data),
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  upload: (
    folder: string,
    file: File,
    onProgress?: (percent: number) => void
  ) => {
    const form = new FormData();
    form.append('image', file);
    return api.post(`/api/upload/${folder}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }).then(r => r.data);
  },

  uploadMultiple: (
    folder: string,
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    return api.post(`/api/upload/multiple/${folder}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }).then(r => r.data);
  },
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getOverview: () =>
    api.get('/api/analytics/overview').then(r => r.data),

  track: (path: string) =>
    api.post('/api/analytics/track', { path }).catch(() => null), // Non-fatal
};
