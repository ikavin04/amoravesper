'use client';

import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api';
import { AnalyticsOverview } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { BookOpen, Quote, Image, FileText, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: 'Books', value: stats?.books ?? 0, icon: BookOpen, href: '/dashboard/books', color: 'var(--color-gold)' },
    { label: 'Quotes', value: stats?.quotes ?? 0, icon: Quote, href: '/dashboard/quotes', color: 'var(--color-rose-light)' },
    { label: 'Gallery Images', value: stats?.gallery ?? 0, icon: Image, href: '/dashboard/gallery', color: '#7ba3c4' },
    { label: 'Blog Posts', value: stats?.posts ?? 0, icon: FileText, href: '/dashboard/blog', color: 'var(--color-mist-light)' },
    { label: 'Monthly Views', value: stats?.monthlyViews ?? 0, icon: Eye, href: '/dashboard/analytics', color: 'var(--color-gold)' },
  ];

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="mb-8">
          <p className="text-label mb-2">Welcome back</p>
          <h1 className="text-headline" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            Author Studio
          </h1>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((card, i) => (
          <FadeIn key={card.label} delay={i * 0.08}>
            <Link href={card.href} className="card p-5 block group">
              <div className="flex items-start justify-between mb-4">
                <card.icon size={18} style={{ color: card.color }} />
                <TrendingUp size={12} style={{ color: 'var(--color-mist)', opacity: 0.5 }} />
              </div>
              {loading ? (
                <div className="shimmer h-8 w-16 rounded mb-2" />
              ) : (
                <p className="text-3xl font-bold font-display mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}>
                  {card.value.toLocaleString()}
                </p>
              )}
              <p className="text-xs" style={{ color: 'var(--color-mist)' }}>{card.label}</p>
            </Link>
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        {data?.topPages && data.topPages.length > 0 && (
          <FadeIn delay={0.3}>
            <div className="card p-6">
              <p className="text-label mb-5">Top Pages (30 days)</p>
              <div className="space-y-3">
                {data.topPages.map(page => (
                  <div key={page.path} className="flex items-center justify-between gap-4">
                    <p className="text-sm font-mono truncate" style={{ color: 'var(--color-mist-light)', flex: 1 }}>
                      {page.path}
                    </p>
                    <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--color-gold)' }}>
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Quick Actions */}
        <FadeIn delay={0.4}>
          <div className="card p-6">
            <p className="text-label mb-5">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Manage Books', href: '/dashboard/books' },
                { label: 'Manage Quotes', href: '/dashboard/quotes' },
                { label: 'Upload Images', href: '/dashboard/uploads' },
                { label: 'Blog & News', href: '/dashboard/blog' },
                { label: 'Studio Settings', href: '/dashboard/settings' },
                { label: 'View Website', href: '/', target: '_blank' },
              ].map(action => (
                <Link
                  key={action.label}
                  href={action.href}
                  target={action.target}
                  className="btn btn-outline text-xs"
                  style={{ padding: '0.625rem 1rem' }}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
