import { lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollyMedia } from '../hooks/useScrollyMedia';

const PackagesSection = lazy(() => import('./PackagesSection'));

const BASE_SCENES = [
  {
    id: 'scene1',
    defaultSrc: '/themes/romantic/romantic1.webp',
    tag: '🌹 Rose Setup',
    headline: 'A World\nOf Petals',
    body: 'Thousands of fresh rose petals scatter across the floor the moment you arrive — a crimson carpet that whispers your name.',
    textPos: 'left',
  },
  {
    id: 'scene2',
    defaultSrc: '/themes/romantic/romantic2.webp',
    tag: '🕯️ Candlelit Table',
    headline: 'Candlelight\n& Gold',
    body: 'Flames dance in perfect rhythm, casting a warm amber glow across every surface. The world outside simply ceases to exist.',
    textPos: 'right',
  },
  {
    id: 'scene3',
    defaultSrc: '/themes/romantic/romantic3.webp',
    tag: '🌸 Petal Arrangement',
    headline: 'Every Petal\nWith Intent',
    body: 'Nothing is left to chance. Each arrangement is hand-crafted to create a visual poem — beauty in every single corner.',
    textPos: 'left',
  },
  {
    id: 'scene4',
    defaultSrc: '/themes/romantic/romantic4.webp',
    tag: '✨ Intimate Corner',
    headline: 'Your\nSanctuary',
    body: 'A private sanctuary designed just for the two of you. Soft strings, sweet scents, and the luxury of time standing still.',
    textPos: 'center',
    isCta: true,
  },
];

/* ── Heart particle system ── */
function createHearts(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 10 + 6,
    speedY: Math.random() * 0.25 + 0.08,
    speedX: (Math.random() - 0.5) * 0.12,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.015 + 0.005,
    opacity: Math.random() * 0.35 + 0.10,
    hue: Math.random() * 20 + 340,   // pinks & reds
    rotation: (Math.random() - 0.5) * 0.4,
  }));
}

function drawHeart(ctx, cx, cy, size) {
  const s = size * 0.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.4);
  ctx.bezierCurveTo(cx, cy - s * 0.2, cx - s, cy - s * 0.6, cx - s, cy + s * 0.05);
  ctx.bezierCurveTo(cx - s, cy + s * 0.6, cx, cy + s, cx, cy + s * 1.1);
  ctx.bezierCurveTo(cx, cy + s, cx + s, cy + s * 0.6, cx + s, cy + s * 0.05);
  ctx.bezierCurveTo(cx + s, cy - s * 0.6, cx, cy - s * 0.2, cx, cy + s * 0.4);
  ctx.closePath();
  ctx.fill();
}

export default function RomanticScrollytelling() {
  const navigate = useNavigate();
  const textRefs = useRef([]);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const heartsRef = useRef(createHearts(35));
  const progressRef = useRef(null);
  const { resolve } = useScrollyMedia('romantic');

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

  /* ── Canvas particle animation (hearts) ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const hearts = heartsRef.current;

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      hearts.forEach((h) => {
        h.y += h.speedY / H * 2;
        h.wobble += h.wobbleSpeed;
        h.x += Math.sin(h.wobble) * 0.0008 + h.speedX / W;

        if (h.y > 1.08) { h.y = -0.08; h.x = Math.random(); }
        if (h.x < -0.05) h.x = 1.05;
        if (h.x > 1.05) h.x = -0.05;

        ctx.save();
        ctx.globalAlpha = h.opacity;
        ctx.translate(h.x * W, h.y * H);
        ctx.rotate(h.rotation);
        ctx.fillStyle = `hsla(${h.hue}, 75%, 55%, 1)`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `hsla(${h.hue}, 80%, 50%, 0.4)`;
        drawHeart(ctx, 0, 0, h.size);
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
    <div className="sst-page" data-theme="romantic">
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
          <span className="sst-nav-theme">Roses &amp; Candlelight</span>
        </div>
      </nav>

      <section className="sst-intro" style={{ backgroundImage: `url('${resolve('scene1', '/themes/romantic/romantic1.webp')}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <video key={resolve('video', '/themes/romantic/romantic.mp4')} className="sst-intro-video" autoPlay muted loop playsInline preload="auto" poster={resolve('scene1', '/themes/romantic/romantic1.webp')}>
          <source src={resolve('video', '/themes/romantic/romantic.mp4')} type="video/mp4" />
        </video>
        <div className="sst-intro-overlay" />
        <div className="sst-intro-content">
          <span className="sst-tag">🌹 Romantic Experience</span>
          <h1 className="sst-intro-headline">Roses &<br />Candlelight</h1>
          <p className="sst-intro-sub">An evening crafted for the two of you.</p>
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
                    <span style={{ fontSize: '20px' }}>🕯️</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe0e8', fontStyle: 'italic', lineHeight: 1.5 }}>Dozens of soft candles casting a golden glow across the entire room.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🌹</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe0e8', fontStyle: 'italic', lineHeight: 1.5 }}>Lush rose petals trailed across the floor, leading to a moment you'll never forget.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🎶</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe0e8', fontStyle: 'italic', lineHeight: 1.5 }}>Soft strings and ambient music filling the air with warmth and intimacy.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>💫</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe0e8', fontStyle: 'italic', lineHeight: 1.5 }}>Every detail — the scent, the light, the space — designed for just the two of you.</span>
                  </div>
                </div>
              )}
            </div>
            <div className="sst-scene-counter">{String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}</div>
          </div>
        </section>
      ))}

      <Suspense fallback={<PackagesFallback />}>
        <PackagesSection themeKey="romantic" />
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