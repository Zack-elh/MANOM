'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const items = [
  { id: 1, label: 'Precision Cut', image: '/images/gallery/8663131e764264cfe2b4a28951b51464.jpg', color: '#3c6057' },
  { id: 2, label: 'Beard Sculpt', image: '/images/gallery/e34e8e86fcb6b5e1fbeef4bbb6759a3f.jpg', color: '#d4af37' },
  { id: 3, label: 'Classic Style', image: '/images/gallery/cfa208aeb173ae8ab9d354b5f10968ef.jpg', color: '#3c6057' },
  { id: 4, label: 'Modern Look', image: '/images/gallery/42f19ce49a080c96dee2899b62eddcdd.jpg', color: '#d4af37' },
  { id: 5, label: 'Finishing Touch', image: '/images/gallery/1519b22600113aaa6e414032b78a2af8.jpg', color: '#3c6057' },
]

const ITEM_WIDTH = 400
const GAP = 30

export const Gallery: React.FC = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const totalDistance = (items.length - 1) * (ITEM_WIDTH + GAP)
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalDistance])

  return (
    <section id="gallery">
      {/* Header */}
      <div className="py-20 text-center bg-white">
        <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-4 block">Our Work</span>
        <h2
          className="text-5xl md:text-6xl text-[#0b0b0b]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Gallery
        </h2>
      </div>

      {/* Horizontal Scroll */}
      <div ref={containerRef} className="relative h-[300vh] bg-white">
        <div className="sticky top-0 h-screen w-[400px] mx-auto flex items-center overflow-visible">
          <motion.div className="flex gap-[30px] will-change-transform" style={{ x }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-[400px] h-[500px] rounded-xl relative overflow-hidden cursor-pointer group hover-target"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${item.image})` }}
                />

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to bottom, transparent 60%, ${item.color})`, mixBlendMode: 'multiply' }}
                />

                {/* Content */}
                <div className="absolute bottom-8 left-8 z-10">
                  <span className="text-xs font-mono block mb-2" style={{ color: item.color }}>
                    0{item.id}
                  </span>
                  <h3
                    className="text-2xl font-semibold text-[#f5f5f5] m-0"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {item.label}
                  </h3>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
