'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.4,
        delay: 3,
      })
      .from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
      }, '-=0.4');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Image - only in hero */}
      <div className="absolute inset-0">
        <img
          src="/images/hero.jpg"
          alt="MANOM"
          className="w-full h-full object-cover"
        />
      </div>

      {/* MANOM - White */}
      <h1
        ref={titleRef}
        className="relative z-10 select-none w-full text-center px-4"
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(4rem, 16vw, 14rem)',
          fontWeight: 700,
          lineHeight: 0.85,
          color: '#ffffff',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))',
        }}
      >
        MANOM
      </h1>

      {/* CTA */}
      <div ref={ctaRef} className="relative z-10 mt-12">
        <Link href="/booking">
          <button className="px-12 py-5 text-xs font-semibold tracking-[0.15em] uppercase bg-[#0b0b0b] text-white hover:bg-[#2c2c2c] transition-all duration-300" style={{ fontFamily: 'var(--font-ui)' }}>
            Book Now
          </button>
        </Link>
      </div>
    </section>
  );
};
