'use client';

import { useState, useEffect, useCallback } from 'react';
import { booksApi, chaptersApi } from '@/lib/api';
import { Chapter, Book } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { Plus, Trash2, Edit2, Eye, EyeOff, Lock, Unlock, X, Loader } from 'lucide-react';
import { formatDate, formatWordCount } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminChaptersPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);

  useEffect(() => {
    booksApi.getAllAdmin().then(setBooks).catch(() => toast.error('Failed to load books'));
  }, []);

  const fetchChapters = useCallback(async (bookId: string) => {
    if (!bookId) return;
    setLoading(true);
    try {
      const data = await chaptersApi.getAllAdmin(bookId);
      setChapters(data);
    } catch { toast.error('Failed to load chapters'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (selectedBook) fetchChapters(selectedBook); }, [selectedBook, fetchChapters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this chapter?')) return;
    try {
      await chaptersApi.delete(id);
      toast.success('Chapter deleted');
      fetchChapters(selectedBook);
    } catch { toast.error('Failed'); }
  };

  const togglePublish = async (ch: Chapter) => {
    try {
      await chaptersApi.update(ch.id, { ...ch, is_published: !ch.is_published });
      fetchChapters(selectedBook);
    } catch { toast.error('Failed'); }
  };

  const toggleStatus = async (ch: Chapter) => {
    try {
      await chaptersApi.update(ch.id, { ...ch, status: ch.status === 'locked' ? 'preview' : 'locked' });
      fetchChapters(selectedBook);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label mb-2">Manage</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Chapters</h1>
          </div>
        </div>

        {/* Book Selector */}
        <div className="mb-8 flex items-center gap-4">
          <select
            className="input max-w-xs"
            value={selectedBook}
            onChange={e => setSelectedBook(e.target.value)}
          >
            <option value="">Select a book...</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
          {selectedBook && (
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={14} /> Add Chapter
            </button>
          )}
        </div>
      </FadeIn>

      {!selectedBook ? (
        <div className="text-center py-16">
          <p style={{ color: 'var(--color-mist-light)' }}>Select a book to manage its chapters.</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-14 rounded-sm" />)}</div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ color: 'var(--color-mist-light)' }}>No chapters yet for this book.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map(ch => (
            <FadeIn key={ch.id}>
              <div className="flex items-center gap-4 p-4 rounded-sm"
                style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)', opacity: ch.is_published ? 1 : 0.6 }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-mist-light)' }}>
                  {ch.chapter_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-parchment)' }}>{ch.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-mist)' }}>
                    {formatWordCount(ch.word_count)}
                    {ch.release_date && ` · ${formatDate(ch.release_date, 'MMM d, yyyy')}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleStatus(ch)} className="p-1.5 rounded" title="Toggle Lock/Preview"
                    style={{ color: ch.status === 'preview' ? 'var(--color-gold)' : 'var(--color-mist)' }}>
                    {ch.status === 'locked' ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                  <button onClick={() => togglePublish(ch)} className="p-1.5 rounded"
                    style={{ color: ch.is_published ? 'var(--color-gold)' : 'var(--color-mist)' }}>
                    {ch.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={() => { setEditing(ch); setShowModal(true); }} className="p-1.5 rounded"
                    style={{ color: 'var(--color-mist)' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(ch.id)} className="p-1.5 rounded"
                    style={{ color: 'var(--color-mist)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-rose-light)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-mist)')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {showModal && selectedBook && (
        <ChapterFormModal
          chapter={editing}
          bookId={selectedBook}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={() => { setShowModal(false); setEditing(null); fetchChapters(selectedBook); }}
        />
      )}
    </div>
  );
}

function ChapterFormModal({ chapter, bookId, onClose, onSave }: {
  chapter: Chapter | null; bookId: string; onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState({
    chapter_number: chapter?.chapter_number || 1,
    title: chapter?.title || '',
    preview_text: chapter?.preview_text || '',
    word_count: chapter?.word_count || 0,
    status: chapter?.status || 'locked',
    is_published: chapter?.is_published || false,
    author_notes: chapter?.author_notes || '',
    release_date: chapter?.release_date ? chapter.release_date.slice(0, 16) : '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, book_id: bookId, release_date: form.release_date || null };
      if (chapter) {
        await chaptersApi.update(chapter.id, payload);
        toast.success('Chapter updated');
      } else {
        await chaptersApi.create(payload);
        toast.success('Chapter created');
      }
      onSave();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-sm" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-ink-soft)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-display font-bold" style={{ fontFamily: 'var(--font-display)' }}>{chapter ? 'Edit Chapter' : 'Add Chapter'}</h2>
          <button onClick={onClose} style={{ color: 'var(--color-mist)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Chapter Number *</label>
              <input type="number" className="input" value={form.chapter_number} min={1}
                onChange={e => set('chapter_number', parseInt(e.target.value))} required />
            </div>
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Word Count</label>
              <input type="number" className="input" value={form.word_count} min={0}
                onChange={e => set('word_count', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Chapter Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Chapter title" required />
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Preview Text (shown on site)</label>
            <textarea className="textarea" rows={4} value={form.preview_text} onChange={e => set('preview_text', e.target.value)} placeholder="A teaser excerpt from this chapter..." />
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Author Notes</label>
            <textarea className="textarea" rows={2} value={form.author_notes} onChange={e => set('author_notes', e.target.value)} placeholder="Notes to readers..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="locked">Locked</option>
                <option value="preview">Preview Available</option>
              </select>
            </div>
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Release Date</label>
              <input type="datetime-local" className="input" value={form.release_date} onChange={e => set('release_date', e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative w-9 h-5 rounded-full transition-colors cursor-pointer"
              style={{ background: form.is_published ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)' }}
              onClick={() => set('is_published', !form.is_published)}>
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: form.is_published ? 'translateX(16px)' : 'translateX(0)' }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--color-mist-light)' }}>Published</span>
          </label>
          <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
              {saving && <Loader size={14} className="animate-spin" />}
              {saving ? 'Saving...' : chapter ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
