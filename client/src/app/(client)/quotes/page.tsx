import type { Metadata } from 'next';
import { quotesApi } from '@/lib/api';
import { QuoteCard } from '@/components/client/QuoteCard';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Favorite Lines',
  description: 'A collection of favorite lines, dialogue, poetry, and monologues from the worlds of Amora Vesper.',
};

export const revalidate = 60;

export default async function QuotesPage() {
  let quotes = [];
  try {
    quotes = await quotesApi.getAll();
  } catch {
    quotes = [];
  }

  return (
    <div style={{ paddingTop: '7rem' }}>
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <FadeIn>
            <p className="text-label mb-4">From the Pages</p>
            <h1 className="text-headline mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Favorite Lines
            </h1>
            <p className="text-base" style={{ color: 'var(--color-mist-light)', maxWidth: '480px' }}>
              Dialogue, quotes, poetry, and monologues that refuse to leave you.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="container"><div className="divider-gold" /></div>

      <section className="section">
        <div className="container">
          {quotes.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-label mb-4">Coming Soon</p>
              <p className="text-subheading" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mist-light)' }}>
                Lines are being gathered.
              </p>
            </div>
          ) : (
            <div className="masonry-grid">
              {(quotes as import('@/types').Quote[]).map((quote) => (
                <QuoteCard key={quote.id} quote={quote} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
