import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { API_BASE_URL } from '../data/packageCatalog'
import ReviewsCarousel from './ReviewsCarousel'
import '../styles/reviews-testimonials-luxury.css'

const FALLBACK_REVIEWS = [
  { id: 'f1', rating: 5, review: 'The setup honestly felt cinematic and unforgettable. Every corner had a story to tell.', name: 'Arun Kumar', eventType: 'Romantic Surprise' },
  { id: 'f2', rating: 5, review: 'My partner was speechless. The attention to every little detail was beyond anything we imagined.', name: 'Priya & Arjun', eventType: 'Anniversary Celebration' },
  { id: 'f3', rating: 5, review: 'Pulled off the most magical proposal. They coordinated everything secretly — the reveal was pure cinema.', name: 'Ravi M.', eventType: 'Surprise Proposal' },
  { id: 'f4', rating: 5, review: "Mom's 50th birthday left everyone in tears — the good kind. This team turned a room into a memory.", name: 'Karthik S.', eventType: 'Birthday Grand Package' },
  { id: 'f5', rating: 5, review: 'From the lighting to the music, everything felt handcrafted just for us. A dream come true.', name: 'Divya & Rohan', eventType: 'Romantic Anniversary' },
  { id: 'f6', rating: 5, review: 'The ambiance was absolutely breathtaking. Guests kept asking who planned it — worth every rupee.', name: 'Sneha R.', eventType: 'Private Birthday' },
]

function mapApiReview(review, i) {
  if (!review) return null
  return {
    id: review.id != null ? String(review.id) : `api-${i}`,
    rating: Number(review.rating || 5),
    review: review.message || '',
    name: review.customerName || 'Guest',
    eventType: review.eventType || 'Event',
  }
}

function StatIcon({ type }) {
  const stroke = 'currentColor'
  const common = { fill: 'none', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'guests') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="8" r="3.5" {...common} />
        <path {...common} d="M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" />
      </svg>
    )
  }
  if (type === 'rating') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          {...common}
          d="M12 3.5l2.35 4.76 5.26.77-3.8 3.7.9 5.24L12 15.9l-4.71 2.47.9-5.24-3.8-3.7 5.26-.77L12 3.5z"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        {...common}
        d="M12 20.5s-6.5-4.2-6.5-9.2a4.5 4.5 0 0 1 8.2-2.6 4.5 4.5 0 0 1 8.2 2.6c0 5-6.5 9.2-6.5 9.2z"
      />
    </svg>
  )
}

function SectionHeader({ inView }) {
  return (
    <motion.header
      className="reviews-magic-header mx-auto max-w-3xl text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="reviews-magic-label"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="reviews-magic-label__gem" aria-hidden>
          ✦
        </span>
        <span>Our Happy Clients</span>
        <span className="reviews-magic-label__gem" aria-hidden>
          ✦
        </span>
      </motion.div>

      <motion.h2
        className="reviews-magic-title"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
      >
        Loved by Thousands,
        <br />
        <em className="reviews-magic-title__em">Trusted for a Reason.</em>
      </motion.h2>

      <motion.p
        className="reviews-magic-subtitle"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        Real experiences from our most cherished guests
      </motion.p>

      <motion.div
        className="reviews-magic-ornament"
        aria-hidden
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={inView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="reviews-magic-ornament__line" />
        <span className="reviews-magic-ornament__diamond">◆</span>
        <span className="reviews-magic-ornament__line" />
      </motion.div>
    </motion.header>
  )
}

function ReviewStats({ inView, count }) {
  const displayCount = count >= 8 ? `${Math.max(count, 200)}+` : '200+'
  const stats = [
    { icon: 'guests', value: displayCount, label: 'Happy Guests' },
    { icon: 'rating', value: '4.9', star: true, label: 'Average Rating' },
    { icon: 'recommend', value: '100%', label: 'Would Recommend' },
  ]

  return (
    <motion.div
      className="reviews-magic-stats"
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Guest satisfaction statistics"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="reviews-magic-stat">
          <div className="reviews-magic-stat__icon">
            <StatIcon type={stat.icon} />
          </div>
          <div className="reviews-magic-stat__body">
            <div className={`reviews-magic-stat__value${stat.star ? ' reviews-magic-stat__value--stars' : ''}`}>
              {stat.value}
              {stat.star && (
                <span className="reviews-magic-stat__star" aria-hidden>
                  ★
                </span>
              )}
            </div>
            <div className="reviews-magic-stat__label">{stat.label}</div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

export default function CustomerReviewsSection() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS)

  useEffect(() => {
    let ignore = false
    fetch(`${API_BASE_URL}/reviews`)
      .then((r) => r.json())
      .then((result) => {
        if (!ignore && result.success && Array.isArray(result.data) && result.data.length > 0) {
          const mapped = result.data.map(mapApiReview).filter(Boolean)
          if (mapped.length > 0) setReviews(mapped)
        }
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="reviews-magic-section reviews-lux-section"
      aria-label="Customer testimonials — Memories That Became Magic"
    >
      {/* Corner particles */}
      <div className="reviews-lux-particles" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="reviews-lux-particle" />
        ))}
      </div>
      <div className="container reviews-lux-shell">
        <SectionHeader inView={inView} />
        <ReviewStats inView={inView} count={reviews.length} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <ReviewsCarousel reviews={reviews} />
      </motion.div>
    </section>
  )
}
