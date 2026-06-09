'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Team', href: '#team' },
    { label: 'Gallery', href: '#gallery' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-black/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className={`max-w-[1200px] mx-auto flex items-center justify-between px-6 md:px-10 transition-all duration-300 ${
        scrolled ? 'h-18 md:h-20' : 'h-24 md:h-28'
      }`}>
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/images/logoo.png"
            alt="MANOM"
            className={`w-auto transition-all duration-300 ${
              scrolled ? 'h-14 md:h-16' : 'h-18 md:h-22'
            }`}
          />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[11px] font-medium tracking-[0.14em] uppercase transition-colors duration-300 hover:text-verdigris ${
                scrolled ? 'text-black' : 'text-white/80'
              }`}
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <a href="#" className={`transition-colors duration-300 hover:text-verdigris ${
            scrolled ? 'text-black' : 'text-white/80'
          }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <Link href="/auth">
            <button
              className={`px-6 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 ${
                scrolled
                  ? 'bg-black text-white hover:bg-verdigris'
                  : 'bg-white text-black hover:bg-verdigris hover:text-white'
              }`}
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Book Now
            </button>
          </Link>
        </div>

        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-5 h-[1.5px] transition-all duration-300 ${
            scrolled ? 'bg-black' : 'bg-white'
          } ${mobileOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
          <span className={`w-5 h-[1.5px] transition-all duration-300 ${
            scrolled ? 'bg-black' : 'bg-white'
          } ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-[1.5px] transition-all duration-300 ${
            scrolled ? 'bg-black' : 'bg-white'
          } ${mobileOpen ? '-rotate-45 -translate-y-[4.5px]' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-black/[0.06]">
          <div className="px-6 py-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-black hover:text-verdigris transition-colors tracking-[0.1em] uppercase"
                style={{ fontFamily: 'var(--font-ui)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link href="/auth" onClick={() => setMobileOpen(false)}>
              <button className="w-full px-6 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase bg-black text-white hover:bg-verdigris transition-all mt-2">
                Book Now
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
