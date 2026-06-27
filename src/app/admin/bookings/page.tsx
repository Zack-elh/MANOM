'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/i18n/context';
import { useCurrency } from '@/context/CurrencyContext';
import { authFetch } from '@/lib/authFetch';

interface Booking {
  id: number; ref_code: string; service_title: string; barber_name: string; client_name: string | null; client_email: string;
  booking_date: string; booking_time: string; status: string; price: number; notes: string | null; user_id: number | null; no_show_count: number;
}
interface Service { id: number; title: string; price: number; duration: number; }
interface Barber { id: number; name: string; }
interface Client { id: number; name: string; email: string; phone: string | null; }
interface Slot { time: string; datetime: string; }
interface Strike { id: number; strike_type: string; created_at: string; forgiven_at: string | null; ref_code: string; booking_date: string; booking_time: string; service_title: string; barber_name: string; forgiven_by_name: string | null; }

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ service_id: '', barber_id: '', booking_date: '', booking_time: '', notes: '' });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clientMode, setClientMode] = useState<'search' | 'walkin'>('search');
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [walkinName, setWalkinName] = useState('');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [noShowId, setNoShowId] = useState<number | null>(null);
  const [strikeHistory, setStrikeHistory] = useState<{ user: { name: string; no_show_count: number }; strikes: Strike[] } | null>(null);
  const [loadingStrikes, setLoadingStrikes] = useState(false);
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
    }).catch(() => setError('Failed to load data')).finally(() => setLoading(false));
  }, [filter, search]);

  // Fetch available slots when barber + date + service are selected
  useEffect(() => {
    if (!form.barber_id || !form.booking_date || !form.service_id) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetch(`/api/bookings/slots.php?barber_id=${form.barber_id}&date=${form.booking_date}&service_id=${form.service_id}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots || []))
      .catch((err) => console.error('Failed to load slots:', err))
      .finally(() => setLoadingSlots(false));
  }, [form.barber_id, form.booking_date, form.service_id]);

  // Client search debounce
  useEffect(() => {
    if (clientMode !== 'search' || clientSearch.length < 2) { setClientResults([]); return; }
    const timer = setTimeout(() => {
      authFetch(`/api/admin/clients.php?search=${encodeURIComponent(clientSearch)}`)
        .then(r => r.json())
        .then(data => setClientResults(data.clients || []))
        .catch((err) => console.error('Client search failed:', err));
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, clientMode]);

  const handleCreate = async () => {
    if (!form.service_id || !form.barber_id || !form.booking_date || !form.booking_time) return;
    setCreating(true);
    setError('');
    setCreateSuccess('');

    const body: Record<string, unknown> = {
      service_id: parseInt(form.service_id),
      barber_id: parseInt(form.barber_id),
      booking_date: form.booking_date,
      booking_time: form.booking_time,
      notes: form.notes || null,
    };

    if (clientMode === 'search' && selectedClient) {
      body.user_id = selectedClient.id;
    } else if (clientMode === 'walkin') {
      body.user_id = null;
      const info = [`Walk-in: ${walkinName || 'Guest'}`];
      if (walkinEmail) info.push(walkinEmail);
      if (walkinPhone) info.push(walkinPhone);
      if (form.notes) info.push(`Notes: ${form.notes}`);
      body.notes = info.join(' | ');
    }

    try {
      const res = await authFetch('/api/admin/bookings.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        resetForm();
        setCreateSuccess(`Booking ${data.booking?.ref_code || ''} created`);
        // Reload list
        authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()).then(d => setBookings(d.bookings || [])).catch((err) => console.error('Failed to reload bookings:', err));
      } else {
        setError(data.error || 'Failed to create');
      }
    } catch { setError('Failed to create'); }
    setCreating(false);
  };

  const handleAdminCancel = async (bookingId: number) => {
    const reason = prompt(t('admin.cancelReason'));
    if (reason === null) return;
    setCancellingId(bookingId);
    setError('');
    setCreateSuccess('');
    try {
      const res = await authFetch('/api/admin/bookings.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, reason: reason || 'Cancelled by admin' }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(`Booking ${data.booking?.ref_code || ''} cancelled`);
        authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()).then(d => setBookings(d.bookings || [])).catch((err) => console.error('Failed to reload bookings:', err));
      } else setError(data.error || 'Failed to cancel');
    } catch { setError('Failed to cancel'); }
    setCancellingId(null);
  };

  const handleNoShow = async (bookingId: number) => {
    if (!confirm('Mark this booking as no-show? This will add a strike to the client.')) return;
    setNoShowId(bookingId);
    setError('');
    setCreateSuccess('');
    try {
      const res = await authFetch('/api/admin/no-show.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(`${data.client_name} — No-show marked (${data.no_show_count}/3 strikes — ${data.restriction_level})`);
        authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()).then(d => setBookings(d.bookings || [])).catch(() => {});
      } else setError(data.error || 'Failed to mark no-show');
    } catch { setError('Failed to mark no-show'); }
    setNoShowId(null);
  };

  const handleComplete = async (bookingId: number) => {
    setNoShowId(bookingId);
    setError('');
    setCreateSuccess('');
    try {
      const res = await authFetch('/api/admin/bookings.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'complete' }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(`Booking completed`);
        authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()).then(d => setBookings(d.bookings || [])).catch(() => {});
      } else setError(data.error || 'Failed to complete');
    } catch { setError('Failed to complete'); }
    setNoShowId(null);
  };

  const handleStart = async (bookingId: number) => {
    setNoShowId(bookingId);
    setError('');
    setCreateSuccess('');
    try {
      const res = await authFetch('/api/admin/bookings.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'start' }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(`Booking started — client in the chair`);
        authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()).then(d => setBookings(d.bookings || [])).catch(() => {});
      } else setError(data.error || 'Failed to start');
    } catch { setError('Failed to start'); }
    setNoShowId(null);
  };

  const handleApprove = async (bookingId: number) => {
    if (!confirm('Approve this booking? Client has 2+ strikes and this booking was pending your approval.')) return;
    setNoShowId(bookingId);
    setError('');
    setCreateSuccess('');
    try {
      const res = await authFetch('/api/admin/bookings.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'approve' }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(`Booking approved`);
        authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()).then(d => setBookings(d.bookings || [])).catch(() => {});
      } else setError(data.error || 'Failed to approve');
    } catch { setError('Failed to approve'); }
    setNoShowId(null);
  };

  const fetchStrikeHistory = async (userId: number) => {
    setLoadingStrikes(true);
    setStrikeHistory(null);
    try {
      const res = await authFetch(`/api/admin/client-strikes.php?user_id=${userId}`);
      const data = await res.json();
      if (res.ok) setStrikeHistory(data);
    } catch { /* ignore */ }
    setLoadingStrikes(false);
  };

  const handleForgiveNoShow = async (bookingId: number) => {
    setNoShowId(bookingId);
    setError('');
    setCreateSuccess('');
    try {
      const res = await authFetch('/api/admin/no-show.php', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(`${data.client_name} — No-show forgiven (${data.no_show_count} strikes remaining)`);
        authFetch(`/api/admin/bookings.php?status=${filter}&search=${search}`).then(r => r.json()).then(d => setBookings(d.bookings || [])).catch(() => {});
      } else setError(data.error || 'Failed to forgive');
    } catch { setError('Failed to forgive'); }
    setNoShowId(null);
  };

  const resetForm = () => {
    setForm({ service_id: '', barber_id: '', booking_date: '', booking_time: '', notes: '' });
    setSlots([]);
    setClientMode('search');
    setClientSearch('');
    setClientResults([]);
    setSelectedClient(null);
    setWalkinName('');
    setWalkinEmail('');
    setWalkinPhone('');
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (time: string) => { const [h, m] = time.split(':'); return `${parseInt(h) % 12 || 12}:${m} ${parseInt(h) >= 12 ? 'PM' : 'AM'}`; };

  const selectedService = services.find(s => s.id === parseInt(form.service_id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="section-label">{t('admin.manage')}</span>
          <h1 className="text-2xl md:text-3xl text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.bookings')}</h1>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); if (!showCreate) resetForm(); }} className="btn btn-primary text-xs">{showCreate ? t('common.cancel') : t('admin.newBooking')}</button>
      </div>

      {error && <div className="mb-4 py-3 px-4 bg-red-50 border border-red-200 text-red-700 text-xs flex justify-between" style={{ fontFamily: 'var(--font-ui)' }}><span>{error}</span><button onClick={() => setError('')} className="font-bold">&times;</button></div>}
      {createSuccess && <div className="mb-4 py-3 px-4 bg-green-50 border border-green-200 text-green-700 text-xs flex justify-between" style={{ fontFamily: 'var(--font-ui)' }}><span>{createSuccess}</span><button onClick={() => setCreateSuccess('')} className="font-bold">&times;</button></div>}

      {showCreate && (
        <div className="p-6 bg-surface-alt border border-black/[0.04] mb-8">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.createManualBooking')}</h3>

          {/* Service | Barber | Date */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.service')}</label>
              <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value, booking_time: '' })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }}>
                <option value="">—</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.title} ({s.duration}min — {formatPrice(s.price)})</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.barber')}</label>
              <select value={form.barber_id} onChange={(e) => setForm({ ...form, barber_id: e.target.value, booking_time: '' })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }}>
                <option value="">—</option>
                {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.date')}</label>
              <input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value, booking_time: '' })} min={new Date().toISOString().split('T')[0]} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
            </div>
          </div>

          {/* Time slots */}
          {form.barber_id && form.booking_date && form.service_id && (
            <div className="mb-4">
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.time')}</label>
              {loadingSlots ? (
                <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p>
              ) : slots.length === 0 ? (
                <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>No available slots</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setForm({ ...form, booking_time: slot.time })}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${form.booking_time === slot.time ? 'bg-black text-white border-black' : 'bg-white border-black/[0.12] text-black hover:border-black'}`}
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Client section */}
          <div className="mb-4">
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="clientMode" checked={clientMode === 'search'} onChange={() => setClientMode('search')} className="accent-verdigris" />
                <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-ui)' }}>Existing client</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="clientMode" checked={clientMode === 'walkin'} onChange={() => setClientMode('walkin')} className="accent-verdigris" />
                <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.walkIn')}</span>
              </label>
            </div>

            {clientMode === 'search' ? (
              <div className="relative">
                <input type="text" value={clientSearch} onChange={(e) => { setClientSearch(e.target.value); setSelectedClient(null); }} placeholder="Search client by name or email..." className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                {selectedClient && (
                  <div className="mt-2 py-2 px-3 bg-verdigris/5 border border-verdigris/20 text-xs" style={{ fontFamily: 'var(--font-ui)' }}>
                    {selectedClient.name} — {selectedClient.email} {selectedClient.phone ? `— ${selectedClient.phone}` : ''}
                  </div>
                )}
                {!selectedClient && clientResults.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-black/[0.08] shadow-lg max-h-48 overflow-y-auto">
                    {clientResults.map((c) => (
                      <button key={c.id} type="button" onClick={() => { setSelectedClient(c); setClientSearch(''); setClientResults([]); }} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-text-tertiary ml-2">{c.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={walkinName} onChange={(e) => setWalkinName(e.target.value)} placeholder="Name (optional)" className="py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                <input type="email" value={walkinEmail} onChange={(e) => setWalkinEmail(e.target.value)} placeholder="Email (optional)" className="py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                <input type="tel" value={walkinPhone} onChange={(e) => setWalkinPhone(e.target.value)} placeholder="Phone (optional)" className="py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
              </div>
            )}
          </div>

          {/* Notes */}
          {clientMode === 'search' && (
            <div className="mb-4">
              <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.notes')}</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris resize-none" style={{ fontFamily: 'var(--font-ui)' }} />
            </div>
          )}

          <button onClick={handleCreate} disabled={creating || !form.service_id || !form.barber_id || !form.booking_date || !form.booking_time || (clientMode === 'search' && !selectedClient)} className="btn btn-primary text-xs disabled:opacity-30">
            {creating ? t('admin.creating') : t('admin.createBooking')}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-surface-alt p-1">
          {[
            { value: '', label: t('admin.all') },
            { value: 'pending_approval', label: 'To Approve' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'late_cancel', label: 'Late Cancel' },
            { value: 'no_show', label: 'No-Show' },
          ].map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${filter === f.value ? 'bg-black text-white' : 'text-text-secondary hover:text-black'}`} style={{ fontFamily: 'var(--font-ui)' }}>
              {f.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder={t('admin.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris w-64" style={{ fontFamily: 'var(--font-ui)' }} />
      </div>

      {/* Bookings list */}
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
                <th className="py-3 w-16"></th>
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
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${
                      b.status === 'confirmed' ? 'bg-verdigris/10 text-verdigris' :
                      b.status === 'in_progress' ? 'bg-blue-50 text-blue-700 font-bold' :
                      b.status === 'pending_approval' ? 'bg-amber-50 text-amber-700' :
                      b.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      b.status === 'late_cancel' ? 'bg-orange-50 text-orange-700 font-bold' :
                      b.status === 'no_show' ? 'bg-red-50 text-red-700 font-bold' :
                      'bg-black/5 text-text-tertiary'
                    }`}>{b.status === 'no_show' ? 'NO-SHOW' : b.status === 'late_cancel' ? 'LATE CANCEL' : b.status === 'pending_approval' ? 'PENDING' : b.status === 'in_progress' ? 'IN PROGRESS' : b.status}</span>
                  </td>
                  <td className="py-3 font-medium">{formatPrice(b.price)}</td>
                  <td className="py-3 flex gap-2">
                    {b.status === 'no_show' && (
                      <button onClick={() => handleForgiveNoShow(b.id)} disabled={noShowId === b.id} className="text-[10px] text-green-600 hover:text-green-700 font-medium uppercase tracking-wider disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                        Forgive
                      </button>
                    )}
                    {b.status === 'pending_approval' && (
                      <>
                        <button onClick={() => b.user_id && fetchStrikeHistory(b.user_id)} disabled={!b.user_id} className="text-[10px] text-amber-600 hover:text-amber-700 font-medium uppercase tracking-wider disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                          {loadingStrikes ? '...' : 'Strikes'}
                        </button>
                        <button onClick={() => handleApprove(b.id)} disabled={noShowId === b.id} className="text-[10px] text-verdigris hover:text-verdigris/80 font-medium uppercase tracking-wider disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                          {noShowId === b.id ? '...' : 'Approve'}
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleStart(b.id)} disabled={noShowId === b.id} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium uppercase tracking-wider disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                        {noShowId === b.id ? '...' : 'Start'}
                      </button>
                    )}
                    {(b.status === 'confirmed' || b.status === 'in_progress') && (
                      <button onClick={() => handleComplete(b.id)} disabled={noShowId === b.id} className="text-[10px] text-verdigris hover:text-verdigris/80 font-medium uppercase tracking-wider disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                        {noShowId === b.id ? '...' : 'Complete'}
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleNoShow(b.id)} disabled={noShowId === b.id} className="text-[10px] text-orange-600 hover:text-orange-700 font-medium uppercase tracking-wider disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                        {noShowId === b.id ? '...' : 'No-Show'}
                      </button>
                    )}
                    {b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'no_show' && b.status !== 'late_cancel' && (
                      <button onClick={() => handleAdminCancel(b.id)} disabled={cancellingId === b.id} className="text-[10px] text-red-600 hover:text-red-700 font-medium uppercase tracking-wider disabled:opacity-30" style={{ fontFamily: 'var(--font-ui)' }}>
                        {cancellingId === b.id ? '...' : t('admin.cancel')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Strike History Modal */}
      {strikeHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setStrikeHistory(null)}>
          <div className="bg-white max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>Strike History</h3>
                <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{strikeHistory.user.name} — {strikeHistory.user.no_show_count} strike(s)</p>
              </div>
              <button onClick={() => setStrikeHistory(null)} className="text-text-tertiary hover:text-black text-lg">&times;</button>
            </div>
            {strikeHistory.strikes.length === 0 ? (
              <p className="text-xs text-text-tertiary py-4 text-center" style={{ fontFamily: 'var(--font-ui)' }}>No strikes on record</p>
            ) : (
              <div className="space-y-3">
                {strikeHistory.strikes.map((s) => (
                  <div key={s.id} className={`p-3 border text-xs ${s.forgiven_at ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium uppercase tracking-wider ${s.forgiven_at ? 'text-green-700' : 'text-red-700'}`}>{s.strike_type === 'no_show' ? 'No-Show' : 'Late Cancel'} {s.forgiven_at ? '(Forgiven)' : ''}</span>
                      <span className="text-text-tertiary">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-text-secondary">Ref: {s.ref_code} — {s.service_title} with {s.barber_name}</p>
                    <p className="text-text-secondary">{s.booking_date} at {s.booking_time}</p>
                    {s.forgiven_at && <p className="text-green-600 mt-1">Forgiven by {s.forgiven_by_name}</p>}
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-text-tertiary mt-4 pt-3 border-t border-black/[0.08]" style={{ fontFamily: 'var(--font-ui)' }}>
              {strikeHistory.user.no_show_count >= 3 ? 'Client is BLOCKED — must call to book' : strikeHistory.user.no_show_count >= 2 ? 'Client needs admin approval for all bookings' : 'Client has a restriction warning'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
