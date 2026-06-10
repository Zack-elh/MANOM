'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/i18n/context';

gsap.registerPlugin(ScrollTrigger);

const barbersData = [
  { id: 1, nameKey: 'team.andrew.name', specialtyKey: 'team.andrew.specialty', experienceKey: 'team.andrew.experience', image: '/images/barbers/andrew.jpg' },
  { id: 2, nameKey: 'team.enrique.name', specialtyKey: 'team.enrique.specialty', experienceKey: 'team.enrique.experience', image: '/images/barbers/enrique.jpg' },
  { id: 3, nameKey: 'team.jake.name', specialtyKey: 'team.jake.specialty', experienceKey: 'team.jake.experience', image: '/images/barbers/jack.jpg' },
];

export const Team: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
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
  }, []);

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
          {barbersData.map((barber) => {
            const name = t(barber.nameKey);
            return (
              <div key={barber.id} className="group">
                <div className="team-mask relative overflow-hidden mb-5" style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }}>
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={barber.image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div>
                  <h3 className="text-xl text-black mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{name}</h3>
                  <p className="text-verdigris text-xs font-semibold tracking-[0.08em] uppercase mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
                    {t(barber.specialtyKey)}
                  </p>
                  <p className="text-text-tertiary text-xs mb-3" style={{ fontFamily: 'var(--font-ui)' }}>
                    {t(barber.experienceKey)}
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
