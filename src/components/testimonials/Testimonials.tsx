'use client';

import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'James Mitchell',
    role: 'Business Executive',
    text: 'The Barber House isn\'t just a barbershop — it\'s an experience. Every visit feels like stepping into a different world. The attention to detail is unmatched.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Alexander Chen',
    role: 'Creative Director',
    text: 'I\'ve been to barbershops around the world, and The Barber House stands out. The craftsmanship, the atmosphere, the conversation — everything is curated to perfection.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Torres',
    role: 'Architect',
    text: 'Costa transformed my look completely. The fade was surgical, and the beard sculpt was art. I walked out feeling like a new man. Truly exceptional.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Daniel Okafor',
    role: 'Entrepreneur',
    text: 'The Full Works package is worth every penny. Hot towel shave, scalp treatment, precision cut — it\'s the ultimate grooming experience. I\'m a client for life.',
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding bg-[#f5f5f5]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-4 block">Testimonials</span>
        <h2
          className="text-5xl md:text-6xl text-[#0b0b0b] mb-16"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          What They Say
        </h2>

        {/* Testimonial */}
        <div className="relative min-h-[280px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`absolute inset-0 transition-all duration-700 ${
                index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
              }`}
            >
              {/* Quote */}
              <div className="text-2xl md:text-3xl text-[#0b0b0b] leading-relaxed mb-10 italic" style={{ fontFamily: 'var(--font-heading)' }}>
                &ldquo;{testimonial.text}&rdquo;
              </div>

              {/* Author */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-px bg-[#d4af37]" />
                <span className="text-[#0b0b0b] font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>
                  {testimonial.name}
                </span>
                <span className="text-[#666] text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
                  {testimonial.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === current
                  ? 'bg-[#d4af37] w-8'
                  : 'bg-[#ccc] hover:bg-[#999]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
