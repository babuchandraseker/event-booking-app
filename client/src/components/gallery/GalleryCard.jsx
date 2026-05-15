import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * GalleryCard — standard image card for the luxury gallery.
 *
 * Props:
 *   item: {
 *     id, src, alt, title, caption, category, featured,
 *     visible, order, addedAt
 *   }
 *   index: number (for stagger delay)
 *   className: additional CSS classes (grid placement)
 *   onImageError: optional callback
 */
export default function GalleryCard({ item, index = 0, className = '' }) {
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
      className={`rc-card group ${className}`}
      variants={{
        hidden: { opacity: 0, y: 28, scale: 0.97 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: {
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
            delay: index * 0.08,
          },
        },
      }}
      whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      aria-label={item.alt || item.title || item.category}
      role="listitem"
    >
      {/* Gold glow border on hover */}
      <div className="rc-card-glow" aria-hidden />

      {/* Featured badge */}
      {item.featured && (
        <div className="gc-featured-badge" aria-label="Featured">
          <span>★ Featured</span>
        </div>
      )}

      {/* Media */}
      <div className="rc-card-media">
        {item.src && !imgError ? (
          <img
            src={item.src}
            alt={item.alt || item.title || ''}
            loading="lazy"
            className="rc-card-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="rc-card-fallback">
            <span className="rc-card-emoji">{fallbackEmoji}</span>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="rc-card-overlay">
        <div className="rc-card-overlay-inner">
          {item.category && (
            <span className="rc-tag">{item.category}</span>
          )}
          {item.title && (
            <p className="rc-card-title">{item.title}</p>
          )}
          {item.caption && (
            <p className="rc-card-caption">{item.caption}</p>
          )}
        </div>
      </div>

      {/* Always-visible bottom label */}
      {item.category && (
        <div className="rc-card-label">
          <span className="rc-tag rc-tag-static">{item.category}</span>
        </div>
      )}
    </motion.div>
  )
}
