import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';
import { formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await blogApi.getBySlug(slug);
    return {
      title: post.title,
      description: post.excerpt || '',
      openGraph: {
        title: `${post.title} | Amora Vesper`,
        description: post.excerpt || '',
        images: post.cover_url ? [{ url: post.cover_url }] : [],
      },
    };
  } catch {
    return { title: 'Post Not Found' };
  }
}

export const revalidate = 60;

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = await blogApi.getBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div style={{ paddingTop: '7rem' }}>
      {/* Cover */}
      {post.cover_url && (
        <div className="relative overflow-hidden" style={{ height: '50vh' }}>
          <Image src={post.cover_url} alt={post.title} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, var(--color-ink))' }} />
        </div>
      )}

      <div className="container py-16 max-w-3xl mx-auto">
        <FadeIn>
          <Link href="/news" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: 'var(--color-mist-light)' }}>
            <ArrowLeft size={14} /> Back to News
          </Link>

          <p className="text-label mb-4">{post.category}</p>
          <h1 className="text-headline mb-4" style={{ fontFamily: 'var(--font-display)' }}>{post.title}</h1>
          {post.published_at && (
            <p className="text-sm mb-12" style={{ color: 'var(--color-mist)' }}>{formatDate(post.published_at, 'MMMM d, yyyy')}</p>
          )}

          <div className="divider-gold mb-12" />

          {/* Content */}
          <div
            className="prose-content text-base leading-relaxed"
            style={{ color: 'var(--color-mist-light)' }}
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </FadeIn>
      </div>
    </div>
  );
}
