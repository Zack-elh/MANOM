'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, Language } from '@/i18n/context';
import { useCurrency, Currency } from '@/context/CurrencyContext';

const langLabels: Record<Language, string> = { en: 'EN', fr: 'FR', ar: 'AR' };
const currencyLabels: Record<Currency, string> = { USD: '$', EUR: '€', MAD: 'MAD' };

export const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = () => { setLangOpen(false); setCurrOpen(false); };
    if (langOpen || currOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [langOpen, currOpen]);

  const navLinks = [
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.team'), href: '#team' },
    { label: t('nav.gallery'), href: '#gallery' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md border-b border-black/[0.06]' : 'bg-transparent'
    }`}>
      <div className={`max-w-[1200px] mx-auto flex items-center justify-between px-6 md:px-10 transition-all duration-300 ${
        scrolled ? 'h-18 md:h-20' : 'h-24 md:h-28'
      }`}>
        <Link href="/" className="flex items-center shrink-0">
          <img src="/images/logoo.png" alt="MANOM" className={`w-auto transition-all duration-300 ${
            scrolled ? 'h-14 md:h-16' : 'h-18 md:h-22'
          }`} />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`text-[11px] font-medium tracking-[0.14em] uppercase transition-colors duration-300 hover:text-verdigris ${
              scrolled ? 'text-black' : 'text-white/80'
            }`} style={{ fontFamily: 'var(--font-ui)' }}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); setCurrOpen(false); }} className={`px-2 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors ${
              scrolled ? 'text-black hover:text-verdigris' : 'text-white/80 hover:text-white'
            }`} style={{ fontFamily: 'var(--font-ui)' }}>
              {langLabels[language]}
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-black/[0.08] shadow-lg min-w-[60px] z-50">
                {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
                  <button key={lang} onClick={(e) => { e.stopPropagation(); setLanguage(lang); setLangOpen(false); }} className={`block w-full text-left px-3 py-1.5 text-[10px] uppercase tracking-wider hover:bg-surface-alt transition-colors ${language === lang ? 'text-verdigris font-semibold' : 'text-black'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                    {langLabels[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className={`w-px h-3 ${scrolled ? 'bg-black/10' : 'bg-white/20'}`} />

          {/* Currency Switcher */}
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setCurrOpen(!currOpen); setLangOpen(false); }} className={`px-2 py-1 text-[10px] font-semibold tracking-wider transition-colors ${
              scrolled ? 'text-black hover:text-verdigris' : 'text-white/80 hover:text-white'
            }`} style={{ fontFamily: 'var(--font-ui)' }}>
              {currencyLabels[currency]}
            </button>
            {currOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-black/[0.08] shadow-lg min-w-[60px] z-50">
                {(['USD', 'EUR', 'MAD'] as Currency[]).map((c) => (
                  <button key={c} onClick={(e) => { e.stopPropagation(); setCurrency(c); setCurrOpen(false); }} className={`block w-full text-left px-3 py-1.5 text-[10px] uppercase tracking-wider hover:bg-surface-alt transition-colors ${currency === c ? 'text-verdigris font-semibold' : 'text-black'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                    {currencyLabels[c]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className={`w-px h-3 ${scrolled ? 'bg-black/10' : 'bg-white/20'}`} />

          <Link href="/auth">
            <button className={`btn btn-primary text-[11px] ${!scrolled ? '!bg-white !text-black' : ''}`}>
              {t('nav.bookNow')}
            </button>
          </Link>
        </div>

        <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <span className={`w-5 h-[1.5px] transition-all duration-300 ${scrolled ? 'bg-black' : 'bg-white'} ${mobileOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
          <span className={`w-5 h-[1.5px] transition-all duration-300 ${scrolled ? 'bg-black' : 'bg-white'} ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-[1.5px] transition-all duration-300 ${scrolled ? 'bg-black' : 'bg-white'} ${mobileOpen ? '-rotate-45 -translate-y-[4.5px]' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-black/[0.06]">
          <div className="px-6 py-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-black hover:text-verdigris transition-colors tracking-[0.1em] uppercase" style={{ fontFamily: 'var(--font-ui)' }} onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-black/[0.08]">
              {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`text-[10px] uppercase tracking-wider px-2 py-1 ${language === lang ? 'bg-black text-white' : 'bg-surface-alt text-text-secondary'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                  {langLabels[lang]}
                </button>
              ))}
              <span className="w-px bg-black/10" />
              {(['USD', 'EUR', 'MAD'] as Currency[]).map((c) => (
                <button key={c} onClick={() => setCurrency(c)} className={`text-[10px] uppercase tracking-wider px-2 py-1 ${currency === c ? 'bg-black text-white' : 'bg-surface-alt text-text-secondary'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                  {currencyLabels[c]}
                </button>
              ))}
            </div>
            <Link href="/auth" onClick={() => setMobileOpen(false)}>
              <button className="btn btn-primary w-full text-[11px] mt-2">
                {t('nav.bookNow')}
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
