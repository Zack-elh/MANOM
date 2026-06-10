'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { useCurrency } from '@/context/CurrencyContext';
import { authFetch } from '@/lib/authFetch';

interface Service { id: number; title: string; description: string | null; duration: number; price: number; active: number; }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration: '45', price: '' });
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = () => {
    setLoading(true);
    authFetch('/api/admin/services.php')
      .then((r) => r.json())
      .then((data) => setServices(data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.title || !form.duration || !form.price) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/admin/services.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, description: form.description || null, duration: parseInt(form.duration), price: parseFloat(form.price) }),
      });
      if (res.ok) { setShowCreate(false); setForm({ title: '', description: '', duration: '45', price: '' }); fetchServices(); }
    } catch {} finally { setSaving(false); }
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    try {
      const res = await authFetch('/api/admin/services.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: form.title, description: form.description || null, duration: parseInt(form.duration), price: parseFloat(form.price) }),
      });
      if (res.ok) { setEditing(null); fetchServices(); }
    } catch {} finally { setSaving(false); }
  };

  const handleToggle = async (id: number, active: number) => {
    await authFetch('/api/admin/services.php', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active: active ? 0 : 1 }) });
    fetchServices();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.manage') + '?')) return;
    await authFetch(`/api/admin/services.php?id=${id}`, { method: 'DELETE' });
    fetchServices();
  };

  const startEdit = (s: Service) => { setEditing(s.id); setForm({ title: s.title, description: s.description || '', duration: String(s.duration), price: String(s.price) }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="section-label">{t('admin.manage')}</span>
          <h1 className="text-2xl md:text-3xl text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.services')}</h1>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setEditing(null); }} className="btn btn-primary text-xs">{showCreate ? t('common.cancel') : t('admin.addService')}</button>
      </div>

      {showCreate && (
        <div className="p-6 bg-surface-alt border border-black/[0.04] mb-8">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.createService')}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.title')}</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} /></div>
            <div><label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.description')}</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} /></div>
            <div><label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.duration')}</label><input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} /></div>
            <div><label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.priceLabel')}</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full py-2.5 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} /></div>
          </div>
          <button onClick={handleCreate} disabled={saving} className="btn btn-primary text-xs disabled:opacity-30">{saving ? t('admin.creating') : t('admin.create')}</button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="p-4 bg-surface-alt border border-black/[0.04] hover:border-black/[0.12] transition-colors">
              {editing === s.id ? (
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('admin.description')} className="py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="py-2 px-3 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
                  <div className="col-span-2 flex gap-2">
                    <button onClick={() => handleUpdate(s.id)} disabled={saving} className="btn btn-primary text-xs">{saving ? t('dashboard.saving') : t('common.save')}</button>
                    <button onClick={() => setEditing(null)} className="btn btn-secondary text-xs">{t('common.cancel')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-text-tertiary">{s.duration} {t('common.min')} · {formatPrice(s.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(s.id, s.active)} className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 ${s.active ? 'bg-verdigris/10 text-verdigris' : 'bg-black/5 text-text-tertiary'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                      {s.active ? t('admin.active') : t('admin.inactive')}
                    </button>
                    <button onClick={() => startEdit(s)} className="text-xs text-text-secondary hover:text-black" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.edit')}</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 hover:text-red-700" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.delete')}</button>
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
