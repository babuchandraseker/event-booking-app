import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useBusinessSettings from '../hooks/useBusinessSettings'

const toStatNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export default function TrustSection() {
  const settings = useBusinessSettings()
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })
  const trustStats = [
    { count: toStatNumber(settings.eventsHosted, 1200), suffix: '+', label: 'Events Hosted' },
    { count: toStatNumber(settings.fiveStarReviews, 98), suffix: '%', label: '5-Star Reviews' },
    { count: toStatNumber(settings.addonOptions, 50), suffix: '+', label: 'Add-on Options' },
    { count: toStatNumber(settings.yearsOfExcellence, 4), suffix: '', label: 'Years of Excellence' },
  ]

  return (
    <section
      ref={sectionRef}
      className="trust-section"
      id="trust"
      aria-label="Trust and statistics"
    >
      <div className="container">
        <motion.div
          className="trust-stats reveal"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {trustStats.map((s, i) => (
            <div key={s.label} className="trust-stat">
              <motion.div
                className="trust-stat-num"
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: 0.08 * i }}
              >
                {s.count.toLocaleString('en-IN')}
                {s.suffix}
              </motion.div>
              <div className="trust-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
