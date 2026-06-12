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

export function NeonEffect() {
  useEffect(() => {
    document.querySelectorAll('.btn-primary').forEach(injectSpans);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches?.('.btn-primary')) injectSpans(node);
            node.querySelectorAll?.('.btn-primary').forEach(injectSpans);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
