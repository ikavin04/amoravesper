import { booksApi, blogApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://amoravesper.com';

  let books = [];
  let posts = [];

  try { books = await booksApi.getAll(); } catch { /* non-fatal */ }
  try { posts = await blogApi.getAll(); } catch { /* non-fatal */ }

  const items = [
    ...posts.map((post: { title: string; excerpt: string; slug: string; published_at: string }) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <link>${baseUrl}/news/${post.slug}</link>
      <guid>${baseUrl}/news/${post.slug}</guid>
      <pubDate>${new Date(post.published_at || Date.now()).toUTCString()}</pubDate>
    </item>`),
    ...books.map((book: { title: string; description: string; slug: string; created_at: string }) => `
    <item>
      <title><![CDATA[${book.title}]]></title>
      <description><![CDATA[${book.description || ''}]]></description>
      <link>${baseUrl}/books/${book.slug}</link>
      <guid>${baseUrl}/books/${book.slug}</guid>
      <pubDate>${new Date(book.created_at).toUTCString()}</pubDate>
    </item>`),
  ].join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Amora Vesper</title>
    <description>Official author website of Amora Vesper — dark, atmospheric fiction.</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
