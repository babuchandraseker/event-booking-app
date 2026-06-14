import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import HeroPanel from './HeroPanel'
import HeroLuxuryPanel from './HeroLuxuryPanel'
import HeroParticles from './HeroParticles'
import SlotAvailabilitySection from '../SlotAvailabilitySection'
import { useHeroContent } from '../../hooks/useHeroContent.js'
import { scrollToThemeInGallery } from '../../lib/hero/scrollToThemeInGallery.js'
import { clearQuickReserveContext } from '../../utils/bookingContext.js'

const EXPERIENCE_TAGS = ['Romantic', 'Birthday', 'Luxury Surprise']

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

function splitGridTemplate(count, highlightIndex, reduceMotion) {
  if (reduceMotion || count <= 0) return count > 0 ? Array(count).fill('1fr').join(' ') : '1fr'
  if (count === 1) return '1fr'
  const weights = Array(count).fill(0.68)
  for (let i = 0; i < count; i++) weights[i] = i === highlightIndex ? 1.38 : 0.68
  return weights.map((w) => `${w}fr`).join(' ')
}

export default function CinematicSplitHero() {
  const { ready, visiblePanelsForSite } = useHeroContent()
  const panels = visiblePanelsForSite
  const count = panels.length

  const isLg = useLgUp()
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(null)
  const [autoSlide, setAutoSlide] = useState(0)
  const [mobileSlide, setMobileSlide] = useState(0)
  const videoColRef = useRef(null)
  const activeMobileSlide = count > 0 ? Math.min(mobileSlide, count - 1) : 0

  const advanceMobileSlide = useCallback(() => {
    if (count === 0) return
    setMobileSlide((prev) => (prev + 1) % count)
  }, [count])

  /* Mobile safety advance if `ended` never fires */
  useEffect(() => {
    if (isLg || count === 0) return undefined
    const timer = window.setTimeout(advanceMobileSlide, 20000)
    return () => window.clearTimeout(timer)
  }, [isLg, count, advanceMobileSlide, activeMobileSlide])

  const desktopExpandedIndex = useMemo(() => {
    if (count === 0) return 0
    if (hovered !== null) return Math.min(hovered, count - 1)
    return Math.min(autoSlide, count - 1)
  }, [count, hovered, autoSlide])

  const gridTemplate = useMemo(
    () => splitGridTemplate(count, desktopExpandedIndex, reduceMotion),
    [count, desktopExpandedIndex, reduceMotion],
  )

  const scrollThemesTop = useCallback(() => {
    clearQuickReserveContext()
    document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const howToBook = useCallback(() => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Desktop auto-rotation
  useEffect(() => {
    if (!isLg || count === 0 || hovered !== null) return
    const tick = () => {
      setAutoSlide((prev) => (prev + 1) % count)
    }
    const timer = setInterval(tick, 4500)
    return () => clearInterval(timer)
  }, [isLg, count, hovered])

  const gridTransition = reduceMotion ? { duration: 0 } : { duration: 0.58, ease: [0.16, 1, 0.3, 1] }

  if (!ready || count === 0) {
    return (
      <section
        id="home"
        className="cinematic-hero cinematic-hero--immersive relative isolate flex min-h-[100svh] items-center justify-center bg-[#1a0f28] text-[#F6EBC7]"
      >
        <div className="cinematic-hero__grain pointer-events-none absolute inset-0 z-[5] mix-blend-overlay" aria-hidden />
        <p className="font-body text-sm tracking-wide text-[#c9c2b8]/80">Loading…</p>
      </section>
    )
  }

  return (
    <section
      id="home"
      className="cinematic-hero cinematic-hero--immersive relative isolate overflow-hidden text-[#EFD9F7]"
    >
      <div className="cinematic-hero__grain pointer-events-none absolute inset-0 z-[12] mix-blend-overlay" aria-hidden />
      <div className="cinematic-hero__dust pointer-events-none absolute inset-0 z-[11]" aria-hidden />
      <HeroParticles />

      <div className="cinematic-hero__stage">
        {/* Full-bleed cinematic video canvas */}
        <div ref={videoColRef} className="cinematic-hero__video-canvas" aria-hidden={false}>
          <div
            className="cinematic-hero__video-grid relative hidden h-full w-full lg:block"
            onMouseLeave={() => setHovered(null)}
          >
            <motion.div
              className="grid h-full w-full"
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
                  showExploreCta={false}
                  onExplore={() => scrollToThemeInGallery(panel.themeKey)}
                  onHoverStart={() => setHovered(i)}
                  onHoverEnd={() => {}}
                  splitLayout
                  chipLabel={EXPERIENCE_TAGS[i] || ''}
                />
              ))}
            </motion.div>
          </div>

          <div
            className="cinematic-hero__mobile-videos relative z-[1] h-full w-full lg:hidden"
            role="region"
            aria-roledescription="carousel"
            aria-label="Signature experiences"
          >
            {panels.map((panel, i) => (
              <div
                key={panel.id}
                className={`cinematic-hero__mobile-slide${activeMobileSlide === i ? ' is-active' : ''}`}
                aria-hidden={activeMobileSlide !== i}
              >
                <HeroPanel
                  panel={panel}
                  isExpanded={activeMobileSlide === i}
                  isDimmed={false}
                  showExploreCta={false}
                  onExplore={() => scrollToThemeInGallery(panel.themeKey)}
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                  splitLayout
                  chipLabel={EXPERIENCE_TAGS[i] || ''}
                  sequentialPlay
                  onVideoEnded={advanceMobileSlide}
                />
              </div>
            ))}

            <p className="cinematic-hero__mobile-video-label" key={activeMobileSlide}>
              {EXPERIENCE_TAGS[activeMobileSlide] || ''}
            </p>

            <div className="cinematic-hero__mobile-dots" aria-hidden>
              {panels.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeMobileSlide === i ? 'w-7 bg-[#D7AC28]' : 'w-1.5 bg-white/35'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Luxury cinematic blend — readability + integration */}
        <div className="cinematic-hero__blend-overlay pointer-events-none" aria-hidden />
        <div className="cinematic-hero__warm-wash pointer-events-none" aria-hidden />
        <div className="cinematic-hero__bloom pointer-events-none" aria-hidden />
        <div className="cinematic-hero__depth-vignette pointer-events-none" aria-hidden />
        <div className="cinematic-hero__light-leak pointer-events-none" aria-hidden />

        {/* Floating editorial foreground */}
        <div className="cinematic-hero__foreground">
          <div className="cinematic-hero__content">
            <HeroLuxuryPanel onExploreExperiences={scrollThemesTop} onHowToBook={howToBook} />
          </div>
          <SlotAvailabilitySection variant="hero" />
        </div>
      </div>
    </section>
  )
}
