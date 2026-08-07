'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Book } from '@/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { ExternalLink, BookOpen, Clock } from 'lucide-react';

interface BookCardProps {
  book: Book;
  index?: number;
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Link href={`/books/${book.slug}`} className="card group block">
        {/* Cover Image */}
        <div
          className="img-zoom relative overflow-hidden"
          style={{ aspectRatio: '2/3', background: 'var(--color-ink-muted)' }}
        >
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={`${book.title} cover`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-ink-soft) 0%, var(--color-slate) 100%)',
              }}
            >
              <BookOpen size={48} style={{ color: 'var(--color-gold-dim)', opacity: 0.4 }} />
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
            <span className={`badge ${getStatusColor(book.status)} shadow-md`}>
              {getStatusLabel(book.status)}
            </span>
            {book.is_featured && (
              <span className="badge badge-gold shadow-md">Featured</span>
            )}
          </div>

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4"
            style={{ background: 'linear-gradient(to top, rgba(10,9,8,0.9) 0%, transparent 60%)' }}
          >
            <span className="text-label" style={{ color: 'var(--color-gold)' }}>
              View Book →
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {book.genre && (
            <p className="text-label mb-2" style={{ fontSize: '0.6rem' }}>
              {book.genre}
            </p>
          )}

          <h3
            className="font-display text-lg font-bold mb-2 group-hover:text-gradient-gold transition-all"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.2 }}
          >
            {book.title}
          </h3>

          {book.description && (
            <p
              className="text-sm leading-relaxed mb-4 line-clamp-2"
              style={{ color: 'var(--color-mist-light)' }}
            >
              {book.description}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex items-center gap-4 mb-4">
            {book.reading_time && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-mist)' }}>
                <Clock size={11} />
                {book.reading_time}
              </span>
            )}
            {book.chapter_count !== undefined && (
              <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                {book.chapter_count} chapters
              </span>
            )}
          </div>

          {/* External Links */}
          <div className="flex flex-wrap gap-2">
            {book.wattpad_link && (
              <a
                href={book.wattpad_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="btn btn-ghost flex items-center gap-1"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}
              >
                <ExternalLink size={11} />
                Wattpad
              </a>
            )}
            {book.kindle_link && (
              <a
                href={book.kindle_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="btn btn-ghost flex items-center gap-1"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}
              >
                <ExternalLink size={11} />
                Kindle
              </a>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
