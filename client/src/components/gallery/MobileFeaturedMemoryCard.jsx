import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MOBILE_FEATURED_SLIDES } from '../../data/mobileFeaturedMemories'

const ROTATE_MS = 2000

/**
 * Mobile featured memory — auto-rotating cinematic card with hold-to-pause.
 */
export default function MobileFeaturedMemoryCard({ slides = MOBILE_FEATURED_SLIDES, onCta }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const holdRef = useRef(false)

  const slide = slides[index] ?? slides[0]

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (paused || slides.length < 2) return undefined
    const id = window.setInterval(advance, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused, advance, slides.length])

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
              key={slide?.id ?? index}
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

        {slides.length > 1 && (
          <div className="rc-mob-featured-dots" aria-hidden>
            {slides.map((s, i) => (
              <span
                key={s.id}
                className={`rc-mob-featured-dot${i === index ? ' is-active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
