'use client';

import { useState, useEffect, useCallback } from 'react';
import { booksApi, uploadApi } from '@/lib/api';
import { Book } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, ExternalLink, BookOpen } from 'lucide-react';
import { getStatusLabel, getStatusColor, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { BookFormModal } from './BookFormModal';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await booksApi.getAllAdmin();
      setBooks(data);
    } catch {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also delete all chapters and characters.`)) return;
    try {
      await booksApi.delete(id);
      toast.success('Book deleted');
      fetchBooks();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const togglePublish = async (book: Book) => {
    try {
      await booksApi.update(book.id, { ...book, is_published: !book.is_published });
      toast.success(book.is_published ? 'Unpublished' : 'Published');
      fetchBooks();
    } catch {
      toast.error('Failed to update');
    }
  };

  const toggleFeature = async (book: Book) => {
    try {
      // Unfeature all first
      if (!book.is_featured) {
        for (const b of books.filter(bk => bk.is_featured)) {
          await booksApi.update(b.id, { ...b, is_featured: false });
        }
      }
      await booksApi.update(book.id, { ...book, is_featured: !book.is_featured });
      toast.success(book.is_featured ? 'Unfeatured' : 'Featured on homepage');
      fetchBooks();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditing(null);
    fetchBooks();
  };

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label mb-2">Manage</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Books</h1>
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Add Book
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-20 rounded-sm" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen size={48} style={{ color: 'var(--color-mist)', opacity: 0.3, margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-mist-light)' }}>No books yet. Add your first book.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map(book => (
            <FadeIn key={book.id}>
              <div
                className="flex items-center gap-4 p-4 rounded-sm"
                style={{
                  background: 'var(--color-ink-muted)',
                  border: `1px solid ${book.is_published ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}`,
                  opacity: book.is_published ? 1 : 0.6,
                }}
              >
                {/* Cover thumbnail */}
                <div className="relative flex-shrink-0 overflow-hidden rounded-sm" style={{ width: 36, height: 54 }}>
                  {book.cover_url ? (
                    <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="36px" />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'var(--color-slate)' }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm" style={{ color: 'var(--color-parchment)' }}>{book.title}</p>
                    {book.is_featured && <span className="badge badge-gold" style={{ fontSize: '0.55rem' }}>Featured</span>}
                    <span className={`badge ${getStatusColor(book.status)}`} style={{ fontSize: '0.55rem' }}>
                      {getStatusLabel(book.status)}
                    </span>
                    {!book.is_published && <span className="badge badge-mist" style={{ fontSize: '0.55rem' }}>Draft</span>}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-mist)' }}>
                    {book.genre} · {book.chapter_count || 0} chapters · {formatDate(book.created_at, 'MMM d, yyyy')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleFeature(book)}
                    className="p-1.5 rounded transition-colors"
                    title={book.is_featured ? 'Unfeature' : 'Feature on homepage'}
                    style={{ color: book.is_featured ? 'var(--color-gold)' : 'var(--color-mist)' }}
                  >
                    <Star size={14} fill={book.is_featured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => togglePublish(book)}
                    className="p-1.5 rounded transition-colors"
                    title={book.is_published ? 'Unpublish' : 'Publish'}
                    style={{ color: book.is_published ? 'var(--color-gold)' : 'var(--color-mist)' }}
                  >
                    {book.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <a
                    href={`/books/${book.slug}`}
                    target="_blank"
                    className="p-1.5 rounded transition-colors"
                    title="View on site"
                    style={{ color: 'var(--color-mist)' }}
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => { setEditing(book); setShowModal(true); }}
                    className="p-1.5 rounded transition-colors"
                    title="Edit"
                    style={{ color: 'var(--color-mist)' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    className="p-1.5 rounded transition-colors"
                    title="Delete"
                    style={{ color: 'var(--color-mist)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-rose-light)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-mist)')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Book Form Modal */}
      {showModal && (
        <BookFormModal
          book={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
