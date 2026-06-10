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

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const auth = localStorage.getItem('manom_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setUser(parsed.user);
      } catch {}
    }

    authFetch('/api/bookings/my-bookings.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.bookings) {
          const now = new Date();
          const upcomingBookings = data.bookings
            .filter((b: Booking) => {
              const bookingDate = new Date(`${b.booking_date}T${b.booking_time}`);
              return bookingDate >= now && b.status !== 'cancelled';
            })
            .slice(0, 3);
          setUpcoming(upcomingBookings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-MA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div>
      <span className="section-label">{t('dashboard.overview')}</span>
      <h1 className="text-2xl md:text-3xl text-black mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
        {greeting()}, {user?.name?.split(' ')[0] || 'there'}
      </h1>
      <p className="text-text-tertiary text-sm mb-10" style={{ fontFamily: 'var(--font-ui)' }}>
        {t('dashboard.scheduleVisit')}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link href="/booking" className="p-5 bg-black text-white hover:bg-verdigris transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.bookAppointment')}</p>
          <p className="text-xs text-white/60 mt-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.scheduleVisit')}</p>
        </Link>
        <Link href="/dashboard/bookings" className="p-5 bg-surface-alt text-black hover:bg-black hover:text-white transition-colors border border-black/[0.08]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.viewBookings')}</p>
          <p className="text-xs text-text-tertiary mt-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.checkHistory')}</p>
        </Link>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('dashboard.upcomingAppointments')}</h2>
          {upcoming.length > 0 && (
            <Link href="/dashboard/bookings" className="btn-ghost text-xs flex items-center gap-1" style={{ fontFamily: 'var(--font-ui)' }}>
              {t('dashboard.viewAll')}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-12 text-center bg-surface-alt border border-black/[0.04]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-text-tertiary">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-text-secondary text-sm mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.noUpcoming')}</p>
            <p className="text-text-tertiary text-xs mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.bookNext')}</p>
            <Link href="/booking" className="btn btn-primary text-xs">{t('dashboard.bookNow')}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-surface-alt border border-black/[0.04] hover:border-black/[0.12] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-verdigris/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-verdigris">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black" style={{ fontFamily: 'var(--font-ui)' }}>{booking.service_title}</p>
                    <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>
                      {booking.barber_name} · {formatDate(booking.booking_date)} · {formatTime(booking.booking_time)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 ${booking.status === 'confirmed' ? 'bg-verdigris/10 text-verdigris' : 'bg-black/5 text-text-tertiary'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                    {booking.status}
                  </span>
                  <p className="text-xs text-text-tertiary mt-1" style={{ fontFamily: 'var(--font-ui)' }}>{formatPrice(booking.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-surface-alt border border-black/[0.04]">
        <h3 className="text-sm font-semibold text-black mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.visitUs')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
          <div>
            <p className="text-text-tertiary text-xs mb-1">{t('dashboard.location')}</p>
            <p className="text-black">57100 Manom, France</p>
          </div>
          <div>
            <p className="text-text-tertiary text-xs mb-1">{t('dashboard.hours')}</p>
            <p className="text-black">Tue - Sun: 9:00 AM - 8:00 PM</p>
            <p className="text-text-secondary">{t('footer.closed')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
