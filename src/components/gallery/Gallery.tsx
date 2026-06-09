'use client'

import { motion } from 'framer-motion'

const items = [
  { id: 1, label: 'Precision Cut', image: '/images/gallery/8663131e764264cfe2b4a28951b51464.jpg', color: '#3c6057' },
  { id: 2, label: 'Beard Sculpt', image: '/images/gallery/e34e8e86fcb6b5e1fbeef4bbb6759a3f.jpg', color: '#d4af37' },
  { id: 3, label: 'Classic Style', image: '/images/gallery/cfa208aeb173ae8ab9d354b5f10968ef.jpg', color: '#3c6057' },
  { id: 4, label: 'Modern Look', image: '/images/gallery/42f19ce49a080c96dee2899b62eddcdd.jpg', color: '#d4af37' },
  { id: 5, label: 'Finishing Touch', image: '/images/gallery/1519b22600113aaa6e414032b78a2af8.jpg', color: '#3c6057' },
]

export const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="bg-white">
      {/* Header */}
      <div className="py-12 md:py-20 text-center px-4">
        <span className="label-tag text-[#3c6057] tracking-[0.3em] mb-3 md:mb-4 block">Our Work</span>
        <h2
          className="text-3xl md:text-5xl lg:text-6xl text-[#0b0b0b]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Gallery
        </h2>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="group"
          >
            <div className="rounded-xl relative overflow-hidden cursor-pointer hover-target aspect-[4/5]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to bottom, transparent 60%, ${item.color})`, mixBlendMode: 'multiply' }}
              />
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
          </motion.div>
        ))}
      </div>
    </section>
  )
}
