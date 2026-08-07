'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '@/lib/api';
import { AnalyticsOverview } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { TrendingUp, Eye, BarChart2 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="mb-8">
          <p className="text-label mb-2">Insights</p>
          <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Analytics</h1>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-32 rounded-sm" />)}
        </div>
      ) : !data ? (
        <div className="text-center py-24">
          <p style={{ color: 'var(--color-mist-light)' }}>Analytics unavailable.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Monthly Views Card */}
          <FadeIn>
            <div className="card p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <Eye size={24} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div>
                <p className="text-4xl font-bold font-display" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}>
                  {data.stats.monthlyViews.toLocaleString()}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-mist-light)' }}>Page views in the last 30 days</p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            {data.topPages.length > 0 && (
              <FadeIn delay={0.1}>
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart2 size={16} style={{ color: 'var(--color-gold)' }} />
                    <p className="text-label">Top Pages</p>
                  </div>
                  <div className="space-y-4">
                    {data.topPages.map((page, i) => (
                      <div key={page.path} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-4 text-right flex-shrink-0"
                          style={{ color: 'var(--color-mist)' }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono truncate" style={{ color: 'var(--color-parchment)' }}>{page.path}</p>
                          <div className="mt-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full"
                              style={{
                                width: `${(page.views / data.topPages[0].views) * 100}%`,
                                background: 'linear-gradient(to right, var(--color-gold-dim), var(--color-gold))',
                              }} />
                          </div>
                        </div>
                        <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--color-gold)' }}>
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Views by Day */}
            {data.viewsByDay.length > 0 && (
              <FadeIn delay={0.2}>
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp size={16} style={{ color: 'var(--color-gold)' }} />
                    <p className="text-label">Daily Views (30d)</p>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {data.viewsByDay.map(day => {
                      const max = Math.max(...data.viewsByDay.map(d => d.views));
                      const height = max > 0 ? (day.views / max) * 100 : 0;
                      return (
                        <div key={day.date} className="flex-1 group relative flex flex-col justify-end">
                          <div
                            className="w-full rounded-sm transition-all group-hover:opacity-80"
                            style={{
                              height: `${height}%`,
                              background: 'linear-gradient(to top, var(--color-gold-dim), var(--color-gold))',
                              minHeight: height > 0 ? '2px' : '0',
                            }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ background: 'var(--color-ink-muted)', color: 'var(--color-parchment)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {day.views}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs" style={{ color: 'var(--color-mist)' }}>
                      {data.viewsByDay[0]?.date}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-mist)' }}>
                      {data.viewsByDay[data.viewsByDay.length - 1]?.date}
                    </p>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
