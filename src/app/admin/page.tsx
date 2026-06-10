'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { useCurrency } from '@/context/CurrencyContext';
import { authFetch } from '@/lib/authFetch';

interface Stats {
  today: { bookings: number; revenue: number };
  month: { bookings: number; revenue: number };
  pending_bookings: number;
  total_clients: number;
  upcoming: Array<{ id: number; ref_code: string; service_title: string; barber_name: string; client_name: string; booking_date: string; booking_time: string; status: string; price: number; }>;
  recent: Array<{ id: number; ref_code: string; service_title: string; barber_name: string; client_name: string; booking_date: string; booking_time: string; status: string; created_at: string; }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ today: { bookings: 0, revenue: 0 }, month: { bookings: 0, revenue: 0 }, pending_bookings: 0, total_clients: 0, upcoming: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    authFetch('/api/admin/stats.php')
      .then((res) => res.json())
      .then((data) => { if (data.today && data.month) setStats(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (time: string) => { const [h, m] = time.split(':'); return `${parseInt(h) % 12 || 12}:${m} ${parseInt(h) >= 12 ? 'PM' : 'AM'}`; };

  if (loading) return <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>;

  return (
    <div>
      <span className="section-label">{t('admin.adminDashboard')}</span>
      <h1 className="text-2xl md:text-3xl text-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.overview')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 bg-surface-alt border border-black/[0.04]">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.todayBookings')}</p>
          <p className="text-2xl font-bold text-black" style={{ fontFamily: 'var(--font-heading)' }}>{stats?.today?.bookings || 0}</p>
        </div>
        <div className="p-5 bg-surface-alt border border-black/[0.04]">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.todayRevenue')}</p>
          <p className="text-2xl font-bold text-black" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(stats?.today?.revenue || 0)}</p>
        </div>
        <div className="p-5 bg-surface-alt border border-black/[0.04]">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.pending')}</p>
          <p className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'var(--font-heading)' }}>{stats?.pending_bookings || 0}</p>
        </div>
        <div className="p-5 bg-surface-alt border border-black/[0.04]">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.totalClients')}</p>
          <p className="text-2xl font-bold text-black" style={{ fontFamily: 'var(--font-heading)' }}>{stats?.total_clients || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-5 bg-verdigris text-white">
          <p className="text-[10px] uppercase tracking-wider mb-2 opacity-70" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.thisMonth')}</p>
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{stats.month.bookings} {t('admin.bookings').toLowerCase()}</p>
          <p className="text-sm opacity-80" style={{ fontFamily: 'var(--font-ui)' }}>{formatPrice(stats.month.revenue)}</p>
        </div>
        <div className="p-5 bg-black text-white">
          <p className="text-[10px] uppercase tracking-wider mb-2 opacity-70" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.quickActions')}</p>
          <div className="flex gap-2 mt-3">
            <Link href="/admin/bookings" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.newBooking')}</Link>
            <Link href="/admin/services" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.manageServices')}</Link>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.upcoming')}</h2>
          <Link href="/admin/bookings" className="btn-ghost text-xs flex items-center gap-1" style={{ fontFamily: 'var(--font-ui)' }}>
            {t('admin.viewAll')}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        {stats.upcoming.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Ref</th>
                  <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.clients').slice(0, -1)}</th>
                  <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.service')}</th>
                  <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.barber')}</th>
                  <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.date')}</th>
                  <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.time')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcoming.map((b) => (
                  <tr key={b.id} className="border-b border-black/[0.04] hover:bg-surface-alt transition-colors">
                    <td className="py-3 text-text-tertiary text-xs">{b.ref_code}</td>
                    <td className="py-3 font-medium">{b.client_name || t('common.walkIn')}</td>
                    <td className="py-3">{b.service_title}</td>
                    <td className="py-3">{b.barber_name}</td>
                    <td className="py-3 text-text-secondary">{formatDate(b.booking_date)}</td>
                    <td className="py-3 text-text-secondary">{formatTime(b.booking_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-text-tertiary text-sm py-8 text-center" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.noUpcoming')}</p>}
      </div>

      <div>
        <h2 className="text-lg text-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.recentActivity')}</h2>
        {stats.recent.length > 0 ? (
          <div className="space-y-2">
            {stats.recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-black/[0.04]">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${b.status === 'confirmed' ? 'bg-verdigris' : b.status === 'completed' ? 'bg-text-tertiary' : b.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{b.client_name || t('common.walkIn')} — {b.service_title}</p>
                    <p className="text-xs text-text-tertiary">{b.barber_name} · {formatDate(b.booking_date)} · {formatTime(b.booking_time)}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">{b.status}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-text-tertiary text-sm py-8 text-center" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.noRecent')}</p>}
      </div>
    </div>
  );
}
