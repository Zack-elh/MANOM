'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';

export const BookingCTA: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-surface-dark py-20 md:py-32">
      <div className="max-w-[720px] mx-auto text-center px-6 md:px-10">
        <span className="section-label text-white/40">{t('booking.bookAppointment')}</span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('booking.bookYourExperience')}
        </h2>
        <p className="text-white/40 text-base max-w-md mx-auto mb-10 leading-relaxed" style={{ fontFamily: 'var(--font-ui)' }}>
          {t('hero.subtitle')}
        </p>
        <Link href="/auth">
          <button className="btn btn-white text-[11px]">
            {t('hero.cta')}
          </button>
        </Link>
      </div>
    </section>
  );
};
