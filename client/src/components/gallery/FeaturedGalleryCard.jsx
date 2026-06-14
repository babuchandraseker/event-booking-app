import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * FeaturedGalleryCard — large cinematic left card.
 * Dark luxury redesign: deep overlay, gold CTA, chips, premium badge.
 *
 * Props:
 *   item: { src, alt, title, caption, category, cta }
 *   onCta: function
 *   className: string
 *   luxury: bool
 */
const FEATURED_CHIPS = ['Candlelight', 'Rose Petals', 'Curated Music']

export default function FeaturedGalleryCard({ item, onCta, className = '', luxury = false }) {
  const [imgError, setImgError] = useState(false)

  const CATEGORY_EMOJI = {
    Romantic: '🌹',
    Birthday: '🎂',
    'Luxury Surprise': '✨',
    Proposal: '💍',
    Anniversary: '🥂',
    'FEATURED EXPERIENCE': '👑',
  }

  const fallbackEmoji = CATEGORY_EMOJI[item.category] || '✦'

  return (
    <motion.div
      className={`rc-card rc-featured-card group ${className}`}
      variants={{
        hidden: { opacity: 0, y: 32, scale: 0.97 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0 },
        },
      }}
      aria-label={item.alt || item.title}
      role="listitem"
    >
      {/* Gold glow border */}
      <div className="rc-card-glow rc-featured-glow" aria-hidden />

      {/* Premium badge */}
      <div className="gc-featured-badge" aria-label="Premium Experience">
        <span>✦ Premium</span>
      </div>

      {/* Image */}
      <div className="rc-card-media">
        {item.src && !imgError ? (
          <img
            src={item.src}
            alt={item.alt || ''}
            loading="eager"
            className="rc-card-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="rc-card-fallback rc-featured-fallback">
            <span className="rc-card-emoji">{fallbackEmoji}</span>
          </div>
        )}
      </div>

      {/* Cinematic gradient overlay */}
      <div className="rc-featured-overlay" aria-hidden />

      {/* Content */}
      <div className="rc-featured-content">
        {item.category && (
          <span className="rc-tag rc-tag-featured">
            {luxury && <span aria-hidden>👑 </span>}
            {item.category}
          </span>
        )}

        <h3 className="rc-featured-title">{item.title}</h3>

        {item.caption && <p className="rc-featured-subtitle">{item.caption}</p>}

        {/* Chips */}
        <div className="rc-featured-chips">
          {FEATURED_CHIPS.map((chip) => (
            <span key={chip} className="rc-chip">{chip}</span>
          ))}
        </div>

        {item.cta && (
          <button
            className="rc-featured-cta"
            onClick={onCta}
            type="button"
          >
            <span>{item.cta}</span>
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15" aria-hidden>
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}
