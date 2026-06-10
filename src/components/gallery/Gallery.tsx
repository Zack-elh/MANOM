'use client'

import { useLanguage } from '@/i18n/context'

const items = [
  { id: 1, label: 'Precision Cut', image: '/images/gallery/8663131e764264cfe2b4a28951b51464.jpg' },
  { id: 2, label: 'Beard Sculpt', image: '/images/gallery/e34e8e86fcb6b5e1fbeef4bbb6759a3f.jpg' },
  { id: 3, label: 'Classic Style', image: '/images/gallery/cfa208aeb173ae8ab9d354b5f10968ef.jpg' },
  { id: 4, label: 'Modern Look', image: '/images/gallery/42f19ce49a080c96dee2899b62eddcdd.jpg' },
  { id: 5, label: 'Finishing Touch', image: '/images/gallery/1519b22600113aaa6e414032b78a2af8.jpg' },
]

const ITEM_COUNT = items.length
const ANGLE = 360 / ITEM_COUNT
const RADIUS = 280

export const Gallery: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section
      id="gallery"
      className="bg-white overflow-hidden"
    >
      {/* Heading */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10" style={{ paddingTop: 'var(--spacing-section)' }}>
        <div className="text-center mb-16">
          <span className="section-label">{t('gallery.label')}</span>
          <h2
            className="text-3xl md:text-5xl lg:text-[3.5rem] text-black"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('gallery.title')}
          </h2>
        </div>
      </div>

      {/* 3D Carousel */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: '80vh', perspective: '1000px' }}
      >
        <style>{`
          @keyframes galleryRotate {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
          .gallery-carousel {
            transform-style: preserve-3d;
            animation: galleryRotate 20s infinite linear;
          }
          .gallery-carousel:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="gallery-carousel relative w-0 h-0">
          {items.map((item, i) => (
            <figure
              key={item.id}
              className="absolute overflow-hidden border-4 border-black"
              style={{
                width: 220,
                height: 160,
                left: -110,
                top: -80,
                transform: `rotateY(${i * ANGLE}deg) translateZ(${RADIUS}px)`,
              }}
            >
              <img
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover cursor-pointer"
                style={{
                  filter: 'grayscale(1)',
                  transition: 'all 0.5s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0)'
                  e.currentTarget.style.transform = 'scale(1.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(1)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />
              <figcaption
                className="absolute bottom-0 left-0 right-0 p-2 text-center text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
