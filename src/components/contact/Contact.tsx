'use client'

import { useLanguage } from '@/i18n/context'

export const Contact: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section id="contact" className="bg-white" style={{ paddingTop: 'var(--spacing-section)', paddingBottom: 'var(--spacing-section)' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="section-label">{t('contact.label')}</span>
            <h2 className="text-3xl md:text-5xl text-black mb-8 leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('contact.title')}
            </h2>
            <blockquote className="text-lg md:text-xl leading-relaxed mb-8 border-l-2 pl-6" style={{ fontFamily: "'Satoshi', sans-serif", color: '#2a4a42', borderColor: '#2a4a42' }}>
              {t('contact.quote')}
            </blockquote>
            <div className="space-y-2 text-sm" style={{ fontFamily: 'var(--font-ui)', color: '#3c6057' }}>
              <p className="font-medium text-black">MANOM BarberShop</p>
              <p>{t('footer.location')}</p>
              <p>{t('footer.hours')}</p>
              <p>{t('footer.closed')}</p>
            </div>
          </div>

          <div className="relative overflow-hidden" style={{ filter: 'grayscale(1) contrast(1.1) brightness(0.95)' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d42328.6751448598!2d6.1604283!3d49.3669803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47953b20b9bf0b9d%3A0x40a5fb99a3a9fa0!2s57100%20Manom%2C%20France!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="MANOM BarberShop Location"
            />
            <div className="absolute inset-0 pointer-events-none border border-black/10" />
            <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 text-xs font-semibold tracking-widest uppercase pointer-events-none" style={{ fontFamily: 'var(--font-ui)' }}>
              MANOM BarberShop
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
