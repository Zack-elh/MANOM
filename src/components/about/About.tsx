'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/i18n/context';

gsap.registerPlugin(ScrollTrigger);

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const stats = [
    { number: '15+', label: t('about.stat1Label') },
    { number: '50k+', label: t('about.stat2Label') },
    { number: '3', label: t('about.stat3Label') },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-stat', {
        textContent: 0,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        stagger: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="bg-white" style={{ paddingTop: 'var(--spacing-section)', paddingBottom: 'var(--spacing-section)' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img src="/images/about.jpg" alt="MANOM Interior" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <span className="section-label">{t('about.label')}</span>
            <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] text-black mb-8 leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('about.title')}
            </h2>
            <div className="space-y-5 text-text-secondary">
              <p className="text-base leading-[1.7]" style={{ fontFamily: 'var(--font-ui)' }}>
                {t('about.description')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-black/[0.08]">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl text-verdigris font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.number}
                  </div>
                  <div className="text-[10px] md:text-xs text-text-tertiary uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
