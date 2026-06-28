import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import GalleryGrid from './gallery/GalleryGrid'
import { useGallery } from '../hooks/useGallery'
import '../styles/memories-gallery-luxury.css'
import '../styles/memories-gallery-mobile-luxury.css'

/**
 * Real moments · Real emotions — dark luxury cinematic gallery.
 * Section background, floral corners, gold streaks, particles.
 */
export default function RealCelebrations({ onBook }) {
  const headerRef = useRef(null)
  const inView = useInView(headerRef, { once: true, margin: '-40px' })

  const { items, loading } = useGallery()

  const handleCta = () => {
    if (typeof onBook === 'function') onBook()
    else document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="rc-section rc-section--luxury"
      aria-label="Real Celebrations gallery"
    >
      {/* Gold streaks */}
      <div className="rc-gold-streak rc-gold-streak-1" aria-hidden />
      <div className="rc-gold-streak rc-gold-streak-2" aria-hidden />

      {/* Floral corner — top left */}
      <svg
        className="rc-floral-tl"
        viewBox="0 0 260 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <g opacity="1">
          {/* Main stem */}
          <path d="M10 250 Q40 180 80 120 Q120 60 180 20" stroke="#d7ac28" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          {/* Branch 1 */}
          <path d="M80 120 Q55 95 35 75" stroke="#c8971a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          {/* Branch 2 */}
          <path d="M120 70 Q100 50 85 30" stroke="#c8971a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          {/* Flower 1 — large */}
          <ellipse cx="180" cy="20" rx="14" ry="7" transform="rotate(-30 180 20)" fill="rgba(90,40,140,0.6)" stroke="#d7ac28" strokeWidth="0.8"/>
          <ellipse cx="180" cy="20" rx="14" ry="7" transform="rotate(30 180 20)" fill="rgba(90,40,140,0.5)" stroke="#d7ac28" strokeWidth="0.8"/>
          <ellipse cx="180" cy="20" rx="14" ry="7" transform="rotate(90 180 20)" fill="rgba(90,40,140,0.45)" stroke="#d7ac28" strokeWidth="0.8"/>
          <circle cx="180" cy="20" r="5" fill="#d7ac28" opacity="0.85"/>
          {/* Flower 2 */}
          <ellipse cx="35" cy="75" rx="9" ry="5" transform="rotate(-50 35 75)" fill="rgba(100,50,160,0.55)" stroke="#c8971a" strokeWidth="0.7"/>
          <ellipse cx="35" cy="75" rx="9" ry="5" transform="rotate(40 35 75)" fill="rgba(100,50,160,0.5)" stroke="#c8971a" strokeWidth="0.7"/>
          <ellipse cx="35" cy="75" rx="9" ry="5" transform="rotate(130 35 75)" fill="rgba(100,50,160,0.45)" stroke="#c8971a" strokeWidth="0.7"/>
          <circle cx="35" cy="75" r="3.5" fill="#c8971a" opacity="0.8"/>
          {/* Flower 3 */}
          <ellipse cx="85" cy="30" rx="7" ry="4" transform="rotate(-20 85 30)" fill="rgba(80,35,120,0.5)" stroke="#d7ac28" strokeWidth="0.7"/>
          <ellipse cx="85" cy="30" rx="7" ry="4" transform="rotate(70 85 30)" fill="rgba(80,35,120,0.45)" stroke="#d7ac28" strokeWidth="0.7"/>
          <circle cx="85" cy="30" r="3" fill="#d7ac28" opacity="0.75"/>
          {/* Leaves */}
          <path d="M100 95 Q90 80 105 70 Q110 85 100 95Z" fill="rgba(60,30,100,0.5)" stroke="#c8971a" strokeWidth="0.5"/>
          <path d="M145 50 Q135 35 150 28 Q155 42 145 50Z" fill="rgba(60,30,100,0.45)" stroke="#c8971a" strokeWidth="0.5"/>
          <path d="M60 140 Q48 128 62 118 Q67 132 60 140Z" fill="rgba(60,30,100,0.4)" stroke="#c8971a" strokeWidth="0.5"/>
          {/* Small dots */}
          <circle cx="55" cy="100" r="1.5" fill="#d7ac28" opacity="0.5"/>
          <circle cx="130" cy="55" r="1.5" fill="#d7ac28" opacity="0.45"/>
          <circle cx="160" cy="35" r="1" fill="#d7ac28" opacity="0.4"/>
        </g>
      </svg>

      {/* Floral corner — bottom right (rotated 180°) */}
      <svg
        className="rc-floral-br"
        viewBox="0 0 260 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <g opacity="1">
          <path d="M10 250 Q40 180 80 120 Q120 60 180 20" stroke="#d7ac28" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <path d="M80 120 Q55 95 35 75" stroke="#c8971a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <path d="M120 70 Q100 50 85 30" stroke="#c8971a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="180" cy="20" rx="14" ry="7" transform="rotate(-30 180 20)" fill="rgba(90,40,140,0.6)" stroke="#d7ac28" strokeWidth="0.8"/>
          <ellipse cx="180" cy="20" rx="14" ry="7" transform="rotate(30 180 20)" fill="rgba(90,40,140,0.5)" stroke="#d7ac28" strokeWidth="0.8"/>
          <ellipse cx="180" cy="20" rx="14" ry="7" transform="rotate(90 180 20)" fill="rgba(90,40,140,0.45)" stroke="#d7ac28" strokeWidth="0.8"/>
          <circle cx="180" cy="20" r="5" fill="#d7ac28" opacity="0.85"/>
          <ellipse cx="35" cy="75" rx="9" ry="5" transform="rotate(-50 35 75)" fill="rgba(100,50,160,0.55)" stroke="#c8971a" strokeWidth="0.7"/>
          <ellipse cx="35" cy="75" rx="9" ry="5" transform="rotate(40 35 75)" fill="rgba(100,50,160,0.5)" stroke="#c8971a" strokeWidth="0.7"/>
          <ellipse cx="35" cy="75" rx="9" ry="5" transform="rotate(130 35 75)" fill="rgba(100,50,160,0.45)" stroke="#c8971a" strokeWidth="0.7"/>
          <circle cx="35" cy="75" r="3.5" fill="#c8971a" opacity="0.8"/>
          <ellipse cx="85" cy="30" rx="7" ry="4" transform="rotate(-20 85 30)" fill="rgba(80,35,120,0.5)" stroke="#d7ac28" strokeWidth="0.7"/>
          <ellipse cx="85" cy="30" rx="7" ry="4" transform="rotate(70 85 30)" fill="rgba(80,35,120,0.45)" stroke="#d7ac28" strokeWidth="0.7"/>
          <circle cx="85" cy="30" r="3" fill="#d7ac28" opacity="0.75"/>
          <path d="M100 95 Q90 80 105 70 Q110 85 100 95Z" fill="rgba(60,30,100,0.5)" stroke="#c8971a" strokeWidth="0.5"/>
          <path d="M145 50 Q135 35 150 28 Q155 42 145 50Z" fill="rgba(60,30,100,0.45)" stroke="#c8971a" strokeWidth="0.5"/>
          <path d="M60 140 Q48 128 62 118 Q67 132 60 140Z" fill="rgba(60,30,100,0.4)" stroke="#c8971a" strokeWidth="0.5"/>
          <circle cx="55" cy="100" r="1.5" fill="#d7ac28" opacity="0.5"/>
          <circle cx="130" cy="55" r="1.5" fill="#d7ac28" opacity="0.45"/>
          <circle cx="160" cy="35" r="1" fill="#d7ac28" opacity="0.4"/>
        </g>
      </svg>

      {/* Sparkle particles */}
      <div className="rc-particles" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="rc-particle" />
        ))}
      </div>

      <div className="container rc-container">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          className="rc-header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rc-label-wrap">
            <span className="rc-label-icon" aria-hidden>✦</span>
            <span className="rc-label-text">Our Gallery</span>
            <span className="rc-label-icon" aria-hidden>✦</span>
          </div>

          <h2 className="rc-heading">
            <span className="rc-heading-prefix">Real moments.</span>
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

        {/* Gallery grid */}
        {loading ? (
          <>
            <div className="rc-gallery-loading rc-gallery-desktop" aria-label="Loading gallery">
              <div className="rc-gallery-skeleton" style={{ gridColumn: '1', minHeight: 460 }} />
              <div className="rc-gallery-skeleton" style={{ gridColumn: '2' }} />
            </div>
            <div className="rc-gallery-loading rc-gallery-loading-mobile" aria-label="Loading gallery">
              <div className="rc-gallery-skeleton rc-gallery-skeleton--featured" />
              <div className="rc-gallery-skeleton rc-gallery-skeleton--marquee" />
            </div>
          </>
        ) : (
          <GalleryGrid items={items} onCta={handleCta} />
        )}

        {/* Footer tagline */}
        <motion.div
          className="rc-memory-footer"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="rc-memory-footer-icon" aria-hidden>✦</span>
          <span className="rc-memory-footer-text">Let&apos;s Create Your Unforgettable Memory</span>
        </motion.div>
      </div>
    </section>
  )
}
