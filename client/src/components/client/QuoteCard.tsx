'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import Image from 'next/image';
import { Quote } from '@/types';
import toast from 'react-hot-toast';

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const typeLabels: Record<string, string> = {
    dialogue: 'Dialogue',
    quote: 'Quote',
    poetry: 'Poetry',
    monologue: 'Monologue',
  };

  const handleShare = async () => {
    const text = `"${quote.text}"${quote.book_title ? ` — ${quote.book_title}` : ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: 'Amora Vesper' });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="masonry-item group relative overflow-hidden rounded-sm"
      style={{
        background: 'var(--color-ink-muted)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Background image */}
      {quote.background_image_url && (
        <>
          <Image
            src={quote.background_image_url}
            alt=""
            fill
            className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(10,9,8,0.5), rgba(10,9,8,0.85))' }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative p-6 z-10">
        {/* Type label */}
        <span className={`badge badge-gold mb-4 inline-block`} style={{ fontSize: '0.6rem' }}>
          {typeLabels[quote.type] || 'Quote'}
        </span>

        {/* Quote text */}
        <blockquote
          className="font-display text-base leading-relaxed mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-parchment)',
            fontStyle: quote.type === 'poetry' ? 'italic' : 'normal',
            lineHeight: 1.6,
          }}
        >
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        {/* Footer */}
        <div className="flex items-end justify-between gap-2 mt-4">
          <div>
            {quote.book_title && (
              <p className="text-xs font-medium" style={{ color: 'var(--color-gold)' }}>
                {quote.book_title}
              </p>
            )}
            {quote.chapter && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-mist)' }}>
                {quote.chapter}
              </p>
            )}
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              color: 'var(--color-gold)',
            }}
            aria-label="Share quote"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
