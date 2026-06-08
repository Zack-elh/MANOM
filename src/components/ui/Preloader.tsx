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
          window.dispatchEvent(new Event('preloader-done'));
        },
      });

      tl.to(progress, {
        val: 100,
        duration: 2.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          if (percRef.current) percRef.current.innerText = Math.round(progress.val).toString();
          if (barRef.current) barRef.current.style.width = progress.val + '%';
        },
      })
      .to(loaderRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: 'power4.inOut',
        delay: 0.2,
      });
    }, loaderRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[999999] flex flex-col justify-between p-6 md:p-[5vw]"
      style={{ background: '#0b0b0b', color: '#f5f5f5' }}
    >
      {/* Top */}
      <div className="text-xs uppercase tracking-[0.15em] text-[#f5f5f5]/50" style={{ fontFamily: 'var(--font-ui)' }}>
        Establishing Environment
      </div>

      {/* Center - Percentage */}
      <div
        ref={percRef}
        className="text-center"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(4rem, 16vw, 14rem)',
          lineHeight: 0.8,
          fontWeight: 400,
        }}
      >
        0
      </div>

      {/* Bottom - Progress Bar */}
      <div className="w-full h-px bg-white/15 relative overflow-hidden">
        <div
          ref={barRef}
          className="absolute top-0 left-0 h-full bg-[#f5f5f5] transition-none"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
};
