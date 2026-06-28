import { useEffect, useRef, useState, useCallback } from 'react';
import { THEME_DATA } from '../themeData';
import { API_BASE_URL } from '../config/api.js';

export default function CinematicModal({ themeKey, onClose }) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [galleryDragStart, setGalleryDragStart] = useState(null);
  const [galleryScrollStart, setGalleryScrollStart] = useState(null);
  const [activeDot, setActiveDot] = useState(0);
  // Resolved video URL: prefer scrollyMedia.video (Cloudinary) over static fallback
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState(null);

  const particlesCanvasRef = useRef(null);
  const particleAnimRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const cineVideoRef = useRef(null);
  const galleryRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const d = THEME_DATA[themeKey];

  // Fetch the live theme record from the API to get the Cloudinary video URL
  // (stored in scrollyMedia.video). Falls back to the static THEME_DATA.video
  // if the API is unavailable or hasn't been uploaded yet.
  useEffect(() => {
    if (!themeKey) return;
    // Reset to static default immediately so there's no blank flash
    setResolvedVideoSrc(d?.video || null);
    let cancelled = false;
    fetch(`${API_BASE_URL}/themes?_=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return;
        const theme = json.data.find((t) => t.id === themeKey || t.key === themeKey);
        if (!theme) return;
        // Correct fallback chain: Cloudinary > theme.videoSrc > static THEME_DATA.video
        const liveUrl = theme.scrollyMedia?.video || theme.videoSrc || d?.video || null;
        setResolvedVideoSrc(liveUrl);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [themeKey]);

  // Init particles
  const initParticles = useCallback((key) => {
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const palettes = {
      romantic: ['rgba(255,200,140,', 'rgba(220,140,80,', 'rgba(255,240,200,'],
      birthday: ['rgba(220,180,255,', 'rgba(255,200,100,', 'rgba(100,220,255,'],
      surprise: ['rgba(180,220,255,', 'rgba(255,220,120,', 'rgba(220,180,255,']
    };
    const colors = palettes[key] || palettes.romantic;

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H + H * 0.3,
      r: Math.random() * 2.2 + 0.5,
      speed: Math.random() * 0.45 + 0.1,
      drift: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.55 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      flicker: Math.random() * Math.PI * 2
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const now = Date.now() / 1000;
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(now * 0.8 + p.flicker) * 0.18;
        p.flicker += 0.012;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        const f = 0.6 + 0.4 * Math.sin(now * 3 + p.flicker);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(p.opacity * f).toFixed(2)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(p.opacity * f * 0.1).toFixed(2)})`;
        ctx.fill();
      });
      particleAnimRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });
    draw();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const stopParticles = useCallback(() => {
    if (particleAnimRef.current) {
      cancelAnimationFrame(particleAnimRef.current);
      particleAnimRef.current = null;
    }
    const canvas = particlesCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startAmbientAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      // Stop existing
      oscillatorsRef.current.forEach((o) => {
        try {
          o.stop();
        } catch {
          // ignore
        }
      });
      oscillatorsRef.current = [];

      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.04, audioCtxRef.current.currentTime + 2.5);
      gainNodeRef.current.connect(audioCtxRef.current.destination);
      [60, 120, 180, 240].forEach((f, i) => {
        const osc = audioCtxRef.current.createOscillator();
        const og = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.value = f + i * 0.3;
        og.gain.value = 0.25 - i * 0.04;
        osc.connect(og);
        og.connect(gainNodeRef.current);
        osc.start();
        oscillatorsRef.current.push(osc);
      });
    } catch {
      // ignore
    }
  }, []);

  const stopAmbientAudio = useCallback(() => {
    oscillatorsRef.current.forEach((o) => {
      try {
        o.stop();
      } catch {
        // ignore
      }
    });
    oscillatorsRef.current = [];
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.5);
    }
  }, []);

  const handleClose = useCallback(() => {
    stopParticles();
    stopAmbientAudio();
    setAudioEnabled(false);
    if (cineVideoRef.current) {
      cineVideoRef.current.pause();
      cineVideoRef.current.currentTime = 0;
    }
    document.body.style.overflow = '';
    onClose();
  }, [stopParticles, stopAmbientAudio, onClose]);

  useEffect(() => {
    if (!themeKey) return;
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    const cleanup = setTimeout(() => initParticles(themeKey), 200);
    return () => clearTimeout(cleanup);
  }, [themeKey, initParticles]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const toggleAudio = () => {
    if (!audioEnabled) {
      startAmbientAudio();
      setAudioEnabled(true);
    } else {
      stopAmbientAudio();
      setAudioEnabled(false);
    }
  };

  const handleGalleryMouseDown = (e) => {
    setGalleryDragStart(e.pageX);
    setGalleryScrollStart(galleryRef.current?.scrollLeft || 0);
  };

  const handleGalleryMouseMove = (e) => {
    if (galleryDragStart === null || !galleryRef.current) return;
    galleryRef.current.scrollLeft = galleryScrollStart - (e.pageX - galleryDragStart);
  };

  const handleGalleryMouseEnd = () => setGalleryDragStart(null);

  const handleGalleryScroll = () => {
    if (!galleryRef.current || !d) return;
    const max = galleryRef.current.scrollWidth - galleryRef.current.clientWidth;
    const pct = max > 0 ? galleryRef.current.scrollLeft / max : 0;
    setActiveDot(Math.round(pct * (d.gallery.length - 1)));
  };

  const scrollToGalleryItem = (i) => {
    if (!galleryRef.current) return;
    const imgs = galleryRef.current.querySelectorAll('.cine-gallery-img');
    if (imgs[i]) imgs[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  if (!d || !themeKey) return null;

  return (
    <div className="cine-overlay open" id="themeModal" role="dialog" aria-modal="true" aria-label="Immersive theme experience">
      {/* Cinematic video bg */}
      <div className="cine-video-bg" aria-hidden="true">
        {resolvedVideoSrc ? (
          <video
            className="cine-bg-video"
            ref={cineVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          >
            <source src={resolvedVideoSrc} type="video/mp4" />
          </video>
        ) : (
          <div
            className="cine-bg-still"
            style={d.bgFallback
              ? { display: 'block', background: `url('${d.bgFallback}') center/cover, linear-gradient(135deg,#030008,#14082a)` }
              : { display: 'block', background: 'linear-gradient(135deg,#030008 0%,#14082a 50%,#030008 100%)' }
            }
          />
        )}
        <div className="cine-vignette"></div>
        <div className="cine-gradient-bottom"></div>
        <div className="cine-gradient-left"></div>
        <div className="cine-grain" aria-hidden="true"></div>
      </div>

      {/* Particles canvas */}
      <canvas className="cine-particles" ref={particlesCanvasRef} aria-hidden="true" />

      {/* Top controls */}
      <div className="cine-top-bar">
        <div className="cine-logo-mark">A WonderOne Suprise</div>
        <div className="cine-top-actions">
          <button
            className={`cine-audio-btn${audioEnabled ? ' active' : ''}`}
            onClick={toggleAudio}
            aria-label="Toggle ambient audio"
          >
            <span className="cine-audio-icon">{audioEnabled ? '♫' : '♪'}</span>
            <span className="cine-audio-label">{audioEnabled ? 'Ambient On' : 'Ambient Off'}</span>
          </button>
          <button className="cine-close-btn" onClick={handleClose} aria-label="Close experience">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div className="cine-scroll-container" ref={scrollContainerRef}>

        {/* Hero layer */}
        <div className="cine-hero-layer">
          <div className="cine-hero-content">
            <div className="cine-tags">
              {d.tags.map(t => <span key={t} className="cine-tag">{t}</span>)}
            </div>
            <div className="cine-eyebrow">{d.label}</div>
            <h2 className="cine-title" dangerouslySetInnerHTML={{ __html: d.title.replace('\n', '<br>') }} />
            <p className="cine-tagline">{d.tagline}</p>
            <div className="cine-scroll-hint" aria-hidden="true">
              <div className="cine-scroll-line"></div>
              <span>Scroll to explore</span>
            </div>
          </div>
        </div>

        {/* Story layer */}
        <div className="cine-story-layer">
          <div className="cine-narrative">
            <div className="cine-narrative-inner">
              <div className="cine-section-label">The Experience</div>
              <p className="cine-story-text">{d.story}</p>
              <div className="cine-includes-wrap">
                <div className="cine-section-label" style={{ marginTop: '40px' }}>What's Included</div>
                <div className="cine-includes-grid">
                  {d.includes.map(inc => <div key={inc} className="cine-include-item">{inc}</div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery strip */}
          <div className="cine-gallery-wrap">
            <div className="cine-section-label" style={{ padding: '0 40px', marginBottom: '20px' }}>Inside the Room</div>
            <div
              className="cine-gallery-strip"
              ref={galleryRef}
              onMouseDown={handleGalleryMouseDown}
              onMouseMove={handleGalleryMouseMove}
              onMouseUp={handleGalleryMouseEnd}
              onMouseLeave={handleGalleryMouseEnd}
              onScroll={handleGalleryScroll}
            >
              {d.gallery.map((item, i) => (
                <div key={i} className="cine-gallery-img">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.label}
                      loading="lazy"
                      onError={e => {
                        e.target.parentElement.innerHTML = `<div class="cine-gallery-img-emoji"><span>${item.emoji || '✨'}</span><span>${item.label}</span></div>`;
                      }}
                    />
                  ) : (
                    <div className="cine-gallery-img-emoji">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="cine-gallery-dots" aria-hidden="true">
              {d.gallery.map((_, i) => (
                <div
                  key={i}
                  className={`cine-dot${activeDot === i ? ' active' : ''}`}
                  onClick={() => scrollToGalleryItem(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA Bar */}
      <div className="cine-sticky-cta">
        <div className="cine-sticky-price">
          <span className="cine-sticky-label">Starting from</span>
          <span className="cine-sticky-amount">{d.price}</span>
          <span className="cine-sticky-note">{d.priceNote}</span>
        </div>
        <div className="cine-sticky-right">
          <div className="cine-urgency" aria-live="polite">
            <span className="cine-urgency-dot"></span>
            <span>{d.urgency}</span>
          </div>
          <a
            href="#booking"
            className="cine-cta-btn"
            onClick={e => {
              handleClose();
              e.preventDefault();
              setTimeout(() => {
                const target = document.querySelector('#booking');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          >
            <span className="cine-cta-shimmer"></span>
            <span>✦</span> Reserve This Experience
          </a>
        </div>
      </div>
    </div>
  );
}
