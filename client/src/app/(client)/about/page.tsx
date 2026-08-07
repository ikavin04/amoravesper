import type { Metadata } from 'next';
import { settingsApi } from '@/lib/api';
import { FadeIn } from '@/components/ui/FadeIn';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Mail, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Amora Vesper — author biography, writing journey, and favorite genres.',
};

export const revalidate = 300;

export default async function AboutPage() {
  let settings: Record<string, string> = {};
  try {
    settings = await settingsApi.getPublic();
  } catch {
    settings = {};
  }

  const socials = [
    { label: 'Instagram', href: settings.social_instagram || 'https://www.instagram.com/amoraavesper/', icon: Instagram },
    { label: 'Threads', href: settings.social_threads || 'https://www.threads.com/@amoraavesper', icon: ExternalLink },
    { label: 'Wattpad', href: settings.social_wattpad || 'https://www.wattpad.com/user/AmoraVesper', icon: ExternalLink },
    { label: 'Email', href: `mailto:${settings.social_email || 'amoraavesper@gmail.com'}`, icon: Mail },
  ];

  return (
    <div style={{ paddingTop: '7rem' }}>
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <FadeIn>
            <p className="text-label mb-4">The Author</p>
            <h1 className="text-headline mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              About Amora Vesper
            </h1>
          </FadeIn>
        </div>
      </section>

      <div className="container"><div className="divider-gold" /></div>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn direction="right">
              <div className="relative">
                {settings.about_image_url ? (
                  <div
                    className="relative overflow-hidden rounded-sm"
                    style={{ aspectRatio: '4/5' }}
                  >
                    {/* Glow */}
                    <div
                      className="absolute inset-0 blur-2xl opacity-20 rounded-sm"
                      style={{ background: 'var(--color-gold)', transform: 'scale(0.85)' }}
                    />
                    <Image
                      src={settings.about_image_url}
                      alt="Amora Vesper"
                      fill
                      className="object-cover relative z-10"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                ) : (
                  <div
                    className="rounded-sm flex items-center justify-center"
                    style={{ aspectRatio: '4/5', background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="text-center">
                      <p className="font-display text-6xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold-dim)' }}>
                        AV
                      </p>
                    </div>
                  </div>
                )}

                {/* Decorative frame */}
                <div
                  className="absolute -bottom-4 -right-4 w-32 h-32 rounded-sm"
                  style={{ border: '1px solid var(--color-gold-dim)', opacity: 0.3 }}
                />
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <div>
                <p className="text-label mb-6">Biography</p>
                {settings.about_bio ? (
                  <div
                    className="space-y-4 text-base leading-relaxed mb-10"
                    style={{ color: 'var(--color-mist-light)' }}
                  >
                    {settings.about_bio.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--color-mist-light)' }}>
                    Amora Vesper is an author of dark, atmospheric fiction — stories that breathe in the space between silence and shadow. Her writing explores grief, longing, and the strange beauty found in broken things.
                  </p>
                )}

                {/* Writing Journey */}
                <div
                  className="p-6 rounded-sm mb-8"
                  style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-label mb-3">The Writing Journey</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-mist-light)' }}>
                    What started as late-night notes in a worn journal became something larger — a body of work that refuses to be quiet. Every book is written in the hours the world goes still.
                  </p>
                </div>

                {/* Favorite Genres */}
                <div className="mb-8">
                  <p className="text-label mb-4">Favorite Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {['Smut', 'Angst', 'Yearning', 'Tension', 'Stalking', 'Romance', 'Young Adult'].map(genre => (
                      <span key={genre} className="badge badge-gold">{genre}</span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                {socials.length > 0 && (
                  <div>
                    <p className="text-label mb-4">Find Me Here</p>
                    <div className="flex flex-wrap gap-3">
                      {socials.map(social => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline flex items-center gap-2"
                          style={{ padding: '0.6rem 1.25rem' }}
                        >
                          <social.icon size={14} />
                          {social.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
