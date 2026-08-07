'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Book, Chapter } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { GalleryGrid } from '@/components/client/GalleryGrid';
import { getStatusColor, getStatusLabel, formatDate, formatWordCount } from '@/lib/utils';
import {
  ExternalLink, Lock, Eye, Music, ChevronDown, ChevronUp, Star
} from 'lucide-react';

export function BookDetailClient({ book }: { book: Book }) {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  return (
    <div>
      {/* ── Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '60vh', minHeight: '400px', paddingTop: '5rem' }}
      >
        {book.banner_url ? (
          <Image src={book.banner_url} alt={book.title} fill className="object-cover" priority sizes="100vw" />
        ) : book.cover_url ? (
          <Image src={book.cover_url} alt={book.title} fill className="object-cover blur-xl scale-110 opacity-30" priority sizes="100vw" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--color-ink-soft)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,9,8,0.3) 0%, rgba(10,9,8,0.95) 100%)' }} />

        {/* Book Cover floating */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container flex items-end gap-8 pb-0">
            <div
              className="relative flex-shrink-0 hidden md:block"
              style={{ width: 180, height: 270, marginBottom: '-3rem', zIndex: 10 }}
            >
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={`${book.title} cover`}
                  fill
                  className="object-cover rounded-sm shadow-2xl"
                  sizes="180px"
                />
              ) : (
                <div className="w-full h-full rounded-sm" style={{ background: 'var(--color-slate)' }} />
              )}
            </div>
            <div className="pb-8 flex-1">
              {book.genre && <p className="text-label mb-2">{book.genre}</p>}
              <h1 className="text-headline mb-3" style={{ fontFamily: 'var(--font-display)' }}>{book.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`badge ${getStatusColor(book.status)}`}>{getStatusLabel(book.status)}</span>
                {book.reading_time && (
                  <span className="text-xs" style={{ color: 'var(--color-mist-light)' }}>{book.reading_time}</span>
                )}
                {book.chapter_count !== undefined && (
                  <span className="text-xs" style={{ color: 'var(--color-mist-light)' }}>{book.chapter_count} chapters</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-16">

            {/* Synopsis / Description */}
            {(book.synopsis || book.description) && (
              <FadeIn>
                <p className="text-label mb-4">Synopsis</p>
                <div className="divider-gold mb-6" />
                <p className="text-base leading-relaxed" style={{ color: 'var(--color-mist-light)', fontSize: '1.0625rem' }}>
                  {book.synopsis || book.description}
                </p>
              </FadeIn>
            )}

            {/* Chapters */}
            {book.chapters && book.chapters.length > 0 && (
              <FadeIn>
                <p className="text-label mb-4">Chapters</p>
                <div className="divider-gold mb-6" />
                <div className="space-y-2">
                  {book.chapters.map((ch: Chapter) => (
                    <div
                      key={ch.id}
                      className="rounded-sm overflow-hidden"
                      style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <button
                        className="w-full text-left p-4 flex items-center justify-between gap-4"
                        onClick={() => ch.status === 'preview' && setExpandedChapter(expandedChapter === ch.id ? null : ch.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-mist-light)' }}>
                            {ch.chapter_number}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-parchment)' }}>
                              {ch.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {ch.word_count > 0 && (
                                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>{formatWordCount(ch.word_count)}</span>
                              )}
                              {ch.release_date && (
                                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>{formatDate(ch.release_date, 'MMM d, yyyy')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {ch.status === 'locked' ? (
                            <span className="badge badge-mist flex items-center gap-1">
                              <Lock size={10} /> Locked
                            </span>
                          ) : (
                            <span className="badge badge-gold flex items-center gap-1">
                              <Eye size={10} /> Preview
                            </span>
                          )}
                          {ch.status === 'preview' && (
                            expandedChapter === ch.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          )}
                        </div>
                      </button>

                      {/* Preview Text */}
                      {ch.status === 'preview' && expandedChapter === ch.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t px-6 py-5"
                          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                        >
                          {ch.preview_text && (
                            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-mist-light)', fontStyle: 'italic' }}>
                              &ldquo;{ch.preview_text}&rdquo;
                            </p>
                          )}
                          {ch.author_notes && (
                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-gold)' }}>Author's Note</p>
                              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-mist)' }}>{ch.author_notes}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}

            {/* Characters */}
            {book.characters && book.characters.length > 0 && (
              <FadeIn>
                <p className="text-label mb-4">Characters</p>
                <div className="divider-gold mb-6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {book.characters.map(char => (
                    <div
                      key={char.id}
                      className="text-center p-4 rounded-sm"
                      style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div
                        className="relative mx-auto mb-3 overflow-hidden rounded-full"
                        style={{ width: 72, height: 72, background: 'var(--color-slate)' }}
                      >
                        {char.photo_url && (
                          <Image src={char.photo_url} alt={char.name} fill className="object-cover" sizes="72px" />
                        )}
                      </div>
                      <p className="font-medium text-sm" style={{ color: 'var(--color-parchment)' }}>{char.name}</p>
                      {char.role && <p className="text-xs mt-1" style={{ color: 'var(--color-gold)' }}>{char.role}</p>}
                      {char.description && (
                        <p className="text-xs mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--color-mist)' }}>{char.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}

            {/* Book Gallery */}
            {book.gallery && book.gallery.length > 0 && (
              <FadeIn>
                <p className="text-label mb-4">Gallery & Moodboard</p>
                <div className="divider-gold mb-6" />
                <GalleryGrid images={book.gallery.map(g => ({ ...g, title: null, folder: 'book', is_published: true, alt_text: g.caption }))} />
              </FadeIn>
            )}

            {/* Reviews */}
            {book.reviews && book.reviews.length > 0 && (
              <FadeIn>
                <p className="text-label mb-4">Reader Reviews</p>
                <div className="divider-gold mb-6" />
                <div className="space-y-4">
                  {book.reviews.map(review => (
                    <div
                      key={review.id}
                      className="p-5 rounded-sm"
                      style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--color-parchment)' }}>{review.reviewer_name}</p>
                          {review.platform && <p className="text-xs" style={{ color: 'var(--color-mist)' }}>{review.platform}</p>}
                        </div>
                        {review.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} size={12} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />
                            ))}
                          </div>
                        )}
                      </div>
                      {review.text && (
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-mist-light)' }}>{review.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Read Links */}
            <FadeIn delay={0.2}>
              <div
                className="p-6 rounded-sm"
                style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-label mb-4">Read This Book</p>
                <div className="space-y-3">
                  {book.wattpad_link && (
                    <a href={book.wattpad_link} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline w-full flex items-center gap-2">
                      <ExternalLink size={14} /> Read on Wattpad
                    </a>
                  )}
                  {book.kindle_link && (
                    <a href={book.kindle_link} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline w-full flex items-center gap-2">
                      <ExternalLink size={14} /> Read on Kindle
                    </a>
                  )}
                  {book.website_link && (
                    <a href={book.website_link} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary w-full flex items-center gap-2">
                      <ExternalLink size={14} /> Official Preview
                    </a>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Playlist */}
            {book.playlist && book.playlist.length > 0 && (
              <FadeIn delay={0.3}>
                <div
                  className="p-6 rounded-sm"
                  style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-label mb-4 flex items-center gap-2">
                    <Music size={12} /> Playlist
                  </p>
                  <div className="space-y-3">
                    {book.playlist.map(track => (
                      <div key={track.id}>
                        {track.url ? (
                          <a
                            href={track.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3"
                          >
                            <div className="w-1 h-8 rounded-full flex-shrink-0 transition-colors"
                              style={{ background: 'var(--color-gold-dim)' }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-[var(--color-gold)] transition-colors"
                                style={{ color: 'var(--color-parchment)' }}>{track.track_title}</p>
                              {track.artist && (
                                <p className="text-xs" style={{ color: 'var(--color-mist)' }}>{track.artist}</p>
                              )}
                            </div>
                          </a>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-8 rounded-full flex-shrink-0"
                              style={{ background: 'var(--color-gold-dim)' }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-parchment)' }}>{track.track_title}</p>
                              {track.artist && <p className="text-xs" style={{ color: 'var(--color-mist)' }}>{track.artist}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Back Link */}
            <FadeIn delay={0.4}>
              <Link href="/books" className="btn btn-ghost w-full">
                ← All Books
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>

      <div style={{ height: '6rem' }} />
    </div>
  );
}
