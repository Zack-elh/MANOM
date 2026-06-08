'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
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
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#0b0b0b]/10 px-8"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-24">
        {/* Logo - Big */}
        <Link href="/" className="flex items-center">
          <img
            src="/images/logoo.png"
            alt="MANOM"
            className="h-16 md:h-20 w-auto"
          />
        </Link>

        {/* Desktop Nav - Centered */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors hover:text-[#3c6057] ${
                scrolled ? 'text-[#0b0b0b]' : 'text-[#0b0b0b]'
              }`}
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Book Now - Right */}
        <div className="hidden lg:flex items-center">
          <Link href="/booking">
            <button
              className={`px-8 py-3 text-xs font-semibold tracking-[0.15em] uppercase border-2 transition-all duration-300 ${
                scrolled
                  ? 'border-[#0b0b0b] text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-white'
                  : 'border-[#0b0b0b] text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-white'
              }`}
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Book Now
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className={`w-6 h-0.5 bg-[#0b0b0b] transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-[#0b0b0b] transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-[#0b0b0b] transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[#0b0b0b]/10">
          <div className="px-8 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#0b0b0b] hover:text-[#3c6057] transition-colors tracking-[0.15em] uppercase"
                style={{ fontFamily: 'var(--font-ui)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link href="/booking" onClick={() => setMobileOpen(false)}>
              <button className="w-full px-8 py-3 text-xs font-semibold tracking-[0.15em] uppercase border-2 border-[#0b0b0b] text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-white transition-all mt-2">
                Book Now
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
