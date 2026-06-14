import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import ThemeCard from './ThemeCard'
import { API_BASE_URL } from '../config/api.js'

// Responsive offset: on narrow mobile, push side cards further out to prevent overlap
function getSideOffset() {
  if (typeof window === 'undefined') return '108%'
  return window.innerWidth < 640 ? '125%' : '108%'
}

function getIsCompactCarousel() {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 640
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const SLOT_MAP = {
  slot1: '10:00 AM', slot2: '12:00 PM', slot3: '2:00 PM',
  slot4: '4:00 PM',  slot5: '6:00 PM',  slot6: '8:00 PM',
}

const FALLBACK_THEMES = [
  {
    key: 'romantic', tag: '🌹 Romantic', img: '/themes/romantic/romantic1.jpg',
    title: 'Heart Theme',
    desc: 'An intimate escape draped in petals, soft candlelight, and whispered elegance.',
    features: ['Candles', 'Rose petals', 'Music'],
  },
  {
    key: 'birthday', tag: '🎉 Birthday', emoji: '🎂',
    mediaStyle: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a2e,#2d1b4e,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
    title: 'Balloon Theme',
    desc: 'Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory.',
    features: ['Balloons', 'Custom banner', 'Cake'],
  },
  {
    key: 'surprise', tag: '✨ Surprise', emoji: '🎁',
    mediaStyle: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#0d1a2e,#1a2d4e,#0d1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
    title: 'Partition Theme',
    desc: 'A perfectly orchestrated surprise that leaves them breathless.',
    features: ['Secret setup', 'Reveal décor', 'Timing'],
  },
]

function normalizeForCard(t) {
  return {
    key: t.key || t.id, tag: t.tag || t.title, title: t.title, desc: t.desc,
    features: Array.isArray(t.features) ? t.features
      : typeof t.features === 'string' ? t.features.split(',').map(f => f.trim()).filter(Boolean) : [],
    img: t.img || '', emoji: t.emoji || '',
    ...(t.emoji && !t.img ? {
      mediaStyle: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a2e,#2d1b4e,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
    } : {}),
  }
}

function getBookingContext() {
  try {
    const raw = sessionStorage.getItem('vn_booking_context')
    if (raw) return JSON.parse(raw)
  } catch {
    return null
  }
  return null
}

/**
 * Cinematic 3-card carousel:
 * - Only 3 real theme cards rendered — no DOM duplication
 * - active index cycles via setInterval
 * - active card: centered, larger, full opacity
 * - side cards: smaller, angled, dimmed
 * - pause on hover/touch
 */
export default function ThemeSection({ onBook }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [themes, setThemes] = useState(FALLBACK_THEMES)
  const [active, setActive] = useState(1)    // middle card starts active
  const [sideOffset, setSideOffset] = useState(getSideOffset)
  const [compactCarousel, setCompactCarousel] = useState(getIsCompactCarousel)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    let ignore = false
    fetch(`${API_BASE_URL}/themes`)
      .then(r => r.json())
      .then(data => {
        if (ignore) return
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const active = data.data.filter(t => t.active !== false)
          // Only first 3 themes used
          setThemes(active.slice(0, 3).map(normalizeForCard))
        }
      })
      .catch(() => undefined)
    return () => { ignore = true }
  }, [])

  const n = themes.length

  const next = useCallback(() => setActive(prev => (prev + 1) % n), [n])
  const prev = useCallback(() => setActive(prev => (prev - 1 + n) % n), [n])

  // Auto-advance
  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(next, 3200)
    return () => clearInterval(intervalRef.current)
  }, [paused, next])

  // Responsive side-card offset: update on resize
  useEffect(() => {
    const onResize = () => {
      setSideOffset(getSideOffset())
      setCompactCarousel(getIsCompactCarousel())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const ctx = getBookingContext()
  const dateStr = ctx?.date ? `${MONTHS[ctx.date.month]} ${ctx.date.day}, ${ctx.date.year}` : null
  const slotStr = ctx?.slot ? SLOT_MAP[ctx.slot] : null

  // Position metadata for each card index relative to active
  const getCardState = (i) => {
    const diff = ((i - active) % n + n) % n   // 0=active, 1=right, 2=left (for 3)
    if (diff === 0) return 'active'
    if (diff === 1) return 'right'
    return 'left'
  }

  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }, [])

  const onTouchEnd = useCallback(
    (e) => {
      const start = touchStartX.current
      touchStartX.current = null
      if (start == null) return
      const end = e.changedTouches[0]?.clientX
      if (end == null) return
      const delta = end - start
      if (Math.abs(delta) < 48) return
      if (delta < 0) next()
      else prev()
    },
    [next, prev],
  )

  return (
    <section className="themes-section themes-section--luxury" id="themes" ref={ref}>
      {/* Cinematic vignette depth */}
      <div className="themes-vignette" aria-hidden />

      {/* Floral corner accents */}
      <svg className="themes-section__floral themes-section__floral--tl" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M10 130 C10 60, 80 10, 130 10" stroke="rgba(212,175,55,0.7)" strokeWidth="0.8" fill="none"/>
        <path d="M10 130 C10 80, 55 25, 100 30" stroke="rgba(212,175,55,0.5)" strokeWidth="0.6" fill="none"/>
        <path d="M10 130 C30 70, 90 40, 130 40" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" fill="none"/>
        <circle cx="130" cy="10" r="3" fill="rgba(212,175,55,0.6)"/>
        <circle cx="100" cy="30" r="2" fill="rgba(212,175,55,0.5)"/>
        <circle cx="70" cy="55" r="1.5" fill="rgba(212,175,55,0.4)"/>
        <path d="M25 115 Q40 90 60 95 Q45 110 25 115Z" fill="rgba(212,175,55,0.15)"/>
        <path d="M15 95 Q35 75 50 85 Q30 95 15 95Z" fill="rgba(212,175,55,0.12)"/>
        <path d="M40 130 Q65 110 75 125 Q58 132 40 130Z" fill="rgba(212,175,55,0.12)"/>
      </svg>
      <svg className="themes-section__floral themes-section__floral--tr" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M10 130 C10 60, 80 10, 130 10" stroke="rgba(212,175,55,0.7)" strokeWidth="0.8" fill="none"/>
        <path d="M10 130 C10 80, 55 25, 100 30" stroke="rgba(212,175,55,0.5)" strokeWidth="0.6" fill="none"/>
        <path d="M10 130 C30 70, 90 40, 130 40" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" fill="none"/>
        <circle cx="130" cy="10" r="3" fill="rgba(212,175,55,0.6)"/>
        <circle cx="100" cy="30" r="2" fill="rgba(212,175,55,0.5)"/>
        <circle cx="70" cy="55" r="1.5" fill="rgba(212,175,55,0.4)"/>
        <path d="M25 115 Q40 90 60 95 Q45 110 25 115Z" fill="rgba(212,175,55,0.15)"/>
        <path d="M15 95 Q35 75 50 85 Q30 95 15 95Z" fill="rgba(212,175,55,0.12)"/>
      </svg>

      <div className="themes-section__particles" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="themes-section__particle" />
        ))}
      </div>

      <div className="container">
        <motion.div
          className="themes-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label themes-label-ornament">
            <span className="themes-label-line" aria-hidden="true" />
            Our Themes
            <span className="themes-label-line" aria-hidden="true" />
          </div>
          <h2 className="themes-heading">
            <span className="themes-heading-prefix">Choose Your</span>
            <span className="themes-heading-accent">Story</span>
          </h2>
          <p className="section-subtitle">
            Three immersive worlds — each crafted to celebrate your moment with elegance, warmth, and unforgettable detail.
          </p>
          {(dateStr || slotStr) && (
            <motion.div
              className="themes-booking-ctx"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="themes-booking-ctx-icon">✦</span>
              <span>
                Your slot is reserved for
                {dateStr && <strong> {dateStr}</strong>}
                {slotStr && <> at <strong>{slotStr}</strong></>}
                — now choose your theme below.
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Cinematic carousel stage ── */}
      <div
        className="themes-cine-stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          setPaused(true)
          onTouchStart(e)
        }}
        onTouchEnd={(e) => {
          onTouchEnd(e)
          setPaused(false)
        }}
        aria-label="Theme experience carousel"
        role="region"
      >
        {/* Ambient spotlight behind center card */}
        <div className="themes-cine-spotlight" aria-hidden />
        <div className="themes-cine-track">
          {themes.map((theme, i) => {
            const state = getCardState(i)
            return (
              <motion.div
                key={theme.key}
                className={`themes-cine-card themes-cine-card--${state}`}
                animate={{
                  scale:   state === 'active' ? (compactCarousel ? 1 : 1.06) : (compactCarousel ? 0.68 : 0.78),
                  x:       state === 'active' ? '0%'    : state === 'right' ? sideOffset : `-${sideOffset}`,
                  rotateY: state === 'active' ? 0       : state === 'right' ? -10 : 10,
                  opacity: state === 'active' ? 1       : 0.42,
                  zIndex:  state === 'active' ? 3       : 1,
                }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ cursor: 'pointer' }}
              >
                <ThemeCard
                  theme={theme}
                  index={i}
                  inView={inView}
                  inCarousel
                  onBook={onBook}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Nav arrows */}
        <button className="themes-cine-arrow themes-cine-arrow--prev" onClick={prev} aria-label="Previous theme">‹</button>
        <button className="themes-cine-arrow themes-cine-arrow--next" onClick={next} aria-label="Next theme">›</button>

        {/* Dots */}
        <div className="themes-cine-dots" role="tablist" aria-label="Theme selection">
          {themes.map((_, i) => (
            <button
              key={i}
              className={`themes-cine-dot${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Theme ${i + 1}`}
              aria-selected={i === active}
              role="tab"
            />
          ))}
        </div>
      </div>


    </section>
  )
}
