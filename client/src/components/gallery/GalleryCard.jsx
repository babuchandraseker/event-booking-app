import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * GalleryCard — small dark luxury image card.
 * Shows top badge pill, hover glow, violet/gold borders.
 */
export default function GalleryCard({ item, index = 0, className = '' }) {
  const [imgError, setImgError] = useState(false)

  const CATEGORY_EMOJI = {
    Romantic: '♥',
    'ROMANTIC DINNER': '♥',
    Birthday: '🎂',
    'Luxury Surprise': '✦',
    'LUXURY SETUP': '💎',
    'SURPRISE ROOM': '🎁',
    Proposal: '💍',
    'PROPOSAL SETUP': '💍',
    Anniversary: '🥂',
    ANNIVERSARY: '🥂',
    Celebrations: '✦',
    CELEBRATIONS: '✦',
  }

  const fallbackEmoji = CATEGORY_EMOJI[item.category] || '✦'

  return (
    <motion.div
      className={`rc-card group ${className}`}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: {
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
            delay: index * 0.07,
          },
        },
      }}
      aria-label={item.alt || item.title || item.category}
      role="listitem"
    >
      {/* Gold glow ring on hover */}
      <div className="rc-card-glow" aria-hidden />

      {/* Top badge */}
      {item.category && (
        <div
          style={{
            position: 'absolute',
            top: '0.7rem',
            left: '0.7rem',
            zIndex: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.28rem',
            padding: '0.22rem 0.5rem',
            borderRadius: '5px',
            background: 'rgba(12, 7, 25, 0.7)',
            border: '1px solid rgba(215, 172, 40, 0.35)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <span style={{ fontSize: '0.6rem', lineHeight: 1 }}>
            {CATEGORY_EMOJI[item.category] || item.icon || '✦'}
          </span>
          <span style={{
            fontSize: '0.5rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(215, 172, 40, 0.9)',
          }}>
            {item.category}
          </span>
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

      {/* Hover overlay with title */}
      <div className="rc-card-overlay">
        <div className="rc-card-overlay-inner">
          {item.title && (
            <p className="rc-card-title">{item.title}</p>
          )}
          {item.caption && (
            <p className="rc-card-caption">{item.caption}</p>
          )}
        </div>
      </div>

      {/* Bottom label — always visible */}
      {item.title && (
        <div className="rc-card-label">
          <span className="rc-tag-static">
            {item.title}
          </span>
        </div>
      )}
    </motion.div>
  )
}
