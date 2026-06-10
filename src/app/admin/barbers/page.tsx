'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { authFetch } from '@/lib/authFetch';

interface Barber { id: number; name: string; specialty: string | null; image: string | null; active: number; }

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', specialty: '', image: '' });
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  useEffect(() => { fetchBarbers(); }, []);

  const fetchBarbers = () => {
    setLoading(true);
    authFetch('/api/admin/barbers.php')
      .then((r) => r.json())
      .then((data) => setBarbers(data.barbers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/admin/barbers.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, specialty: form.specialty || null, image: form.image || null }),
      });
      if (res.ok) { setShowCreate(false); setForm({ name: '', specialty: '', image: '' }); fetchBarbers(); }
    } catch {} finally { setSaving(false); }
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    try {
      const res = await authFetch('/api/admin/barbers.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: form.name, specialty: form.specialty || null, image: form.image || null }),
      });
      if (res.ok) { setEditing(null); fetchBarbers(); }
    } catch {} finally { setSaving(false); }
  };

  const handleToggle = async (id: number, active: number) => {
    await authFetch('/api/admin/barbers.php', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active: active ? 0 : 1 }) });
    fetchBarbers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    await authFetch(`/api/admin/barbers.php?id=${id}`, { method: 'DELETE' });
    fetchBarbers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="section-label">{t('admin.manage')}</span>
          <h1 className="text-2xl md:text-3xl text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.barbers')}</h1>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setEditing(null); }} className="btn btn-primary text-xs">{showCreate ? t('common.cancel') : t('admin.addBarber')}</button>
      </div>

      {showCreate && (
        <div className="p-6 bg-surface-alt border border-black/[0.04] mb-8">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.addBarberTitle')}</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.name')}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} /></div>
            <div><label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.specialty')}</label><input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} /></div>
            <div><label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.imageUrl')}</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} /></div>
          </div>
          <button onClick={handleCreate} disabled={saving} className="btn btn-primary text-xs disabled:opacity-30">{saving ? t('admin.creating') : t('admin.addBarberCta')}</button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>
      ) : (
        <div className="space-y-2">
          {barbers.map((b) => (
            <div key={b.id} className="p-4 bg-surface-alt border border-black/[0.04] hover:border-black/[0.12] transition-colors">
              {editing === b.id ? (
                <div className="grid grid-cols-3 gap-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                  <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder={t('admin.specialty')} className="py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder={t('admin.imageUrl')} className="py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                  <div className="col-span-3 flex gap-2">
                    <button onClick={() => handleUpdate(b.id)} disabled={saving} className="btn btn-primary text-xs">{saving ? t('dashboard.saving') : t('common.save')}</button>
                    <button onClick={() => setEditing(null)} className="btn btn-secondary text-xs">{t('common.cancel')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-verdigris/10 flex items-center justify-center rounded-full">
                      <span className="text-sm font-bold text-verdigris" style={{ fontFamily: 'var(--font-heading)' }}>{b.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-xs text-text-tertiary">{b.specialty || t('admin.noSpecialty')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(b.id, b.active)} className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 ${b.active ? 'bg-verdigris/10 text-verdigris' : 'bg-black/5 text-text-tertiary'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                      {b.active ? t('admin.active') : t('admin.inactive')}
                    </button>
                    <button onClick={() => { setEditing(b.id); setForm({ name: b.name, specialty: b.specialty || '', image: b.image || '' }); }} className="text-xs text-text-secondary hover:text-black" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.edit')}</button>
                    <button onClick={() => handleDelete(b.id)} className="text-xs text-red-600 hover:text-red-700" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.delete')}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
