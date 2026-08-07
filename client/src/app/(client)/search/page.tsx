'use client';

import { useState, useCallback } from 'react';
import { searchApi } from '@/lib/api';
import { SearchResults } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, BookOpen, Quote, User, FileText } from 'lucide-react';
import { FadeIn } from '@/components/ui/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchApi.search(q);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const totalResults = results?.total ?? 0;

  return (
    <div style={{ paddingTop: '7rem' }}>
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-label mb-4">Find Anything</p>
            <h1 className="text-headline mb-10" style={{ fontFamily: 'var(--font-display)' }}>
              Search
            </h1>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-mist)' }}
                />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search books, quotes, characters, posts..."
                  className="input pl-12 pr-12 text-base"
                  style={{ height: '56px', fontSize: '1rem' }}
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setResults(null); setSearched(false); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-mist)' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary mt-4 w-full md:w-auto">
                Search
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      <div className="container max-w-3xl mx-auto">
        <div className="divider-gold" />
      </div>

      <section className="section">
        <div className="container max-w-3xl mx-auto">
          {loading && (
            <div className="text-center py-16">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
                style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
              />
            </div>
          )}

          {!loading && searched && !results && (
            <p className="text-center py-16" style={{ color: 'var(--color-mist-light)' }}>
              Search failed. Please try again.
            </p>
          )}

          {!loading && results && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sm mb-8" style={{ color: 'var(--color-mist)' }}>
                  {totalResults === 0
                    ? `No results for "${results.query}"`
                    : `${totalResults} result${totalResults === 1 ? '' : 's'} for "${results.query}"`}
                </p>

                <div className="space-y-10">
                  {/* Books */}
                  {results.books.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={14} style={{ color: 'var(--color-gold)' }} />
                        <p className="text-label">Books</p>
                      </div>
                      <div className="space-y-3">
                        {results.books.map(book => (
                          <Link
                            key={book.id}
                            href={`/books/${book.slug}`}
                            className="flex items-center gap-4 p-4 rounded-sm group transition-all"
                            style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            {book.cover_url && (
                              <div className="relative flex-shrink-0 overflow-hidden rounded-sm" style={{ width: 44, height: 66 }}>
                                <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="44px" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm group-hover:text-[var(--color-gold)] transition-colors"
                                style={{ color: 'var(--color-parchment)' }}>{book.title}</p>
                              {book.description && (
                                <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--color-mist)' }}>{book.description}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quotes */}
                  {results.quotes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Quote size={14} style={{ color: 'var(--color-gold)' }} />
                        <p className="text-label">Quotes</p>
                      </div>
                      <div className="space-y-3">
                        {results.quotes.map(quote => (
                          <Link
                            key={quote.id}
                            href="/quotes"
                            className="block p-4 rounded-sm group"
                            style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <p className="text-sm italic font-display line-clamp-2"
                              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}>
                              &ldquo;{quote.text}&rdquo;
                            </p>
                            {quote.book_title && (
                              <p className="text-xs mt-2" style={{ color: 'var(--color-gold)' }}>{quote.book_title}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Characters */}
                  {results.characters.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <User size={14} style={{ color: 'var(--color-gold)' }} />
                        <p className="text-label">Characters</p>
                      </div>
                      <div className="space-y-3">
                        {results.characters.map(char => (
                          <Link
                            key={char.id}
                            href={`/books/${char.book_slug}`}
                            className="flex items-center gap-4 p-4 rounded-sm group"
                            style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            {char.photo_url && (
                              <div className="relative flex-shrink-0 rounded-full overflow-hidden" style={{ width: 40, height: 40 }}>
                                <Image src={char.photo_url} alt={char.name} fill className="object-cover" sizes="40px" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm group-hover:text-[var(--color-gold)] transition-colors"
                                style={{ color: 'var(--color-parchment)' }}>{char.name}</p>
                              <p className="text-xs" style={{ color: 'var(--color-mist)' }}>
                                {char.role} · {char.book_title}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  {results.posts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <FileText size={14} style={{ color: 'var(--color-gold)' }} />
                        <p className="text-label">Posts</p>
                      </div>
                      <div className="space-y-3">
                        {results.posts.map(post => (
                          <Link
                            key={post.id}
                            href={`/news/${post.slug}`}
                            className="block p-4 rounded-sm group"
                            style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <p className="font-medium text-sm group-hover:text-[var(--color-gold)] transition-colors"
                              style={{ color: 'var(--color-parchment)' }}>{post.title}</p>
                            {post.excerpt && (
                              <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--color-mist)' }}>{post.excerpt}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {totalResults === 0 && (
                    <div className="text-center py-12">
                      <p className="font-display text-2xl mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mist-light)' }}>
                        Nothing found.
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-mist)' }}>
                        Try a different search term.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
