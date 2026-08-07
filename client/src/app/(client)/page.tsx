import type { Metadata } from 'next';
import { booksApi, settingsApi, quotesApi, announcementsApi, blogApi } from '@/lib/api';
import { HeroSection } from '@/components/client/HeroSection';
import { BookCard } from '@/components/client/BookCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { CountdownTimer } from '@/components/client/CountdownTimer';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Amora Vesper — Official Author Website',
  description: 'Official website of Amora Vesper — author of dark, atmospheric fiction. Discover books, read previews, and follow the writing journey.',
};

export const revalidate = 60; // ISR every 60s

async function getHomeData() {
  try {
    const [settings, books, featuredBook, pinnedQuote, announcements, latestPosts] = await Promise.allSettled([
      settingsApi.getPublic(),
      booksApi.getAll(),
      booksApi.getFeatured(),
      quotesApi.getPinned(),
      announcementsApi.getActive(),
      blogApi.getAll(),
    ]);

    return {
      settings: settings.status === 'fulfilled' ? settings.value : {},
      books: books.status === 'fulfilled' ? books.value : [],
      featuredBook: featuredBook.status === 'fulfilled' ? featuredBook.value : null,
      pinnedQuote: pinnedQuote.status === 'fulfilled' ? pinnedQuote.value : null,
      announcements: announcements.status === 'fulfilled' ? announcements.value : [],
      latestPosts: latestPosts.status === 'fulfilled' ? latestPosts.value.slice(0, 3) : [],
    };
  } catch {
    return { settings: {}, books: [], featuredBook: null, pinnedQuote: null, announcements: [], latestPosts: [] };
  }
}

export default async function HomePage() {
  const { settings, books, featuredBook, pinnedQuote, announcements, latestPosts } = await getHomeData();

  const recentBooks = books.slice(0, 4);
  const writingProgress = parseInt(settings.writing_progress || '0');

  return (
    <>
      {/* ── Announcement Banner ── */}
      {settings.announcement_active === 'true' && settings.announcement_text && (
        <div
          className="py-3 px-4 text-center text-xs tracking-widest uppercase"
          style={{ background: 'rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.15)', color: 'var(--color-gold)' }}
        >
          {settings.announcement_text}
        </div>
      )}

      {/* ── Hero ── */}
      <HeroSection settings={settings} featuredBook={featuredBook} />

      {/* ── Featured Book ── */}
      {featuredBook && (
        <section className="section" style={{ background: 'var(--color-ink-soft)' }}>
          <div className="container">
            <FadeIn>
              <p className="text-label mb-4">Featured Book</p>
            </FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="right">
                <div
                  className="relative mx-auto"
                  style={{ maxWidth: '340px', aspectRatio: '2/3' }}
                >
                  {/* Shadow glow */}
                  <div
                    className="absolute inset-0 rounded-sm blur-3xl opacity-30"
                    style={{ background: 'var(--color-gold)', transform: 'scale(0.8) translateY(10%)' }}
                  />
                  {featuredBook.cover_url ? (
                    <Image
                      src={featuredBook.cover_url}
                      alt={`${featuredBook.title} cover`}
                      fill
                      className="object-cover rounded-sm shadow-2xl relative z-10"
                      sizes="340px"
                      priority
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-sm relative z-10 flex items-center justify-center"
                      style={{ background: 'var(--color-slate)' }}
                    />
                  )}
                </div>
              </FadeIn>

              <FadeIn direction="left" delay={0.2}>
                <div>
                  {featuredBook.genre && <p className="text-label mb-4">{featuredBook.genre}</p>}
                  <h2 className="text-headline mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                    {featuredBook.title}
                  </h2>
                  {featuredBook.description && (
                    <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--color-mist-light)', maxWidth: '480px' }}>
                      {featuredBook.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <Link href={`/books/${featuredBook.slug}`} className="btn btn-primary">
                      Read Preview
                    </Link>
                    {featuredBook.wattpad_link && (
                      <a href={featuredBook.wattpad_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                        Read on Wattpad
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* ── Writing Status ── */}
      <section className="section">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <p className="text-label mb-4">Currently Writing</p>
              <h2 className="text-subheading mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                {settings.writing_status || 'Working on something new...'}
              </h2>
              {writingProgress > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs" style={{ color: 'var(--color-mist)' }}>Progress</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-gold)' }}>{writingProgress}%</span>
                  </div>
                  <div className="h-px relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="absolute left-0 top-0 h-full transition-all duration-1000"
                      style={{
                        width: `${writingProgress}%`,
                        background: 'linear-gradient(to right, var(--color-gold-dim), var(--color-gold))',
                      }}
                    />
                  </div>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Pinned Quote ── */}
      {pinnedQuote && (
        <section
          className="py-24 relative overflow-hidden"
          style={{ background: 'var(--color-ink-soft)' }}
        >
          {pinnedQuote.background_image_url && (
            <>
              <Image
                src={pinnedQuote.background_image_url}
                alt=""
                fill
                className="object-cover opacity-10"
                sizes="100vw"
              />
              <div className="absolute inset-0" style={{ background: 'rgba(10,9,8,0.7)' }} />
            </>
          )}
          <div className="container relative z-10">
            <FadeIn className="text-center max-w-3xl mx-auto">
              <p className="text-label mb-8">Favorite Line</p>
              <blockquote
                className="font-display text-2xl md:text-3xl font-medium italic leading-relaxed mb-8"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-parchment)',
                  lineHeight: 1.5,
                }}
              >
                &ldquo;{pinnedQuote.text}&rdquo;
              </blockquote>
              {pinnedQuote.book_title && (
                <p style={{ color: 'var(--color-gold)' }} className="text-sm font-medium tracking-wider uppercase">
                  — {pinnedQuote.book_title}
                  {pinnedQuote.chapter && `, ${pinnedQuote.chapter}`}
                </p>
              )}
              <div className="mt-8">
                <Link href="/quotes" className="btn btn-outline">
                  More Favorite Lines
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── Recent Books ── */}
      {recentBooks.length > 0 && (
        <section className="section">
          <div className="container">
            <FadeIn className="flex items-end justify-between mb-12">
              <div>
                <p className="text-label mb-3">The Library</p>
                <h2 className="text-headline" style={{ fontFamily: 'var(--font-display)' }}>
                  Books
                </h2>
              </div>
              <Link href="/books" className="btn btn-ghost">
                View All →
              </Link>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(recentBooks as import('@/types').Book[]).map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Countdown for upcoming book ── */}
      {books.find((b: { countdown_date: string; status: string }) => b.countdown_date && b.status === 'upcoming') && (() => {
        const upcoming = books.find((b: { countdown_date: string; status: string }) => b.countdown_date && b.status === 'upcoming');
        return (
          <section
            className="py-20"
            style={{ background: 'var(--color-ink-soft)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="container">
              <CountdownTimer
                targetDate={upcoming.countdown_date}
                title={`${upcoming.title} — Coming Soon`}
              />
            </div>
          </section>
        );
      })()}

      {/* ── Latest Updates ── */}
      {latestPosts.length > 0 && (
        <section className="section">
          <div className="container">
            <FadeIn className="flex items-end justify-between mb-12">
              <div>
                <p className="text-label mb-3">From the Desk</p>
                <h2 className="text-headline" style={{ fontFamily: 'var(--font-display)' }}>
                  Latest Updates
                </h2>
              </div>
              <Link href="/news" className="btn btn-ghost">
                All Updates →
              </Link>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(latestPosts as import('@/types').BlogPost[]).map((post, i) => (
                <FadeIn key={post.id} delay={i * 0.1}>
                  <Link href={`/news/${post.slug}`} className="card group block h-full">
                    {post.cover_url && (
                      <div className="img-zoom relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        <Image
                          src={post.cover_url}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-label mb-2" style={{ fontSize: '0.6rem' }}>{post.category}</p>
                      <h3
                        className="font-display text-lg font-bold mb-2 group-hover:text-[var(--color-gold)] transition-colors"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--color-mist-light)' }}>{post.excerpt}</p>
                      )}
                      {post.published_at && (
                        <p className="text-xs mt-3" style={{ color: 'var(--color-mist)' }}>
                          {formatDate(post.published_at)}
                        </p>
                      )}
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery Teaser ── */}
      <section
        className="py-20 text-center"
        style={{ background: 'var(--color-ink-soft)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="container">
          <FadeIn>
            <p className="text-label mb-4">Aesthetics & Moodboards</p>
            <h2 className="text-headline mb-8" style={{ fontFamily: 'var(--font-display)' }}>
              The Gallery
            </h2>
            <Link href="/gallery" className="btn btn-primary">
              Explore Gallery
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
