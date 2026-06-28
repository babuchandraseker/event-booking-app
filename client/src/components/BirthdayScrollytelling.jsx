import { lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollyMedia } from '../hooks/useScrollyMedia';

const PackagesSection = lazy(() => import('./PackagesSection'));

const BASE_SCENES = [
  {
    id: 'scene1',
    defaultSrc: '/themes/birthday/bday1.webp',
    tag: '🎈 Vibrant Decor',
    headline: 'Celebrate\nIn Style',
    body: 'Vibrant balloons, custom banners, and an atmosphere charged with joy. This is where your new year begins.',
    textPos: 'left',
  },
  {
    id: 'scene2',
    defaultSrc: '/themes/birthday/bday2.webp',
    tag: '✨ Candle Moment',
    headline: 'A Moment\nOf Magic',
    body: 'The lights dim, the candles flicker, and for one heartbeat, the world stops for you. Make a wish that lasts forever.',
    textPos: 'right',
  },
  {
    id: 'scene3',
    defaultSrc: '/themes/birthday/bday3.webp',
    tag: '🎁 Sweet Surprises',
    headline: 'Surprises\nEverywhere',
    body: 'From hidden gifts to unexpected guests, we create a journey of delight throughout your special evening.',
    textPos: 'left',
  },
  {
    id: 'scene4',
    defaultSrc: '/themes/birthday/bday4.webp',
    tag: '🍷 Premium Dining',
    headline: 'Elegant\nTouch',
    body: 'Sophisticated table settings and curated floral arrangements that add a touch of class to your party.',
    textPos: 'right',
  },
  {
    id: 'scene5',
    defaultSrc: '/themes/birthday/bday5.webp',
    tag: '🎊 Book Now',
    headline: 'Let The\nParty Begin',
    body: 'Ready to make this birthday your best one yet? Secure your date and let us handle the magic.',
    textPos: 'center',
    isCta: true,
  },
];

/* ── Star Particle System ── */
function createStars(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 3 + 1.5,
    speedY: Math.random() * 0.3 + 0.1,
    speedX: (Math.random() - 0.5) * 0.15,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.02 + 0.01,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.01,
  }));
}

function drawStar(ctx, cx, cy, size, rotation) {
  const spikes = 4;
  const outerR = size;
  const innerR = size * 0.4;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function BirthdayScrollytelling() {
  const navigate = useNavigate();
  const textRefs = useRef([]);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const starsRef = useRef(createStars(45));
  const progressRef = useRef(null);
  const { resolve } = useScrollyMedia('birthday');

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

  /* ── Intersection Observer for text reveal ── */
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

  /* ── Canvas particle animation (stars) ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const stars = starsRef.current;

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      stars.forEach((s) => {
        s.y += s.speedY / H * 2;
        s.x += s.speedX / W * 2;
        s.twinkle += s.twinkleSpeed;
        s.rotation += s.rotSpeed;

        if (s.y > 1.05) { s.y = -0.05; s.x = Math.random(); }
        if (s.x < -0.05) s.x = 1.05;
        if (s.x > 1.05) s.x = -0.05;

        const alpha = 0.3 + Math.sin(s.twinkle) * 0.35;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = '#ffe8a0';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffe8a0';
        drawStar(ctx, s.x * W, s.y * H, s.size, s.rotation);
        ctx.shadowBlur = 0;
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
    <div className="sst-page" data-theme="birthday">
      {/* Cinematic elements */}
      <div ref={progressRef} className="sst-progress-bar" />
      <div className="sst-letterbox-top" />
      <div className="sst-letterbox-bottom" />
      <canvas ref={canvasRef} className="sst-particles" />

      {/* ── NAV ── */}
      <nav className="sst-nav">
        <button className="sst-nav-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="sst-nav-brand">
          <span className="sst-nav-name">A WonderOne Suprise</span>
          <span className="sst-nav-dot">·</span>
          <span className="sst-nav-theme">Birthday Celebration</span>
        </div>
      </nav>

      {/* ── INTRO VIDEO ── */}
      <section className="sst-intro" style={{ backgroundImage: `url('${resolve('scene1', '/themes/birthday/bday1.webp')}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {resolve('video') && (
          <video key={resolve('video')} className="sst-intro-video" autoPlay muted loop playsInline preload="auto" poster={resolve('scene1', '/themes/birthday/bday1.webp')}>
            <source src={resolve('video')} type="video/mp4" />
          </video>
        )}
        <div className="sst-intro-overlay" />
        <div className="sst-intro-content">
          <span className="sst-tag">🎂 Birthday Celebration</span>
          <h1 className="sst-intro-headline">Your<br />Special Day</h1>
          <p className="sst-intro-sub">Every birthday deserves a room that screams celebration.</p>
          <div className="sst-scroll-hint">
            <span>Scroll to explore</span>
            <div className="sst-scroll-arrow" />
          </div>
        </div>
      </section>

      {/* ── SCENES ── */}
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
                    <span style={{ fontSize: '20px' }}>🎈</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe8c0', fontStyle: 'italic', lineHeight: 1.5 }}>Vibrant balloon arches and custom banners set the mood the moment guests walk in.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🎂</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe8c0', fontStyle: 'italic', lineHeight: 1.5 }}>A candlelit cake moment crafted to stop time — just for you.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🍷</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe8c0', fontStyle: 'italic', lineHeight: 1.5 }}>Elegant dining setups with curated florals, warm lighting, and premium table dressing.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.92 }}>
                    <span style={{ fontSize: '20px' }}>🎁</span>
                    <span style={{ fontSize: '0.95rem', color: '#ffe8c0', fontStyle: 'italic', lineHeight: 1.5 }}>Hidden surprises and thoughtful touches woven throughout your entire evening.</span>
                  </div>
                </div>
              )}
            </div>
            <div className="sst-scene-counter">{String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}</div>
          </div>
        </section>
      ))}

      <Suspense fallback={<PackagesFallback />}>
        <PackagesSection themeKey="birthday" />
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