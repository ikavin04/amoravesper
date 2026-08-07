'use client';

import { useState, useEffect, useCallback } from 'react';
import { booksApi, quotesApi, uploadApi } from '@/lib/api';
import { Quote, Book } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { Plus, Trash2, Edit2, Eye, EyeOff, Pin, Upload, X, Loader } from 'lucide-react';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [q, b] = await Promise.all([quotesApi.getAllAdmin(), booksApi.getAllAdmin()]);
      setQuotes(q);
      setBooks(b);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quote?')) return;
    try {
      await quotesApi.delete(id);
      toast.success('Quote deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const togglePublish = async (quote: Quote) => {
    try {
      await quotesApi.update(quote.id, { ...quote, is_published: !quote.is_published });
      toast.success(quote.is_published ? 'Unpublished' : 'Published');
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const togglePin = async (quote: Quote) => {
    try {
      await quotesApi.update(quote.id, { ...quote, is_pinned: !quote.is_pinned });
      toast.success(quote.is_pinned ? 'Unpinned' : 'Pinned to homepage');
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label mb-2">Manage</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Quotes</h1>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Quote
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-16 rounded-sm" />)}</div>
      ) : (
        <div className="space-y-3">
          {quotes.map(quote => (
            <FadeIn key={quote.id}>
              <div className="flex items-start gap-4 p-4 rounded-sm"
                style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.06)', opacity: quote.is_published ? 1 : 0.6 }}>
                {quote.background_image_url && (
                  <div className="relative flex-shrink-0 rounded-sm overflow-hidden" style={{ width: 40, height: 40 }}>
                    <Image src={quote.background_image_url} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm italic line-clamp-2" style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-display)' }}>
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {quote.book_title && <span className="text-xs" style={{ color: 'var(--color-gold)' }}>{quote.book_title}</span>}
                    <span className="badge badge-mist" style={{ fontSize: '0.55rem' }}>{quote.type}</span>
                    {quote.is_pinned && <span className="badge badge-gold" style={{ fontSize: '0.55rem' }}>Pinned</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => togglePin(quote)} className="p-1.5 rounded" title="Pin/Unpin"
                    style={{ color: quote.is_pinned ? 'var(--color-gold)' : 'var(--color-mist)' }}>
                    <Pin size={13} fill={quote.is_pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => togglePublish(quote)} className="p-1.5 rounded" title="Publish/Unpublish"
                    style={{ color: quote.is_published ? 'var(--color-gold)' : 'var(--color-mist)' }}>
                    {quote.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={() => { setEditing(quote); setShowModal(true); }} className="p-1.5 rounded"
                    style={{ color: 'var(--color-mist)' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(quote.id)} className="p-1.5 rounded"
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

      {showModal && (
        <QuoteFormModal
          quote={editing}
          books={books}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={() => { setShowModal(false); setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function QuoteFormModal({ quote, books, onClose, onSave }: {
  quote: Quote | null; books: Book[]; onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState({
    text: quote?.text || '',
    book_id: quote?.book_id || '',
    chapter: quote?.chapter || '',
    type: quote?.type || 'quote',
    background_image_url: quote?.background_image_url || '',
    is_pinned: quote?.is_pinned || false,
    is_published: quote ? quote.is_published : true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bgRef = useState<HTMLInputElement | null>(null);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleBgUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadApi.upload('quotes', file);
      set('background_image_url', result.url);
      toast.success('Background uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text) { toast.error('Quote text required'); return; }
    setSaving(true);
    try {
      if (quote) {
        await quotesApi.update(quote.id, form);
        toast.success('Quote updated');
      } else {
        await quotesApi.create(form);
        toast.success('Quote created');
      }
      onSave();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-sm overflow-hidden" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-ink-soft)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-display font-bold" style={{ fontFamily: 'var(--font-display)' }}>{quote ? 'Edit Quote' : 'Add Quote'}</h2>
          <button onClick={onClose} style={{ color: 'var(--color-mist)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Quote Text *</label>
            <textarea className="textarea" rows={4} value={form.text} onChange={e => set('text', e.target.value)} placeholder="Enter the quote..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Book</label>
              <select className="input" value={form.book_id} onChange={e => set('book_id', e.target.value)}>
                <option value="">No book</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="quote">Quote</option>
                <option value="dialogue">Dialogue</option>
                <option value="poetry">Poetry</option>
                <option value="monologue">Monologue</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Chapter Reference</label>
            <input className="input" value={form.chapter} onChange={e => set('chapter', e.target.value)} placeholder="e.g. Chapter 3, Part I" />
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Background Image</label>
            <div className="flex items-center gap-3">
              {form.background_image_url && (
                <div className="relative rounded-sm overflow-hidden flex-shrink-0" style={{ width: 60, height: 60 }}>
                  <Image src={form.background_image_url} alt="" fill className="object-cover" sizes="60px" />
                </div>
              )}
              <label className="btn btn-outline flex items-center gap-2 cursor-pointer">
                {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading...' : 'Upload Background'}
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleBgUpload(f); }} />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[{ k: 'is_published', l: 'Published' }, { k: 'is_pinned', l: 'Pin to Homepage' }].map(t => (
              <label key={t.k} className="flex items-center gap-2 cursor-pointer">
                <div className="relative w-9 h-5 rounded-full transition-colors cursor-pointer"
                  style={{ background: form[t.k as keyof typeof form] ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)' }}
                  onClick={() => set(t.k, !form[t.k as keyof typeof form])}>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: form[t.k as keyof typeof form] ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--color-mist-light)' }}>{t.l}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
              {saving && <Loader size={14} className="animate-spin" />}
              {saving ? 'Saving...' : quote ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
