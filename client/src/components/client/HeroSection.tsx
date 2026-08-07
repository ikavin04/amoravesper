'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiteSettings, Book } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  settings: SiteSettings;
  featuredBook: Book | null;
}

export function HeroSection({ settings, featuredBook }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background on scroll
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Text reveal
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll('.char');
        gsap.from(chars, {
          opacity: 0,
          y: 60,
          rotationX: -45,
          stagger: 0.035,
          duration: 1,
          ease: 'power4.out',
          delay: 0.2,
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = settings.hero_title || 'Stories that breathe.';
  const subtitle = settings.hero_subtitle || 'Author of dark, atmospheric fiction.';

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-ink)' }}
    >
      {/* Background image with parallax */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        {settings.hero_background_url ? (
          <Image
            src={settings.hero_background_url}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(155,79,110,0.06) 0%, transparent 50%)',
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,9,8,0.4) 0%, rgba(10,9,8,0.7) 50%, rgba(10,9,8,1) 100%)',
          }}
        />
      </div>

      {/* Decorative grain */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content Container */}
      <div className="container relative z-10 text-center py-24 md:py-32 flex flex-col items-center justify-center min-h-screen">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-label mb-6 md:mb-8"
        >
          Official Author Website
        </motion.p>

        <h1
          ref={titleRef}
          className="text-display mb-6 md:mb-8 max-w-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
          aria-label={title}
        >
          {title.split('').map((char, i) => (
            <span
              key={i}
              className="char inline-block"
              style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base sm:text-lg mb-8 sm:mb-12 mx-auto max-w-xl px-4"
          style={{ color: 'var(--color-mist-light)', letterSpacing: '0.01em' }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4"
        >
          <Link href="/books" className="btn btn-primary w-full sm:w-auto">
            Explore Books
          </Link>
          {featuredBook && (
            <Link href={`/books/${featuredBook.slug}`} className="btn btn-outline w-full sm:w-auto">
              Read {featuredBook.title}
            </Link>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator - anchored to section bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-label" style={{ fontSize: '0.55rem', letterSpacing: '0.25em' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 md:h-10"
          style={{ background: 'linear-gradient(to bottom, var(--color-gold), transparent)' }}
        />
      </motion.div>
    </section>
  );
}
