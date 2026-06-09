'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const MagneticCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const dot = dotRef.current;
    if (!dot) return;

    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth < 1024) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[100000] mix-blend-difference"
        style={{
          background: '#d4af37',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <style>{`
        @media (max-width: 1024px) {
          .cursor-dot { display: none !important; }
        }
      `}</style>
    </>
  );
};
