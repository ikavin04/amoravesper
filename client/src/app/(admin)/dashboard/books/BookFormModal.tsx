'use client';

import { useState, useRef } from 'react';
import { booksApi, uploadApi } from '@/lib/api';
import { Book } from '@/types';
import { motion } from 'framer-motion';
import { X, Upload, Loader } from 'lucide-react';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface BookFormModalProps {
  book: Book | null;
  onClose: () => void;
  onSave: () => void;
}

const GENRES = ['Fantasy', 'Dark Romance', 'Gothic', 'Thriller', 'Contemporary', 'Paranormal', 'Literary Fiction', 'Horror', 'Mystery'];

export function BookFormModal({ book, onClose, onSave }: BookFormModalProps) {
  const [form, setForm] = useState({
    title: book?.title || '',
    slug: book?.slug || '',
    genre: book?.genre || '',
    status: book?.status || 'ongoing',
    description: book?.description || '',
    cover_url: book?.cover_url || '',
    wattpad_link: book?.wattpad_link || '',
    kindle_link: book?.kindle_link || '',
    reading_time: book?.reading_time || '',
    is_published: book?.is_published ?? true,
    is_featured: book?.is_featured ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const coverRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || slugify(title) }));
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    setCoverProgress(0);
    try {
      const result = await uploadApi.upload('covers', file, p => setCoverProgress(p));
      set('cover_url', result.url);
      toast.success('Cover uploaded');
    } catch {
      toast.error('Cover upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) { toast.error('Title and slug required'); return; }
    setSaving(true);
    try {
      if (book) {
        await booksApi.update(book.id, form);
        toast.success('Book updated');
      } else {
        await booksApi.create(form);
        toast.success('Book created');
      }
      onSave();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg my-8 rounded-sm overflow-hidden"
        style={{ background: 'var(--color-ink-soft)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-display text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {book ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-mist)' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Title *</label>
              <input className="input" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Book title" required />
            </div>
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Slug *</label>
              <input className="input" value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="book-slug" required />
            </div>
          </div>

          {/* Genre + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Genre</label>
              <select className="input" value={form.genre} onChange={e => set('genre', e.target.value)}>
                <option value="">Select genre</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Coming Soon</option>
                <option value="hiatus">On Hiatus</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Description</label>
            <textarea className="textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Book synopsis and description..." />
          </div>

          {/* Cover Image Upload (512x800 pxs) */}
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Cover Image (512×800 pxs)</label>
            <div
              className="relative border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              onClick={() => coverRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleCoverUpload(f); }}
            >
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
              {form.cover_url ? (
                <div className="relative mx-auto" style={{ width: 80, height: 125 }}>
                  <Image src={form.cover_url} alt="Cover" fill className="object-cover rounded-sm" sizes="80px" />
                </div>
              ) : (
                <div className="py-4">
                  <Upload size={24} style={{ color: 'var(--color-mist)', margin: '0 auto 0.5rem' }} />
                  <p className="text-xs" style={{ color: 'var(--color-mist)' }}>Upload Cover (512×800 pxs)</p>
                </div>
              )}
              {uploadingCover && (
                <div className="mt-2">
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${coverProgress}%`, background: 'var(--color-gold)' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Links: Wattpad + Kindle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Wattpad Link</label>
              <input className="input" type="url" value={form.wattpad_link} onChange={e => set('wattpad_link', e.target.value)} placeholder="https://www.wattpad.com/..." />
            </div>
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Kindle Link</label>
              <input className="input" type="url" value={form.kindle_link} onChange={e => set('kindle_link', e.target.value)} placeholder="https://amazon.com/..." />
            </div>
          </div>

          {/* Reading Time */}
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Reading Time</label>
            <input className="input" value={form.reading_time} onChange={e => set('reading_time', e.target.value)} placeholder="e.g. 5-7 hours" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
              {saving ? <Loader size={14} className="animate-spin" /> : null}
              {saving ? 'Saving...' : book ? 'Save Changes' : 'Create Book'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
