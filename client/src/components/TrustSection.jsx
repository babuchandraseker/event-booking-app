import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const trustStats = [
  { count: 1200, suffix: '+', label: 'Events Hosted' },
  { count: 98, suffix: '%', label: '5-Star Reviews' },
  { count: 50, suffix: '+', label: 'Add-on Options' },
  { count: 4, suffix: '', label: 'Years of Excellence' },
]

export default function TrustSection() {
  const statRefs = useRef([])
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          const target = parseInt(el.dataset.count, 10)
          const suffix = el.dataset.suffix || ''
          let current = 0
          const duration = 1800
          const step = target / (duration / 16)
          const interval = setInterval(() => {
            current = Math.min(current + step, target)
            el.textContent = Math.floor(current).toLocaleString('en-IN') + suffix
            if (current >= target) clearInterval(interval)
          }, 16)
          observer.unobserve(el)
        })
      },
      { threshold: 0.45 }
    )

    statRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
              <div
                className="trust-stat-num"
                data-count={s.count}
                data-suffix={s.suffix}
                ref={(el) => {
                  statRefs.current[i] = el
                }}
              >
                {s.count}
                {s.suffix}
              </div>
              <div className="trust-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
