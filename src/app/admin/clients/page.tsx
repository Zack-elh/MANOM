'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { authFetch } from '@/lib/authFetch';

interface Client { id: number; name: string; email: string; phone: string | null; created_at: string; total_bookings: number; active_bookings: number; }

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { t, language } = useLanguage();

  useEffect(() => {
    setLoading(true);
    authFetch(`/api/admin/clients.php?search=${search}`)
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false));
  }, [search]);

  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-MA' : 'en-US';
  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="section-label">{t('admin.manage')}</span>
          <h1 className="text-2xl md:text-3xl text-black" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.clients')}</h1>
        </div>
        <span className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>{clients.length} {t('admin.clientsRegistered').split(' ').slice(1).join(' ')}</span>
      </div>

      {error && <div className="mb-6 py-3 px-4 bg-red-50 border border-red-200 text-red-700 text-xs" style={{ fontFamily: 'var(--font-ui)' }}>{error}<button onClick={() => setError('')} className="ml-4 font-bold">&times;</button></div>}

      <div className="mb-6">
        <input type="text" placeholder={t('admin.searchClients')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md px-4 py-2.5 border border-black/[0.08] text-sm bg-white outline-none focus:border-verdigris" style={{ fontFamily: 'var(--font-ui)' }} />
      </div>

      {loading ? (
        <div className="py-12 text-center"><p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('common.loading')}</p></div>
      ) : clients.length === 0 ? (
        <div className="py-12 text-center bg-surface-alt"><p className="text-text-secondary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{t('admin.noClients')}</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            <thead>
              <tr className="border-b border-black/[0.08]">
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.nameCol')}</th>
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.emailCol')}</th>
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.phoneCol')}</th>
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.bookingsCol')}</th>
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.activeCol')}</th>
                <th className="text-left py-3 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{t('admin.joinedCol')}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-black/[0.04] hover:bg-surface-alt transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-verdigris/10 flex items-center justify-center rounded-full">
                        <span className="text-xs font-bold text-verdigris">{c.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-text-secondary">{c.email}</td>
                  <td className="py-3 text-text-secondary">{c.phone || '—'}</td>
                  <td className="py-3">{c.total_bookings}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${c.active_bookings > 0 ? 'bg-verdigris/10 text-verdigris' : 'bg-black/5 text-text-tertiary'}`}>{c.active_bookings}</span>
                  </td>
                  <td className="py-3 text-text-tertiary text-xs">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
