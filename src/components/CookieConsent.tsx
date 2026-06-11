'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/context';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const accepted = localStorage.getItem('manom_cookie_consent');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('manom_cookie_consent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <p className="text-xs text-white/80" style={{ fontFamily: 'var(--font-ui)' }}>
          {t('cookieConsent.text')}
        </p>
        <button onClick={accept} className="shrink-0 bg-white text-black px-5 py-2 text-xs font-medium hover:bg-white/90 transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>
          {t('cookieConsent.accept')}
        </button>
      </div>
    </div>
  );
}
