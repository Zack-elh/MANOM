'use client';

import React from 'react';
import Link from 'next/link';

export const BookingCTA: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-[#f5f5f5]">
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-6 block">Ready?</span>
        <h2
          className="text-5xl md:text-7xl text-[#0b0b0b] mb-8 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Book Your
          <br />
          <span className="italic text-gradient-verdigris">Experience</span>
        </h2>
        <p className="text-[#666] text-lg max-w-2xl mx-auto mb-12">
          Your next chapter in refined grooming starts with a single click.
          Select your service, choose your barber, and step into luxury.
        </p>
        <Link href="/booking">
          <button className="btn-primary px-12 py-5 text-sm">
            Book Now
          </button>
        </Link>
      </div>
    </section>
  );
};
