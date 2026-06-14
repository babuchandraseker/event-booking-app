import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

const SERIF = '"Playfair Display", var(--font-display), Georgia, serif'
const SANS = 'var(--font-body, "DM Sans", system-ui, sans-serif)'

const GOLD = 'linear-gradient(135deg, #F8E4A8 0%, #D7AC28 48%, #C78D17 100%)'
const GOLD_TEXT = {
  background: GOLD,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

// Dark glass card styling
const CARD_BG = 'rgba(18, 12, 32, 0.72)'
const CARD_BG_HOVER = 'rgba(28, 18, 50, 0.88)'
const GOLD_BORDER = 'rgba(212, 175, 55, 0.18)'
const GOLD_BORDER_HOVER = 'rgba(212, 175, 55, 0.45)'

const ORB_FILL =
  'radial-gradient(ellipse 88% 50% at 50% 12%, rgba(232,197,90,0.22) 0%, transparent 42%), radial-gradient(circle at 68% 38%, rgba(130,56,179,0.92) 0%, rgba(72,24,117,0.96) 45%, rgba(45,8,90,0.99) 100%)'

const NODES = [
  { title: 'Premium Experience', desc: 'Luxury-inspired celebrations crafted beautifully with attention to every detail.', icon: 'crown', side: 'left', x: 1.5, y: 10, rotate: -4, width: 318, z: 8 },
  { title: 'Beyond Expectations', desc: 'We go above and beyond to turn your moments into unforgettable memories.', icon: 'star', side: 'right', x: 70, y: 6, rotate: 3, width: 300, z: 7 },
  { title: 'Seamless Booking', desc: 'Simple, fast, and transparent booking process designed for your convenience.', icon: 'calendar', side: 'left', x: 0, y: 36, rotate: -2.5, width: 292, z: 9 },
  { title: 'Friendly Support', desc: 'A warm, professional team available 24/7 to assist you at every step.', icon: 'headset', side: 'right', x: 69, y: 34, rotate: 2, width: 308, z: 8 },
  { title: 'Elegant Spaces', desc: 'Beautifully curated spaces that set the perfect vibe for every occasion.', icon: 'building', side: 'left', x: 4, y: 64, rotate: -4.5, width: 284, z: 6 },
  { title: 'High Quality Service', desc: 'We maintain the highest standards to deliver an exceptional experience.', icon: 'diamond', side: 'right', x: 69, y: 62, rotate: 3.5, width: 314, z: 9 },
]

const CARD_H = 112
const CW = 1100
const CH = 780
const CORE_CX = CW / 2
const CORE_CY = CH / 2
const CORE_R = 152

function IconSvg({ name, size = 20 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'crown': return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path {...common} d="M4 18h16M6 14l2-8 4 5 4-5 2 8" /><circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" /><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" /></svg>)
    case 'calendar': return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><rect {...common} x="4" y="5" width="16" height="15" rx="2" /><path {...common} d="M8 3v4M16 3v4M4 10h16" /></svg>)
    case 'building': return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path {...common} d="M6 20V8l6-4 6 4v12" /><path {...common} d="M9 20v-6h6v6M12 8v2" /></svg>)
    case 'star': return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path {...common} d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.5 6.4 20.5l2.1-6.7L3 9.8h6.8L12 3z" /></svg>)
    case 'headset': return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path {...common} d="M4 14v-2a8 8 0 0116 0v2" /><path {...common} d="M4 14a3 3 0 003 3v2H4v-5zM20 14a3 3 0 01-3 3v2h3v-5z" /></svg>)
    case 'diamond': return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path {...common} d="M12 3l8 7-8 11L4 10l8-7z" /></svg>)
    default: return null
  }
}

function ParticleField() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    let raf
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * 1600, y: Math.random() * 900,
      r: Math.random() * 1.2 + 0.15,
      dx: (Math.random() - 0.5) * 0.07, dy: (Math.random() - 0.5) * 0.055,
      a: Math.random() * 0.35 + 0.04, ph: Math.random() * Math.PI * 2,
      gold: Math.random() > 0.45,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      pts.forEach((p) => {
        p.ph += 0.005
        const a = p.a * (0.38 + 0.62 * Math.sin(p.ph))
        ctx.beginPath()
        ctx.arc(p.x % c.width, p.y % c.height, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.gold ? `rgba(212,175,55,${a * 0.55})` : `rgba(120,65,200,${a * 0.22})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x > c.width + 2) p.x = -2
        if (p.x < -2) p.x = c.width + 2
        if (p.y > c.height + 2) p.y = -2
        if (p.y < -2) p.y = c.height + 2
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
}

// Floral corner decoration SVG
function FloralCorner({ flip }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 180 180"
      style={{
        position: 'absolute',
        width: 'clamp(100px, 12vw, 175px)',
        opacity: 0.22,
        pointerEvents: 'none',
        ...(flip
          ? { bottom: 0, right: 0, transform: 'rotate(180deg)' }
          : { top: 0, left: 0, transform: 'rotate(0deg)' })
      }}
    >
      <defs>
        <radialGradient id={flip ? 'fg2' : 'fg1'} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#b47cff" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#7a28d0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4a0e8f" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id={flip ? 'gg2' : 'gg1'} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0d060" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c89018" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {/* Large petal cluster */}
      {[0,60,120,180,240,300].map((r, i) => (
        <ellipse key={i} cx="38" cy="20" rx="13" ry="6.5" fill={`url(#${flip ? 'fg2' : 'fg1'})`}
          transform={`rotate(${r} 38 38)`} opacity={0.7 + i * 0.04} />
      ))}
      {/* Gold center */}
      <circle cx="38" cy="38" r="7" fill={`url(#${flip ? 'gg2' : 'gg1'})`} />
      <circle cx="38" cy="38" r="3.5" fill="rgba(255,235,120,0.85)" />
      {/* Smaller accent petals */}
      {[30,90,150,210,270,330].map((r, i) => (
        <ellipse key={i} cx="78" cy="56" rx="9" ry="4.5" fill={`url(#${flip ? 'fg2' : 'fg1'})`}
          transform={`rotate(${r} 78 78)`} opacity={0.55 + i * 0.03} />
      ))}
      <circle cx="78" cy="78" r="5" fill={`url(#${flip ? 'gg2' : 'gg1'})`} />
      {/* Gold vine lines */}
      <path d="M 38 45 Q 55 62 78 73" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="1.2" />
      <path d="M 10 38 Q 22 55 38 68" fill="none" stroke="rgba(180,124,255,0.3)" strokeWidth="0.9" />
      <path d="M 38 10 Q 55 22 72 38" fill="none" stroke="rgba(180,124,255,0.3)" strokeWidth="0.9" />
      {/* Tiny leaf dots */}
      {[[20,60],[55,28],[12,18],[65,68],[88,40],[42,90]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.8} fill="rgba(212,175,55,0.5)" />
      ))}
    </svg>
  )
}

function cardAnchor(node) {
  const left = (node.x / 100) * CW
  const top = (node.y / 100) * CH
  const cy = top + CARD_H / 2
  const onLeft = node.side === 'left'
  const dotX = onLeft ? left + node.width - 6 : left - 10
  return { x: dotX, y: cy, onLeft }
}

function organicBranch(node, idx) {
  const dot = cardAnchor(node)
  const angle = Math.atan2(dot.y - CORE_CY, dot.x - CORE_CX)
  const startR = CORE_R - 1
  const startX = CORE_CX + Math.cos(angle) * startR
  const startY = CORE_CY + Math.sin(angle) * startR
  const dx = dot.x - startX
  const dy = dot.y - startY
  const wobble = idx % 2 === 0 ? 1 : -1
  const bend = dot.onLeft ? 1 : -1
  const cp1x = startX + dx * 0.26 + bend * (38 + wobble * 22)
  const cp1y = startY + dy * 0.1 - wobble * Math.abs(dx) * 0.06
  const cp2x = startX + dx * 0.74 - bend * (18 + wobble * 14)
  const cp2y = startY + dy * 0.86 + wobble * 14
  return {
    d: `M ${startX.toFixed(1)},${startY.toFixed(1)} C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${dot.x.toFixed(1)},${dot.y.toFixed(1)}`,
    start: { x: startX, y: startY }, end: { x: dot.x, y: dot.y },
  }
}

function BranchNetwork({ inView }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-[4] h-full w-full overflow-visible" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="wc-flow" gradientUnits="userSpaceOnUse" x1={CORE_CX - 200} y1={CORE_CY} x2={CORE_CX + 200} y2={CORE_CY}>
          <stop offset="0%" stopColor="rgba(255,225,130,0.22)" />
          <stop offset="50%" stopColor="rgba(248,200,90,0.85)" />
          <stop offset="100%" stopColor="rgba(200,160,50,0.28)" />
        </linearGradient>
        <filter id="wc-line-glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {NODES.map((node, i) => {
        const { d } = organicBranch(node, i)
        return (
          <g key={node.title}>
            {/* Glow base */}
            <motion.path d={d} fill="none" stroke="rgba(212,175,55,0.05)" strokeWidth={5} strokeLinecap="round" filter="url(#wc-line-glow)"
              initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.09, ease: [0.16, 1, 0.3, 1] }} />
            {/* Main gold line */}
            <motion.path d={d} fill="none" stroke="url(#wc-flow)" strokeWidth={0.7} strokeLinecap="round" filter="url(#wc-line-glow)"
              initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.09, ease: [0.16, 1, 0.3, 1] }} />
            {/* Shimmer pulse */}
            <motion.path d={d} fill="none" stroke="rgba(255,240,160,0.75)" strokeWidth={0.45} strokeLinecap="round" strokeDasharray="5 500" filter="url(#wc-line-glow)"
              initial={{ opacity: 0 }} animate={inView ? { strokeDashoffset: [-5, -280], opacity: [0, 0.75, 0.75, 0] } : {}}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 + i * 0.2, repeatDelay: 1.1 + i * 0.15 }} />
          </g>
        )
      })}
    </svg>
  )
}

function ConnectionNodes({ inView }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-[11] h-full w-full overflow-visible" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
      <defs>
        <filter id="wc-node-glow">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="node-gold" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFE88A" />
          <stop offset="100%" stopColor="#C89018" />
        </radialGradient>
      </defs>
      {NODES.map((node, i) => {
        const { start, end } = organicBranch(node, i)
        return (
          <g key={`node-${node.title}`}>
            {/* Center node */}
            <motion.circle cx={start.x} cy={start.y} r={5} fill="rgba(212,175,55,0.15)" filter="url(#wc-node-glow)"
              initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.35, delay: 0.6 + i * 0.09 }} />
            <motion.circle cx={start.x} cy={start.y} r={2.8} fill="url(#node-gold)" filter="url(#wc-node-glow)"
              initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 0.95, scale: 1 } : {}}
              transition={{ duration: 0.35, delay: 0.6 + i * 0.09 }} />
            {/* End node — larger outer glow ring */}
            <motion.circle cx={end.x} cy={end.y} r={14} fill="rgba(212,175,55,0.08)" filter="url(#wc-node-glow)"
              initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 1.05 + i * 0.09 }} />
            {/* End node core */}
            <motion.circle cx={end.x} cy={end.y} r={4.5} fill="url(#node-gold)" filter="url(#wc-node-glow)"
              initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 1.05 + i * 0.09 }} />
            {/* Pulse ring */}
            <motion.circle cx={end.x} cy={end.y} r={12} fill="none" stroke="rgba(212,175,55,0.38)" strokeWidth={0.9}
              animate={{ r: [12, 22, 12], opacity: [0.38, 0, 0.38] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.42 }} />
          </g>
        )
      })}
    </svg>
  )
}

function StoryCore({ inView }) {
  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: `${((CORE_CX - CORE_R) / CW) * 100}%`,
        top: `${((CORE_CY - CORE_R) / CH) * 100}%`,
        width: `${((CORE_R * 2) / CW) * 100}%`,
        height: `${((CORE_R * 2) / CH) * 100}%`,
        transformOrigin: 'center center',
      }}
      initial={{ opacity: 0, scale: 0.72 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.05, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer ambient glow */}
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{ inset: -36, background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(100,45,200,0.07) 45%, transparent 70%)', filter: 'blur(24px)' }}
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.07, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Gold ring accent */}
      <div className="pointer-events-none absolute inset-0 rounded-full" style={{ border: '1px solid rgba(212,175,55,0.35)', boxShadow: '0 0 28px rgba(212,175,55,0.12), inset 0 0 28px rgba(90,35,160,0.25)' }} />
      {/* Inner orb */}
      <motion.div
        className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full text-center"
        style={{ background: ORB_FILL, backdropFilter: 'blur(32px)' }}
        animate={{
          boxShadow: [
            '0 0 40px rgba(212,175,55,0.18), 0 0 70px rgba(100,40,200,0.14), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 40px rgba(90,32,170,0.28)',
            '0 0 52px rgba(212,175,55,0.28), 0 0 85px rgba(100,40,200,0.22), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 0 48px rgba(90,32,170,0.36)',
            '0 0 40px rgba(212,175,55,0.18), 0 0 70px rgba(100,40,200,0.14), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 40px rgba(90,32,170,0.28)',
          ]
        }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Top gold highlight arc */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 8%, rgba(232,197,90,0.24) 0%, transparent 60%)', borderRadius: '50%' }} />
        <span className="mb-1.5 text-xl" style={{ ...GOLD_TEXT, filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.65))' }}>✦</span>
        <div style={{ fontFamily: SERIF, fontSize: '1.78rem', fontWeight: 500, lineHeight: 1.1, ...GOLD_TEXT, filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.4))' }}>
          Why<br />Choose Us
        </div>
        <div className="my-2 h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />
        <div style={{ fontFamily: SANS, fontSize: '0.44rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.52)', lineHeight: 1.5 }}>
          A WONDERONE<br />SURPRISE
        </div>
        <span className="mt-1.5 text-sm" style={{ ...GOLD_TEXT, opacity: 0.5 }}>✦</span>
      </motion.div>
    </motion.div>
  )
}

function MindmapCard({ node, index, inView }) {
  const [hov, setHov] = useState(false)
  const floatAmp = 4 + (index % 3) * 2
  const floatDur = 4.5 + index * 0.55

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.88, rotate: node.rotate * 0.3 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: node.rotate, y: [0, -floatAmp, 0] } : {}}
      transition={{
        opacity: { duration: 0.78, delay: 0.18 + index * 0.09, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.78, delay: 0.18 + index * 0.09, ease: [0.16, 1, 0.3, 1] },
        rotate: { duration: 0.82, delay: 0.18 + index * 0.09, ease: [0.16, 1, 0.3, 1] },
        y: { duration: floatDur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.45 }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="absolute"
      style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.width, zIndex: hov ? 20 : node.z, transformOrigin: 'center center' }}
    >
      <div
        className="relative flex items-start gap-4 overflow-hidden rounded-2xl px-5 py-5"
        style={{
          background: hov ? CARD_BG_HOVER : CARD_BG,
          border: `1px solid ${hov ? GOLD_BORDER_HOVER : GOLD_BORDER}`,
          boxShadow: hov
            ? '0 24px 56px rgba(0,0,0,0.55), 0 0 36px rgba(212,175,55,0.14), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 12px 40px rgba(0,0,0,0.42), 0 0 0 1px rgba(212,175,55,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
          backdropFilter: 'blur(28px)',
          transform: hov ? 'translateY(-7px)' : 'translateY(0)',
          transition: 'transform 0.38s cubic-bezier(0.16,1,0.3,1), box-shadow 0.38s ease, border-color 0.38s ease, background 0.38s ease',
        }}
      >
        {/* Top shimmer */}
        <div aria-hidden className="pointer-events-none absolute left-[8%] right-[8%] top-0 h-px"
          style={{ background: hov ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)' }} />
        {/* Subtle violet inner glow on hover */}
        {hov && <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,55,200,0.08) 0%, transparent 70%)' }} />}

        {/* Icon container */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{
            border: `1px solid ${hov ? 'rgba(212,175,55,0.42)' : 'rgba(212,175,55,0.2)'}`,
            background: 'radial-gradient(circle at 35% 28%, rgba(110,45,170,0.75) 0%, rgba(30,10,60,0.92) 100%)',
            color: hov ? '#F2DC88' : '#C89820',
            boxShadow: hov ? '0 0 22px rgba(212,175,55,0.28), inset 0 1px 0 rgba(255,255,255,0.08)' : '0 0 0 1px rgba(212,175,55,0.08)',
            transition: 'all 0.38s ease',
          }}>
          <IconSvg name={node.icon} size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1.5 text-[1.06rem] leading-snug" style={{ fontFamily: SERIF, fontWeight: 500, ...GOLD_TEXT }}>
            {node.title}
          </h3>
          <div className="mb-2 h-px max-w-[155px]"
            style={{ background: node.side === 'left' ? 'linear-gradient(90deg, rgba(212,175,55,0.32), transparent)' : 'linear-gradient(270deg, rgba(212,175,55,0.32), transparent)' }} />
          <p className="m-0 text-[0.79rem] leading-relaxed" style={{ fontFamily: SANS, color: 'rgba(195,182,215,0.78)' }}>
            {node.desc}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

function MindmapCanvas({ inView }) {
  const containerRef = useRef(null)
  const [height, setHeight] = useState(Math.round((CW / CH) * 900) || 640)
  useEffect(() => {
    if (!containerRef.current) return
    const update = () => {
      const w = containerRef.current.offsetWidth
      const h = Math.max(480, Math.round((w * CH) / CW))
      setHeight(h)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={containerRef} className="relative mx-auto hidden w-full max-w-[1180px] md:block" style={{ height, minHeight: 480 }}>
      <ParticleField />
      {/* Center ambient spotlight */}
      <div aria-hidden className="pointer-events-none absolute rounded-full" style={{ left: `${((CORE_CX - CORE_R * 1.6) / CW) * 100}%`, top: `${((CORE_CY - CORE_R * 1.6) / CH) * 100}%`, width: `${((CORE_R * 3.2) / CW) * 100}%`, height: `${((CORE_R * 3.2) / CH) * 100}%`, background: 'radial-gradient(circle, rgba(90,38,180,0.1) 0%, rgba(60,20,130,0.06) 40%, transparent 68%)', filter: 'blur(50px)', zIndex: 1 }} />
      <BranchNetwork inView={inView} />
      {NODES.map((node, i) => <MindmapCard key={node.title} node={node} index={i} inView={inView} />)}
      <ConnectionNodes inView={inView} />
      <StoryCore inView={inView} />
    </div>
  )
}

// ── Mobile layout ──

const MOBILE_CARD_ORDER = ['Premium Experience', 'Seamless Booking', 'Beyond Expectations', 'Friendly Support', 'Elegant Spaces', 'High Quality Service']
const MOBILE_NODES = MOBILE_CARD_ORDER.map((title) => NODES.find((n) => n.title === title)).filter(Boolean)

const MW = 390
const MH = 520
const M_ORB_R = 128
const M_ORB_CY = MH / 2
const M_CARD_W = 198
const M_CARD_H = 58
const M_CARD_GAP = 10
const M_CARDS_TOP = 52
const M_STAGGER = [0, 6, 2, 10, 4, 8]

function mobileCardLayout(index) {
  const left = MW * 0.46 + M_STAGGER[index]
  const top = M_CARDS_TOP + index * (M_CARD_H + M_CARD_GAP)
  return { left, top, cy: top + M_CARD_H / 2 }
}
function mobileCardAnchor(index) { const { left, cy } = mobileCardLayout(index); return { x: left - 4, y: cy } }
function mobileOrganicBranch(index) {
  const dot = mobileCardAnchor(index)
  const startX = M_ORB_R - 2
  const startY = M_ORB_CY + (dot.y - M_ORB_CY) * 0.12
  const dx = dot.x - startX; const dy = dot.y - startY
  const wobble = index % 2 === 0 ? 1 : -1
  const cp1x = startX + dx * 0.35 + wobble * 18; const cp1y = startY + dy * 0.15 - wobble * 8
  const cp2x = startX + dx * 0.72 - wobble * 10; const cp2y = startY + dy * 0.82 + wobble * 6
  return { d: `M ${startX.toFixed(1)},${startY.toFixed(1)} C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${dot.x.toFixed(1)},${dot.y.toFixed(1)}`, start: { x: startX, y: startY }, end: { x: dot.x, y: dot.y } }
}

function MobileBranchNetwork({ inView, activeIndex }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-[4] h-full w-full overflow-visible" viewBox={`0 0 ${MW} ${MH}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="wc-m-flow" gradientUnits="userSpaceOnUse" x1={0} y1={M_ORB_CY} x2={MW} y2={M_ORB_CY}>
          <stop offset="0%" stopColor="rgba(140,80,240,0.25)" />
          <stop offset="45%" stopColor="rgba(248,200,90,0.85)" />
          <stop offset="100%" stopColor="rgba(200,160,50,0.3)" />
        </linearGradient>
        <filter id="wc-m-line-glow"><feGaussianBlur stdDeviation="1.8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <radialGradient id="m-node-gold" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFE88A" />
          <stop offset="100%" stopColor="#C89018" />
        </radialGradient>
      </defs>
      {MOBILE_NODES.map((node, i) => {
        const { d, start, end } = mobileOrganicBranch(i)
        const isActive = i === activeIndex
        return (
          <g key={`m-branch-${node.title}`}>
            <motion.path d={d} fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth={3.5} strokeLinecap="round" filter="url(#wc-m-line-glow)"
              initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: isActive ? 0.55 : 0.22 } : {}}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }} />
            <motion.path d={d} fill="none" stroke="url(#wc-m-flow)" strokeWidth={isActive ? 0.9 : 0.5} strokeLinecap="round" filter="url(#wc-m-line-glow)"
              animate={inView ? { opacity: isActive ? [0.65, 1, 0.65] : 0.28, pathLength: 1 } : {}}
              transition={{ opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, pathLength: { duration: 0.9, delay: 0.2 + i * 0.06 } }} />
            <motion.circle cx={start.x} cy={start.y} r={isActive ? 3.5 : 2.2} fill={isActive ? 'url(#m-node-gold)' : 'rgba(212,175,55,0.38)'} filter="url(#wc-m-line-glow)"
              animate={inView && isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.6 }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.circle cx={end.x} cy={end.y} r={isActive ? 5.5 : 4} fill={isActive ? 'url(#m-node-gold)' : 'rgba(212,175,55,0.28)'} filter="url(#wc-m-line-glow)"
              animate={inView && isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.48 }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }} />
          </g>
        )
      })}
    </svg>
  )
}

function MobileHalfOrb({ inView }) {
  const size = M_ORB_R * 2; const visibleW = M_ORB_R
  return (
    <>
      <motion.div className="pointer-events-none absolute z-[6]"
        style={{ left: 0, top: '50%', width: size, height: size, marginTop: -M_ORB_R, marginLeft: -M_ORB_R }}
        initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }} aria-hidden>
        <motion.div className="absolute rounded-full"
          style={{ inset: -14, right: -4, background: 'radial-gradient(ellipse 30% 60% at 90% 50%, rgba(130,60,240,0.22) 0%, rgba(100,40,200,0.08) 40%, transparent 70%)', filter: 'blur(16px)' }}
          animate={{ opacity: [0.4, 0.68, 0.4] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="relative h-full w-full overflow-hidden rounded-full"
          animate={{ boxShadow: ['0 0 32px rgba(100,40,200,0.22), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 36px rgba(80,30,160,0.32)', '0 0 44px rgba(100,40,200,0.32), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 0 44px rgba(80,30,160,0.42)', '0 0 32px rgba(100,40,200,0.22), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 36px rgba(80,30,160,0.32)'] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: ORB_FILL, border: '1px solid rgba(212,175,55,0.35)', backdropFilter: 'blur(28px)' }} />
      </motion.div>
      <motion.div className="pointer-events-none absolute z-[7] flex flex-col items-center justify-center text-center"
        style={{ left: 0, top: '50%', width: visibleW, height: size, marginTop: -M_ORB_R, paddingRight: 6 }}
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.95, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}>
        <span className="mb-1 text-base" style={{ ...GOLD_TEXT, filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.6))' }}>✦</span>
        <h3 className="m-0" style={{ fontFamily: SERIF, fontSize: 'clamp(1.45rem, 6.8vw, 1.82rem)', fontWeight: 500, lineHeight: 1.05, ...GOLD_TEXT, filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.38))' }}>Why<br />Choose Us</h3>
        <div className="my-1.5 h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)' }} />
        <p className="m-0" style={{ fontFamily: SANS, fontSize: 'clamp(0.38rem, 1.8vw, 0.44rem)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.52)', lineHeight: 1.35 }}>A WONDERONE<br />SURPRISE</p>
      </motion.div>
    </>
  )
}

function MobileFeatureCard({ node, index, activeIndex, inView }) {
  const isActive = index === activeIndex
  const { left, top } = mobileCardLayout(index)
  return (
    <motion.article className="absolute z-[8]"
      style={{ left: `${(left / MW) * 100}%`, top: `${(top / MH) * 100}%`, width: `${(M_CARD_W / MW) * 100}%`, transformOrigin: 'left center' }}
      initial={{ opacity: 0, x: 12 }}
      animate={inView ? { opacity: isActive ? 1 : 0.45, x: 0, scale: isActive ? 1.06 : 0.92, filter: isActive ? 'blur(0px)' : 'blur(0.4px)' } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
      <div className="relative flex items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2.5"
        style={{
          background: isActive ? CARD_BG_HOVER : CARD_BG,
          border: `1px solid ${isActive ? GOLD_BORDER_HOVER : GOLD_BORDER}`,
          boxShadow: isActive
            ? '0 14px 36px rgba(0,0,0,0.55), 0 0 28px rgba(212,175,55,0.14), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 6px 22px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.03)',
          backdropFilter: 'blur(24px)',
        }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-[8%] top-0 h-px"
          style={{ background: isActive ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.52), transparent)' : 'linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent)' }} />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{
            border: `1px solid ${isActive ? 'rgba(212,175,55,0.42)' : 'rgba(212,175,55,0.18)'}`,
            background: 'radial-gradient(circle at 35% 28%, rgba(100,42,158,0.88) 0%, rgba(18,8,38,0.96) 100%)',
            color: isActive ? '#F2DC88' : '#C89820',
            boxShadow: isActive ? '0 0 16px rgba(212,175,55,0.26)' : 'none',
          }}>
          <IconSvg name={node.icon} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 leading-tight" style={{ fontFamily: SERIF, fontSize: isActive ? '0.72rem' : '0.66rem', fontWeight: 500, ...GOLD_TEXT }}>{node.title}</h3>
          <p className="m-0 mt-0.5 leading-snug" style={{ fontFamily: SANS, fontSize: '0.58rem', color: isActive ? 'rgba(180,165,210,0.85)' : 'rgba(160,148,185,0.38)', display: '-webkit-box', WebkitLineClamp: isActive ? 2 : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{node.desc}</p>
        </div>
      </div>
    </motion.article>
  )
}

function MobileCinematicCanvas({ inView }) {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [height, setHeight] = useState(520)
  useEffect(() => {
    if (!inView) return undefined
    const timer = setInterval(() => setActiveIndex((i) => (i + 1) % MOBILE_NODES.length), 2000)
    return () => clearInterval(timer)
  }, [inView])
  useEffect(() => {
    if (!containerRef.current) return undefined
    const update = () => {
      const w = containerRef.current.offsetWidth
      const h = Math.max(480, Math.round((w * MH) / MW))
      setHeight(h)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[440px] overflow-hidden md:hidden" style={{ height, minHeight: 480 }}>
      <ParticleField />
      <div aria-hidden className="pointer-events-none absolute rounded-full" style={{ left: -M_ORB_R * 0.4, top: '50%', width: M_ORB_R * 2.2, height: M_ORB_R * 2.2, marginTop: -(M_ORB_R * 1.1), background: 'radial-gradient(circle at 70% 50%, rgba(90,40,200,0.14) 0%, rgba(65,28,140,0.07) 45%, transparent 68%)', filter: 'blur(38px)', zIndex: 1 }} />
      <MobileBranchNetwork inView={inView} activeIndex={activeIndex} />
      <MobileHalfOrb inView={inView} />
      {MOBILE_NODES.map((node, i) => <MobileFeatureCard key={node.title} node={node} index={i} activeIndex={activeIndex} inView={inView} />)}
      <motion.p className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] m-0 px-3 text-center text-[0.52rem] leading-relaxed"
        style={{ fontFamily: SANS, color: 'rgba(212,175,55,0.32)', letterSpacing: '0.06em' }}
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}>
        ✦ Each feature brings us closer to creating your perfect experience. ✦
      </motion.p>
    </div>
  )
}

export default function WhyChooseUsSection() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })

  return (
    <section ref={sectionRef} id="why-us" aria-label="Why choose A WonderOne Surprise" className="wcu-section">
      {/* Cinematic spotlight */}
      <div className="wcu-spotlight" aria-hidden />
      {/* Floral corners */}
      <FloralCorner flip={false} />
      <FloralCorner flip={true} />
      {/* Luxury background gold particles */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="wcu-particle" />
        ))}
      </div>

      <div className="container relative z-[2]">
        <motion.header
          className="mb-10 text-center sm:mb-12"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-3.5 flex items-center justify-center gap-2.5">
            <span className="inline-block h-px w-8 sm:w-10" style={{ background: 'rgba(212,175,55,0.28)' }} />
            <span className="text-[0.55rem] font-bold uppercase tracking-[0.36em] sm:text-[0.57rem]" style={{ fontFamily: SANS, color: 'rgba(212,175,55,0.55)' }}>✧ OUR PROMISE ✧</span>
            <span className="inline-block h-px w-8 sm:w-10" style={{ background: 'rgba(212,175,55,0.28)' }} />
          </div>
          <h2 className="mb-4 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[1.08] tracking-tight" style={{ fontFamily: SERIF, fontWeight: 500, color: 'rgba(248,242,232,0.95)' }}>
            Why Choose{' '}
            <em className="not-italic" style={{ ...GOLD_TEXT, filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.32))' }}>Us</em>
          </h2>
          <p className="mx-auto max-w-md text-[clamp(0.78rem,1.35vw,0.92rem)] leading-relaxed" style={{ fontFamily: SANS, color: 'rgba(195,182,215,0.72)' }}>
            We don&apos;t just plan events — we create experiences that stay with you forever.
          </p>
        </motion.header>

        <MindmapCanvas inView={inView} />
        <MobileCinematicCanvas inView={inView} />
      </div>

    </section>
  )
}
