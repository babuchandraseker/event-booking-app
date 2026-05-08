import { useEffect, useRef } from 'react';

const stats = [
  { count: 1200, suffix: '+', label: 'Events Hosted' },
  { count: 98, suffix: '%', label: '5-Star Reviews' },
  { count: 3, suffix: '', label: 'Signature Themes' },
  { count: 50, suffix: '+', label: 'Add-on Options' },
];

export default function HeroSection() {
  const statRefs = useRef([]);

  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Parallax on scroll
  useEffect(() => {
    const video = document.querySelector('.hero-video');
    const handleScroll = () => {
      if (!video) return;
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        video.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const duration = 1800;
        const step = target / (duration / 16);
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current).toLocaleString('en-IN') + suffix;
          if (current >= target) clearInterval(interval);
        }, 16);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    statRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" id="home" aria-label="Hero">
      <div className="hero-video-wrap" aria-hidden="true">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/themes/romantic/romantic1.jpg"
        >
          <source src="/themes/romantic/romantic.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="hero-overlay" aria-hidden="true"></div>
      <div className="hero-overlay-bottom" aria-hidden="true"></div>

      <div className="hero-content">
        

        <h1 className="hero-title">
          Moments That<br />
          <strong>Live Forever</strong>
        </h1>

        <p className="hero-subtitle">
          Curated private experiences for the ones who matter most.
          From candlelit romance to grand celebrations — we craft the extraordinary.
        </p>

        <div className="hero-cta">
          <a href="#booking" className="btn btn-primary" onClick={e => handleAnchorClick(e, '#booking')}>
            <span>✦</span> Book Your Experience
          </a>
          <a href="#themes" className="btn btn-outline" onClick={e => handleAnchorClick(e, '#themes')}>
            Explore Themes
          </a>
        </div>

        <div className="hero-stats">
          {stats.map((s, i) => (
            <div key={i}>
              <div
                className="hero-stat-num"
                data-count={s.count}
                data-suffix={s.suffix}
                ref={el => statRefs.current[i] = el}
              >
                0{s.suffix}
              </div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        <div className="scroll-line"></div>
        <span>Scroll</span>
      </div>
    </section>
  );
}
