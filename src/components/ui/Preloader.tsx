'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Preloader: React.FC = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const percRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const progress = { val: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(loaderRef.current, { display: 'none' });
        },
      });

      tl.to(progress, {
        val: 100,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (percRef.current) percRef.current.innerText = Math.round(progress.val).toString();
          if (barRef.current) barRef.current.style.width = progress.val + '%';
        },
      })
      .to(loaderRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        delay: 0.1,
      });
    }, loaderRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[999999] flex flex-col justify-between p-6 md:p-10"
      style={{ background: '#0a0a0a', color: '#fafafa' }}
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-white/30" style={{ fontFamily: 'var(--font-ui)' }}>
        MANOM
      </div>

      <div
        ref={percRef}
        className="text-center"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(3rem, 14vw, 12rem)',
          lineHeight: 0.8,
          fontWeight: 400,
        }}
      >
        0
      </div>

      <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
        <div
          ref={barRef}
          className="absolute top-0 left-0 h-full bg-white/60"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
};
