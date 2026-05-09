import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PackagesSection from './PackagesSection';

const SCENES = [
  {
    id: 'scene1',
    src: '/themes/romantic/romantic1.jpg',
    tag: '🌹 Rose Setup',
    headline: 'A World\nOf Petals',
    body: 'Thousands of fresh rose petals scatter across the floor the moment you arrive — a crimson carpet that whispers your name.',
    textPos: 'left',
  },
  {
    id: 'scene2',
    src: '/themes/romantic/romantic2.jpg',
    tag: '🕯️ Candlelit Table',
    headline: 'Candlelight\n& Gold',
    body: 'Flames dance in perfect rhythm, casting a warm amber glow across every surface. The world outside simply ceases to exist.',
    textPos: 'right',
  },
  {
    id: 'scene3',
    src: '/themes/romantic/romantic3.jpg',
    tag: '🌸 Petal Arrangement',
    headline: 'Every Petal\nWith Intent',
    body: 'Nothing is left to chance. Each arrangement is hand-crafted to create a visual poem — beauty in every single corner.',
    textPos: 'left',
  },
  {
    id: 'scene4',
    src: '/themes/romantic/romantic4.jpg',
    tag: '✨ Intimate Corner',
    headline: 'Your\nSanctuary',
    body: 'A private sanctuary designed just for the two of you. Soft strings, sweet scents, and the luxury of time standing still.',
    textPos: 'center',
    isCta: true,
  },
];

const INCLUDES = [
  'Fresh Rose Petals', '100+ Candles', 'Welcome Drinks',
  'Photo Assist', 'Private Music', 'Custom Menu',
  'Dessert Platter', 'Ambient Lighting',
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

  const handleBookNow = () => {
    navigate('/reserve/romantic');
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="sst-page" data-theme="romantic">
      <canvas ref={canvasRef} className="sst-particles" />

      <nav className="sst-nav">
        <button className="sst-nav-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="sst-nav-brand">
          <span className="sst-nav-name">Velvet Nights</span>
          <span className="sst-nav-dot">·</span>
          <span className="sst-nav-theme">Roses & Candlelight</span>
        </div>
        <button className="sst-nav-cta" onClick={handleBookNow}>Reserve — ₹4,999</button>
      </nav>

      <section className="sst-intro">
        <video className="sst-intro-video" autoPlay muted loop playsInline preload="auto">
          <source src="/themes/romantic/romantic.mp4" type="video/mp4" />
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
                <div className="sst-cta-btns" style={{ marginTop: '28px' }}>
                  <button className="sst-btn-primary" onClick={handleBookNow}>✦ Reserve Tonight</button>
                  <button className="sst-btn-ghost" onClick={() => navigate(-1)}>Back</button>
                </div>
              )}
            </div>
            <div className="sst-scene-counter">{String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}</div>
          </div>
        </section>
      ))}

      <PackagesSection themeKey="romantic" />

      <div className="sst-footer-nav">
        <button className="sst-btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
        <button className="sst-btn-primary" onClick={handleBookNow}>Reserve Now</button>
      </div>
    </div>
  );
}
