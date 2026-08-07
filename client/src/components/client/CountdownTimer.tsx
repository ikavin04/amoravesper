'use client';

import { useState, useEffect } from 'react';
import { getCountdown } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string;
  title?: string;
}

export function CountdownTimer({ targetDate, title }: CountdownTimerProps) {
  const [time, setTime] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!time) return null;

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <div className="text-center">
      {title && (
        <p className="text-label mb-6">{title}</p>
      )}
      <div className="flex items-center justify-center gap-4 md:gap-8">
        {units.map(unit => (
          <div key={unit.label} className="text-center">
            <div
              className="font-display text-4xl md:text-6xl font-bold tabular-nums"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}
            >
              {String(unit.value).padStart(2, '0')}
            </div>
            <p className="text-label mt-2" style={{ fontSize: '0.55rem' }}>{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
