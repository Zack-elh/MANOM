'use client';

import React from 'react';
import Link from 'next/link';

export const BookingCTA: React.FC = () => {
  return (
    <section className="bg-surface-dark py-20 md:py-32">
      <div className="max-w-[720px] mx-auto text-center px-6 md:px-10">
        <span className="section-label text-white/40">Ready to Begin?</span>
        <h2
          className="text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Book Your
          <br />
          Experience
        </h2>
        <p className="text-white/40 text-base max-w-md mx-auto mb-10 leading-relaxed" style={{ fontFamily: 'var(--font-ui)' }}>
          Your next chapter in refined grooming starts with a single click.
        </p>
        <Link href="/auth">
          <button
            className="px-10 py-4 text-[11px] font-semibold tracking-[0.1em] uppercase bg-white text-black hover:bg-verdigris hover:text-white transition-all duration-300"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            Book Now
          </button>
        </Link>
      </div>
    </section>
  );
};
