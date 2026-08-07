import type { Metadata } from 'next';
import { settingsApi } from '@/lib/api';
import { FadeIn } from '@/components/ui/FadeIn';
import { Instagram, Mail, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Amora Vesper — Instagram, Threads, TikTok, and email.',
};

export const revalidate = 300;

export default async function ContactPage() {
  let settings: Record<string, string> = {};
  try {
    settings = await settingsApi.getPublic();
  } catch {
    settings = {};
  }

  const contactLinks = [
    {
      platform: 'Instagram',
      handle: settings.social_instagram || '@amoraavesper',
      href: settings.social_instagram || 'https://www.instagram.com/amoraavesper/',
      description: 'Daily aesthetics, writing updates, and behind-the-scenes.',
      icon: Instagram,
    },
    {
      platform: 'Threads',
      handle: settings.social_threads || '@amoraavesper',
      href: settings.social_threads || 'https://www.threads.com/@amoraavesper',
      description: 'Thoughts on writing, reading recommendations, and life.',
      icon: ExternalLink,
    },
    {
      platform: 'Wattpad',
      handle: settings.social_wattpad || '@AmoraVesper',
      href: settings.social_wattpad || 'https://www.wattpad.com/user/AmoraVesper',
      description: 'Read serial chapters, exclusive drafts, and reader comments.',
      icon: ExternalLink,
    },
    {
      platform: 'Email',
      handle: settings.social_email || 'amoraavesper@gmail.com',
      href: `mailto:${settings.social_email || 'amoraavesper@gmail.com'}`,
      description: 'For collaborations, press inquiries, and reader mail.',
      icon: Mail,
    },
  ];

  return (
    <div style={{ paddingTop: '7rem' }}>
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <FadeIn>
            <p className="text-label mb-4">Get in Touch</p>
            <h1 className="text-headline mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Contact
            </h1>
            <p className="text-base" style={{ color: 'var(--color-mist-light)', maxWidth: '480px' }}>
              Follow along on the journey, or reach out — I read every message.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="container"><div className="divider-gold" /></div>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {contactLinks.map((link, i) => (
              <FadeIn key={link.platform} delay={i * 0.1}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group p-6 block"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
                    >
                      <link.icon size={16} style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm" style={{ color: 'var(--color-parchment)' }}>
                          {link.platform}
                        </p>
                        <ExternalLink size={11} style={{ color: 'var(--color-mist)', opacity: 0.6 }} className="group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-gold)' }}>
                        {link.handle}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-mist)' }}>
                        {link.description}
                      </p>
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
