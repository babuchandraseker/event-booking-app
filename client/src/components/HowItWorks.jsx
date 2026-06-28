import { useRef, useEffect, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const SERIF = 'var(--font-display, "Playfair Display", "Cormorant Garamond", Georgia, serif)'
const SANS  = 'var(--font-body, "Inter", "Plus Jakarta Sans", system-ui, sans-serif)'
const GOLD  = { background: 'linear-gradient(135deg, #FFF0C0 0%, #D7AC28 42%, #B8860B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
const GOLD_RICH = { background: 'linear-gradient(135deg, #FFE97D 0%, #D7AC28 50%, #A07000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
const GOLD_HEX = '#D7AC28'

// ─── Step Data ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01', label: 'STEP 01',
    title: 'Choose Experience',
    subtitle: 'Discover Your Story',
    emoji: '✦',
    icon: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4L23.4 14H34L25.3 20.2 28.7 30.2 20 24 11.3 30.2 14.7 20.2 6 14H16.6Z" fill="rgba(215,172,40,0.9)" stroke="rgba(215,172,40,0.4)" strokeWidth="0.8"/>
        <circle cx="20" cy="20" r="4" stroke="rgba(255,235,120,0.5)" strokeWidth="1" fill="rgba(215,172,40,0.12)"/>
        <path d="M20 8v2M20 30v2M8 20h2M30 20h2" stroke="rgba(215,172,40,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="1.5" fill="rgba(255,240,140,0.8)"/>
      </svg>
    ),
    desc: 'Browse our signature themes — Romantic, Birthday, or Surprise — and choose the world that matches your moment. Each is a fully designed atmosphere crafted for unforgettable celebrations.',
    bullets: ['View cinematic theme previews', 'Explore real celebration galleries', 'Find the story that speaks to you'],
    glow: 'rgba(215,172,40,0.35)',
    accent: 'rgba(215,172,40,0.08)',
    hint: 'Romantic · Birthday · Surprise',
    orb: 'rgba(215,172,40,0.055)',
  },
  {
    num: '02', label: 'STEP 02',
    title: 'Customize Setup',
    subtitle: 'Craft Every Detail',
    emoji: '◈',
    icon: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 12L30 10 15 25 13 31l7-2L32 12Z" stroke="rgba(215,172,40,0.95)" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(215,172,40,0.08)"/>
        <path d="M10 32h20" stroke="rgba(215,172,40,0.35)" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="29" cy="13" r="3" fill="rgba(215,172,40,0.55)" stroke="rgba(255,230,100,0.4)" strokeWidth="0.8"/>
        <path d="M17 21l2 2" stroke="rgba(255,240,120,0.7)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M7 10C9 8 11 9 12 11" stroke="rgba(215,172,40,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M6 20C5 16 7 13 10 12" stroke="rgba(215,172,40,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    desc: 'Select your preferred package tier, then layer in personal add-ons — florals, photography, custom cakes, ambient fog, and more. Every detail tuned to your vision.',
    bullets: ['Choose from curated packages', 'Add florals, cake, DJ & more', 'Personalize décor to your taste'],
    glow: 'rgba(130,56,200,0.35)',
    accent: 'rgba(130,56,200,0.07)',
    hint: 'Florals · Cakes · Ambience · More',
    orb: 'rgba(130,56,200,0.06)',
  },
  {
    num: '03', label: 'STEP 03',
    title: 'Confirm Booking',
    subtitle: 'Secure Your Date',
    emoji: '⊹',
    icon: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="9" width="26" height="23" rx="4" stroke="rgba(215,172,40,0.9)" strokeWidth="1.5" fill="rgba(215,172,40,0.06)"/>
        <path d="M7 17h26" stroke="rgba(215,172,40,0.4)" strokeWidth="1.3"/>
        <path d="M14 7v4M26 7v4" stroke="rgba(215,172,40,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 25l4 4 10-10" stroke="rgba(255,235,100,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    desc: 'Pick your date, share a few details, and we\'ll take care of everything else. Our team handles all planning, coordination, and timing so you can simply look forward to your big day.',
    bullets: ['Select your perfect date', 'Quick & secure confirmation', 'Hassle-free planning'],
    glow: 'rgba(215,172,40,0.28)',
    accent: 'rgba(215,172,40,0.06)',
    hint: 'Easy · Secure · Stress-free',
    orb: 'rgba(100,40,180,0.055)',
  },
  {
    num: '04', label: 'STEP 04',
    title: 'Experience Magic',
    subtitle: 'Live the Moment',
    emoji: '✶',
    icon: (
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6C20 6 30 12 32 20C34 28 27 35 20 36C13 35 6 28 8 20C10 12 20 6 20 6Z" stroke="rgba(215,172,40,0.85)" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(215,172,40,0.07)"/>
        <path d="M20 13V23" stroke="rgba(215,172,40,0.6)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M15 18H25" stroke="rgba(215,172,40,0.6)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M14 9L11 6M26 9L29 6M20 6V3" stroke="rgba(255,230,100,0.65)" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="20" cy="23" r="3.2" stroke="rgba(215,172,40,0.8)" strokeWidth="1.3" fill="rgba(215,172,40,0.14)"/>
        <circle cx="20" cy="23" r="1.2" fill="rgba(255,245,140,0.85)"/>
      </svg>
    ),
    desc: 'Walk into a breathtaking setup designed just for you. We manage every detail behind the scenes so you can be fully present, celebrate deeply, and create memories that last forever.',
    bullets: ['We handle the full setup', 'You enjoy every moment', 'Memories that last a lifetime'],
    glow: 'rgba(180,100,240,0.32)',
    accent: 'rgba(180,100,240,0.07)',
    hint: 'Grand Reveal · Pure Joy · Forever',
    orb: 'rgba(180,100,240,0.06)',
  },
]

const METRICS = [
  { value: 500, suffix: '+', label: 'Magical Surprises', icon: '✦' },
  { value: 98,  suffix: '%', label: 'Happy Couples',     icon: '◈' },
  { value: 24,  suffix: '/7', label: 'Dedicated Support', icon: '⊹' },
  { value: 100, suffix: '%', label: 'Premium Service',   icon: '✶' },
]

// ─── Floating Particles ───────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const count = Math.max(50, Math.floor((canvas.width * canvas.height) / 12000))
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      dx: (Math.random() - 0.5) * 0.18,
      dy: -(Math.random() * 0.2 + 0.05),
      alpha: Math.random() * 0.45 + 0.08,
      gold: Math.random() > 0.32,
      pulse: Math.random() * Math.PI * 2,
      diamond: Math.random() > 0.55,
    }))
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.pulse += 0.006
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        if (p.diamond) {
          const s = p.r * 1.6
          ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s * 0.58, p.y)
          ctx.lineTo(p.x, p.y + s); ctx.lineTo(p.x - s * 0.58, p.y)
          ctx.closePath()
        } else { ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2) }
        ctx.fillStyle = p.gold ? `rgba(215,172,40,${a})` : `rgba(120,60,210,${a * 0.5})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.y < -8) { p.y = canvas.height + 8; p.x = Math.random() * canvas.width }
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return (
    <canvas ref={canvasRef} aria-hidden style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  )
}

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ target, suffix, inView }) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const ctrl = animate(0, target, {
      duration: 2.4, ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setVal(Math.round(v)),
    })
    return () => ctrl.stop()
  }, [inView, target])
  return (
    <span style={{ fontFamily: SERIF, fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', fontWeight: 400, ...GOLD_RICH }}>
      {val}{suffix}
    </span>
  )
}

// ─── Desktop Connector ────────────────────────────────────────────────────────
function Connector({ index, inView }) {
  return (
    <div style={{ flex: '0 0 52px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
      <motion.div
        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.0, delay: 0.6 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: 1, transformOrigin: 'left',
          background: 'linear-gradient(90deg, rgba(215,172,40,0.55), rgba(215,172,40,0.15))',
          boxShadow: '0 0 6px rgba(215,172,40,0.25)',
        }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.45, delay: 1.1 + index * 0.15 }}
        style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0, zIndex: 3,
          border: '1px solid rgba(215,172,40,0.45)',
          background: 'radial-gradient(circle, rgba(215,172,40,0.18) 0%, rgba(5,3,14,0.95) 65%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(215,172,40,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5h7M6.5 2.5l3 3-3 3" stroke="rgba(215,172,40,0.95)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </div>
  )
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ step, index, inView }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 52, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.85, delay: 0.2 + index * 0.13, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 0', minWidth: 0, position: 'relative',
        background: hovered
          ? 'linear-gradient(160deg, rgba(20,12,48,0.99) 0%, rgba(12,7,32,0.98) 100%)'
          : 'linear-gradient(160deg, rgba(14,8,36,0.97) 0%, rgba(8,5,22,0.95) 100%)',
        border: `1px solid ${hovered ? 'rgba(215,172,40,0.58)' : 'rgba(215,172,40,0.2)'}`,
        borderRadius: 24,
        padding: '34px 24px 28px',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        boxShadow: hovered
          ? `0 44px 96px rgba(0,0,0,0.82), 0 0 70px ${step.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 20px 56px rgba(0,0,0,0.62), 0 0 2px rgba(215,172,40,0.08), inset 0 1px 0 rgba(255,255,255,0.035)`,
        transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'default', overflow: 'hidden',
      }}
    >
      {/* Top shimmer bar */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
        background: hovered
          ? 'linear-gradient(90deg, transparent, rgba(215,172,40,0.85), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(215,172,40,0.32), transparent)',
        transition: 'all 0.45s ease',
      }} />
      {/* Left edge accent */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, top: '10%', bottom: '10%', width: 2.5, borderRadius: '0 3px 3px 0',
        background: hovered
          ? `linear-gradient(to bottom, transparent, ${step.glow}, transparent)`
          : 'linear-gradient(to bottom, transparent, rgba(215,172,40,0.2), transparent)',
        transition: 'all 0.45s ease',
      }} />
      {/* Bottom edge accent */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: '12%', right: '12%', height: 1,
        background: hovered
          ? `linear-gradient(90deg, transparent, ${step.glow}, transparent)`
          : 'transparent',
        transition: 'all 0.45s ease',
      }} />
      {/* Corner radial glow */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, right: 0, width: 160, height: 160,
        background: `radial-gradient(ellipse at 90% 10%, ${step.accent} 0%, transparent 65%)`,
        pointerEvents: 'none', opacity: hovered ? 2 : 1, transition: 'opacity 0.45s ease',
      }} />
      {/* Bottom center glow on hover */}
      {hovered && (
        <div aria-hidden style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '50%',
          background: `radial-gradient(ellipse at 50% 100%, ${step.glow.replace('0.35','0.07')} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
      {/* Watermark number */}
      <div aria-hidden style={{
        position: 'absolute', top: 8, right: 14,
        fontFamily: SERIF, fontSize: '5rem', fontWeight: 700,
        color: hovered ? 'rgba(215,172,40,0.1)' : 'rgba(215,172,40,0.05)',
        lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        transition: 'color 0.4s ease',
      }}>
        {step.num}
      </div>

      {/* Step label */}
      <div style={{
        fontFamily: SANS, fontSize: '0.5rem', fontWeight: 800,
        letterSpacing: '0.4em', textTransform: 'uppercase',
        color: 'rgba(215,172,40,0.58)', marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <span style={{
          display: 'inline-block', width: 18, height: 1,
          background: 'rgba(215,172,40,0.38)',
        }} />
        {step.label}
      </div>

      {/* Icon container */}
      <motion.div
        animate={hovered ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 64, height: 64, borderRadius: 20, marginBottom: 22,
          border: `1px solid ${hovered ? 'rgba(215,172,40,0.58)' : 'rgba(215,172,40,0.24)'}`,
          background: hovered
            ? `linear-gradient(145deg, rgba(215,172,40,0.12), ${step.accent})`
            : `linear-gradient(145deg, rgba(215,172,40,0.06), rgba(0,0,0,0.22))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hovered
            ? `0 0 32px ${step.glow}, 0 0 12px ${step.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`
            : `0 0 12px rgba(215,172,40,0.06), inset 0 1px 0 rgba(255,255,255,0.03)`,
          transition: 'all 0.45s ease', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Icon inner glow */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: `radial-gradient(circle at 40% 35%, ${step.accent.replace('0.07','0.18')} 0%, transparent 68%)`,
          opacity: hovered ? 1 : 0, transition: 'opacity 0.45s ease',
        }} />
        {step.icon}
      </motion.div>

      {/* Gold ornament divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(215,172,40,0.45), transparent)' }} />
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: hovered ? '#D7AC28' : 'rgba(215,172,40,0.5)',
          boxShadow: hovered ? '0 0 10px #D7AC28, 0 0 4px #D7AC28' : 'none',
          transition: 'all 0.38s',
        }} />
        <div style={{ width: 22, height: 1, background: 'linear-gradient(90deg, rgba(215,172,40,0.3), transparent)' }} />
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: SERIF, fontSize: 'clamp(1.12rem, 1.55vw, 1.32rem)',
        fontWeight: 400, color: hovered ? '#F5EDD8' : '#EDE8E2',
        marginBottom: 5, lineHeight: 1.26, letterSpacing: '0.01em',
        transition: 'color 0.35s ease',
      }}>
        {step.title}
      </h3>

      {/* Subtitle */}
      <p style={{
        fontFamily: SANS, fontSize: '0.58rem', fontWeight: 700,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: hovered ? 'rgba(215,172,40,0.62)' : 'rgba(215,172,40,0.46)',
        marginBottom: 14, transition: 'color 0.35s',
      }}>
        {step.subtitle}
      </p>

      {/* Description */}
      <p style={{
        fontFamily: SANS, fontSize: '0.73rem', lineHeight: 1.72,
        color: 'rgba(165,155,148,0.88)', marginBottom: 18,
      }}>
        {step.desc}
      </p>

      {/* Bullets */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {step.bullets.map((b, bi) => (
          <li key={bi} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: SANS, fontSize: '0.7rem',
            color: hovered ? 'rgba(215,172,40,0.82)' : 'rgba(215,172,40,0.68)',
            transition: 'color 0.35s',
          }}>
            <span style={{
              width: 4.5, height: 4.5, borderRadius: '50%', flexShrink: 0,
              background: hovered ? '#D7AC28' : 'rgba(215,172,40,0.5)',
              boxShadow: hovered ? '0 0 7px rgba(215,172,40,0.7)' : 'none',
              transition: 'all 0.38s',
            }} />
            {b}
          </li>
        ))}
      </ul>

      {/* Hint tag */}
      <div style={{
        fontFamily: SANS, fontSize: '0.57rem', letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: hovered ? 'rgba(215,172,40,0.44)' : 'rgba(215,172,40,0.3)',
        borderTop: `1px solid ${hovered ? 'rgba(215,172,40,0.18)' : 'rgba(215,172,40,0.1)'}`,
        paddingTop: 13, marginTop: 2,
        transition: 'all 0.38s',
      }}>
        <span style={{ marginRight: 6, opacity: 0.7 }}>{step.emoji}</span>
        {step.hint}
      </div>
    </motion.div>
  )
}

// ─── Progress Indicator ───────────────────────────────────────────────────────
function ProgressBar({ inView }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.2 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, marginBottom: 32, position: 'relative', zIndex: 2,
      }}
    >
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1px solid rgba(215,172,40,0.42)',
              background: 'radial-gradient(circle, rgba(215,172,40,0.12) 0%, rgba(5,3,14,0.9) 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SANS, fontSize: '0.55rem', fontWeight: 800,
              color: 'rgba(215,172,40,0.88)', letterSpacing: '0.04em',
              boxShadow: '0 0 18px rgba(215,172,40,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {s.num}
          </motion.div>
          {i < STEPS.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.55 + i * 0.1 }}
              style={{
                width: 72, height: 1, transformOrigin: 'left',
                background: 'linear-gradient(90deg, rgba(215,172,40,0.5), rgba(215,172,40,0.12))',
                boxShadow: '0 0 4px rgba(215,172,40,0.2)',
              }}
            />
          )}
        </div>
      ))}
    </motion.div>
  )
}

// ─── Desktop Journey ──────────────────────────────────────────────────────────
function DesktopJourney({ inView }) {
  return (
    <div style={{ position: 'relative' }}>
      <ParticleField />
      {/* Ambient orbs */}
      <div aria-hidden style={{
        position: 'absolute', top: '10%', left: '5%', width: '32%', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(215,172,40,0.05) 0%, transparent 70%)',
        filter: 'blur(90px)', pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: '10%', right: '5%', width: '32%', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,50,220,0.06) 0%, transparent 70%)',
        filter: 'blur(90px)', pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)',
        width: '40%', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(215,172,40,0.035) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />
      <ProgressBar inView={inView} />
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, position: 'relative', zIndex: 2 }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'stretch', flex: '1 1 0', minWidth: 0 }}>
            <StepCard step={step} index={i} inView={inView} />
            {i < STEPS.length - 1 && <Connector index={i} inView={inView} />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mobile Timeline ──────────────────────────────────────────────────────────
function MobileTimeline({ inView }) {
  return (
    <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', padding: '0 2px' }}>
      {/* Vertical glow line */}
      <motion.div
        aria-hidden
        initial={{ scaleY: 0, opacity: 0 }}
        animate={inView ? { scaleY: 1, opacity: 1 } : {}}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', left: 29, top: 25, bottom: 25, width: 1.5,
          background: 'linear-gradient(to bottom, rgba(215,172,40,0.75), rgba(215,172,40,0.15) 90%, transparent)',
          transformOrigin: 'top', zIndex: 0,
          boxShadow: '0 0 8px rgba(215,172,40,0.25)',
        }}
      />
      {/* Blur glow behind line */}
      <div aria-hidden style={{
        position: 'absolute', left: 24, top: 25, bottom: 25, width: 12,
        background: 'linear-gradient(to bottom, rgba(215,172,40,0.14), rgba(215,172,40,0.04))',
        filter: 'blur(5px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.72, delay: 0.2 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}
          >
            {/* Medallion */}
            <div style={{
              flexShrink: 0, width: 60, height: 60, borderRadius: '50%',
              border: '1px solid rgba(215,172,40,0.45)',
              background: 'radial-gradient(circle at 40% 35%, rgba(215,172,40,0.1) 0%, rgba(6,3,16,0.98) 70%)',
              boxShadow: '0 0 32px rgba(215,172,40,0.18), inset 0 1px 0 rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
              <div style={{ transform: 'scale(0.92)' }}>{step.icon}</div>
              <span style={{
                fontFamily: SANS, fontSize: '0.38rem', fontWeight: 800,
                letterSpacing: '0.22em', color: 'rgba(215,172,40,0.55)', textTransform: 'uppercase',
              }}>{step.num}</span>
            </div>

            {/* Card */}
            <div style={{
              flex: 1, minWidth: 0,
              background: 'linear-gradient(148deg, rgba(15,9,38,0.99) 0%, rgba(9,5,24,0.97) 100%)',
              border: '1px solid rgba(215,172,40,0.2)',
              borderRadius: 20, padding: '20px 18px 22px',
              backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              boxShadow: `0 16px 48px rgba(0,0,0,0.62), 0 0 32px ${step.glow.replace('0.35','0.12')}, inset 0 1px 0 rgba(255,255,255,0.04)`,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Top shimmer */}
              <div aria-hidden style={{
                position: 'absolute', top: 0, left: '6%', right: '6%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(215,172,40,0.42), transparent)',
              }} />
              {/* Corner spot */}
              <div aria-hidden style={{
                position: 'absolute', top: 0, right: 0, width: 100, height: 100,
                background: `radial-gradient(ellipse at 90% 10%, ${step.accent}, transparent 68%)`,
                pointerEvents: 'none',
              }} />
              {/* Step label */}
              <div style={{
                fontFamily: SANS, fontSize: '0.47rem', fontWeight: 800,
                letterSpacing: '0.35em', color: 'rgba(215,172,40,0.55)',
                textTransform: 'uppercase', marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ display: 'inline-block', width: 14, height: 1, background: 'rgba(215,172,40,0.35)' }} />
                {step.label}
              </div>
              <h3 style={{
                fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 400,
                color: '#EDE8E2', marginBottom: 3, lineHeight: 1.24,
              }}>{step.title}</h3>
              <p style={{
                fontFamily: SANS, fontSize: '0.55rem', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(215,172,40,0.46)', marginBottom: 11,
              }}>{step.subtitle}</p>
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(215,172,40,0.28), transparent)', marginBottom: 11 }} />
              <p style={{
                fontFamily: SANS, fontSize: '0.74rem', lineHeight: 1.68,
                color: 'rgba(160,150,142,0.85)', marginBottom: 13,
              }}>{step.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {step.bullets.map((b, bi) => (
                  <li key={bi} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    fontFamily: SANS, fontSize: '0.7rem', color: 'rgba(215,172,40,0.72)',
                  }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(215,172,40,0.58)', flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
              <div style={{
                fontFamily: SANS, fontSize: '0.54rem', letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'rgba(215,172,40,0.32)',
                borderTop: '1px solid rgba(215,172,40,0.1)', paddingTop: 11, marginTop: 13,
              }}>
                <span style={{ marginRight: 5, opacity: 0.65 }}>{step.emoji}</span>
                {step.hint}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ metric, index, inView }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.68, delay: 0.08 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 155px', minWidth: 0,
        background: hovered
          ? 'linear-gradient(145deg, rgba(18,10,42,0.96), rgba(10,6,26,0.94))'
          : 'linear-gradient(145deg, rgba(12,7,30,0.9), rgba(8,4,20,0.88))',
        border: `1px solid ${hovered ? 'rgba(215,172,40,0.38)' : 'rgba(215,172,40,0.15)'}`,
        borderRadius: 20, padding: '30px 24px 26px',
        textAlign: 'center', backdropFilter: 'blur(22px)',
        boxShadow: hovered
          ? '0 26px 65px rgba(0,0,0,0.6), 0 0 36px rgba(215,172,40,0.12)'
          : '0 18px 52px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        cursor: 'default', position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
        transition: 'all 0.4s ease',
      }}
    >
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(215,172,40,0.3), transparent)',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        border: `1px solid ${hovered ? 'rgba(215,172,40,0.28)' : 'rgba(215,172,40,0.18)'}`,
        background: hovered ? 'rgba(215,172,40,0.09)' : 'rgba(215,172,40,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 18px', fontSize: '1.1rem', color: GOLD_HEX,
        boxShadow: hovered ? '0 0 22px rgba(215,172,40,0.28)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        {metric.icon}
      </div>
      <div style={{ marginBottom: 8 }}>
        <CountUp target={metric.value} suffix={metric.suffix} inView={inView} />
      </div>
      <div style={{
        fontFamily: SANS, fontSize: '0.62rem', fontWeight: 600,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(200,190,175,0.6)',
      }}>
        {metric.label}
      </div>
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const sectionRef = useRef(null)
  const metricsRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.08 })
  const metricsInView = useInView(metricsRef, { once: true, amount: 0.3 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="How it works"
      style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(72px, 9vw, 116px) 0 clamp(72px, 9vw, 104px)',
        /* Solid luxury background — does NOT rely on parent */
        background: 'linear-gradient(180deg, #06030F 0%, #08051A 28%, #0A0620 55%, #09051C 80%, #06030E 100%)',
      }}
    >
      {/* ── Cinematic background layers ── */}

      {/* Top-center gold bloom */}
      <div aria-hidden style={{
        position: 'absolute', top: '-8%', left: '50%', transform: 'translateX(-50%)',
        width: '70%', aspectRatio: '2/1',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(215,172,40,0.065) 0%, transparent 60%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Left violet orb */}
      <div aria-hidden style={{
        position: 'absolute', top: '15%', left: '-6%', width: '38%', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(90,30,180,0.1) 0%, transparent 68%)',
        filter: 'blur(90px)', pointerEvents: 'none',
      }} />

      {/* Right gold orb */}
      <div aria-hidden style={{
        position: 'absolute', top: '20%', right: '-6%', width: '38%', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(215,172,40,0.06) 0%, transparent 68%)',
        filter: 'blur(90px)', pointerEvents: 'none',
      }} />

      {/* Bottom center violet glow */}
      <div aria-hidden style={{
        position: 'absolute', bottom: '-5%', left: '50%', transform: 'translateX(-50%)',
        width: '60%', aspectRatio: '3/1',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(100,40,200,0.08) 0%, transparent 65%)',
        filter: 'blur(70px)', pointerEvents: 'none',
      }} />

      {/* Cinematic light rays */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '15%', width: 1.5, height: '60%',
        background: 'linear-gradient(to bottom, transparent, rgba(215,172,40,0.07), transparent)',
        transform: 'rotate(-8deg)', transformOrigin: 'top center', pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: 0, right: '15%', width: 1.5, height: '60%',
        background: 'linear-gradient(to bottom, transparent, rgba(130,56,179,0.06), transparent)',
        transform: 'rotate(8deg)', transformOrigin: 'top center', pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '50%', width: 1, height: '45%',
        background: 'linear-gradient(to bottom, transparent, rgba(215,172,40,0.04), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Subtle grain texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.028,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '128px',
      }} />

      {/* Vignette */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 88% 80% at 50% 50%, transparent 28%, rgba(0,0,0,0.38) 100%)',
      }} />

      {/* Top border fade */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '10%',
        background: 'linear-gradient(to bottom, rgba(4,2,10,0.65), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Bottom border fade */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '10%',
        background: 'linear-gradient(to top, rgba(4,2,10,0.65), transparent)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>

        {/* ── Section Header ── */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 72 }}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Premium badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.72, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 22px',
              border: '1px solid rgba(215,172,40,0.3)',
              borderRadius: 100,
              background: 'rgba(215,172,40,0.06)',
              backdropFilter: 'blur(16px)',
              marginBottom: 28,
              boxShadow: '0 0 30px rgba(215,172,40,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <span style={{ color: GOLD_HEX, fontSize: '0.65rem' }}>✦</span>
            <span style={{
              fontFamily: SANS, fontSize: '0.56rem', fontWeight: 800,
              letterSpacing: '0.38em', textTransform: 'uppercase',
              color: 'rgba(215,172,40,0.78)',
            }}>
              How It Works
            </span>
            <span style={{ color: GOLD_HEX, fontSize: '0.65rem' }}>✦</span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.16 }}
          >
            <h2 style={{
              fontFamily: SERIF, fontSize: 'clamp(2.1rem, 5.5vw, 3.8rem)',
              fontWeight: 400, color: '#EDE8E2',
              letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 4,
            }}>
              Your Journey to an
            </h2>
            <h2 style={{
              fontFamily: SERIF, fontSize: 'clamp(2.1rem, 5.5vw, 3.8rem)',
              fontWeight: 400, lineHeight: 1.15, marginBottom: 24,
            }}>
              <em style={{
                ...GOLD_RICH, fontStyle: 'italic',
                filter: 'drop-shadow(0 0 32px rgba(215,172,40,0.32))',
              }}>Unforgettable</em>
              {' '}
              <span style={{ color: '#EDE8E2' }}>Celebration</span>
            </h2>
          </motion.div>

          {/* Gold ornament divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={inView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.85, delay: 0.28 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 24 }}
          >
            <div style={{ width: 90, height: 1, background: 'linear-gradient(90deg, transparent, rgba(215,172,40,0.55))' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(215,172,40,0.45)' }} />
              <span style={{ color: GOLD_HEX, fontSize: '0.75rem', filter: 'drop-shadow(0 0 6px rgba(215,172,40,0.5))' }}>✦</span>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(215,172,40,0.45)' }} />
            </div>
            <div style={{ width: 90, height: 1, background: 'linear-gradient(90deg, rgba(215,172,40,0.55), transparent)' }} />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.32 }}
            style={{
              fontFamily: SANS, fontSize: 'clamp(0.86rem, 1.5vw, 1.02rem)',
              color: 'rgba(195,185,178,0.72)',
              maxWidth: 580, margin: '0 auto', lineHeight: 1.8,
            }}
          >
            Four simple steps — from choosing your theme to walking into a perfectly crafted scene.{' '}
            <span style={{ ...GOLD, fontStyle: 'italic', fontWeight: 500 }}>
              Everything is handled for you.
            </span>
          </motion.p>
        </motion.div>

        {/* ── Journey Layout ── */}
        <div style={{ marginBottom: 82 }}>
          {isMobile
            ? <MobileTimeline inView={inView} />
            : <DesktopJourney inView={inView} />
          }
        </div>

        {/* ── Bottom Quote Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.88, delay: 1.0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(10,6,26,0.96), rgba(14,9,34,0.92))',
            border: '1px solid rgba(215,172,40,0.22)',
            borderRadius: 20, padding: 'clamp(18px, 2.5vw, 26px) clamp(22px, 3vw, 38px)',
            display: 'flex', alignItems: 'center', gap: 20,
            backdropFilter: 'blur(28px)',
            boxShadow: '0 18px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px rgba(215,172,40,0.04)',
            marginBottom: 80,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div aria-hidden style={{
            position: 'absolute', top: 0, left: '3%', right: '3%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(215,172,40,0.42), transparent)',
          }} />
          <div aria-hidden style={{
            position: 'absolute', bottom: 0, left: '25%', right: '25%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(215,172,40,0.12), transparent)',
          }} />
          <div style={{
            width: 50, height: 50, borderRadius: 15, flexShrink: 0,
            border: '1px solid rgba(215,172,40,0.32)',
            background: 'radial-gradient(circle, rgba(215,172,40,0.12) 0%, rgba(5,3,14,0.9) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.15rem', color: GOLD_HEX,
            boxShadow: '0 0 24px rgba(215,172,40,0.22)',
          }}>
            ✦
          </div>
          <p style={{
            fontFamily: SERIF, fontSize: 'clamp(0.85rem, 1.4vw, 1.04rem)',
            color: 'rgba(218,208,198,0.85)', lineHeight: 1.7,
            margin: 0, flex: 1,
          }}>
            From your first click to your final celebration,{' '}
            <em style={{ ...GOLD_RICH }}>
              every detail is crafted with care.
            </em>
          </p>
        </motion.div>

        {/* ── Metrics ── */}
        <div ref={metricsRef}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={metricsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30 }}
          >
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(215,172,40,0.24))' }} />
            <span style={{
              fontFamily: SANS, fontSize: '0.54rem', fontWeight: 800,
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(215,172,40,0.38)', whiteSpace: 'nowrap',
            }}>
              ✦ By the numbers ✦
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(215,172,40,0.24), transparent)' }} />
          </motion.div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {METRICS.map((m, i) => (
              <MetricCard key={i} metric={m} index={i} inView={metricsInView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
