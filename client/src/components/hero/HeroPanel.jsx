import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { videoMimeFromUrl } from '../../lib/hero/validateHeroMedia.js'

/**
 * Single cinematic hero column with background video, overlays, and CTA.
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
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } else {
      el.pause()
    }
  }, [isExpanded])

  const videoSrc = panel.videoSrc || panel.videoUrl
  const poster = panel.poster ?? panel.posterImage
  const videoType = videoMimeFromUrl(videoSrc)

  return (
    <article
      className={`group relative h-full min-h-0 overflow-hidden lg:border-r lg:border-black/40 lg:last:border-r-0 ${className}`}
      aria-label={`${panel.title} experience`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{ minWidth: 0 }}
    >
      {/* Background video */}
      <video
        key={videoSrc}
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-105 object-cover transition-[filter,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:brightness-110"
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden={!isExpanded}
      >
        <source src={videoSrc} type={videoType} />
      </video>

      {/* Cinematic dark base */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${panel.overlay}`}
        aria-hidden
      />

      {/* Violet / gold ambient glow */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${panel.glow} opacity-70 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100`}
        aria-hidden
      />

      {/* Edge vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)] opacity-80"
        aria-hidden
      />

      {/* Dim sibling panels */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/0"
        animate={{ backgroundColor: isDimmed ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.35 }}
      />

      {/* Soft vertical “split” highlight */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-200/25 to-transparent opacity-60"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-[2] flex h-full min-h-[100svh] flex-col justify-end p-6 pb-40 pt-24 sm:p-8 lg:min-h-0 lg:p-10 lg:pb-36 lg:pt-20">
        <motion.div
          initial={false}
          animate={{
            y: isExpanded ? 0 : 12,
            opacity: 1,
          }}
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
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-[rgba(12,10,28,0.55)] px-6 py-3 font-body text-xs font-medium uppercase tracking-[0.2em] text-amber-100/95 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 hover:border-amber-300/50 hover:bg-[rgba(24,18,48,0.65)] hover:shadow-[0_0_28px_rgba(200,168,75,0.25)] sm:text-sm"
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
    </article>
  )
}
