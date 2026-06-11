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
  multi_service_ids?: number[];
  multi_services?: { id: number; title: string; price: number; duration: number }[];
}
interface Service { id: number; title: string; price: number; duration: number; }
interface Barber { id: number; name: string; }
interface Slot { time: string; datetime: string; }

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ service_ids: [] as number[], barber_id: '', booking_date: '', booking_time: '' });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => { let mounted = true; fetchBookings(); return () => { mounted = false; }; }, []);

  useEffect(() => {
    let mounted = true;
    authFetch('/api/public/services.php').then(r => r.json()).then(d => { if (mounted) setServices(d.services || []); }).catch(() => {});
    authFetch('/api/public/barbers.php').then(r => r.json()).then(d => { if (mounted) setBarbers(d.barbers || []); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!editingId || !editForm.barber_id || !editForm.booking_date || editForm.service_ids.length === 0) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    const controller = new AbortController();
    const primaryService = editForm.service_ids[0];
    fetch(`/api/bookings/slots.php?barber_id=${editForm.barber_id}&date=${editForm.booking_date}&service_id=${primaryService}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { if (mounted) setSlots(d.slots || []); })
      .catch(() => { if (mounted) setSlots([]); })
      .finally(() => { if (mounted) setLoadingSlots(false); });
    return () => { mounted = false; controller.abort(); };
  }, [editingId, editForm.barber_id, editForm.booking_date, editForm.service_ids]);

  const fetchBookings = () => {
    setLoading(true);
    authFetch('/api/bookings/my-bookings.php')
      .then((res) => res.json())
      .then((data) => { if (data.bookings) setBookings(data.bookings); })
      .catch(() => console.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  const startEdit = (b: Booking) => {
    let ids: number[] = [];
    if (b.multi_service_ids && b.multi_service_ids.length > 0) {
      ids = b.multi_service_ids;
    } else {
      const found = services.find(s => s.title === b.service_title)?.id;
      if (found) ids = [found];
    }
    setEditingId(b.id);
    setEditForm({
      service_ids: ids,
      barber_id: String(barbers.find(br => br.name === b.barber_name)?.id || ''),
      booking_date: b.booking_date,
      booking_time: b.booking_time.replace(':00', ''),
    });
    setSlots([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ service_ids: [], barber_id: '', booking_date: '', booking_time: '' });
    setSlots([]);
  };

  const toggleEditService = (id: number) => {
    setEditForm(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(id) ? prev.service_ids.filter(s => s !== id) : [...prev.service_ids, id],
      booking_time: '',
    }));
  };

  const handleSave = async () => {
    if (!editingId || editForm.service_ids.length === 0 || !editForm.barber_id || !editForm.booking_date || !editForm.booking_time) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/bookings/edit.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: editingId,
          service_ids: editForm.service_ids,
          barber_id: parseInt(editForm.barber_id),
          booking_date: editForm.booking_date,
          booking_time: editForm.booking_time,
        }),
      });
      const data = await res.json();
      if (res.ok) { cancelEdit(); fetchBookings(); }
      else { alert(data.error || 'Failed to update'); }
    } catch { alert('Failed to update'); }
    setSaving(false);
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm(t('dashboard.cancelConfirm'))) return;
    setCancellingId(bookingId);
    try {
      const res = await authFetch('/api/bookings/cancel.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json();
      if (res.ok) { fetchBookings(); }
      else { alert(data.error || 'Failed to cancel'); }
    } catch { alert('Failed to cancel'); }
    setCancellingId(null);
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
  const formatTimeEdit = (time: string) => { const [h, m] = time.split(':'); return `${parseInt(h) % 12 || 12}:${m} ${parseInt(h) >= 12 ? 'PM' : 'AM'}`; };
  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-verdigris/10 text-verdigris';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'completed': return 'bg-black/5 text-text-tertiary';
      case 'cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-black/5 text-text-tertiary';
    }
  };

  const selectedServices = services.filter(s => editForm.service_ids.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + Number(s.duration), 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

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
          <p className="text-text-secondary text-sm mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.noBookings').replace('{filter}', filter === 'all' ? '' : filter)}</p>
          <Link href="/booking" className="btn btn-primary text-xs mt-4">{t('dashboard.bookAppointment')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="p-5 bg-surface-alt border border-black/[0.04] hover:border-black/[0.12] transition-colors">
              {editingId === booking.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.services')}</label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {services.map((s) => {
                          const isSelected = editForm.service_ids.includes(s.id);
                          return (
                            <button key={s.id} type="button" onClick={() => toggleEditService(s.id)} className={`w-full text-left flex items-center justify-between px-2 py-1.5 text-xs border transition-colors ${isSelected ? 'border-verdigris bg-verdigris/5 text-verdigris' : 'border-black/[0.08] hover:border-black/20'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                              <span>{s.title}</span>
                              <span className="font-medium">{formatPrice(s.price)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.barber')}</label>
                      <select value={editForm.barber_id} onChange={(e) => setEditForm({ ...editForm, barber_id: e.target.value, booking_time: '' })} className="w-full py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }}>
                        <option value="">—</option>
                        {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.date')}</label>
                      <input type="date" value={editForm.booking_date} onChange={(e) => setEditForm({ ...editForm, booking_date: e.target.value, booking_time: '' })} min={new Date().toISOString().split('T')[0]} className="w-full py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('booking.time')}</label>
                      {loadingSlots ? (
                        <p className="text-xs text-text-tertiary py-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p>
                      ) : slots.length === 0 ? (
                        <p className="text-xs text-text-tertiary py-2" style={{ fontFamily: 'var(--font-ui)' }}>{editForm.booking_date ? t('booking.noSlots') : t('booking.selectDateFirst')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {slots.map((slot) => (
                            <button key={slot.time} onClick={() => setEditForm({ ...editForm, booking_time: slot.time })} className={`px-2 py-1 text-[11px] font-medium border transition-colors ${editForm.booking_time === slot.time ? 'bg-black text-white border-black' : 'bg-white border-black/[0.12] text-black hover:border-black'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                              {formatTimeEdit(slot.time)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                    {selectedServices.length > 0 && (
                    <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>
                      {selectedServices.length} service(s) · {totalDuration} {t('common.min')} · {formatPrice(totalPrice)}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving || editForm.service_ids.length === 0 || !editForm.barber_id || !editForm.booking_date || !editForm.booking_time} className="btn btn-primary text-xs disabled:opacity-30">
                      {saving ? t('dashboard.saving') : t('common.save')}
                    </button>
                    <button onClick={cancelEdit} className="btn btn-secondary text-xs">{t('common.cancel')}</button>
                  </div>
                </div>
              ) : (
                <>
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
                      <span className="inline-flex w-5 h-5 rounded-full bg-verdigris/10 items-center justify-center text-[10px] font-bold text-verdigris uppercase shrink-0">{booking.barber_name.charAt(0)}</span> {booking.barber_name}
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
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(booking)} className="text-xs text-verdigris hover:text-black font-medium transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>
                        {t('dashboard.editBooking')}
                      </button>
                      {booking.can_cancel && (
                        <button onClick={() => handleCancel(booking.id)} disabled={cancellingId === booking.id} className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                          {cancellingId === booking.id ? t('dashboard.cancelling') : t('dashboard.cancelBooking')}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
