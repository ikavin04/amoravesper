'use client';

import { useState, useEffect, useCallback } from 'react';
import { booksApi } from '@/lib/api';
import { Book } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { Plus, Trash2, Edit2, Upload, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { uploadApi } from '@/lib/api';

interface CharacterFormData {
  book_id: string; name: string; role: string; description: string; photo_url: string; sort_order: number;
}

export default function AdminCharactersPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [characters, setCharacters] = useState<{ id: string; name: string; role: string; description: string; photo_url: string; sort_order: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<typeof characters[0] | null>(null);

  useEffect(() => { booksApi.getAllAdmin().then(setBooks); }, []);

  const fetchCharacters = useCallback(async (bookId: string) => {
    if (!bookId) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/characters/${bookId}`, { credentials: 'include' });
      setCharacters(await res.json());
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (selectedBook) fetchCharacters(selectedBook); }, [selectedBook, fetchCharacters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this character?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/characters/${id}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Character deleted');
      fetchCharacters(selectedBook);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label mb-2">Manage</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Characters</h1>
          </div>
        </div>
        <div className="mb-8 flex items-center gap-4">
          <select className="input max-w-xs" value={selectedBook} onChange={e => setSelectedBook(e.target.value)}>
            <option value="">Select a book...</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
          {selectedBook && (
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
              <Plus size={14} /> Add Character
            </button>
          )}
        </div>
      </FadeIn>

      {!selectedBook ? (
        <div className="text-center py-16"><p style={{ color: 'var(--color-mist-light)' }}>Select a book to manage its characters.</p></div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-40 rounded-sm" />)}
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-16"><p style={{ color: 'var(--color-mist-light)' }}>No characters yet.</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map(char => (
            <FadeIn key={char.id}>
              <div className="card p-4 text-center group">
                <div className="relative mx-auto mb-3 rounded-full overflow-hidden" style={{ width: 80, height: 80, background: 'var(--color-slate)' }}>
                  {char.photo_url && <Image src={char.photo_url} alt={char.name} fill className="object-cover" sizes="80px" />}
                </div>
                <p className="font-medium text-sm" style={{ color: 'var(--color-parchment)' }}>{char.name}</p>
                {char.role && <p className="text-xs mt-1" style={{ color: 'var(--color-gold)' }}>{char.role}</p>}
                <div className="flex justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(char); setShowModal(true); }} className="p-1.5 rounded" style={{ color: 'var(--color-mist)' }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(char.id)} className="p-1.5 rounded" style={{ color: 'var(--color-mist)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-rose-light)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-mist)')}><Trash2 size={13} /></button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {showModal && selectedBook && (
        <CharacterModal char={editing} bookId={selectedBook}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={() => { setShowModal(false); setEditing(null); fetchCharacters(selectedBook); }} />
      )}
    </div>
  );
}

function CharacterModal({ char, bookId, onClose, onSave }: {
  char: { id: string; name: string; role: string; description: string; photo_url: string; sort_order: number } | null;
  bookId: string; onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: char?.name || '', role: char?.role || '', description: char?.description || '',
    photo_url: char?.photo_url || '', sort_order: char?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadApi.upload('characters', file);
      set('photo_url', result.url);
      toast.success('Photo uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, book_id: bookId };
      if (char) {
        await fetch(`${API}/api/characters/${char.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        toast.success('Updated');
      } else {
        await fetch(`${API}/api/characters`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        toast.success('Created');
      }
      onSave();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-sm" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-ink-soft)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-display font-bold" style={{ fontFamily: 'var(--font-display)' }}>{char ? 'Edit Character' : 'Add Character'}</h2>
          <button onClick={onClose} style={{ color: 'var(--color-mist)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo Upload */}
          <div className="text-center">
            <div className="relative mx-auto mb-3 rounded-full overflow-hidden cursor-pointer" style={{ width: 80, height: 80, background: 'var(--color-slate)' }}
              onClick={() => document.getElementById('char-photo-input')?.click()}>
              {form.photo_url ? <Image src={form.photo_url} alt="" fill className="object-cover" sizes="80px" /> : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload size={20} style={{ color: 'var(--color-mist)' }} />
                </div>
              )}
            </div>
            <input id="char-photo-input" type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
            <button type="button" className="btn btn-ghost" style={{ fontSize: '0.7rem' }}
              onClick={() => document.getElementById('char-photo-input')?.click()}>
              {uploading ? <Loader size={12} className="animate-spin" /> : null}
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Character name" required />
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Role</label>
            <input className="input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Protagonist, Love Interest" />
          </div>
          <div>
            <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Description</label>
            <textarea className="textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Character description..." />
          </div>
          <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
              {saving && <Loader size={14} className="animate-spin" />}
              {saving ? 'Saving...' : char ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
