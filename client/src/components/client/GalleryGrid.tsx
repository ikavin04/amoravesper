'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { GalleryImage } from '@/types';
import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface GalleryGridProps {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="masonry-grid">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className="masonry-item group relative overflow-hidden rounded-sm cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
            onClick={() => setLightbox(img)}
          >
            <div className="relative" style={{ minHeight: '200px' }}>
              <Image
                src={img.image_url}
                alt={img.alt_text || img.title || ''}
                width={600}
                height={800}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: 'rgba(10,9,8,0.4)' }}
              >
                <ZoomIn size={28} style={{ color: 'var(--color-parchment)' }} />
              </div>
              {img.title && (
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(10,9,8,0.9), transparent)' }}
                >
                  <p className="text-xs font-medium" style={{ color: 'var(--color-parchment)' }}>
                    {img.title}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(10,9,8,0.95)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-parchment)' }}
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl max-h-[85vh] w-full"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={lightbox.image_url}
              alt={lightbox.alt_text || lightbox.title || ''}
              width={1200}
              height={1600}
              className="w-full h-auto max-h-[85vh] object-contain rounded-sm"
            />
            {lightbox.title && (
              <p className="text-center mt-3 text-sm" style={{ color: 'var(--color-mist-light)' }}>
                {lightbox.title}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
