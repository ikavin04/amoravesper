import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://amoravesper.com'),
  title: {
    default: 'Amora Vesper — Official Author Website',
    template: '%s | Amora Vesper',
  },
  description: 'Official website of Amora Vesper — author of dark, atmospheric fiction. Discover books, read previews, explore aesthetics, and follow the writing journey.',
  keywords: ['Amora Vesper', 'author', 'dark fiction', 'atmospheric novels', 'books', 'reading'],
  authors: [{ name: 'Amora Vesper' }],
  creator: 'Amora Vesper',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://amoravesper.com',
    siteName: 'Amora Vesper',
    title: 'Amora Vesper — Official Author Website',
    description: 'Official website of Amora Vesper — author of dark, atmospheric fiction.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Amora Vesper — Author',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amora Vesper — Official Author Website',
    description: 'Official website of Amora Vesper — author of dark, atmospheric fiction.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
