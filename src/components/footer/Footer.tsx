'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#0b0b0b]/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/images/logoo.png" alt="MANOM" className="h-10 w-auto" />
            </div>
            <p className="text-[#666] text-sm leading-relaxed">
              Where traditional craftsmanship meets modern luxury.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#0b0b0b] font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['Team', 'Gallery', 'About'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-[#666] hover:text-[#3c6057] transition-colors text-sm"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-[#0b0b0b] font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
              Hours
            </h4>
            <ul className="space-y-3 text-sm text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>
              <li>Mon - Fri: 9:00 AM - 8:00 PM</li>
              <li>Saturday: 9:00 AM - 6:00 PM</li>
              <li>Sunday: 10:00 AM - 4:00 PM</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#0b0b0b] font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>
              <li>123 Luxury Lane</li>
              <li>New York, NY 10001</li>
              <li className="pt-2">
                <a href="tel:+1234567890" className="hover:text-[#3c6057] transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <a href="mailto:hello@manom.com" className="hover:text-[#3c6057] transition-colors">
                  hello@manom.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#0b0b0b]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#666] text-xs" style={{ fontFamily: 'var(--font-ui)' }}>
            &copy; {new Date().getFullYear()} MANOM. All rights reserved.
          </p>
          <p className="text-[#999] text-xs" style={{ fontFamily: 'var(--font-ui)' }}>
            Powered by Zackon
          </p>
        </div>
      </div>
    </footer>
  );
};
