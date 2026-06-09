'use client';

import React, { useState } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'James Mitchell',
    role: 'Business Executive',
    text: 'MANOM isn\'t just a barbershop — it\'s an experience. Every visit feels like stepping into a different world. The attention to detail is unmatched.',
    initials: 'JM',
  },
  {
    id: 2,
    name: 'Alexander Chen',
    role: 'Creative Director',
    text: 'I\'ve been to barbershops around the world, and MANOM stands out. The craftsmanship, the atmosphere, the conversation — everything is curated to perfection.',
    initials: 'AC',
  },
  {
    id: 3,
    name: 'Michael Torres',
    role: 'Architect',
    text: 'The fade was surgical, and the beard sculpt was art. I walked out feeling like a new man. Truly exceptional.',
    initials: 'MT',
  },
  {
    id: 4,
    name: 'Daniel Okafor',
    role: 'Entrepreneur',
    text: 'The Full Works package is worth every penny. Hot towel shave, scalp treatment, precision cut — it\'s the ultimate grooming experience.',
    initials: 'DO',
  },
];

export const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);

  return (
    <section className="bg-white" style={{ paddingTop: 'var(--spacing-section)', paddingBottom: 'var(--spacing-section)' }}>
      <div className="max-w-[640px] mx-auto text-center px-6 md:px-10">
        <span className="section-label">Testimonials</span>
        <h2
          className="text-3xl md:text-5xl lg:text-[3.5rem] text-black mb-16"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          What They Say
        </h2>

        <div className="relative min-h-[260px] md:min-h-[280px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`absolute inset-0 transition-all duration-500 ${
                index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <div
                className="text-[80px] leading-none text-black/[0.06] mb-4 select-none"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                &ldquo;
              </div>
              <div
                className="text-lg md:text-xl text-black leading-[1.7] mb-8"
                style={{ fontFamily: 'var(--font-ui)', fontWeight: 400 }}
              >
                {testimonial.text}
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-verdigris/10 flex items-center justify-center">
                  <span className="text-verdigris text-xs font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>
                    {testimonial.initials}
                  </span>
                </div>
                <div>
                  <span className="text-black text-sm font-semibold block" style={{ fontFamily: 'var(--font-ui)' }}>
                    {testimonial.name}
                  </span>
                  <span className="text-text-tertiary text-xs" style={{ fontFamily: 'var(--font-ui)' }}>
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                index === current
                  ? 'bg-black w-8'
                  : 'bg-black/15 w-4 hover:bg-black/30'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
