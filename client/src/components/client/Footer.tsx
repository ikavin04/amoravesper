import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        background: 'var(--color-ink-soft)',
      }}
    >
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <p
                className="font-display text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}
              >
                Amora Vesper
              </p>
              <p
                className="text-xs tracking-[0.2em] uppercase mt-1"
                style={{ color: 'var(--color-gold)' }}
              >
                Official Author Website
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-mist-light)', maxWidth: '280px' }}>
              Writing dark, atmospheric stories that linger long after the last page.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-label mb-5">Navigate</p>
            <nav className="flex flex-col gap-3">
              {[
                { href: '/books', label: 'Books' },
                { href: '/quotes', label: 'Favorite Lines' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/news', label: 'News & Updates' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--color-mist-light)] hover:text-[var(--color-gold)] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div>
            <p className="text-label mb-5">Connect</p>
            <div className="flex flex-col gap-3">
              {[
                { href: 'https://www.instagram.com/amoraavesper/', label: 'Instagram', icon: '@amoraavesper' },
                { href: 'https://www.threads.com/@amoraavesper', label: 'Threads', icon: '@amoraavesper' },
                { href: 'https://www.wattpad.com/user/AmoraVesper', label: 'Wattpad', icon: '@AmoraVesper' },
                { href: 'mailto:amoraavesper@gmail.com', label: 'Email', icon: 'amoraavesper@gmail.com' },
              ].map(social => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--color-mist-light)] hover:text-[var(--color-gold)] transition-colors duration-200 group"
                >
                  <span className="text-xs font-medium text-[var(--color-mist)]">{social.label}</span>
                  <span>{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-gold mb-8" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--color-mist)' }}>
            © {currentYear} Amora Vesper. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/feed.xml"
              className="text-xs transition-colors"
              style={{ color: 'var(--color-mist)' }}
            >
              RSS Feed
            </Link>
            <span style={{ color: 'var(--color-mist)' }} className="text-xs">
              Built with care.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
