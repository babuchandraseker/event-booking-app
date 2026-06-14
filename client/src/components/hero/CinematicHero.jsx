import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { useHeroContent } from '../../hooks/useHeroContent.js'
import { useSwipeGesture } from '../../hooks/useSwipeGesture.js'
import { clearQuickReserveContext } from '../../utils/bookingContext.js'
import { scrollToSection } from '../../utils/scrollTo.js'
import SlotAvailabilitySection from '../SlotAvailabilitySection.jsx'
import HeroLuxuryPanel from './HeroLuxuryPanel.jsx'

// ─── Pick best MP4 src — never HLS ───────────────────────────────────────────
// ImageKit URLs are served directly from CDN.


function resolveMp4Src(panel) {
  const candidates = [panel?.mp4Url, panel?.videoSrc, panel?.videoUrl]
  for (const c of candidates) {
    if (c && typeof c === 'string' && !c.endsWith('.m3u8') && c.trim() !== '') {
      return c
    }
  }
  return ''
}

// ─── HeroVideoPlayer ──────────────────────────────────────────────────────────
// Single always-mounted <video>. Swaps src dynamically.
// Props:
//   src        — current video URL
//   poster     — poster image URL
//   onReady()  — called once video can play (triggers fade-in)
//   onEnded()  — called when video finishes (triggers auto-advance)
//   opacity    — controlled fade value (0–1)
const HeroVideoPlayer = memo(function HeroVideoPlayer({ src, poster, onReady, onEnded, opacity }) {
  const videoRef   = useRef(null)
  const prevSrcRef = useRef('')
  const readyFired = useRef(false)
  // Keep onEnded / onReady in a ref so the event listener closure is always current
  const onEndedRef = useRef(onEnded)
  const onReadyRef = useRef(onReady)
  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
  useEffect(() => { onReadyRef.current = onReady }, [onReady])

  // Wire up the 'ended' listener once on mount — never torn down
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const handleEnded = () => onEndedRef.current?.()
    el.addEventListener('ended', handleEnded)
    return () => el.removeEventListener('ended', handleEnded)
  }, [])

  // Swap src whenever it changes
  useEffect(() => {
    const el = videoRef.current
    if (!el || !src) return
    if (src === prevSrcRef.current) return

    prevSrcRef.current = src
    readyFired.current = false

    el.pause()

    const fireReady = () => {
      if (!readyFired.current) {
        readyFired.current = true
        onReadyRef.current?.()
        // play() — handle both promise (modern) and void (old iOS)
        const p = el.play()
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            // Autoplay blocked — show overlay (handled in parent)
          })
        }
      }
    }

    // canplay fires earlier than canplaythrough; good enough to start
    el.addEventListener('canplay', fireReady, { once: true })
    el.src = src
    el.load()

    // Fallback: some mobile browsers never fire canplay for local files
    const fallback = setTimeout(() => {
      if (!readyFired.current) {
        readyFired.current = true
        onReadyRef.current?.()
        const p = el.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      }
    }, 1200)

    return () => {
      clearTimeout(fallback)
      el.removeEventListener('canplay', fireReady)
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      className="hero-video-el"
      // NO loop — we handle cycling ourselves via 'ended'
      autoPlay
      muted
      playsInline
      preload="metadata"
      disablePictureInPicture
      poster={poster}
      aria-hidden
      style={{ opacity, transition: 'opacity 0.4s ease' }}
    />
  )
})

// ─── Poster-only slide ────────────────────────────────────────────────────────
const PosterSlide = memo(function PosterSlide({ src, alt }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt || ''}
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
      decoding="async"
    />
  )
})

// ─── Active poster slide ──────────────────────────────────────────────────────
const ActivePosterSlide = memo(function ActivePosterSlide({ src, alt }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt || ''}
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover"
      fetchpriority="high"
      decoding="async"
    />
  )
})

// ─── Autoplay-blocked overlay ─────────────────────────────────────────────────
const BlockedOverlay = memo(function BlockedOverlay({ onUnblock }) {
  return (
    <button
      type="button"
      aria-label="Play video"
      onClick={onUnblock}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/40 cursor-pointer"
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        border: '2px solid rgba(215,172,40,0.7)',
        background: 'rgba(215,172,40,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 32px rgba(215,172,40,0.3)',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(215,172,40,0.95)">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </div>
      <span style={{
        fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)',
        fontSize: '0.7rem', fontWeight: 700,
        letterSpacing: '0.28em', textTransform: 'uppercase',
        color: 'rgba(215,172,40,0.85)',
      }}>
        Tap to Play
      </span>
    </button>
  )
})

// ─── Thumbnail bar ────────────────────────────────────────────────────────────
const ThumbnailBar = memo(function ThumbnailBar({ panels, activeIndex, onSelect }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center gap-2 pb-5 px-4 sm:pb-6 sm:gap-3">
      {panels.map((panel, i) => {
        const poster   = panel.poster || panel.posterImage || ''
        const isActive = i === activeIndex
        return (
          <button
            key={panel.id}
            type="button"
            aria-label={`Show ${panel.title}`}
            aria-current={isActive}
            onClick={() => onSelect(i)}
            className={[
              'relative flex-shrink-0 rounded-lg overflow-hidden border-2 hero-thumb-btn',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7ac28]',
              isActive
                ? 'border-[#d7ac28] w-20 h-14 sm:w-24 sm:h-16 opacity-100'
                : 'border-white/20 w-16 h-11 sm:w-20 sm:h-14 opacity-60 hover:opacity-80 hover:border-white/40',
            ].join(' ')}
            style={isActive ? {
              boxShadow: '0 0 18px rgba(215,172,40,0.45), 0 0 6px rgba(215,172,40,0.3)',
            } : {}}
          >
            {poster
              ? <img src={poster} alt={panel.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              : <div className="absolute inset-0 bg-[#2e1848]" />
            }
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(215,172,40,0.22)] to-transparent" />
            )}
            {/* Progress bar at bottom of active thumb */}
            {isActive && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: 'rgba(215,172,40,0.7)',
              }} />
            )}
            <span className="absolute bottom-1 left-1 right-1 text-[0.5rem] font-semibold tracking-widest uppercase text-center truncate text-white/90 drop-shadow">
              {panel.title}
            </span>
          </button>
        )
      })}
    </div>
  )
})

// ─── Arrow navigation ─────────────────────────────────────────────────────────
const NavArrow = memo(function NavArrow({ dir, onClick }) {
  return (
    <button
      type="button"
      aria-label={dir === 'prev' ? 'Previous theme' : 'Next theme'}
      onClick={onClick}
      className={[
        'absolute top-1/2 -translate-y-1/2 z-20',
        'w-10 h-10 sm:w-12 sm:h-12 rounded-full',
        'flex items-center justify-center',
        'border border-white/20 bg-black/25',
        'text-white/80 hover:text-[#d7ac28] hover:border-[rgba(215,172,40,0.45)]',
        'hero-nav-arrow',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7ac28]',
        dir === 'prev' ? 'left-3 sm:left-5' : 'right-3 sm:right-5',
      ].join(' ')}
    >
      {dir === 'prev' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  )
})

// ─── Main component ───────────────────────────────────────────────────────────
export default memo(function CinematicHero() {
  const { ready, visiblePanelsForSite } = useHeroContent()
  const panels = useMemo(() => visiblePanelsForSite, [visiblePanelsForSite])
  const count  = panels.length

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeIndex,    setActiveIndex]    = useState(0)
  const [videoOpacity,   setVideoOpacity]   = useState(0)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [isDragging,     setIsDragging]     = useState(false)
  const [readyToLoadVideo, setReadyToLoadVideo] = useState(false)

  // Refs to avoid stale closures in callbacks
  const activeIndexRef  = useRef(0)
  const isSwitchingRef  = useRef(false)
  const switchTimerRef  = useRef(null)
  const countRef        = useRef(count)

  // Defer background video loading until page is interactive
  useEffect(() => {
    const handleLoad = () => {
      const t = setTimeout(() => setReadyToLoadVideo(true), 1500)
      return () => clearTimeout(t)
    }

    if (document.readyState === 'complete') {
      const cleanup = handleLoad()
      return cleanup
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  // ── Callback ref for the hero <section> ───────────────────────────────────
  // We use useState (not useRef) so that when React assigns the DOM node,
  // a re-render is triggered. useSwipeGesture depends on `sectionEl` directly;
  // when it changes from null → HTMLElement, the swipe effect re-runs and
  // attaches all touch/mouse listeners to the real DOM node.
  //
  // With the old pattern (useRef + passing ref object), useSwipeGesture's effect
  // ran once during the loading skeleton phase (ref.current = null → no-op) and
  // never re-ran after the real section mounted, leaving zero touch listeners.
  const [sectionEl, setSectionEl] = useState(null)
  const setSectionRef = useCallback((node) => {
    if (node !== null) setSectionEl(node)
  }, [])

  useEffect(() => { activeIndexRef.current = activeIndex }, [activeIndex])
  useEffect(() => { countRef.current = count }, [count])

  // ── Resolve video srcs once ────────────────────────────────────────────────
  const resolvedSrcs = useMemo(() =>
    panels.map(p => ({
      mp4:    resolveMp4Src(p),
      poster: p.poster || p.posterImage || '',
    })),
    [panels]
  )

  const safeIndex    = count > 0 ? Math.min(activeIndex, count - 1) : 0
  const activeSrc    = resolvedSrcs[safeIndex]?.mp4    || ''
  const activePoster = resolvedSrcs[safeIndex]?.poster || ''

  // ── Core switch logic ──────────────────────────────────────────────────────
  // fade out → update index → video player loads new src → onReady fades in
  const switchTo = useCallback((nextIdx) => {
    const n = countRef.current
    if (n === 0 || isSwitchingRef.current) return
    const target = ((nextIdx % n) + n) % n

    isSwitchingRef.current = true
    setVideoOpacity(0)

    clearTimeout(switchTimerRef.current)
    switchTimerRef.current = setTimeout(() => {
      setActiveIndex(target)
      // isSwitchingRef reset happens inside handleVideoReady once src loads
    }, 350)
  }, [])

  // Called by HeroVideoPlayer once new video can play
  const handleVideoReady = useCallback(() => {
    isSwitchingRef.current = false
    setVideoOpacity(1)
    setAutoplayBlocked(false)
  }, [])

  // Called by HeroVideoPlayer when video finishes — auto-advance
  const handleVideoEnded = useCallback(() => {
    const n = countRef.current
    if (n < 2) {
      // Single video: just replay
      const el = document.querySelector('.hero-video-el')
      if (el) { el.currentTime = 0; el.play().catch(() => {}) }
      return
    }
    switchTo(activeIndexRef.current + 1)
  }, [switchTo])

  // Manual thumbnail / arrow selection
  const handleManual = useCallback((idx) => {
    if (idx === activeIndexRef.current && !isSwitchingRef.current) return
    switchTo(idx)
  }, [switchTo])
  const handlePrev = useCallback(() => switchTo(activeIndexRef.current - 1), [switchTo])
  const handleNext = useCallback(() => switchTo(activeIndexRef.current + 1), [switchTo])

  // ── Swipe gestures (req 1–5, 9) ───────────────────────────────────────────
  // swipe left → next; swipe right → prev
  // Vertical-scroll protection built into the hook (lockAngle = 30°)
  // Pass the DOM node directly — hook re-runs whenever sectionEl changes
  useSwipeGesture(sectionEl, handleNext, handlePrev, {
    threshold:         48,
    velocityThreshold: 0.28,
    lockAngle:         30,
  })

  // Grabbing cursor feedback during mouse drag
  useEffect(() => {
    if (!sectionEl || count < 2) return
    const onDown = () => setIsDragging(true)
    const onUp   = () => setIsDragging(false)
    sectionEl.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      sectionEl.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [sectionEl, count])

  // Unblock autoplay after first user gesture
  const handleUnblock = useCallback(() => {
    setAutoplayBlocked(false)
    const el = document.querySelector('.hero-video-el')
    if (el) {
      const p = el.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => setAutoplayBlocked(true))
      }
    }
  }, [])

  // Detect autoplay blocked on initial load (opacity stays 0 after 2s)
  useEffect(() => {
    if (!ready || count === 0) return
    const timer = setTimeout(() => {
      if (videoOpacity === 0) {
        setAutoplayBlocked(true)
        // Still show the poster
        setVideoOpacity(1)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [ready, count]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timers on unmount
  useEffect(() => () => clearTimeout(switchTimerRef.current), [])

  // Nav callbacks
  const scrollThemesTop = useCallback(() => {
    clearQuickReserveContext()
    scrollToSection('#themes')
  }, [])
  const howToBook = useCallback(() => {
    scrollToSection('#how-it-works')
  }, [])

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (!ready || count === 0) {
    return (
      <section
        id="home"
        className="cinematic-hero cinematic-hero--immersive relative isolate flex min-h-[100svh] items-center justify-center bg-[#1a0f28] text-[#F6EBC7]"
        style={{ contain: 'layout paint' }}
      >
        <div className="cinematic-hero__grain pointer-events-none absolute inset-0 z-[5]" aria-hidden />
        <p className="font-body text-sm tracking-wide text-[#c9c2b8]/80">Loading…</p>
      </section>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      ref={setSectionRef}
      id="home"
      className="cinematic-hero cinematic-hero--immersive relative isolate overflow-hidden text-[#EFD9F7]"
      style={{
        minHeight: '100svh',
        contain: 'layout paint',
        cursor: count > 1 ? (isDragging ? 'grabbing' : 'grab') : undefined,
        // SWIPE FIX: tell the browser this element handles horizontal gestures in JS.
        // pan-y = allow vertical scroll; pinch-zoom = allow native pinch.
        // Without this, some Android browsers apply their own swipe heuristics
        // and cancel our touchmove before useSwipeGesture can read it.
        touchAction: 'pan-y pinch-zoom',
      }}
    >
      <div className="cinematic-hero__grain pointer-events-none absolute inset-0 z-[12]" aria-hidden />

      {/* ── Background layer ── */}
      <div className="hero-bg-layer">
        {/* Inactive panels: poster only */}
        {panels.map((panel, i) => {
          if (i === safeIndex) return null
          return (
            <PosterSlide
              key={panel.id}
              src={resolvedSrcs[i]?.poster}
              alt={panel.title}
            />
          )
        })}

        {/* Active panel poster: loaded eagerly */}
        <ActivePosterSlide
          src={activePoster}
          alt={panels[safeIndex]?.title}
        />

        {/* Single always-mounted video element (deferred load) */}
        {readyToLoadVideo && (
          <HeroVideoPlayer
            src={activeSrc}
            poster={activePoster}
            onReady={handleVideoReady}
            onEnded={handleVideoEnded}
            opacity={videoOpacity}
          />
        )}

        <div className="cinematic-hero__blend-overlay" aria-hidden />
        <div className="cinematic-hero__depth-vignette" aria-hidden />
      </div>

      {/* Autoplay blocked overlay */}
      {autoplayBlocked && (
        <BlockedOverlay onUnblock={handleUnblock} />
      )}

      {/* Nav arrows */}
      {count > 1 && (
        <>
          <NavArrow dir="prev" onClick={handlePrev} />
          <NavArrow dir="next" onClick={handleNext} />
        </>
      )}

      {/* Foreground content */}
      <div className="cinematic-hero__foreground">
        <div className="cinematic-hero__content">
          <HeroLuxuryPanel onExploreExperiences={scrollThemesTop} onHowToBook={howToBook} />
        </div>
        <SlotAvailabilitySection variant="hero" />
      </div>

      {/* Thumbnail bar */}
      {count > 1 && (
        <ThumbnailBar
          panels={panels}
          activeIndex={safeIndex}
          onSelect={handleManual}
        />
      )}
    </section>
  )
})
