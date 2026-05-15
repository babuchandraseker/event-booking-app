import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * MediaCard — image card with glassmorphism overlay, gold glow border,
 * zoom effect and stagger-ready animation variant.
 *
 * Props:
 *   item: { src, alt, fallback, category, title, caption }
 *   index: number (for stagger delay)
 *   className: additional CSS classes (grid placement)
 */
export default function MediaCard({ item, index = 0, className = '' }) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      className={`rc-card group ${className}`}
      variants={{
        hidden: { opacity: 0, y: 28, scale: 0.97 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }
        }
      }}
      whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      aria-label={item.alt || item.title || item.category}
    >
      {/* Gold glow border on hover */}
      <div className="rc-card-glow" aria-hidden />

      {/* Media */}
      <div className="rc-card-media">
        {item.src && !imgError ? (
          <img
            src={item.src}
            alt={item.alt || ''}
            loading="lazy"
            className="rc-card-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="rc-card-fallback">
            <span className="rc-card-emoji">{item.fallback}</span>
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
