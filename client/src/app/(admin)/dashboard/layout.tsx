'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, List, Quote, Image, User, FileText,
  Upload, Settings, BarChart2, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

interface AdminContextType {
  admin: { adminId: string; email: string } | null;
}
const AdminContext = createContext<AdminContextType>({ admin: null });
export const useAdmin = () => useContext(AdminContext);

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/books', label: 'Books', icon: BookOpen },
  { href: '/dashboard/chapters', label: 'Chapters', icon: List },
  { href: '/dashboard/quotes', label: 'Quotes', icon: Quote },
  { href: '/dashboard/gallery', label: 'Gallery', icon: Image },
  { href: '/dashboard/characters', label: 'Characters', icon: User },
  { href: '/dashboard/blog', label: 'Blog', icon: FileText },
  { href: '/dashboard/uploads', label: 'Uploads', icon: Upload },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ adminId: string; email: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    authApi.me()
      .then(data => {
        setAdmin(data.admin);
        setAuthChecked(true);
      })
      .catch(() => {
        router.replace('/author');
      });
  }, [router]);

  const handleLogout = async () => {
    await authApi.logout();
    router.replace('/author');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ink)' }}>
        <div className="w-6 h-6 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ admin }}>
      <div style={{ background: 'var(--color-ink)', minHeight: '100vh' }}>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--color-ink-muted)',
            color: 'var(--color-parchment)',
            border: '1px solid rgba(255,255,255,0.08)',
          }
        }} />

        {/* Sidebar */}
        <AnimatePresence>
          <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {/* Brand */}
            <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
                <p className="font-display text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}>
                  Amora Vesper
                </p>
                <p className="text-label mt-0.5" style={{ fontSize: '0.55rem' }}>Author Studio</p>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="p-4 flex-1">
              <div className="space-y-1">
                {NAV_ITEMS.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all group"
                      style={{
                        background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                        color: isActive ? 'var(--color-gold)' : 'var(--color-mist-light)',
                        border: isActive ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
                      }}
                    >
                      <item.icon size={15} />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3 px-3 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--color-gold)' }}
                >
                  {admin?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--color-parchment)' }}>
                    {admin?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 w-full text-sm rounded-sm transition-colors"
                style={{ color: 'var(--color-mist)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-rose-light)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-mist)')}
              >
                <LogOut size={14} />
                Sign Out
              </button>
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 w-full text-xs mt-1 rounded-sm"
                style={{ color: 'var(--color-mist)' }}
              >
                ↗ View Site
              </a>
            </div>
          </aside>
        </AnimatePresence>

        {/* Mobile Header */}
        <header
          className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-4 border-b"
          style={{ background: 'var(--color-ink-soft)', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <Link href="/dashboard">
            <p className="font-display font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Amora Vesper</p>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'var(--color-parchment)' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="admin-content" style={{ paddingTop: '0' }}>
          <div className="lg:hidden" style={{ height: '60px' }} />
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}
