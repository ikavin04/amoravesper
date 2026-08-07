import type { Metadata } from 'next';
import { booksApi } from '@/lib/api';
import { BookCard } from '@/components/client/BookCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { Book } from '@/types';

export const metadata: Metadata = {
  title: 'Books',
  description: 'Explore all books by Amora Vesper — dark, atmospheric fiction with rich characters and immersive worlds.',
};

export const revalidate = 60;

const GENRES = ['Fantasy', 'Dark Romance', 'Gothic', 'Thriller', 'Contemporary', 'Paranormal'];
const STATUSES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'upcoming', label: 'Coming Soon' },
  { value: 'hiatus', label: 'On Hiatus' },
];

export default async function BooksPage() {
  let books: Book[] = [];
  try {
    books = await booksApi.getAll();
  } catch {
    books = [];
  }

  return (
    <div style={{ paddingTop: '7rem' }}>
      {/* Header */}
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <FadeIn>
            <p className="text-label mb-4">The Library</p>
            <h1 className="text-headline mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              All Books
            </h1>
            <p className="text-base" style={{ color: 'var(--color-mist-light)', maxWidth: '480px' }}>
              Every story written by Amora Vesper — from completed novels to ongoing serials.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Divider */}
      <div className="container"><div className="divider-gold" /></div>

      {/* Books Grid */}
      <section className="section">
        <div className="container">
          {books.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-label mb-4">Coming Soon</p>
              <p className="text-subheading" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mist-light)' }}>
                Books are on their way.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
