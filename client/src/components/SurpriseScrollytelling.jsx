import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SCENES = [
  {
    id: 'scene1',
    src: '/themes/surprise/surprise1.jpeg',
    tag: '🤫 The Setup',
    headline: 'Breathtaking\nMoments',
    body: 'A perfectly orchestrated reveal that leaves them speechless. We coordinate every detail in complete silence.',
    textPos: 'left',
  },
  {
    id: 'scene2',
    src: '/themes/surprise/surprise2.jpeg',
    tag: '🥹 The Reaction',
    headline: 'Pure\nJoy',
    body: 'The exact moment they realize it was all for them. Tears of joy, laughter, and a memory that never fades.',
    textPos: 'right',
  },
  {
    id: 'scene3',
    src: '/themes/surprise/surprise3.jpeg',
    tag: '✨ The Details',
    headline: 'Nothing\nLeft to Chance',
    body: 'Every balloon, every light, every note — placed with precision and love. We perfect the surprise so you can enjoy the moment.',
    textPos: 'left',
  },
  {
    id: 'scene4',
    src: '/themes/surprise/surprise4.jpeg',
    tag: '🎁 Reserve Today',
    headline: 'Start Your\nMasterpiece',
    body: "Every surprise is unique. Let's start planning the one they'll talk about for years.",
    textPos: 'center',
    isCta: true,
  },
];

const INCLUDES = [
  'Stealth Setup', 'Blindfold Reveal', 'Private Location',
  'Reaction Capture', 'Secret Catering', 'Hidden Music',
  'Custom Surprise Decor', 'Complete Coordination',
];

/* ── Confetti / popper particle system ── */
const CONFETTI_COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff8c94', '#a78bfa', '#f472b6', '#fb923c',
  '#34d399', '#60a5fa', '#fbbf24',
];

function createConfetti(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    w: Math.random() * 8 + 4,
    h: Math.random() * 5 + 2,
    speedY: Math.random() * 0.3 + 0.08,
    speedX: (Math.random() - 0.5) * 0.15,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.025 + 0.008,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    opacity: Math.random() * 0.5 + 0.25,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    shape: Math.random() > 0.6 ? 'circle' : 'rect', // mix of shapes
  }));
}

export default function SurpriseScrollytelling() {
  const navigate = useNavigate();
  const textRefs = useRef([]);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const confettiRef = useRef(createConfetti(50));

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sst-text--visible');
          } else {
            entry.target.classList.remove('sst-text--visible');
          }
        });
      },
      { threshold: 0.25, rootMargin: '-10% 0px -10% 0px' }
    );
    textRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Canvas particle animation (confetti / poppers) ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const pieces = confettiRef.current;

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      pieces.forEach((p) => {
        p.y += p.speedY / H * 2;
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.001 + p.speedX / W;
        p.rotation += p.rotSpeed;

        if (p.y > 1.08) { p.y = -0.06; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x * W, p.y * H);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
      });

      animRef.current = requestAnimationFrame(loop);
    };

    loop();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = animate();
    return () => { if (cleanup) cleanup(); };
  }, [animate]);

  const handleBookNow = () => {
    navigate('/#booking');
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="sst-page" data-theme="surprise">
      <canvas ref={canvasRef} className="sst-particles" />

      <nav className="sst-nav">
        <button className="sst-nav-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="sst-nav-brand">
          <span className="sst-nav-name">WonderOne-Suprises</span>
          <span className="sst-nav-dot">·</span>
          <span className="sst-nav-theme">The Grand Reveal</span>
        </div>
        <button className="sst-nav-cta" onClick={handleBookNow}>Reserve — ₹5,999</button>
      </nav>

      <section className="sst-intro">
        <video className="sst-intro-video" autoPlay muted loop playsInline preload="auto">
          <source src="/themes/surprise/surprise.mp4" type="video/mp4" />
        </video>
        <div className="sst-intro-overlay" />
        <div className="sst-intro-content">
          <span className="sst-tag">✨ Secret Experience</span>
          <h1 className="sst-intro-headline">The Grand<br />Reveal</h1>
          <p className="sst-intro-sub">Secrecy is our specialty. Moments are our masterpiece.</p>
          <div className="sst-scroll-hint">
            <span>Scroll to explore</span>
            <div className="sst-scroll-arrow" />
          </div>
        </div>
      </section>

      {SCENES.map((scene, i) => (
        <section key={scene.id} className="sst-scene-wrapper">
          <div className="sst-scene-sticky">
            <div className="sst-scene-bg" style={{ backgroundImage: `url('${scene.src}')` }} />
            <div className="sst-scene-overlay" />
            <div
              ref={(el) => (textRefs.current[i] = el)}
              className={`sst-text sst-text--${scene.textPos}`}
            >
              <span className="sst-tag">{scene.tag}</span>
              <h2 className="sst-headline">
                {scene.headline.split('\n').map((line, j) => (
                  <span key={j}>{line}<br /></span>
                ))}
              </h2>
              <p className="sst-body">{scene.body}</p>
              {scene.isCta && (
                <div className="sst-cta-btns" style={{ marginTop: '28px' }}>
                  <button className="sst-btn-primary" onClick={handleBookNow}>✦ Reserve Secretly</button>
                  <button className="sst-btn-ghost" onClick={() => navigate(-1)}>Back</button>
                </div>
              )}
            </div>
            <div className="sst-scene-counter">{String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}</div>
          </div>
        </section>
      ))}

      <section className="sst-includes">
        <div className="sst-includes-inner">
          <p className="sst-includes-label">What's Included</p>
          <h2 className="sst-includes-title">Secrecy in <em>Every Detail</em></h2>
          <div className="sst-includes-grid">
            {INCLUDES.map((label) => (
              <div key={label} className="sst-include-card"><span>{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <div className="sst-footer-nav">
        <button className="sst-btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
        <button className="sst-btn-primary" onClick={handleBookNow}>Reserve Now</button>
      </div>
    </div>
  );
}
