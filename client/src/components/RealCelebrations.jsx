import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import GalleryGrid from './gallery/GalleryGrid'
import { useGallery } from '../hooks/useGallery'

/**
 * RealCelebrations — premium cinematic IMAGE gallery section.
 *
 * - All reel/video logic removed.
 * - Fully dynamic: data comes from useGallery (localStorage → Firebase-ready).
 * - Admin manages gallery via /control-panel-7x9/gallery.
 * - Same #gallery anchor and page flow preserved.
 *
 * Firebase integration:
 *   useGallery already contains the Firestore snapshot hook-in point.
 *   Swap localStorage read/write with Firestore onSnapshot.
 */
export default function RealCelebrations({ onBook }) {
  const headerRef = useRef(null)
  const inView = useInView(headerRef, { once: true, margin: '-60px' })

  const { items, loading } = useGallery()

  const handleCta = () => {
    if (typeof onBook === 'function') onBook()
    else document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="rc-section"
      id="gallery"
      aria-label="Real Celebrations gallery"
    >
      {/* Ambient radial glow */}
      <div className="rc-ambient" aria-hidden />

      <div className="container rc-container">
        {/* ── Section Header ── */}
        <motion.div
          ref={headerRef}
          className="rc-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rc-label-wrap">
            <span className="rc-label-icon" aria-hidden>✦</span>
            <span className="rc-label-text">Real Celebrations</span>
            <span className="rc-label-icon" aria-hidden>✦</span>
          </div>

          <h2 className="rc-heading">
            Real moments.{' '}
            <em className="rc-heading-em">Real emotions.</em>
          </h2>

          <p className="rc-subheading">
            Luxury memories crafted for unforgettable nights — every frame a feeling,
            every detail a declaration.
          </p>

          <div className="rc-divider" aria-hidden>
            <span className="rc-divider-line" />
            <span className="rc-divider-gem">◆</span>
            <span className="rc-divider-line" />
          </div>
        </motion.div>

        {/* ── Image Gallery Grid ── */}
        {loading ? (
          <div className="rc-gallery-loading" aria-label="Loading gallery">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="rc-gallery-skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : (
          <GalleryGrid items={items} onCta={handleCta} />
        )}

        {/* ── Bottom CTA strip ── */}
        <motion.div
          className="rc-footer-strip"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="rc-footer-text">
            Every celebration is a masterpiece waiting to be created.
          </p>
          <button
            className="rc-footer-btn"
            onClick={handleCta}
            type="button"
          >
            <span>Book Your Experience</span>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden>
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
