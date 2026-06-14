import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import ReviewCard from './ReviewCard'

const GAP = 16

function getLayout() {
  if (typeof window === 'undefined') return { cardWidth: 340, visible: 1 }
  const w = window.innerWidth
  // Mobile: one card fills viewport minus carousel side padding (12px each side)
  if (w < 640) return { cardWidth: w - 24, visible: 1 }
  if (w < 1024) return { cardWidth: 320, visible: 2 }
  return { cardWidth: 340, visible: 3 }
}

export default function ReviewsCarousel({ reviews }) {
  const [index, setIndex] = useState(0)
  const [layout, setLayout] = useState(getLayout)
  const x = useMotionValue(0)
  const isPaused = useRef(false)
  const viewportRef = useRef(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const { cardWidth, visible } = layout
  const maxIndex = Math.max(0, reviews.length - visible)
  const step = cardWidth + GAP

  useEffect(() => {
    const onResize = () => setLayout(getLayout())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    queueMicrotask(() => setIndex((i) => Math.min(i, maxIndex)))
  }, [maxIndex])

  useEffect(() => {
    const target = -index * step
    const controls = animate(x, target, { duration: 0.55, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [index, step, x])

  useEffect(() => {
    if (reviews.length <= visible || isPaused.current) return undefined
    const id = window.setInterval(() => {
      if (isPaused.current) return
      setIndex((i) => (i >= maxIndex ? 0 : i + 1))
    }, 5000)
    return () => window.clearInterval(id)
  }, [reviews.length, visible, maxIndex])

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1))
  }, [maxIndex])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1))
  }, [maxIndex])

  const pause = () => { isPaused.current = true }
  const resume = () => { isPaused.current = false }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    pause()
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - (touchStartY.current || 0)
    // Only swipe if horizontal movement dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
    touchStartY.current = null
    resume()
  }

  if (reviews.length === 0) return null

  const dotCount = maxIndex + 1

  return (
    <div
      className="reviews-lux-carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="reviews-lux-carousel__inner">
        <button
          type="button"
          className="reviews-lux-nav reviews-lux-nav--prev"
          onClick={goPrev}
          aria-label="Previous testimonial"
        >
          ‹
        </button>

        <div className="reviews-lux-viewport" ref={viewportRef}>
          <motion.div className="reviews-lux-track" style={{ x, gap: GAP }}>
            {reviews.map((review, i) => (
              <ReviewCard
                key={review.id || i}
                review={review}
                style={{ width: cardWidth, flexShrink: 0 }}
              />
            ))}
          </motion.div>
        </div>

        <button
          type="button"
          className="reviews-lux-nav reviews-lux-nav--next"
          onClick={goNext}
          aria-label="Next testimonial"
        >
          ›
        </button>
      </div>

      {dotCount > 1 && (
        <div className="reviews-lux-dots" role="tablist" aria-label="Testimonial slides">
          {Array.from({ length: dotCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`reviews-lux-dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
