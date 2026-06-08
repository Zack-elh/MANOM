'use client';

import React from 'react';

const services = [
  {
    id: 1,
    title: 'Signature Haircut',
    description: 'Precision cut tailored to your face shape and lifestyle. Includes consultation, shampoo, and styling.',
    duration: '45 min',
    price: 'From $45',
    image: '/images/services/haircut.jpg',
  },
  {
    id: 2,
    title: 'Royal Beard Sculpt',
    description: 'Expert beard shaping with hot towel treatment, precision trim, and beard oil finish.',
    duration: '30 min',
    price: 'From $35',
    image: '/images/services/beard.jpg',
  },
  {
    id: 3,
    title: 'The Full Works',
    description: 'Our complete grooming experience. Haircut, beard sculpt, hot towel facial, and scalp massage.',
    duration: '90 min',
    price: 'From $95',
    image: '/images/services/full-works.jpg',
  },
  {
    id: 4,
    title: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with premium products and luxurious hot towel wrapping.',
    duration: '40 min',
    price: 'From $40',
    image: '/images/services/shave.jpg',
  },
  {
    id: 5,
    title: 'Scalp Treatment',
    description: 'Deep cleansing scalp therapy with essential oils and massage to promote healthy hair growth.',
    duration: '30 min',
    price: 'From $30',
    image: '/images/services/scalp.jpg',
  },
  {
    id: 6,
    title: 'Hair Design',
    description: 'Creative line work and patterns for the modern gentleman who wants to make a statement.',
    duration: '60 min',
    price: 'From $55',
    image: '/images/services/design.jpg',
  },
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="section-padding bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-4 block">What We Offer</span>
          <h2
            className="text-5xl md:text-6xl text-[#0b0b0b] mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Our Services
          </h2>
          <p className="text-[#666] max-w-2xl mx-auto text-lg">
            Each service is crafted with precision and delivered with the care you deserve.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="card overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <span className="gold-badge">{service.duration}</span>
                  <span className="text-[#d4af37] font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>
                    {service.price}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className="text-xl text-[#0b0b0b] mb-3 group-hover:text-[#3c6057] transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {service.title}
                </h3>
                <p className="text-[#666] text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
