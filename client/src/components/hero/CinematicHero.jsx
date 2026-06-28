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
  // Use only Hero-panel video fields — never theme.scrollyMedia.video.
  // Hero videos live at hero/videos/ on Cloudinary (uploaded via the Hero CMS).
  // Theme scrolly videos live at themes/<id>/ — they are separate Cloudinary assets.
  // Mixing them caused hero panels to display theme-upload URLs (404 double-path bug).
  const candidates = [panel?.mp4Url, panel?.videoUrl, panel?.videoSrc]
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
//   onError()  — called when video fails to load
const HeroVideoPlayer = memo(function HeroVideoPlayer({ src, poster, panelKey, onReady, onEnded, opacity, onError }) {
  const videoRef   = useRef(null)
  // FIX: track the *panel* we last loaded for, not just the src string.
  // Previously this compared src === prevSrcRef.current and bailed out (without
  // ever calling onReady) whenever two panels resolved to the same video URL —
  // that permanently left isSwitchingRef stuck `true` in the parent, which
  // silently dropped every future 'ended' event => rotation looked "stuck".
  const prevKeyRef = useRef(null)
  const readyFired = useRef(false)
  // Keep callbacks in refs so event listener closures are always current
  const onEndedRef = useRef(onEnded)
  const onReadyRef = useRef(onReady)
  const onErrorRef = useRef(onError)
  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
  useEffect(() => { onReadyRef.current = onReady }, [onReady])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  // Wire up the 'ended' listener once on mount — never torn down
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const handleEnded = () => {
      console.log('[Hero] Video Ended', panelKey)
      onEndedRef.current?.()
    }
    el.addEventListener('ended', handleEnded)
    return () => el.removeEventListener('ended', handleEnded)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Swap src whenever the active panel changes — skip only if src is empty
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    // FIX: If src is empty/missing, do NOT attempt to load — just fire onReady
    // so the poster stays visible and isSwitchingRef is released in the parent.
    if (!src || src.trim() === '') {
      console.warn('[Hero] HeroVideoPlayer: no video src for this panel — showing poster only', panelKey)
      prevKeyRef.current = panelKey
      onReadyRef.current?.()
      return
    }

    // Only skip if we're still on the SAME panel (not just the same URL).
    // Two different panels can legitimately share one video URL, and each
    // switch must still restart playback + call onReady so the parent's
    // isSwitchingRef lock gets released and rotation keeps going.
    if (panelKey === prevKeyRef.current) return

    prevKeyRef.current = panelKey
    readyFired.current = false

    console.log('[Hero] Switching To', panelKey)
    console.log('[Hero] Next Source', src)

    el.pause()

    let retryAttempted = false
    const attemptPlay = () => {
      console.log('[Hero] Play Attempt', panelKey)
      const p = el.play()
      if (p && typeof p.catch === 'function') {
        p.then(() => {
          console.log('[Hero] Play Success', panelKey)
        }).catch((err) => {
          console.warn('[Hero] Play Failed', err?.message || err)
          // Required fix: retry automatically once before giving up to the
          // autoplay-blocked overlay.
          if (!retryAttempted) {
            retryAttempted = true
            setTimeout(attemptPlay, 250)
          }
        })
      } else {
        console.log('[Hero] Play Success', panelKey)
      }
    }

    const fireReady = () => {
      if (!readyFired.current) {
        readyFired.current = true
        console.log('[Hero] Video Started', panelKey)
        onReadyRef.current?.()
        attemptPlay()
      }
    }

    const handleError = () => {
      console.error('[Hero] Video load error for src:', src,
        'networkState:', el.networkState, 'error:', el.error?.message)
      if (!readyFired.current) {
        readyFired.current = true
        onErrorRef.current?.(src)
        // Still call onReady so the switching lock is released
        onReadyRef.current?.()
      }
    }

    // canplay fires earlier than canplaythrough; good enough to start
    el.addEventListener('canplay', fireReady, { once: true })
    el.addEventListener('error', handleError, { once: true })
    el.src = src
    el.load()

    // Fallback: some mobile browsers never fire canplay for remote videos
    // Reduced from 1200ms to 800ms for faster perceived startup
    const fallback = setTimeout(() => {
      if (!readyFired.current) {
        console.warn('[Hero] canplay fallback fired for src:', src)
        fireReady()
      }
    }, 800)

    return () => {
      clearTimeout(fallback)
      el.removeEventListener('canplay', fireReady)
      el.removeEventListener('error', handleError)
    }
  }, [src, panelKey])

  // Required fallback protection: if the browser's native 'ended' event never
  // fires for some reason (seen on a handful of mobile WebViews), force the
  // rotation forward once we're past the clip's known duration + a buffer.
  useEffect(() => {
    const el = videoRef.current
    if (!el || !src) return
    let backupTimer = null
    const armBackupTimer = () => {
      clearTimeout(backupTimer)
      const duration = el.duration
      if (duration && Number.isFinite(duration) && duration > 0) {
        const remainingMs = Math.max(0, (duration - el.currentTime)) * 1000
        backupTimer = setTimeout(() => {
          // Only fire if the video genuinely never reached 'ended'
          if (!el.ended && el.currentSrc) {
            console.warn('[Hero] Backup advance timer fired — ended event never received', panelKey)
            onEndedRef.current?.()
          }
        }, remainingMs + 1500) // +1.5s buffer
      }
    }
    el.addEventListener('loadedmetadata', armBackupTimer)
    if (el.readyState >= 1) armBackupTimer()
    return () => {
      clearTimeout(backupTimer)
      el.removeEventListener('loadedmetadata', armBackupTimer)
    }
  }, [src, panelKey])

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
  const [activeIndex,     setActiveIndex]     = useState(0)
  const [videoOpacity,    setVideoOpacity]    = useState(0)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [isDragging,      setIsDragging]      = useState(false)

  // FIX: Remove the 1500ms deferred video load entirely.
  // The previous deferral was designed to not block the initial page paint, but
  // it created a race between:
  //   - The 1500ms defer (video element never mounts until then)
  //   - The 2000ms autoplay-blocked detection (fires before video can play)
  //   - The API fetch that provides the real video URLs
  // This caused isSwitchingRef to deadlock (never reset) and the
  // autoplay-blocked overlay to appear incorrectly even when autoplay was fine.
  //
  // The video element is now always mounted once `ready && count > 0`.
  // The <video> tag itself uses preload="metadata" which is already network-light.
  // The poster image provides the visual while the video buffers.

  // Refs to avoid stale closures in callbacks
  const activeIndexRef  = useRef(0)
  const isSwitchingRef  = useRef(false)
  const switchTimerRef  = useRef(null)
  const switchSafetyRef = useRef(null)
  const countRef        = useRef(count)

  // ── Callback ref for the hero <section> ───────────────────────────────────
  // We use useState (not useRef) so that when React assigns the DOM node,
  // a re-render is triggered. useSwipeGesture depends on `sectionEl` directly;
  // when it changes from null → HTMLElement, the swipe effect re-runs and
  // attaches all touch/mouse listeners to the real DOM node.
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

  useEffect(() => {
    if (ready && count > 0 && !activeSrc) {
      console.warn('[Hero] Panel', safeIndex, 'has no video URL — poster-only mode for this panel',
        panels[safeIndex])
    }
  }, [activeSrc, ready, count, panels, safeIndex])

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
      console.log('[Hero] Switching panel index ->', target)
      setActiveIndex(target)
      // isSwitchingRef reset happens inside handleVideoReady once src loads.
      // SAFETY NET: if handleVideoReady never fires for any reason (e.g. a
      // video element / event-binding edge case we haven't anticipated), the
      // isSwitchingRef guard at the top of this function would otherwise
      // block every future 'ended' event forever, freezing the rotation on
      // the panel that just finished. Force-release after a generous timeout
      // so rotation always recovers instead of getting permanently stuck.
      clearTimeout(switchSafetyRef.current)
      switchSafetyRef.current = setTimeout(() => {
        if (isSwitchingRef.current) {
          console.warn('[Hero] isSwitchingRef safety release fired — onReady never arrived for panel', target)
          isSwitchingRef.current = false
          setVideoOpacity(1)
        }
      }, 6000)
    }, 350)
  }, [])

  // Called by HeroVideoPlayer once new video can play (or poster-only fallback)
  const handleVideoReady = useCallback(() => {
    clearTimeout(switchSafetyRef.current)
    isSwitchingRef.current = false
    setVideoOpacity(1)
    setAutoplayBlocked(false)
  }, [])

  // Called by HeroVideoPlayer when video fails to load
  const handleVideoError = useCallback((failedSrc) => {
    console.error('[Hero] Video failed to load, advancing to next panel. src:', failedSrc)
    isSwitchingRef.current = false
    // If a panel's video fails, auto-advance after a short delay
    const n = countRef.current
    if (n > 1) {
      setTimeout(() => switchTo(activeIndexRef.current + 1), 2000)
    }
  }, [switchTo])

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

  // FIX: When a panel has no video (activeSrc is empty), we still need rotation.
  // Use a timer-based fallback: display the poster for 8 seconds then advance.
  // This replaces the old effect that only ran when readyToLoadVideo was set.
  const prevActiveSrcRef = useRef('')
  useEffect(() => {
    // Only start the poster-only rotation timer when:
    // 1. There is no video source for the current panel
    // 2. We're not mid-switch (isSwitchingRef would block switchTo anyway)
    // 3. There are multiple panels to rotate between
    if (!ready || count < 2 || activeSrc) {
      prevActiveSrcRef.current = activeSrc
      return
    }

    // activeSrc is empty — show poster, then rotate
    // Make the poster visible immediately (isSwitchingRef is false here)
    setVideoOpacity(1)
    isSwitchingRef.current = false

    const t = setTimeout(() => {
      switchTo(activeIndexRef.current + 1)
    }, 6000)
    return () => clearTimeout(t)
  }, [activeSrc, count, ready, switchTo])

  // Manual thumbnail / arrow selection
  const handleManual = useCallback((idx) => {
    if (idx === activeIndexRef.current && !isSwitchingRef.current) return
    switchTo(idx)
  }, [switchTo])
  const handlePrev = useCallback(() => switchTo(activeIndexRef.current - 1), [switchTo])
  const handleNext = useCallback(() => switchTo(activeIndexRef.current + 1), [switchTo])

  // ── Swipe gestures ─────────────────────────────────────────────────────────
  // swipe left → next; swipe right → prev
  // Vertical-scroll protection built into the hook (lockAngle = 30°)
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

  // FIX: Autoplay-blocked detection.
  // Previously triggered after 2000ms from `ready` — too early because the
  // video element wasn't even mounted for the first 1500ms, so it would almost
  // always fire before the video had a chance to start playing.
  //
  // New approach:
  //   - Only run this timer when there IS a video src (not poster-only panels)
  //   - Give it 4000ms to account for: HeroVideoPlayer mount + src load +
  //     canplay event + fade-in transition
  //   - If videoOpacity is still 0 after that time, we know autoplay was blocked
  useEffect(() => {
    if (!ready || count === 0 || !activeSrc) return
    const timer = setTimeout(() => {
      if (videoOpacity === 0) {
        console.warn('[Hero] Autoplay appears blocked after 4s — showing overlay')
        setAutoplayBlocked(true)
        setVideoOpacity(1) // Show poster at least
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [ready, count, activeSrc]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timers on unmount
  useEffect(() => () => {
    clearTimeout(switchTimerRef.current)
    clearTimeout(switchSafetyRef.current)
  }, [])

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

        {/* Active panel poster: loaded eagerly — always visible as fallback */}
        <ActivePosterSlide
          src={activePoster}
          alt={panels[safeIndex]?.title}
        />

        {/* FIX: Video element is always mounted once panels are ready.
            The old 1500ms deferred mount (readyToLoadVideo state) has been
            removed because it created a timing race with the autoplay-blocked
            detection timer. The <video> tag uses preload="metadata" so it
            only fetches the first few KB until play() is called — no extra
            bandwidth cost from early mounting. */}
        <HeroVideoPlayer
          src={activeSrc}
          panelKey={panels[safeIndex]?.id ?? safeIndex}
          poster={activePoster}
          onReady={handleVideoReady}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          opacity={videoOpacity}
        />

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
          <HeroLuxuryPanel
            buttonText={panels[safeIndex]?.buttonText}
            onExploreExperiences={scrollThemesTop}
            onHowToBook={howToBook}
          />
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
