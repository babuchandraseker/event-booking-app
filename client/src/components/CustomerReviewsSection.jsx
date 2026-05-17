import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { API_BASE_URL } from '../data/packageCatalog'

const testimonials = [
  {
    stars: 5,
    quote:
      'The romantic setup completely exceeded our expectations. Every detail was thoughtful and beautiful. My partner was in tears - the best kind.',
    avatar: '\u2665',
    name: 'Priya & Arjun',
    event: 'Anniversary - Romantic Theme',
  },
  {
    stars: 5,
    quote:
      "We booked the birthday experience for our mom's 50th and she was absolutely speechless. The attention to detail was incredible. Worth every rupee!",
    avatar: '\u2605',
    name: 'Karthik S.',
    event: 'Birthday - Grand Package',
  },
  {
    stars: 5,
    quote:
      'Pulled off the most perfect surprise proposal with Velvet Nights. They coordinated everything secretly and the reveal was absolutely cinematic.',
    avatar: '\u25C6',
    name: 'Ravi M.',
    event: 'Proposal - Surprise Theme',
  },
]

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '')

function resolveImageUrl(url) {
  if (!url) return ''
  return url.startsWith('/uploads/') ? `${API_ORIGIN}${url}` : url
}

function mapApiReview(review, index) {
  if (!review) return null
  return {
    stars: Number(review.rating || 5),
    quote: review.message || '',
    avatar: '',
    photo: resolveImageUrl(review.imageUrl),
    name: review.customerName || 'Guest',
    event: review.eventType || 'Event',
    key: review.id != null ? String(review.id) : `api-${index}`,
  }
}

export default function CustomerReviewsSection() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })
  const [reviews, setReviews] = useState(() =>
    testimonials.map((t, i) => ({ ...t, key: `static-${i}` }))
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let ignore = false

    fetch(`${API_BASE_URL}/reviews`)
      .then((response) => response.json())
      .then((result) => {
        if (!ignore && result.success && Array.isArray(result.data)) {
          const mapped = result.data.map((review, i) => mapApiReview(review, i)).filter(Boolean)
          if (mapped.length > 0) setReviews(mapped)
        }
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (reviews.length <= 1) return undefined
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length)
    }, 7000)
    return () => window.clearInterval(id)
  }, [reviews.length])

  const active = reviews[index] || reviews[0]
  const starString = (n) => {
    const count = Math.min(5, Math.max(1, Math.floor(Number(n) || 5)))
    return '★'.repeat(count)
  }

  const showReview = (nextIndex) => {
    setIndex(nextIndex)
  }

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="relative overflow-hidden border-y border-[rgba(201,168,76,0.12)] bg-gradient-to-b from-[#03030A] via-[#07071A] to-[#03030A] py-20 sm:py-28"
      aria-label="Customer reviews"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(50,35,115,0.18), transparent 55%)',
        }}
      />
      <div className="container relative">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label justify-center">Voices of delight</div>
          <h2 className="section-title">
            Celebrations they still <em>talk about</em>
          </h2>
          <p className="section-subtitle mx-auto max-w-xl text-[var(--text-secondary)]">
            Real guests. Real tears, laughter, and gasps - captured in words, not scripts.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            {active && (
              <motion.article
                key={active.key || active.name}
                role="article"
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -18, filter: 'blur(4px)' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="review-feature-card review-feature-card--spotlight"
              >
                <div className="review-card-top">
                  <div className="review-author">
                    <div className="review-avatar">
                      {active.photo ? (
                        <img
                          src={active.photo}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        active.avatar
                      )}
                    </div>
                    <div>
                      <div className="review-author-name">{active.name}</div>
                      <div className="review-event">{active.event}</div>
                    </div>
                  </div>
                  <div
                    className="review-stars"
                    aria-label={`${active.stars} out of 5 stars`}
                  >
                    {typeof active.stars === 'number' ? starString(active.stars) : active.stars}
                  </div>
                </div>
                <blockquote className="review-quote">
                  "{active.quote}"
                </blockquote>
              </motion.article>
            )}
          </AnimatePresence>

          {reviews.length > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {reviews.map((r, i) => (
                <button
                  key={r.key || r.name}
                  type="button"
                  aria-label={`Show review ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => showReview(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ease-luxury ${
                    i === index
                      ? 'w-10 bg-gradient-to-r from-gold-dark via-gold to-gold-light shadow-glow-gold'
                      : 'w-2.5 bg-[rgba(201,168,76,0.25)] hover:bg-[rgba(201,168,76,0.45)]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
