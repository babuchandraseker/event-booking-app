import { useEffect, useRef } from 'react';

const trustStats = [
  { count: 1200, suffix: '+', label: 'Events Hosted' },
  { count: 98, suffix: '%', label: '5-Star Reviews' },
  { count: 50, suffix: '+', label: 'Add-on Options' },
  { count: 4, suffix: '', label: 'Years of Excellence' },
];

const testimonials = [
  {
    stars: '★★★★★',
    quote: 'The romantic setup completely exceeded our expectations. Every detail was thoughtful and beautiful. My partner was in tears — the best kind.',
    avatar: '💑',
    name: 'Priya & Arjun',
    event: 'Anniversary · Romantic Theme',
    delay: 1,
  },
  {
    stars: '★★★★★',
    quote: "We booked the birthday experience for our mom's 50th and she was absolutely speechless. The attention to detail was incredible. Worth every rupee!",
    avatar: '🎂',
    name: 'Karthik S.',
    event: 'Birthday · Grand Package',
    delay: 2,
  },
  {
    stars: '★★★★★',
    quote: 'Pulled off the most perfect surprise proposal with WonderOne-Suprises. They coordinated everything secretly and the reveal was absolutely cinematic.',
    avatar: '💍',
    name: 'Ravi M.',
    event: 'Proposal · Surprise Theme',
    delay: 3,
  },
];

export default function TrustSection() {
  const statRefs = useRef([]);

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
    <section className="trust-section" id="trust" aria-label="Reviews and statistics">
      <div className="container">
        <div className="trust-stats reveal">
          {trustStats.map((s, i) => (
            <div key={i} className="trust-stat">
              <div
                className="trust-stat-num"
                data-count={s.count}
                data-suffix={s.suffix}
                ref={el => statRefs.current[i] = el}
              >
                {s.count}{s.suffix}
              </div>
              <div className="trust-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="testimonials-header reveal">
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span style={{ width: '32px', height: '1px', background: 'var(--gold)', opacity: 0.6 }}></span>
            Guest Stories
          </div>
          <h2 className="section-title">Moments <em>Remembered</em></h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.name} className={`testimonial-card reveal reveal-delay-${t.delay}`}>
              <div className="testimonial-stars">{t.stars}</div>
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.avatar}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-event">{t.event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
