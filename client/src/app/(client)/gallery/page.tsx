import type { Metadata } from 'next';
import { galleryApi } from '@/lib/api';
import { GalleryGrid } from '@/components/client/GalleryGrid';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Moodboards, aesthetic images, character inspirations, and book photography from the worlds of Amora Vesper.',
};

export const revalidate = 60;

export default async function GalleryPage() {
  let images = [];
  let folders: string[] = [];

  try {
    [images, folders] = await Promise.all([
      galleryApi.getAll(),
      galleryApi.getFolders(),
    ]);
  } catch {
    images = [];
    folders = [];
  }

  return (
    <div style={{ paddingTop: '7rem' }}>
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <FadeIn>
            <p className="text-label mb-4">Aesthetics</p>
            <h1 className="text-headline mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Gallery
            </h1>
            <p className="text-base" style={{ color: 'var(--color-mist-light)', maxWidth: '480px' }}>
              Moodboards, character inspirations, aesthetic images, and book photography.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="container"><div className="divider-gold" /></div>

      <section className="section">
        <div className="container">
          {images.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-label mb-4">Coming Soon</p>
              <p className="text-subheading" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mist-light)' }}>
                Gallery is being curated.
              </p>
            </div>
          ) : (
            <GalleryGrid images={images} />
          )}
        </div>
      </section>
    </div>
  );
}
