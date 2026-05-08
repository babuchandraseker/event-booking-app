import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          intersectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    // Observe any .reveal elements already in the DOM
    const observe = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        intersectionObserver.observe(el);
      });
    };

    observe();

    // Also watch for .reveal elements added after mount (async renders)
    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}