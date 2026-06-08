'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const MagneticCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Hide on mobile
    if (window.innerWidth < 1024) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
    };

    const tick = () => {
      ringPos.current.x += (mouseRef.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mouseRef.current.y - ringPos.current.y) * 0.15;
      gsap.set(ring, { x: ringPos.current.x, y: ringPos.current.y });
    };

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, .hover-target').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          ring.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
          ring.classList.remove('active');
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    gsap.ticker.add(tick);

    // Re-check hover listeners periodically for dynamically added elements
    addHoverListeners();
    const interval = setInterval(addHoverListeners, 2000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(tick);
      clearInterval(interval);
    };
  }, []);

  // Don't render on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 1024) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[100000] mix-blend-difference"
        style={{
          background: '#d4af37',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] flex items-center justify-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: 45,
          height: 45,
          border: '1px solid rgba(28, 26, 23, 0.3)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <style>{`
        .cursor-ring.active {
          width: 90px !important;
          height: 90px !important;
          background-color: #0b0b0b !important;
          border-color: transparent !important;
        }
        @media (max-width: 1024px) {
          .cursor-ring, .cursor-dot { display: none !important; }
        }
      `}</style>
    </>
  );
};
