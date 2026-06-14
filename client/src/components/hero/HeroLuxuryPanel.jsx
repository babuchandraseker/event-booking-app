import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.5 6.4 20.5l2.1-6.7L3 9.8h6.8L12 3z" />
      </svg>
    ),
    label: '100% Private',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M4 10l8-6 8 6v10H4V10z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
    label: 'Luxury Setups',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 11h18" />
      </svg>
    ),
    label: 'Easy Booking',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 21s-6-4.35-6-10a6 6 0 0112 0c0 5.65-6 10-6 10z" />
      </svg>
    ),
    label: 'Memories That Last',
  },
]

export default function HeroLuxuryPanel({ onExploreExperiences, onHowToBook }) {
  return (
    <motion.div
      className="cinematic-hero__content-inner"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="cinematic-hero__heading">
        <span className="cinematic-hero__heading-white">
          Celebrate moments
        </span>
        <span className="cinematic-hero__heading-line-second">
          <span className="cinematic-hero__heading-purple">that deserve</span>{' '}
          <span className="cinematic-hero__heading-accent">privacy.</span>
        </span>
      </h1>

      {/* <div className="cinematic-hero__heading-rule" aria-hidden /> */}

      <p className="cinematic-hero__subtext cinematic-hero__subtext--desktop">
        Premium private rooms for{' '}
        <span className="cinematic-hero__hl">birthdays</span>,{' '}
        <span className="cinematic-hero__hl">proposals</span>, anniversaries and{' '}
        <span className="cinematic-hero__hl cinematic-hero__hl--gold">unforgettable</span>{' '}
        celebrations.
      </p>
      <p className="cinematic-hero__subtext cinematic-hero__subtext--mobile">
        Premium private rooms for{' '}
        <span className="cinematic-hero__hl">birthdays</span>,{' '}
        <span className="cinematic-hero__hl">proposals</span> &amp;{' '}
        <span className="cinematic-hero__hl cinematic-hero__hl--gold">unforgettable</span>{' '}
        celebrations.
      </p>

      <ul className="cinematic-hero__features" aria-label="Key benefits">
        {FEATURES.map((f, i) => (
          <motion.li
            key={f.label}
            className="cinematic-hero__feature"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="cinematic-hero__feature-icon" aria-hidden>
              {f.icon}
            </span>
            <span className="cinematic-hero__feature-label">{f.label}</span>
          </motion.li>
        ))}
      </ul>

      <div className="cinematic-hero__actions">
        <button type="button" className="cinematic-hero__btn-primary" onClick={onExploreExperiences}>
          Explore Experiences
        </button>
        <button type="button" className="cinematic-hero__btn-outline" onClick={onHowToBook}>
          How To Book
        </button>
      </div>

    </motion.div>
  )
}
