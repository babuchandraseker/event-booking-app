import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MOBILE_FEATURED_SLIDES } from '../../data/mobileFeaturedMemories'

const ROTATE_MS = 2000

/**
 * Mobile featured memory — auto-rotating cinematic card with hold-to-pause.
 */
export default function MobileFeaturedMemoryCard({ featured, slides, onCta }) {
  const resolvedSlides = slides || (featured ? [featured] : MOBILE_FEATURED_SLIDES)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const holdRef = useRef(false)

  const slidesList = resolvedSlides.length ? resolvedSlides : MOBILE_FEATURED_SLIDES
  const safeIndex = index < slidesList.length ? index : 0
  const slide = slidesList[safeIndex] ?? slidesList[0]

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % slidesList.length)
  }, [slidesList.length])

  useEffect(() => {
    if (paused || slidesList.length < 2) return undefined
    const id = window.setInterval(advance, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused, advance, slidesList.length])

  const pause = () => {
    holdRef.current = true
    setPaused(true)
  }

  const resume = () => {
    if (!holdRef.current) return
    holdRef.current = false
    setPaused(false)
  }

  const onImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <article
      className="rc-mob-featured"
      aria-label={slide?.alt || slide?.title}
      onPointerDown={pause}
      onPointerUp={resume}
      onPointerCancel={resume}
      onPointerLeave={resume}
    >
      <div className="rc-mob-featured-frame">
        <div className="rc-mob-featured-glow" aria-hidden />

        <div className="rc-mob-featured-media">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide?.id ?? safeIndex}
              className="rc-mob-featured-slide"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              {slide?.src && !imgErrors[slide.id] ? (
                <img
                  src={slide.src}
                  alt={slide.alt || ''}
                  className="rc-mob-featured-img"
                  loading="eager"
                  draggable={false}
                  onError={() => onImgError(slide.id)}
                />
              ) : (
                <div className="rc-mob-featured-fallback" aria-hidden>
                  <span>✦</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="rc-mob-featured-vignette" aria-hidden />
        <div className="rc-mob-featured-glass" aria-hidden />

        <div className="rc-mob-featured-content">
          {slide?.category && (
            <span className="rc-mob-featured-badge">
              <span aria-hidden>👑</span>
              {slide.category}
            </span>
          )}
          <h3 className="rc-mob-featured-title">{slide?.title}</h3>
          {slide?.caption && <p className="rc-mob-featured-caption">{slide.caption}</p>}
          <button
            type="button"
            className="rc-mob-featured-cta"
            onClick={onCta}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span>Explore Experience</span>
            <span className="rc-mob-featured-cta-arrow" aria-hidden>→</span>
          </button>
        </div>

        {slidesList.length > 1 && (
          <div className="rc-mob-featured-dots" aria-hidden>
            {slidesList.map((s, i) => (
              <span
                key={s.id}
                className={`rc-mob-featured-dot${i === safeIndex ? ' is-active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
