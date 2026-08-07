'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/books', label: 'Books' },
  { href: '/quotes', label: 'Lines' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[var(--color-ink)]/95 backdrop-blur-xl border-b border-white/5 py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col leading-none">
              <span
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-display)' }}
              >
                Amora
              </span>
              <span
                className="font-display text-xs font-medium tracking-[0.25em] uppercase"
                style={{ color: 'var(--color-gold)' }}
              >
                Vesper
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.8rem] font-medium tracking-[0.1em] uppercase transition-colors duration-200"
                style={{ color: 'var(--color-mist-light)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-parchment)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-mist-light)')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--color-mist-light)' }}
              aria-label="Search"
            >
              <Search size={18} />
            </Link>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2"
              style={{ color: 'var(--color-parchment)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'var(--color-ink)', paddingTop: '5rem' }}
          >
            <nav className="container flex flex-col gap-8 pt-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-3xl font-display font-bold"
                    style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-display)' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
