'use client';

import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="section-padding bg-[#0b0b0b]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="/images/about.jpg"
                alt="The Barber House Interior"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-[#d4af37]/20 rounded-2xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#3c6057]/10 rounded-2xl" />
          </div>

          {/* Content Side */}
          <div>
            <span className="label-tag text-[#d4af37] tracking-[0.3em] mb-6 block">Our Story</span>
            <h2
              className="text-5xl md:text-6xl text-[#f5f5f5] mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Crafted With
              <br />
              <span className="italic text-gradient-gold">Passion</span>
            </h2>
            <div className="space-y-6 text-[#f5f5f5]/70">
              <p className="text-lg leading-relaxed">
                Founded on the belief that grooming is an art form, The Barber House
                brings together master barbers who share a dedication to perfection.
              </p>
              <p className="text-lg leading-relaxed">
                Every detail matters — from the angle of the blade to the warmth of
                the towel. We don't just cut hair; we craft experiences that leave
                you feeling confident and refined.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/10">
              <div>
                <div className="text-3xl text-[#d4af37] font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  15+
                </div>
                <div className="text-sm text-[#f5f5f5]/50 uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                  Years Experience
                </div>
              </div>
              <div>
                <div className="text-3xl text-[#d4af37] font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  50k+
                </div>
                <div className="text-sm text-[#f5f5f5]/50 uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                  Happy Clients
                </div>
              </div>
              <div>
                <div className="text-3xl text-[#d4af37] font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  4.9
                </div>
                <div className="text-sm text-[#f5f5f5]/50 uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                  Star Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
