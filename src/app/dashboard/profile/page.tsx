'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { useCurrency, Currency } from '@/context/CurrencyContext';
import { authFetch } from '@/lib/authFetch';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

const currencyLabels: Record<Currency, string> = { USD: 'USD ($)', EUR: 'EUR (€)', MAD: 'MAD' };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const { t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const auth = localStorage.getItem('manom_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setUser(parsed.user);
        setForm({ name: parsed.user.name || '', phone: parsed.user.phone || '' });
      } catch {}
    }
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await authFetch('/api/auth/me.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        const auth = localStorage.getItem('manom_auth');
        if (auth) { const parsed = JSON.parse(auth); parsed.user = data.user; localStorage.setItem('manom_auth', JSON.stringify(parsed)); }
        setMessage(t('dashboard.profileUpdated'));
      } else { setMessage(data.error || 'Failed to update'); }
    } catch { setMessage('Failed to update'); } finally { setSaving(false); }
  };

  if (loading) return <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>;
  if (!user) return null;

  return (
    <div>
      <span className="section-label">{t('dashboard.profile')}</span>
      <h1 className="text-2xl md:text-3xl text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('dashboard.yourProfile')}</h1>

      <div className="max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-verdigris/10 flex items-center justify-center">
            <span className="text-xl font-bold text-verdigris" style={{ fontFamily: 'var(--font-heading)' }}>{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-black" style={{ fontFamily: 'var(--font-ui)' }}>{user.name}</p>
            <p className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.fullName')}</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
          </div>
          <div>
            <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.emailLabel')}</label>
            <input type="email" value={user.email} disabled className="w-full py-3 border-b border-black/[0.08] text-sm text-text-tertiary bg-transparent cursor-not-allowed" style={{ fontFamily: 'var(--font-ui)' }} />
            <p className="text-[10px] text-text-tertiary mt-1" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.emailCannotChange')}</p>
          </div>
          <div>
            <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.phone')}</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t('dashboard.phonePlaceholder')} className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors placeholder:text-text-tertiary/50" style={{ fontFamily: 'var(--font-ui)' }} />
          </div>
          <div>
            <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.memberSince')}</label>
            <p className="text-sm text-text-secondary" style={{ fontFamily: 'var(--font-ui)' }}>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Currency Setting */}
          <div className="pt-4 border-t border-black/[0.08]">
            <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-3" style={{ fontFamily: 'var(--font-ui)' }}>{t('dashboard.preferredCurrency')}</label>
            <div className="flex gap-2">
              {(['USD', 'EUR', 'MAD'] as Currency[]).map((c) => (
                <button key={c} onClick={() => setCurrency(c)} className={`px-4 py-2 text-xs font-medium transition-colors ${currency === c ? 'bg-black text-white' : 'bg-surface-alt text-text-secondary hover:text-black border border-black/[0.08]'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                  {currencyLabels[c]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {message && <p className={`text-xs mt-4 ${message.includes('success') ? 'text-verdigris' : 'text-red-600'}`} style={{ fontFamily: 'var(--font-ui)' }}>{message}</p>}

        <button onClick={handleSave} disabled={saving || !form.name.trim()} className="btn btn-primary w-full mt-8 disabled:opacity-30 disabled:cursor-not-allowed">
          {saving ? t('dashboard.saving') : t('dashboard.saveChanges')}
        </button>
      </div>
    </div>
  );
}
