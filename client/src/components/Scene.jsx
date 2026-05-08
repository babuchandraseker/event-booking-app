import { useEffect, useRef, useState } from 'react';

/**
 * Scene — full-screen scroll-driven section.
 *
 * Props:
 *   image      {string}            background image URL / imported asset
 *   children   {ReactNode|fn}      overlay content OR render prop: (visible) => ReactNode
 *   threshold  {number}            IO threshold [0-1], default 0.25
 *   className  {string}            optional extra class on outer section
 */
export default function Scene({ image, children, threshold = 0.25 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // once it's played, unobserve for perf
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <section ref={ref} style={styles.section}>
      {/* Background image layer */}
      <div
        style={{
          ...styles.bg,
          backgroundImage: `url(${image})`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(1.1)',
          transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1.4s cubic-bezier(0.16,1,0.3,1)',
        }}
        aria-hidden="true"
      />

      {/* Gradient vignette */}
      <div style={styles.vignette} aria-hidden="true" />

      {/* Grain texture overlay */}
      <div style={styles.grain} aria-hidden="true" />

      {/* Content layer — supports render prop or plain children */}
      <div style={styles.content}>
        {typeof children === 'function' ? children(visible) : children}
      </div>
    </section>
  );
}

const styles = {
  section: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#0B0B0B',
    // Snap scroll hook (parent must set scroll-snap-type)
    scrollSnapAlign: 'start',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    willChange: 'transform, opacity',
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%), ' +
      'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%)',
    pointerEvents: 'none',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
    opacity: 0.6,
    pointerEvents: 'none',
    mixBlendMode: 'overlay',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    height: '100%',
    width: '100%',
  },
};
