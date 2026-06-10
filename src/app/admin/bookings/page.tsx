'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { useCurrency } from '@/context/CurrencyContext';
import { authFetch } from '@/lib/authFetch';

interface Booking {
  id: number; ref_code: string; service_title: string; barber_name: string; client_name: string; client_email: string;
  booking_date: string; booking_time: string; status: string; price: number; notes: string | null;
}
interface Service { id: number; title: string; price: number; duration: number; }
interface Barber { id: number; name: string; }

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ service_id: '', barber_id: '', booking_date: '', booking_time: '', user_id: '', notes: '' });
  const [creating, setCreating] = useState(false);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    Promise.all([
      authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()),
      authFetch('/api/admin/services.php').then(r => r.json()),
      authFetch('/api/admin/barbers.php').then(r => r.json()),
    ]).then(([bookingsData, servicesData, barbersData]) => {
      setBookings(bookingsData.bookings || []);
      setServices(servicesData.services || []);
      setBarbers(barbersData.barbers || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter, search]);

  const handleCreate = async () => {
    if (!form.service_id || !form.barber_id || !form.booking_date || !form.booking_time) return;
    setCreating(true);
    try {
      const res = await authFetch('/api/admin/bookings.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: parseInt(form.service_id), barber_id: parseInt(form.barber_id), booking_date: form.booking_date, booking_time: form.booking_time, user_id: form.user_id ? parseInt(form.user_id) : null, notes: form.notes || null }),
      });
      const data = await res.json();
      if (res.ok) { setShowCreate(false); setForm({ service_id: '', barber_id: '', booking_date: '', booking_time: '', user_id: '', notes: '' }); window.location.reload(); }
      else alert(data.error || 'Failed to create');
    } catch { alert('Failed to create'); } finally { setCreating(false); }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (time: string) => { const [h, m] = time.split(':'); return `${parseInt(h) % 12 || 12}:${m} ${parseInt(h) >= 12 ? 'PM' : 'AM'}`; };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="section-label">{t('admin.manage')}</span>
          <h1 className="text-2xl md:text-3xl text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.bookings')}</h1>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary text-xs">{showCreate ? t('common.cancel') : t('admin.newBooking')}</button>
      </div>

      {showCreate && (
        <div className="p-6 bg-surface-alt border border-black/[0.04] mb-8">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.createManualBooking')}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.service')}</label>
              <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }}>
                <option value="">{t('admin.service')}</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.title} — {formatPrice(s.price)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.barber')}</label>
              <select value={form.barber_id} onChange={(e) => setForm({ ...form, barber_id: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }}>
                <option value="">{t('admin.barber')}</option>
                {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.date')}</label>
              <input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.time')}</label>
              <input type="time" value={form.booking_time} onChange={(e) => setForm({ ...form, booking_time: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !form.service_id || !form.barber_id || !form.booking_date || !form.booking_time} className="btn btn-primary text-xs disabled:opacity-30">
            {creating ? t('admin.creating') : t('admin.createBooking')}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-surface-alt p-1">
          {[
            { value: '', label: t('admin.all') },
            { value: 'pending', label: t('admin.pending') },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${filter === f.value ? 'bg-black text-white' : 'text-text-secondary hover:text-black'}`} style={{ fontFamily: 'var(--font-ui)' }}>
              {f.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder={t('admin.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris w-64" style={{ fontFamily: 'var(--font-ui)' }} />
      </div>

      {loading ? (
        <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center bg-surface-alt"><p className="text-text-secondary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.noBookings')}</p></div>
      ) : (
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
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Status</th>
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.price')}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-black/[0.04] hover:bg-surface-alt transition-colors">
                  <td className="py-3 text-text-tertiary text-xs">{b.ref_code}</td>
                  <td className="py-3 font-medium">{b.client_name || t('common.walkIn')}</td>
                  <td className="py-3">{b.service_title}</td>
                  <td className="py-3">{b.barber_name}</td>
                  <td className="py-3 text-text-secondary">{formatDate(b.booking_date)}</td>
                  <td className="py-3 text-text-secondary">{formatTime(b.booking_time)}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${b.status === 'confirmed' ? 'bg-verdigris/10 text-verdigris' : b.status === 'pending' ? 'bg-amber-50 text-amber-700' : b.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-black/5 text-text-tertiary'}`}>{b.status}</span>
                  </td>
                  <td className="py-3 font-medium">{formatPrice(b.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
