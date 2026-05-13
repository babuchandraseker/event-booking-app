import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PackagesSection from './PackagesSection';

const SCENES = [
  {
    id: 'scene1',
    src: '/themes/birthday/bday1.jpeg',
    tag: '🎈 Vibrant Decor',
    headline: 'Celebrate\nIn Style',
    body: 'Vibrant balloons, custom banners, and an atmosphere charged with joy. This is where your new year begins.',
    textPos: 'left',
  },
  {
    id: 'scene2',
    src: '/themes/birthday/bday2.jpeg',
    tag: '✨ Candle Moment',
    headline: 'A Moment\nOf Magic',
    body: 'The lights dim, the candles flicker, and for one heartbeat, the world stops for you. Make a wish that lasts forever.',
    textPos: 'right',
  },
  {
    id: 'scene3',
    src: '/themes/birthday/bday3.jpeg',
    tag: '🎁 Sweet Surprises',
    headline: 'Surprises\nEverywhere',
    body: 'From hidden gifts to unexpected guests, we create a journey of delight throughout your special evening.',
    textPos: 'left',
  },
  {
    id: 'scene4',
    src: '/themes/birthday/bday4.jpeg',
    tag: '🍷 Premium Dining',
    headline: 'Elegant\nTouch',
    body: 'Sophisticated table settings and curated floral arrangements that add a touch of class to your party.',
    textPos: 'right',
  },
  {
    id: 'scene5',
    src: '/themes/birthday/bday5.jpeg',
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

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
      { threshold: 0.25, rootMargin: '-10% 0px -10% 0px' }
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

  const handleBookNow = () => {
    navigate('/reserve/birthday');
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="sst-page" data-theme="birthday">
      {/* Particle canvas (fixed, covers viewport) */}
      <canvas ref={canvasRef} className="sst-particles" />

      {/* ── NAV ── */}
      <nav className="sst-nav">
        <button className="sst-nav-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="sst-nav-brand">
          <span className="sst-nav-name">Velvet Nights</span>
          <span className="sst-nav-dot">·</span>
          <span className="sst-nav-theme">Birthday Celebration</span>
        </div>
        <button className="sst-nav-cta" onClick={handleBookNow}>Reserve — ₹6,499</button>
      </nav>

      {/* ── INTRO VIDEO ── */}
      <section className="sst-intro">
        <video className="sst-intro-video" autoPlay muted loop playsInline preload="auto">
          <source src="/themes/birthday/bday.mp4" type="video/mp4" />
        </video>
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
                <div className="sst-cta-btns" style={{ marginTop: '28px' }}>
                  <button className="sst-btn-primary" onClick={handleBookNow}>✦ Book Now</button>
                  <button className="sst-btn-ghost" onClick={() => navigate(-1)}>Back</button>
                </div>
              )}
            </div>
            <div className="sst-scene-counter">{String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}</div>
          </div>
        </section>
      ))}

      <PackagesSection themeKey="birthday" />

      <div className="sst-footer-nav">
        <button className="sst-btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
        <button className="sst-btn-primary" onClick={handleBookNow}>Reserve Now</button>
      </div>
    </div>
  );
}
