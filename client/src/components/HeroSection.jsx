import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function HeroSection({ onBook }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const handleScroll = () => {
      if (!video) return;
      const s = window.pageYOffset;
      if (s < window.innerHeight) video.style.transform = `translateY(${s * 0.3}px) scale(1.05)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToThemes = () => {
    const el = document.querySelector('#themes');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero relative isolate" id="home">
      <div className="hero-video-wrap" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay muted loop playsInline
          poster="/themes/romantic/romantic1.jpg"
        >
          <source src="/themes/romantic/romantic.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-overlay-bottom" aria-hidden="true" />

      {/* Ambient glow orbs */}
      <div className="hero-glow hero-glow--gold" aria-hidden="true" />
      <div className="hero-glow hero-glow--rose" aria-hidden="true" />

      <div className="hero-content">
        <motion.div className="hero-badge" {...fadeUp(0.2)}>
          <span>✦ Premium Private Events · Chennai</span>
        </motion.div>

        <motion.h1 className="hero-title" {...fadeUp(0.4)}>
          Make Moments<br />
          <em>Feel Eternal</em>
        </motion.h1>

        <motion.p className="hero-subtitle" {...fadeUp(0.6)}>
          Premium private experiences crafted for unforgettable memories.
        </motion.p>

        <motion.div className="hero-cta" {...fadeUp(0.8)}>
          <button className="btn btn-primary btn-hero" onClick={() => onBook()}>
            <span>✦</span> Book Your Day
          </button>
          <button className="btn btn-glass" onClick={scrollToThemes}>
            Explore Themes
          </button>
        </motion.div>

        <motion.div className="hero-stats" {...fadeUp(1.0)}>
          {[
            { num: '1200+', label: 'Events Hosted' },
            { num: '98%', label: '5-Star Reviews' },
            { num: '3', label: 'Signature Themes' },
          ].map((s) => (
            <motion.div
              key={s.label}
              className="hero-stat-item"
              whileHover={{ y: -3, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            >
              <div className="hero-stat-num">{s.num}</div>
              <div className="hero-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
