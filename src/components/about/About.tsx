'use client';

import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="/images/about.jpg"
                alt="The Barber House Interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-32 h-32 md:w-48 md:h-48 border border-[#d4af37]/20 rounded-2xl" />
            <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-24 h-24 md:w-32 md:h-32 bg-[#3c6057]/10 rounded-2xl" />
          </div>

          {/* Content Side */}
          <div>
            <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-4 md:mb-6 block">Our Story</span>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl text-[#0b0b0b] mb-6 md:mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Crafted With
              <br />
              <span className="italic text-gradient-verdigris">Passion</span>
            </h2>
            <div className="space-y-5 md:space-y-6 text-[#666666]">
              <p className="text-base md:text-lg leading-relaxed">
                Founded on the belief that grooming is an art form, The Barber House
                brings together master barbers who share a dedication to perfection.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                Every detail matters — from the angle of the blade to the warmth of
                the towel. We don't just cut hair; we craft experiences that leave
                you feeling confident and refined.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-10 md:mt-12 pt-10 md:pt-12 border-t border-[#0b0b0b]/10">
              <div>
                <div className="text-2xl md:text-3xl text-[#3c6057] font-bold mb-1 md:mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  15+
                </div>
                <div className="text-[10px] md:text-sm text-[#666666] uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                  Years Experience
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl text-[#3c6057] font-bold mb-1 md:mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  50k+
                </div>
                <div className="text-[10px] md:text-sm text-[#666666] uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                  Happy Clients
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl text-[#3c6057] font-bold mb-1 md:mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  4.9
                </div>
                <div className="text-[10px] md:text-sm text-[#666666] uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
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
