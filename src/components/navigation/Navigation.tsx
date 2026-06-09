'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const Navigation: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Barber Services', href: '#services' },
    { label: 'Team', href: '#team' },
    { label: 'Gallery', href: '#gallery' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 md:h-20 px-6 md:px-10">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/images/logoo.png"
            alt="MANOM"
            className="h-10 md:h-14 w-auto"
          />
        </Link>

        {/* Desktop Nav - Centered */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#0b0b0b] hover:text-[#3c6057] transition-colors"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side - Instagram + Book Now */}
        <div className="hidden lg:flex items-center gap-5">
          <a href="#" className="text-[#0b0b0b] hover:text-[#3c6057] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <Link href="/booking">
            <button
              className="px-6 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase border border-[#0b0b0b] text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-white transition-all duration-300"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Book Now
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col gap-1 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className={`w-5 h-[1.5px] bg-[#0b0b0b] transition-all ${mobileOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
          <span className={`w-5 h-[1.5px] bg-[#0b0b0b] transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-[1.5px] bg-[#0b0b0b] transition-all ${mobileOpen ? '-rotate-45 -translate-y-[4.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[#0b0b0b]/10">
          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-[#0b0b0b] hover:text-[#3c6057] transition-colors tracking-[0.15em] uppercase"
                style={{ fontFamily: 'var(--font-ui)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link href="/booking" onClick={() => setMobileOpen(false)}>
              <button className="w-full px-6 py-2.5 text-[11px] font-semibold tracking-[0.15em] uppercase border border-[#0b0b0b] text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-white transition-all mt-2">
                Book Now
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
