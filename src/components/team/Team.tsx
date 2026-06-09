'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const barbers = [
  {
    id: 1,
    name: 'Andrew',
    specialty: 'Master Barber',
    experience: '12 years',
    image: '/images/barbers/andrew.jpg',
    description: 'Specializing in classic cuts and hot towel shaves. Andrew brings old-world precision to every client.',
  },
  {
    id: 2,
    name: 'Enrique',
    specialty: 'Style Director',
    experience: '8 years',
    image: '/images/barbers/enrique.jpg',
    description: 'Known for modern fades and creative designs. Enrique pushes the boundaries of contemporary barbering.',
  },
  {
    id: 3,
    name: 'Jack',
    specialty: 'Beard Specialist',
    experience: '10 years',
    image: '/images/barbers/jack.jpg',
    description: 'The beard whisperer. Jack transforms facial hair into works of art with surgical precision.',
  },
];

export const Team: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Image mask reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.team-mask').forEach((mask: any) => {
        gsap.to(mask, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: 1.6,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: mask,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="team" ref={sectionRef} className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-3 md:mb-4 block">The Masters</span>
          <h2
            className="text-3xl md:text-5xl lg:text-6xl text-[#0b0b0b] mb-4 md:mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Our Team
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="group cursor-pointer hover-target"
              onMouseEnter={() => setExpandedId(barber.id)}
              onMouseLeave={() => setExpandedId(null)}
            >
              {/* Image with mask reveal */}
              <div
                className="team-mask relative overflow-hidden rounded-2xl mb-4"
                style={{
                  clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                }}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={barber.image}
                    alt={barber.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/60 via-transparent to-transparent" />
                <div
                  className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 ${
                    expandedId === barber.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  <p className="text-[#f5f5f5]/80 text-sm leading-relaxed">
                    {barber.description}
                  </p>
                </div>
              </div>

              <div>
                <h3
                  className="text-xl text-[#0b0b0b] mb-1 group-hover:text-[#3c6057] transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {barber.name}
                </h3>
                <p className="text-[#3c6057] text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
                  {barber.specialty}
                </p>
                <p className="text-[#666] text-xs mt-1" style={{ fontFamily: 'var(--font-ui)' }}>
                  {barber.experience}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
