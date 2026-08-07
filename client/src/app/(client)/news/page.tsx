import type { Metadata } from 'next';
import { blogApi, announcementsApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from '@/components/ui/FadeIn';
import { formatDate } from '@/lib/utils';
import { Megaphone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'News & Updates',
  description: 'Latest news, writing progress, announcements, and updates from Amora Vesper.',
};

export const revalidate = 60;

const typeColors: Record<string, string> = {
  info: 'var(--color-gold)',
  warning: 'var(--color-rose-light)',
  event: 'var(--color-mist-light)',
  release: 'var(--color-gold)',
};

export default async function NewsPage() {
  let posts = [];
  let announcements = [];

  try {
    [posts, announcements] = await Promise.all([
      blogApi.getAll(),
      announcementsApi.getActive(),
    ]);
  } catch {
    posts = [];
    announcements = [];
  }

  return (
    <div style={{ paddingTop: '7rem' }}>
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <FadeIn>
            <p className="text-label mb-4">From the Desk</p>
            <h1 className="text-headline mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              News & Updates
            </h1>
            <p className="text-base" style={{ color: 'var(--color-mist-light)', maxWidth: '480px' }}>
              Writing progress, upcoming releases, events, and announcements.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="container"><div className="divider-gold" /></div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="section" style={{ paddingBottom: '2rem' }}>
          <div className="container">
            <div className="space-y-3">
              {announcements.map((a: { id: string; type: string; text: string }) => (
                <FadeIn key={a.id}>
                  <div
                    className="flex items-start gap-4 p-5 rounded-sm"
                    style={{
                      background: 'rgba(201,168,76,0.05)',
                      border: `1px solid ${typeColors[a.type] || 'rgba(255,255,255,0.1)'}30`,
                    }}
                  >
                    <Megaphone size={16} style={{ color: typeColors[a.type], flexShrink: 0, marginTop: '2px' }} />
                    <p className="text-sm" style={{ color: 'var(--color-parchment)' }}>{a.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts */}
      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-label mb-4">Coming Soon</p>
              <p className="text-subheading" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mist-light)' }}>
                Updates are on their way.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: { id: string; slug: string; cover_url?: string; title: string; category: string; excerpt?: string; published_at?: string }, i: number) => (
                <FadeIn key={post.id} delay={i * 0.08}>
                  <Link href={`/news/${post.slug}`} className="card group block h-full">
                    {post.cover_url && (
                      <div className="img-zoom relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        <Image src={post.cover_url} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-label mb-3" style={{ fontSize: '0.6rem' }}>{post.category}</p>
                      <h2
                        className="font-display text-xl font-bold mb-3 group-hover:text-[var(--color-gold)] transition-colors"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: 'var(--color-mist-light)' }}>
                          {post.excerpt}
                        </p>
                      )}
                      {post.published_at && (
                        <p className="text-xs" style={{ color: 'var(--color-mist)' }}>{formatDate(post.published_at)}</p>
                      )}
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
