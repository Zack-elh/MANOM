'use client';

import React from 'react';
import Link from 'next/link';

export const BookingCTA: React.FC = () => {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden bg-white">
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-4 md:mb-6 block">Ready?</span>
        <h2
          className="text-3xl md:text-5xl lg:text-7xl text-[#0b0b0b] mb-6 md:mb-8 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Book Your
          <br />
          <span className="italic text-gradient-verdigris">Experience</span>
        </h2>
        <p className="text-[#666] text-base md:text-lg max-w-2xl mx-auto mb-8 md:mb-12">
          Your next chapter in refined grooming starts with a single click.
          Select your service, choose your barber, and step into luxury.
        </p>
        <Link href="/booking">
          <button className="btn-primary px-8 md:px-12 py-4 md:py-5 text-xs md:text-sm">
            Book Now
          </button>
        </Link>
      </div>
    </section>
  );
};
