'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/context';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: t('dashboard.overview'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/dashboard/bookings', label: t('dashboard.myBookings'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/dashboard/profile', label: t('dashboard.profile'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  useEffect(() => {
    const auth = localStorage.getItem('manom_auth');
    if (!auth) {
      router.push('/auth');
      return;
    }
    try {
      const parsed = JSON.parse(auth);
      if (!parsed.user) {
        router.push('/auth');
        return;
      }
      setUser(parsed.user);
    } catch {
      localStorage.removeItem('manom_auth');
      router.push('/auth');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('manom_auth');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.08] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          MANOM
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -mr-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-surface-alt border-r border-black/[0.08] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-6 border-b border-black/[0.08]">
          <Link href="/" className="text-xl font-bold tracking-wider block" style={{ fontFamily: 'var(--font-heading)' }}>
            MANOM
          </Link>
          <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-widest" style={{ fontFamily: 'var(--font-ui)' }}>
            {t('dashboard.clientDashboard')}
          </p>
        </div>

        <nav className="flex-1 px-3 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors mb-1 ${
                  isActive
                    ? 'text-verdigris font-medium'
                    : 'text-text-secondary hover:text-black'
                }`}
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-black/[0.08]">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-black" style={{ fontFamily: 'var(--font-ui)' }}>{user.name}</p>
            <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:text-red-600 transition-colors w-full"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t('dashboard.signOut')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
