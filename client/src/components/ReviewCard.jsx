import { motion } from 'framer-motion'

function StarRating({ rating }) {
  const count = Math.min(5, Math.max(1, Math.floor(Number(rating) || 5)))
  return (
    <div className="review-card-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < count ? 1 : 0.22 }}>
          ★
        </span>
      ))}
    </div>
  )
}

function getInitials(name) {
  if (!name) return 'G'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function ReviewCard({ review, style = {}, className = '' }) {
  const reviewText = review.review || review.message || ''
  const customerName = review.name || review.customerName || 'Guest'
  const eventType = review.eventType || 'Event'
  const rating = review.rating || 5

  return (
    <motion.article
      className={`review-magic-card ${className}`}
      style={style}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`Review by ${customerName}`}
    >
      <div className="review-magic-card__ambient" aria-hidden />
      <div className="review-magic-card__gold-line" aria-hidden />

      <div className="review-magic-card__quote-mark" aria-hidden>
        “
      </div>

      <StarRating rating={rating} />

      <blockquote className="review-magic-card__text">{reviewText}</blockquote>

      <div className="review-magic-card__gem" aria-hidden>
        ◆
      </div>

      <footer className="review-magic-card__footer">
        <div className="review-magic-card__avatar" aria-hidden>
          {getInitials(customerName)}
        </div>
        <div className="review-magic-card__meta">
          <div className="review-magic-card__name">{customerName}</div>
          <div className="review-magic-card__event">{eventType}</div>
        </div>
      </footer>

      <div className="review-magic-card__hover-glow" aria-hidden />
    </motion.article>
  )
}
