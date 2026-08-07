'use client';

import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';
import { Sparkles, X } from 'lucide-react';

export function AnnouncementBar() {
  const [text, setText] = useState<string>('');
  const [active, setActive] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    settingsApi.getPublic()
      .then((settings) => {
        if (settings.announcement_active === 'true' && settings.announcement_text) {
          setText(settings.announcement_text);
          setActive(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!active || !text || dismissed) return null;

  return (
    <div
      className="relative z-[60] w-full py-2.5 px-6 flex items-center justify-center gap-2 text-center text-xs font-semibold tracking-wider uppercase transition-all"
      style={{
        background: 'linear-gradient(90deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.28) 50%, rgba(201,168,76,0.15) 100%)',
        borderBottom: '1px solid rgba(201,168,76,0.3)',
        color: 'var(--color-gold)',
        letterSpacing: '0.12em'
      }}
    >
      <Sparkles size={13} className="flex-shrink-0 animate-pulse" style={{ color: 'var(--color-gold)' }} />
      <span className="truncate max-w-[90vw]">{text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 p-1 rounded hover:opacity-80 transition-opacity"
        title="Dismiss announcement"
        aria-label="Dismiss"
      >
        <X size={13} style={{ color: 'var(--color-gold)' }} />
      </button>
    </div>
  );
}
