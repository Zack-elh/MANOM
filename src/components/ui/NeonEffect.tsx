'use client';

import { useEffect } from 'react';

function injectSpans(btn: Element) {
  if (btn.querySelector('.neon-span')) return;
  for (let i = 0; i < 4; i++) {
    const span = document.createElement('span');
    span.className = 'neon-span';
    btn.appendChild(span);
  }
}

function scanAll() {
  document.querySelectorAll('.btn-primary, .btn-white').forEach(injectSpans);
}

export function NeonEffect() {
  useEffect(() => {
    scanAll();

    const observer = new MutationObserver(() => {
      scanAll();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
