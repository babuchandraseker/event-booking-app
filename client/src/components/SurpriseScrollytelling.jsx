import { lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollyMedia } from '../hooks/useScrollyMedia';

const PackagesSection = lazy(() => import('./PackagesSection'));

const BASE_SCENES = [
  {
    id: 'scene1',
    defaultSrc: '/themes/surprise/surprise1.webp',
    tag: '🤫 The Setup',
    headline: 'Breathtaking\nMoments',
    body: 'A perfectly orchestrated reveal that leaves them speechless. We coordinate every detail in complete silence.',
    textPos: 'left',
  },
  {
    id: 'scene2',
    defaultSrc: '/themes/surprise/surprise2.webp',
    tag: '🥹 The Reaction',
    headline: 'Pure\nJoy',
    body: 'The exact moment they realize it was all for them. Tears of joy, laughter, and a memory that never fades.',
    textPos: 'right',
  },
  {
    id: 'scene3',
    defaultSrc: '/themes/surprise/surprise3.webp',
    tag: '✨ The Details',
    headline: 'Nothing\nLeft to Chance',
    body: 'Every balloon, every light, every note — placed with precision and love. We perfect the surprise so you can enjoy the moment.',
    textPos: 'left',
  },
  {
    id: 'scene4',
    defaultSrc: '/themes/surprise/surprise4.webp',
    tag: '🎁 Reserve Today',
    headline: 'Start Your\nMasterpiece',
    body: "Every surprise is unique. Let's start planning the one they'll talk about for years.",
    textPos: 'center',
    isCta: true,
  },
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
  const progressRef = useRef(null);
  const { resolve } = useScrollyMedia('surprise');

  const SCENES = BASE_SCENES.map((s) => ({ ...s, src: resolve(s.id, s.defaultSrc) }));

  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* ── Scroll progress bar ── */
  useEffect(() => {
    const onScroll = () => {
      if (!progressRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      progressRef.current.style.width = `${progress * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
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

  return (
    <div className="sst-page" data-theme="surprise">
      {/* Cinematic elements */}
      <div ref={progressRef} className="sst-progress-bar" />
      <div className="sst-letterbox-top" />
      <div className="sst-letterbox-bottom" />
      <canvas ref={canvasRef} className="sst-particles" />

      <nav className="sst-nav">
        <button className="sst-nav-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="sst-nav-brand">
          <span className="sst-nav-name">A WonderOne Suprise</span>
          <span className="sst-nav-dot">·</span>
          <span className="sst-nav-theme">The Grand Reveal</span>
        </div>
      </nav>

      <section className="sst-intro" style={{ backgroundImage: `url('${resolve('scene1', '/themes/surprise/surprise1.webp')}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <video key={resolve('video', '/themes/surprise/surprise.mp4')} className="sst-intro-video" autoPlay muted loop playsInline preload="auto" poster={resolve('scene1', '/themes/surprise/surprise1.webp')}>
          <source src={resolve('video', '/themes/surprise/surprise.mp4')} type="video/mp4" />
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
                <div className="sst-theme-description" style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🎊</span>
                    <span style={{ fontSize: '0.95rem', color: '#fff0c0', fontStyle: 'italic', lineHeight: 1.5 }}>Confetti bursts, popper walls, and reactions that live on camera forever.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🎁</span>
                    <span style={{ fontSize: '0.95rem', color: '#fff0c0', fontStyle: 'italic', lineHeight: 1.5 }}>Carefully wrapped surprises placed throughout the evening to keep the magic going.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🤫</span>
                    <span style={{ fontSize: '0.95rem', color: '#fff0c0', fontStyle: 'italic', lineHeight: 1.5 }}>We handle every secret detail — you just show up and watch their face light up.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>📸</span>
                    <span style={{ fontSize: '0.95rem', color: '#fff0c0', fontStyle: 'italic', lineHeight: 1.5 }}>Dramatic setups designed for that one unforgettable reveal moment on camera.</span>
                  </div>
                </div>
              )}
            </div>
            <div className="sst-scene-counter">{String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}</div>
          </div>
        </section>
      ))}

      <Suspense fallback={<PackagesFallback />}>
        <PackagesSection themeKey="surprise" />
      </Suspense>

      <div className="sst-footer-nav">
        <button className="sst-btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );
}

function PackagesFallback() {
  return (
    <section className="pkg-section pkg-section--loading" id="packages" aria-label="Loading packages" aria-busy="true">
      <div className="container">
        <div className="section-loading section-loading--packages">
          <span>Loading...</span>
        </div>
      </div>
    </section>
  );
}