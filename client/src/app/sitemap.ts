import { MetadataRoute } from 'next';
import { booksApi, blogApi } from '@/lib/api';

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://amoravesper.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/books`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/quotes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  let bookRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];

  try {
    const books = await booksApi.getAll();
    bookRoutes = books.map((book: { slug: string; updated_at?: string }) => ({
      url: `${baseUrl}/books/${book.slug}`,
      lastModified: book.updated_at && !isNaN(Date.parse(book.updated_at)) ? new Date(book.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
  } catch { /* non-fatal */ }

  try {
    const posts = await blogApi.getAll();
    postRoutes = posts.map((post: { slug: string; updated_at?: string }) => ({
      url: `${baseUrl}/news/${post.slug}`,
      lastModified: post.updated_at && !isNaN(Date.parse(post.updated_at)) ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }));
  } catch { /* non-fatal */ }

  return [...staticRoutes, ...bookRoutes, ...postRoutes];
}
