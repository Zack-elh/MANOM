'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { useCurrency } from '@/context/CurrencyContext';
import { authFetch } from '@/lib/authFetch';

interface Booking {
  id: number;
  ref_code: string;
  service_title: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  price: number;
  can_cancel: boolean;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = () => {
    setLoading(true);
    authFetch('/api/bookings/my-bookings.php')
      .then((res) => res.json())
      .then((data) => { if (data.bookings) setBookings(data.bookings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      const res = await authFetch('/api/bookings/cancel.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json();
      if (res.ok) fetchBookings();
      else alert(data.error || 'Failed to cancel');
    } catch { alert('Failed to cancel'); } finally { setCancellingId(null); }
  };

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const bookingDate = new Date(`${b.booking_date}T${b.booking_time}`);
    if (filter === 'upcoming') return bookingDate >= now && b.status !== 'cancelled';
    if (filter === 'past') return bookingDate < now || b.status === 'completed' || b.status === 'cancelled';
    return true;
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (time: string) => { const [h, m] = time.split(':'); return `${parseInt(h) % 12 || 12}:${m} ${parseInt(h) >= 12 ? 'PM' : 'AM'}`; };
  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-verdigris/10 text-verdigris';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'completed': return 'bg-black/5 text-text-tertiary';
      case 'cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-black/5 text-text-tertiary';
    }
  };

  return (
    <div>
      <span className="section-label">{t('dashboard.myBookings')}</span>
      <h1 className="text-2xl md:text-3xl text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('dashboard.yourBookings')}</h1>

      <div className="flex gap-1 mb-8 bg-surface-alt p-1 w-fit">
        {(['all', 'upcoming', 'past'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-black text-white' : 'text-text-secondary hover:text-black'}`} style={{ fontFamily: 'var(--font-ui)' }}>
            {f === 'all' ? t('dashboard.all') : f === 'upcoming' ? t('dashboard.upcoming') : t('dashboard.past')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-surface-alt border border-black/[0.04]">
          <p className="text-text-secondary text-sm mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.noBookings').replace('{filter}', '')}</p>
          <Link href="/booking" className="btn btn-primary text-xs mt-4">{t('dashboard.bookAppointment')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="p-5 bg-surface-alt border border-black/[0.04] hover:border-black/[0.12] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-text-tertiary tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>{booking.ref_code}</span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${statusColor(booking.status)}`} style={{ fontFamily: 'var(--font-ui)' }}>{booking.status}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-black" style={{ fontFamily: 'var(--font-ui)' }}>{booking.service_title}</h3>
                </div>
                <span className="text-sm font-semibold text-black" style={{ fontFamily: 'var(--font-ui)' }}>{formatPrice(booking.price)}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-secondary mb-3" style={{ fontFamily: 'var(--font-ui)' }}>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  {booking.barber_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {formatDate(booking.booking_date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatTime(booking.booking_time)}
                </span>
              </div>
              {booking.can_cancel && (
                <button onClick={() => handleCancel(booking.id)} disabled={cancellingId === booking.id} className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50" style={{ fontFamily: 'var(--font-ui)' }}>
                  {cancellingId === booking.id ? t('dashboard.cancelling') : t('dashboard.cancelBooking')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
