'use client'

import { useScroll, useTransform, motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/i18n/context'
import { useCurrency } from '@/context/CurrencyContext'

const ITEM_WIDTH = 340
const GAP = 30

const serviceImages: Record<string, string> = {
  'Signature Haircut': '/images/services/Haircut.jpg',
  'Royal Beard Sculpt': '/images/services/Beard sculpt.webp',
  'The Full Works': '/images/services/full work.jpg',
  'Hot Towel Shave': '/images/services/Hot Towel Shave.jpg',
  'Scalp Treatment': '/images/services/Scalp Treatment.jpg',
  'Hair Design': '/images/services/Hair Design.jpg',
}

const serviceI18n: Record<string, { title: string; desc: string }> = {
  'Signature Haircut': { title: 'services.haircut.title', desc: 'services.haircut.desc' },
  'Royal Beard Sculpt': { title: 'services.beard.title', desc: 'services.beard.desc' },
  'The Full Works': { title: 'services.fullWorks.title', desc: 'services.fullWorks.desc' },
  'Hot Towel Shave': { title: 'services.shave.title', desc: 'services.shave.desc' },
  'Scalp Treatment': { title: 'services.scalp.title', desc: 'services.scalp.desc' },
  'Hair Design': { title: 'services.design.title', desc: 'services.design.desc' },
}

interface ApiService {
  id: number
  title: string
  description: string | null
  duration: number
  price: number
  image: string | null
}

export const Services: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const [services, setServices] = useState<ApiService[]>([])

  useEffect(() => {
    fetch('/api/public/services.php')
      .then((r) => r.json())
      .then((data) => setServices(data.services || []))
      .catch((err) => console.error('Failed to fetch services:', err))
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const totalDistance = Math.max(0, (services.length - 1) * (ITEM_WIDTH + GAP))
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalDistance])

  return (
    <section id="services">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10" style={{ paddingTop: 'var(--spacing-section)' }}>
        <div className="text-center mb-16">
          <span className="section-label">{t('services.label')}</span>
          <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('services.title')}
          </h2>
        </div>
      </div>

      <div ref={containerRef} className="relative" style={{ height: '300vh', backgroundColor: '#0a0a0a' }}>
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div className="flex items-center pl-[calc(50vw-170px)] md:pl-[calc(50vw-170px)]" style={{ x, gap: GAP }}>
            {services.map((service) => {
              const i18n = serviceI18n[service.title]
              const image = service.image ? `/uploads/${service.image}` : (serviceImages[service.title] || '/images/services/Haircut.jpg')
              return (
                <div key={service.id} className="shrink-0 bg-white overflow-hidden shadow-lg flex flex-col" style={{ width: ITEM_WIDTH, height: 480 }}>
                  <div className="relative h-[200px] overflow-hidden">
                    <img src={image} alt={i18n ? t(i18n.title) : service.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg text-black" style={{ fontFamily: 'var(--font-heading)' }}>
                        {i18n ? t(i18n.title) : service.title}
                      </h3>
                      <span className="text-sm font-semibold text-black shrink-0 ml-4" style={{ fontFamily: 'var(--font-ui)' }}>
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    <p className="text-text-tertiary text-sm mb-5 leading-relaxed flex-1" style={{ fontFamily: 'var(--font-ui)' }}>
                      {i18n ? t(i18n.desc) : service.description || ''}
                    </p>
                    <Link href="/auth">
                      <button className="btn btn-primary w-full text-[11px]">
                        {t('services.cta')}
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
