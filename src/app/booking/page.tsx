'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/context';
import { useCurrency } from '@/context/CurrencyContext';
import { authFetch } from '@/lib/authFetch';

interface Service { id: number; title: string; duration: number; price: number; }
interface Barber { id: number; name: string; specialty: string | null; }
interface Slot { time: string; datetime: string; available?: boolean; }

export default function BookingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ ref_code: string; id: number } | null>(null);

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [restriction, setRestriction] = useState<{ level: string; message: string; count: number } | null>(null);

  const isMonday = selectedDate && new Date(selectedDate).getDay() === 1;

  useEffect(() => {
    const auth = localStorage.getItem('manom_auth');
    if (!auth) {
      router.push('/auth');
    } else {
      setAuthenticated(true);
      try { const p = JSON.parse(auth); if (p.user?.role === 'admin') setIsAdmin(true); } catch {}
      Promise.all([
        authFetch('/api/public/services.php').then(r => r.json()),
        authFetch('/api/public/barbers.php').then(r => r.json()),
        authFetch('/api/bookings/check-restriction.php').then(r => r.json()),
      ]).then(([servicesData, barbersData, restrictionData]) => {
        setServices((servicesData.services || []).filter((s: Service & { active?: number }) => s.active !== 0));
        setBarbers((barbersData.barbers || []).filter((b: Barber & { active?: number }) => b.active !== 0));
        if (restrictionData.restriction_level !== 'none') {
          setRestriction({ level: restrictionData.restriction_level, message: restrictionData.message, count: restrictionData.no_show_count });
        }
      }).catch((err) => console.error('Failed to load booking data:', err));
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (selectedDate && selectedBarber && selectedServices.length > 0 && !isMonday) {
      setLoadingSlots(true);
      const primaryService = selectedServices[0];
      authFetch(`/api/bookings/slots.php?barber_id=${selectedBarber}&date=${selectedDate}&service_id=${primaryService}`)
        .then((r) => r.json())
        .then((data) => setSlots(data.slots || []))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, selectedBarber, selectedServices]);

  const toggleService = (id: number) => {
    setSelectedServices((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const selectedServicesData = services.filter((s) => selectedServices.includes(s.id));
  const selectedBarberData = barbers.find((b) => b.id === selectedBarber);
  const totalPrice = selectedServicesData.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServicesData.reduce((sum, s) => sum + s.duration, 0);

  const handleConfirm = async () => {
    if (!selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) return;
    setSubmitting(true);
    try {
      const res = await authFetch('/api/bookings/create.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_ids: selectedServices, barber_id: selectedBarber, booking_date: selectedDate, booking_time: selectedTime }),
      });
      const data = await res.json();
      if (!res.ok) { console.error('Booking error:', data, 'Status:', res.status); alert(data.error || `Booking failed (${res.status})`); setSubmitting(false); return; }
      if (data.booking) setConfirmation(data.booking);
    } catch (err) { console.error('Booking fetch error:', err); alert('Booking failed'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>;
  if (!authenticated) return null;

  if (confirmation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-[400px] text-center">
          <div className="w-16 h-16 bg-verdigris/10 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-verdigris"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="section-label">{t('booking.confirmed')}</span>
          <h1 className="text-3xl md:text-4xl text-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('booking.allSet')}</h1>
          <p className="text-text-tertiary text-sm mb-6" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.refCode')}</p>
          <p className="text-2xl font-bold text-black tracking-widest mb-8" style={{ fontFamily: 'var(--font-heading)' }}>{confirmation.ref_code}</p>
          <p className="text-text-tertiary text-xs mb-8" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.saveRef')}</p>
          <div className="flex gap-4">
            <Link href="/dashboard/bookings" className="btn btn-secondary flex-1">{t('booking.viewBookings')}</Link>
            <Link href="/" className="btn btn-primary flex-1">{t('booking.backToHome')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-6 md:px-10 py-12 md:py-20">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="inline-flex items-center gap-2 text-text-tertiary hover:text-black transition-colors text-sm mb-12" style={{ fontFamily: 'var(--font-ui)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t('common.backToHome')}
        </Link>

        {restriction && restriction.level === 'blocked' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <span className="section-label">{t('booking.accountSuspended')}</span>
            <h1 className="text-2xl md:text-3xl text-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('booking.cannotBook')}</h1>
            <p className="text-text-secondary text-sm mb-8 max-w-sm mx-auto" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.blockedMessage')}</p>
            <div className="p-6 bg-surface-alt border border-black/[0.04] max-w-sm mx-auto mb-8">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.contactSupport')}</p>
              <p className="text-sm font-semibold text-black mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.callUs')}</p>
              <p className="text-lg font-bold text-verdigris mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t('booking.phoneNumber')}</p>
              <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.hoursLabel')}</p>
              <p className="text-xs text-text-secondary" style={{ fontFamily: 'var(--font-ui)' }}>Tue - Sun: 9:00 AM - 8:00 PM</p>
            </div>
            <Link href="/" className="btn btn-secondary text-xs">{t('booking.backToHome')}</Link>
          </div>
        )}

        {restriction && restriction.level !== 'blocked' && (
          <div className={`mb-8 p-4 border text-sm ${restriction.level === 'pending_approval' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`} style={{ fontFamily: 'var(--font-ui)' }}>
            <p className="font-semibold mb-1">{restriction.level === 'pending_approval' ? 'Admin Approval Required' : 'Restriction Notice'}</p>
            <p className="text-xs">{restriction.message}</p>
          </div>
        )}

        {(!restriction || restriction.level !== 'blocked') && (
        <>
        <span className="section-label">{t('booking.bookAppointment')}</span>
        <h1 className="text-3xl md:text-5xl text-black mb-4 leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>{t('booking.bookYourExperience')}</h1>
        <p className="text-text-tertiary text-sm mb-12" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.step')} {step} {t('booking.of')} 3</p>

        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((s) => <div key={s} className={`h-[2px] flex-1 transition-all duration-300 ${s <= step ? 'bg-black' : 'bg-black/10'}`} />)}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl text-black mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{t('booking.selectServices')}</h2>
            <p className="text-text-tertiary text-xs mb-6" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.servicesDesc')}</p>
            <div className="space-y-0">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button key={service.id} onClick={() => toggleService(service.id)} className={`w-full flex items-center justify-between py-5 border-b border-black/[0.08] text-left transition-colors ${isSelected ? 'text-verdigris' : 'hover:text-verdigris'}`}>
                    <div>
                      <span className="text-sm font-medium block" style={{ fontFamily: 'var(--font-ui)' }}>{service.title}</span>
                      <span className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{service.duration} {t('common.min')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>{formatPrice(service.price)}</span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'border-verdigris bg-verdigris' : 'border-black/20'}`}>
                        {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-4 py-3 px-4 bg-surface-alt text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>
                {selectedServices.length} {t('booking.selectServices').split(' ')[0].toLowerCase()} · {totalDuration} {t('common.min')} · {formatPrice(totalPrice)}
              </div>
            )}
            <button onClick={() => selectedServices.length > 0 && setStep(2)} disabled={selectedServices.length === 0 || restriction?.level === 'blocked'} className="btn btn-primary w-full mt-8 disabled:opacity-30 disabled:cursor-not-allowed">
              {t('booking.continue')}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('booking.selectBarber')}</h2>
            <div className="space-y-0">
              {barbers.map((barber) => (
                <button key={barber.id} onClick={() => setSelectedBarber(barber.id)} className={`w-full flex items-center justify-between py-5 border-b border-black/[0.08] text-left transition-colors ${selectedBarber === barber.id ? 'text-verdigris' : 'hover:text-verdigris'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-verdigris/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-verdigris uppercase">{barber.name.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium block" style={{ fontFamily: 'var(--font-ui)' }}>{barber.name}</span>
                      <span className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{barber.specialty || t('common.walkIn')}</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedBarber === barber.id ? 'border-verdigris bg-verdigris' : 'border-black/20'}`}>
                    {selectedBarber === barber.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">{t('booking.back')}</button>
              <button onClick={() => selectedBarber && setStep(3)} disabled={!selectedBarber} className="btn btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed">{t('booking.continue')}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('booking.selectDateTime')}</h2>
            <div className="mb-8">
              <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-3" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.date')}</label>
              <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); if (e.target.value && new Date(e.target.value).getDay() === 1) setSelectedDate(e.target.value); }} min={new Date().toISOString().split('T')[0]} className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
            </div>
            <div className="mb-8">
              <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-3" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.time')}</label>
              {loadingSlots ? (
                <p className="text-text-tertiary text-xs" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.loadingSlots')}</p>
              ) : isMonday ? (
                <p className="text-text-tertiary text-xs" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.closedMonday')}</p>
              ) : slots.length === 0 ? (
                <p className="text-text-tertiary text-xs" style={{ fontFamily: 'var(--font-ui)' }}>{selectedDate ? t('booking.noSlots') : t('booking.selectDateFirst')}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const hour = parseInt(slot.time.split(':')[0]);
                    const displayTime = `${hour % 12 || 12}:${slot.time.split(':')[1]}`;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const busy = slot.available === false;
                    return (
                      <button key={slot.time} disabled={busy} onClick={() => busy ? null : setSelectedTime(slot.time)} className={`py-3 text-xs font-medium border transition-all ${selectedTime === slot.time ? 'border-black bg-black text-white' : busy ? 'bg-black text-white border-black/20 cursor-not-allowed' : 'border-black/10 hover:border-black/30'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                        {displayTime} {ampm}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedBarberData && selectedDate && selectedTime && (
              <div className="py-6 border-t border-black/[0.08] mb-8">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.summary')}</h3>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
                  <div className="flex justify-between"><span className="text-text-tertiary">{t('booking.services')}</span><span className="text-right">{selectedServicesData.map((s) => s.title).join(', ')}</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">{t('booking.barber')}</span><span>{selectedBarberData.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">{t('booking.duration')}</span><span>{totalDuration} {t('common.min')}</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">{t('booking.date')}</span><span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                  <div className="flex justify-between"><span className="text-text-tertiary">{t('booking.time')}</span><span>{selectedTime.replace(':00', '').replace(/^(\d):/, '0$1:')} {parseInt(selectedTime) >= 12 ? 'PM' : 'AM'}</span></div>
                  <div className="flex justify-between pt-2 border-t border-black/[0.08] font-semibold"><span>{t('booking.total')}</span><span>{formatPrice(totalPrice)}</span></div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">{t('booking.back')}</button>
              <button onClick={handleConfirm} disabled={!selectedDate || !selectedTime || submitting || restriction?.level === 'blocked'} className="btn btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed">
                {submitting ? t('booking.booking') : t('booking.confirmBooking')}
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
