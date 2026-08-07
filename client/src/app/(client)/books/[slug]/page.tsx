import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { booksApi } from '@/lib/api';
import { BookDetailClient } from './BookDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const book = await booksApi.getBySlug(slug);
    return {
      title: book.title,
      description: book.description || book.synopsis?.slice(0, 160) || '',
      openGraph: {
        title: `${book.title} | Amora Vesper`,
        description: book.description || '',
        images: book.cover_url ? [{ url: book.cover_url, width: 600, height: 900 }] : [],
      },
    };
  } catch {
    return { title: 'Book Not Found' };
  }
}

export const revalidate = 60;

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  let book;
  try {
    book = await booksApi.getBySlug(slug);
  } catch {
    notFound();
  }

  return <BookDetailClient book={book} />;
}
