'use client'

import { useScroll, useTransform, motion } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const ITEM_WIDTH = 340
const GAP = 30

const services = [
  {
    id: 1,
    title: 'Signature Haircut',
    description: 'Precision cut tailored to your face shape and lifestyle.',
    duration: '45 min',
    price: '$45',
    image: '/images/services/Haircut.jpg',
  },
  {
    id: 2,
    title: 'Royal Beard Sculpt',
    description: 'Expert beard shaping with hot towel treatment.',
    duration: '30 min',
    price: '$35',
    image: '/images/services/Beard sculpt.webp',
  },
  {
    id: 3,
    title: 'The Full Works',
    description: 'Our complete grooming experience.',
    duration: '90 min',
    price: '$95',
    image: '/images/services/full work.jpg',
  },
  {
    id: 4,
    title: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with premium products.',
    duration: '40 min',
    price: '$40',
    image: '/images/services/Hot Towel Shave.jpg',
  },
  {
    id: 5,
    title: 'Scalp Treatment',
    description: 'Deep cleansing scalp therapy with essential oils.',
    duration: '30 min',
    price: '$30',
    image: '/images/services/Scalp Treatment.jpg',
  },
  {
    id: 6,
    title: 'Hair Design',
    description: 'Creative line work and patterns.',
    duration: '60 min',
    price: '$55',
    image: '/images/services/Hair Design.jpg',
  },
]

export const Services: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const totalDistance = (services.length - 1) * (ITEM_WIDTH + GAP)
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalDistance])

  return (
    <section id="services">
      {/* Heading */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10" style={{ paddingTop: 'var(--spacing-section)' }}>
        <div className="text-center mb-16">
          <span className="section-label">What We Offer</span>
          <h2
            className="text-3xl md:text-5xl lg:text-[3.5rem] text-black mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Our Services
          </h2>
        </div>
      </div>

      {/* Scroll container */}
      <div ref={containerRef} className="relative" style={{ height: '300vh', backgroundColor: '#0a0a0a' }}>
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div
            className="flex items-center pl-[calc(50vw-170px)] md:pl-[calc(50vw-170px)]"
            style={{ x, gap: GAP }}
          >
            {services.map((service) => (
              <div
                key={service.id}
                className="shrink-0 bg-white overflow-hidden shadow-lg flex flex-col"
                style={{ width: ITEM_WIDTH, height: 480 }}
              >
                <div className="relative h-[200px] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className="bg-white/90 backdrop-blur-sm text-black text-xs font-semibold px-3 py-1.5"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {service.duration}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-lg text-black"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {service.title}
                    </h3>
                    <span
                      className="text-sm font-semibold text-black shrink-0 ml-4"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {service.price}
                    </span>
                  </div>
                  <p
                    className="text-text-tertiary text-sm mb-5 leading-relaxed flex-1"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {service.description}
                  </p>
                  <Link href="/auth">
                    <button
                      className="w-full py-3 text-[11px] font-semibold tracking-[0.1em] uppercase border border-black/[0.08] text-black hover:bg-black hover:text-white transition-all duration-300"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      Book Now
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
