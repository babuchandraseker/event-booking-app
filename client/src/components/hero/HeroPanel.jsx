import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { videoMimeFromUrl } from '../../lib/hero/validateHeroMedia.js'

/**
 * Single cinematic hero column with background video, overlays, and optional CTA.
 */
export default function HeroPanel({
  panel,
  isExpanded,
  isDimmed,
  showExploreCta,
  onExplore,
  onHoverStart,
  onHoverEnd,
  className = '',
  splitLayout = false,
  chipLabel = '',
  sequentialPlay = false,
  onVideoEnded,
}) {
  const videoRef = useRef(null)

  const handleCta = useCallback(
    (e) => {
      e.stopPropagation()
      const link = String(panel.buttonLink || '').trim()
      if (!link) {
        onExplore()
        return
      }
      if (link.startsWith('#')) {
        document.querySelector(link)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (/^https?:\/\//i.test(link)) {
        window.open(link, '_blank', 'noopener,noreferrer')
        return
      }
      window.location.assign(link)
    },
    [onExplore, panel.buttonLink],
  )

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (isExpanded) {
      el.currentTime = 0
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } else {
      el.pause()
    }
  }, [isExpanded])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !sequentialPlay) return undefined
    const handleEnded = () => {
      if (isExpanded && onVideoEnded) onVideoEnded()
    }
    el.addEventListener('ended', handleEnded)
    return () => el.removeEventListener('ended', handleEnded)
  }, [sequentialPlay, isExpanded, onVideoEnded])

  // Use only Hero-panel video fields. Hero videos are uploaded via the Hero CMS
  // (hero/videos/ on Cloudinary). Never use scrollyMedia.video here — that field
  // holds Theme scrollytelling videos (themes/<id>/ on Cloudinary) which are
  // separate assets; mixing them caused 404 errors from double-path Cloudinary URLs.
  const videoSrc = panel.videoUrl || panel.mp4Url || panel.videoSrc
  const poster = panel.poster ?? panel.posterImage
  const videoType = videoMimeFromUrl(videoSrc)

  const panelClass = [
    'group relative h-full min-h-0 overflow-hidden',
    splitLayout ? 'hero-panel--split' : '',
    splitLayout && isExpanded ? 'hero-panel--active' : '',
    splitLayout ? '' : 'lg:border-r lg:border-black/40 lg:last:border-r-0',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={panelClass}
      aria-label={`${panel.title} experience`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{ minWidth: 0 }}
    >
      <video
        key={videoSrc}
        ref={videoRef}
        className={`hero-panel__video absolute inset-0 h-full w-full object-cover ${
          splitLayout
            ? 'hero-panel__video--split'
            : 'scale-105 transition-[filter,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:brightness-110'
        }`}
        muted
        loop={!sequentialPlay}
        playsInline
        autoPlay={splitLayout}
        preload={splitLayout ? 'auto' : 'metadata'}
        poster={poster}
        aria-hidden={!isExpanded}
      >
        <source src={videoSrc} type={videoType} />
      </video>

      <div
        className={`hero-panel__panel-overlay pointer-events-none absolute inset-0 bg-gradient-to-b ${panel.overlay}`}
        aria-hidden
      />

      <div
        className={`hero-panel__panel-glow pointer-events-none absolute inset-0 bg-gradient-to-br ${panel.glow} opacity-75 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-90`}
        aria-hidden
      />

      {splitLayout && <div className="hero-panel__cinematic-tint" aria-hidden />}

      <div
        className="hero-panel__warm-vignette pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
      />

      {splitLayout && <div className="hero-panel__edge-blur" aria-hidden />}
      {splitLayout && <div className="hero-panel__blend-mask" aria-hidden />}

      {splitLayout && chipLabel && (
        <div className="hero-panel__chip-label">
          <span className="hero-panel__chip-label-text">{chipLabel}</span>
          <span className="hero-panel__chip-label-rule" aria-hidden />
        </div>
      )}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        animate={{
          backgroundColor: isDimmed
            ? 'rgba(35,7,69,0.08)'
            : splitLayout && !isExpanded
              ? 'rgba(35,7,69,0.04)'
              : 'rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.35 }}
      />

      {!splitLayout && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-200/25 to-transparent opacity-60"
          aria-hidden
        />
      )}

      {!splitLayout && (
        <div className="relative z-[2] flex h-full min-h-[100svh] flex-col justify-end p-6 pb-40 pt-24 sm:p-8 lg:min-h-0 lg:p-10 lg:pb-36 lg:pt-20">
          <motion.div
            initial={false}
            animate={{ y: isExpanded ? 0 : 12, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md"
          >
            <motion.h2
              className="font-display text-3xl font-light tracking-tight text-[#f5f0e8] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-4xl lg:text-5xl"
              animate={{ y: isExpanded ? 0 : 6 }}
              transition={{ duration: 0.4 }}
            >
              {panel.title}
            </motion.h2>
            <motion.p
              className="mt-2 max-w-xs font-body text-sm font-light leading-relaxed text-[#c9c2b8]/95 sm:text-base"
              animate={{ y: isExpanded ? 0 : 4, opacity: isExpanded ? 1 : 0.88 }}
              transition={{ duration: 0.4, delay: 0.02 }}
            >
              {panel.subtitle}
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {showExploreCta && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8"
              >
                <button
                  type="button"
                  onClick={handleCta}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(215,172,40,0.45)] bg-[rgba(255,255,255,0.18)] px-6 py-3 font-body text-xs font-medium uppercase tracking-[0.2em] text-[#F7F1FA] shadow-[0_10px_36px_rgba(61,0,102,0.35)] backdrop-blur-md transition-all duration-300 hover:border-[rgba(232,197,90,0.65)] hover:bg-[rgba(255,255,255,0.28)] hover:shadow-[0_0_32px_rgba(215,172,40,0.35)] sm:text-sm"
                >
                  <span aria-hidden className="text-amber-300/90">
                    ✦
                  </span>
                  {panel.buttonText || 'Explore Experience'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </article>
  )
}
