import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import HeroPanel from './HeroPanel'
import { useHeroContent } from '../../hooks/useHeroContent.js'
import { scrollToThemeInGallery } from '../../lib/hero/scrollToThemeInGallery.js'

function useLgUp() {
  const [lg, setLg] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const fn = () => setLg(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return lg
}

function splitGridTemplate(count, hovered, reduceMotion) {
  if (reduceMotion || count <= 0) return count > 0 ? Array(count).fill('1fr').join(' ') : '1fr'
  if (count === 1) return '1fr'
  const weights = Array(count).fill(0.74)
  const highlight = hovered === null ? Math.min(1, Math.floor(count / 2)) : hovered
  for (let i = 0; i < count; i += 1) {
    weights[i] = i === highlight ? 1.32 : 0.74
  }
  return weights.map((w) => `${w}fr`).join(' ')
}

export default function CinematicSplitHero() {
  const { ready, visiblePanelsForSite } = useHeroContent()
  const panels = visiblePanelsForSite
  const count = panels.length

  const isLg = useLgUp()
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(null)
  const [mobileSlide, setMobileSlide] = useState(0)
  const mobileScrollRef = useRef(null)
  const activeMobileSlide = count > 0 ? Math.min(mobileSlide, count - 1) : 0

  const gridTemplate = useMemo(
    () => splitGridTemplate(count, hovered, reduceMotion),
    [count, hovered, reduceMotion],
  )

  const desktopExpandedIndex = useMemo(() => {
    if (count === 0) return 0
    if (hovered === null) return Math.min(1, Math.floor(count / 2))
    return Math.min(hovered, count - 1)
  }, [count, hovered])

  const scrollThemesTop = useCallback(() => {
    document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (isLg || count === 0) return
    const el = mobileScrollRef.current
    if (!el) return
    const run = () => {
      const w = el.clientWidth
      if (w > 0) {
        const start = Math.min(1, Math.max(0, count - 1))
        el.scrollLeft = w * start
      }
    }
    requestAnimationFrame(run)
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
  }, [isLg, count])

  const onMobileScroll = useCallback(
    (e) => {
      const el = e.currentTarget
      const w = el.clientWidth
      if (!w) return
      const idx = Math.round(el.scrollLeft / w)
      if (idx >= 0 && idx < count) {
        setMobileSlide((prev) => (prev === idx ? prev : idx))
      }
    },
    [count],
  )

  const gridTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.58, ease: [0.16, 1, 0.3, 1] }

  if (!ready || count === 0) {
    return (
      <section id="home" className="cinematic-hero relative isolate flex min-h-[100svh] items-center justify-center bg-[#03030a] text-[#f5f0e8]">
        <div className="cinematic-hero__grain pointer-events-none absolute inset-0 z-[5] opacity-[0.14] mix-blend-overlay" aria-hidden />
        <p className="font-body text-sm tracking-wide text-[#8a8294]">Loading cinematic hero…</p>
      </section>
    )
  }

  return (
    <section id="home" className="cinematic-hero relative isolate bg-[#03030a] text-[#f5f0e8]">
      <div className="cinematic-hero__grain pointer-events-none absolute inset-0 z-[5] opacity-[0.14] mix-blend-overlay" aria-hidden />
      <div className="cinematic-hero__dust pointer-events-none absolute inset-0 z-[4]" aria-hidden />

      <div className="pointer-events-none absolute left-0 right-0 top-[4.5rem] z-20 flex justify-center px-4 sm:top-24 lg:top-[5.25rem]">
        <span className="rounded-full border border-amber-200/15 bg-black/30 px-4 py-1.5 font-body text-[0.62rem] uppercase tracking-[0.28em] text-amber-100/80 shadow-lg backdrop-blur-md sm:text-[0.68rem]">
          ✦ Premium Private Events · Chennai
        </span>
      </div>

      <div
        className="relative z-[1] hidden min-h-[100svh] lg:block"
        onMouseLeave={() => setHovered(null)}
      >
        <motion.div
          className="grid h-[100svh] min-h-[640px] w-full max-w-[100vw]"
          initial={false}
          animate={{ gridTemplateColumns: gridTemplate }}
          transition={gridTransition}
          style={{ gridAutoRows: '1fr' }}
        >
          {panels.map((panel, i) => (
            <HeroPanel
              key={panel.id}
              panel={panel}
              isExpanded={desktopExpandedIndex === i}
              isDimmed={hovered !== null && hovered !== i}
              showExploreCta={desktopExpandedIndex === i}
              onExplore={() => scrollToThemeInGallery(panel.themeKey)}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => {}}
            />
          ))}
        </motion.div>
      </div>

      <div className="relative z-[1] lg:hidden">
        <div
          ref={mobileScrollRef}
          className="cinematic-hero-snap flex h-[100svh] snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]"
          style={{ scrollbarWidth: 'none' }}
          onScroll={onMobileScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label="Signature experiences"
        >
          {panels.map((panel, i) => (
            <div
              key={panel.id}
              className="relative h-full w-[100vw] min-w-[100vw] flex-shrink-0 snap-center snap-always"
            >
              <HeroPanel
                panel={panel}
                isExpanded={activeMobileSlide === i}
                isDimmed={false}
                showExploreCta={activeMobileSlide === i}
                onExplore={() => scrollToThemeInGallery(panel.themeKey)}
                onHoverStart={() => {}}
                onHoverEnd={() => {}}
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-32 left-0 right-0 z-10 flex justify-center gap-2">
          {panels.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeMobileSlide === i ? 'w-8 bg-amber-200/90' : 'w-2 bg-white/25'
              }`}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-3 px-4 pb-6 pt-10 sm:pb-8">
        <div className="pointer-events-auto flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            className="btn btn-primary btn-hero shadow-[0_12px_40px_rgba(200,168,75,0.35)]"
            onClick={scrollThemesTop}
          >
            <span>✦</span> Book your day
          </button>
          <button type="button" className="btn btn-glass" onClick={scrollThemesTop}>
            All themes
          </button>
        </div>
        <button
          type="button"
          className="pointer-events-auto mt-1 flex flex-col items-center gap-2 border-none bg-transparent font-body text-[0.65rem] uppercase tracking-[0.28em] text-[#8a8294] transition-colors hover:text-amber-100/90"
          onClick={scrollThemesTop}
        >
          <span className="inline-block h-10 w-px bg-gradient-to-b from-amber-300/60 to-transparent" aria-hidden />
          Scroll
        </button>
      </div>
    </section>
  )
}
