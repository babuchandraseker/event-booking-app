import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * FeaturedGalleryCard — large cinematic card (image only, no video).
 *
 * Props:
 *   item: { src, alt, title, caption, category, cta }
 *   onCta: function
 *   className: string
 */
export default function FeaturedGalleryCard({ item, onCta, className = '' }) {
  const [imgError, setImgError] = useState(false)

  const CATEGORY_EMOJI = {
    Romantic: '🌹',
    Birthday: '🎂',
    'Luxury Surprise': '✨',
    Proposal: '💍',
    Anniversary: '🥂',
  }

  const fallbackEmoji = CATEGORY_EMOJI[item.category] || '✦'

  return (
    <motion.div
      className={`rc-card rc-featured-card group ${className}`}
      variants={{
        hidden: { opacity: 0, y: 32, scale: 0.96 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0 },
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      aria-label={item.alt || item.title}
      role="listitem"
    >
      {/* Gold glow border */}
      <div className="rc-card-glow rc-featured-glow" aria-hidden />

      {/* Image only — no video */}
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
          <motion.span
            className="rc-tag rc-tag-featured"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {item.category}
          </motion.span>
        )}

        <motion.h3
          className="rc-featured-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {item.title}
        </motion.h3>

        {item.caption && (
          <motion.p
            className="rc-featured-subtitle"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.55 }}
          >
            {item.caption}
          </motion.p>
        )}

        {item.cta && (
          <motion.button
            className="rc-featured-cta"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCta}
            type="button"
          >
            <span>{item.cta}</span>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden>
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
