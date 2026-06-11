'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { authFetch } from '@/lib/authFetch';

interface Barber { id: number; name: string; }

interface DaySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export default function AdminAvailabilityPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number>(0);
  const [slots, setSlots] = useState<DaySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    authFetch('/api/admin/barbers.php')
      .then((r) => r.json())
      .then((data) => {
        const list = data.barbers || [];
        setBarbers(list);
        if (list.length > 0) setSelectedBarberId(list[0].id);
      })
      .catch(() => setError('Failed to load barbers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBarberId) return;
    setLoading(true);
    setError('');
    authFetch(`/api/admin/availability.php?barber_id=${selectedBarberId}`)
      .then((r) => r.json())
      .then((data) => {
        const avail: DaySlot[] = (data.availability || []);
        // Initialize all 7 days — fill from API response, defaults to closed
        const allDays: DaySlot[] = DAY_KEYS.map((_, i) => {
          const match = avail.find((a: DaySlot) => a.day_of_week === i);
          return match ? { ...match, active: true } : { day_of_week: i, start_time: '09:00', end_time: '20:00', active: false };
        });
        setSlots(allDays);
      })
      .catch(() => setError('Failed to load availability'))
      .finally(() => setLoading(false));
  }, [selectedBarberId]);

  const updateSlot = (day: number, field: keyof DaySlot, value: string | boolean) => {
    setSlots((prev) => prev.map((s) => (s.day_of_week === day ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await authFetch('/api/admin/availability.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barber_id: selectedBarberId,
          availability: slots.map((s) => ({
            day_of_week: s.day_of_week,
            start_time: s.active ? s.start_time : null,
            end_time: s.active ? s.end_time : null,
          })),
        }),
      });
      if (res.ok) setSuccess(t('common.saved'));
      else { const d = await res.json(); setError(d.error || t('common.error')); }
    } catch { setError(t('common.error')); }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6">
        <span className="section-label">{t('admin.manage')}</span>
        <h1 className="text-2xl md:text-3xl text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.availability')}</h1>
      </div>

      {error && <div className="mb-4 py-3 px-4 bg-red-50 border border-red-200 text-red-700 text-xs flex justify-between" style={{ fontFamily: 'var(--font-ui)' }}><span>{error}</span><button onClick={() => setError('')} className="font-bold">&times;</button></div>}
      {success && <div className="mb-4 py-3 px-4 bg-green-50 border border-green-200 text-green-700 text-xs" style={{ fontFamily: 'var(--font-ui)' }}>{success}</div>}

      <div className="mb-6">
        <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.barber')}</label>
        <select
          value={selectedBarberId}
          onChange={(e) => setSelectedBarberId(Number(e.target.value))}
          className="w-full max-w-xs py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>
      ) : (
        <div className="bg-surface-alt border border-black/[0.04]">
          <div className="grid grid-cols-[120px_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-black/[0.04] text-[10px] text-text-tertiary uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
            <span>{t('admin.day')}</span>
            <span>{t('admin.startTime')}</span>
            <span>{t('admin.endTime')}</span>
            <span className="text-center">{t('admin.active')}</span>
          </div>
          {slots.map((slot) => (
            <div key={slot.day_of_week} className={`grid grid-cols-[120px_1fr_1fr_80px] gap-4 px-6 py-3 items-center border-b border-black/[0.04] last:border-0 ${!slot.active ? 'opacity-40' : ''}`}>
              <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-ui)' }}>
                {t(`calendar.${DAY_KEYS[slot.day_of_week]}`)}
              </span>
              <input
                type="time"
                value={slot.start_time}
                onChange={(e) => updateSlot(slot.day_of_week, 'start_time', e.target.value)}
                disabled={!slot.active}
                className="py-1.5 px-2 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris disabled:opacity-30"
                style={{ fontFamily: 'var(--font-ui)' }}
              />
              <input
                type="time"
                value={slot.end_time}
                onChange={(e) => updateSlot(slot.day_of_week, 'end_time', e.target.value)}
                disabled={!slot.active}
                className="py-1.5 px-2 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris disabled:opacity-30"
                style={{ fontFamily: 'var(--font-ui)' }}
              />
              <label className="flex items-center justify-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={slot.active}
                  onChange={(e) => updateSlot(slot.day_of_week, 'active', e.target.checked)}
                  className="w-4 h-4 accent-verdigris"
                />
              </label>
            </div>
          ))}
          <div className="px-6 py-4 border-t border-black/[0.04]">
            <button onClick={handleSave} disabled={saving} className="btn btn-primary text-xs disabled:opacity-30">
              {saving ? t('dashboard.saving') : t('common.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
