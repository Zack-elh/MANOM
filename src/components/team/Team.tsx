'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/i18n/context';

gsap.registerPlugin(ScrollTrigger);

const barberImages: Record<string, string> = {
  'Andrew': '/images/barbers/andrew.jpg',
  'Enrique': '/images/barbers/enrique.jpg',
  'Jake': '/images/barbers/jack.jpg',
}

const barberI18n: Record<string, { name: string; specialty: string; experience: string }> = {
  'Andrew': { name: 'team.andrew.name', specialty: 'team.andrew.specialty', experience: 'team.andrew.experience' },
  'Enrique': { name: 'team.enrique.name', specialty: 'team.enrique.specialty', experience: 'team.enrique.experience' },
  'Jake': { name: 'team.jake.name', specialty: 'team.jake.specialty', experience: 'team.jake.experience' },
}

interface ApiBarber {
  id: number
  name: string
  specialty: string | null
  image: string | null
}

export const Team: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [barbers, setBarbers] = useState<ApiBarber[]>([]);

  useEffect(() => {
    fetch('/api/public/barbers.php')
      .then((r) => r.json())
      .then((data) => setBarbers(data.barbers || []))
      .catch((err) => console.error('Failed to fetch barbers:', err));
  }, []);

  useEffect(() => {
    if (barbers.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.team-mask').forEach((mask) => {
        gsap.to(mask, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mask,
            start: 'top 95%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [barbers]);

  return (
    <section id="team" ref={sectionRef} className="bg-white" style={{ paddingTop: 'var(--spacing-section)', paddingBottom: 'var(--spacing-section)' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="section-label">{t('team.label')}</span>
          <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] text-black" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('team.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {barbers.map((barber) => {
            const i18n = barberI18n[barber.name];
            const image = barber.image
              ? (barber.image.includes('/') ? `/uploads/${barber.image}` : `/images/barbers/${barber.image}`)
              : (barberImages[barber.name] || '/images/barbers/andrew.jpg');
            const name = i18n ? t(i18n.name) : barber.name;
            return (
              <div key={barber.id} className="group">
                <div className="team-mask relative overflow-hidden mb-5" style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }}>
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div>
                  <h3 className="text-xl text-black mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{name}</h3>
                  <p className="text-verdigris text-xs font-semibold tracking-[0.08em] uppercase mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
                    {i18n ? t(i18n.specialty) : barber.specialty || ''}
                  </p>
                  <p className="text-text-tertiary text-xs mb-3" style={{ fontFamily: 'var(--font-ui)' }}>
                    {i18n ? t(i18n.experience) : ''}
                  </p>
                  <Link href="/auth">
                    <button className="btn-ghost flex items-center gap-2 text-sm">
                      {t('team.bookWith')} {name}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
