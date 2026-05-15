import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    step: '01',
    title: 'Choose Theme',
    desc: 'Immerse yourself in our signature stories and pick the world that matches your moment.',
    icon: '✦',
  },
  {
    step: '02',
    title: 'Select Package',
    desc: 'Curated tiers balance time, décor depth, and crew attention — tuned to your guest count.',
    icon: '📦',
  },
  {
    step: '03',
    title: 'Add Add-ons',
    desc: 'Layer florals, photography, cakes, and bespoke touches without leaving the flow.',
    icon: '➕',
  },
  {
    step: '04',
    title: 'Choose Slot',
    desc: 'Lock a private evening window that fits your surprise, commute, and energy.',
    icon: '📅',
  },
  {
    step: '05',
    title: 'Make Payment',
    desc: 'Secure advance to hold the studio; transparent totals before you confirm.',
    icon: '💳',
  },
  {
    step: '06',
    title: 'Celebrate',
    desc: 'Arrive to a finished scene — candles glowing, music breathing, memories waiting.',
    icon: '🥂',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="how-section relative overflow-hidden" id="how-it-works" aria-label="How it works">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 10% 20%, rgba(201,168,76,0.08), transparent 40%), radial-gradient(circle at 90% 80%, rgba(50,35,115,0.16), transparent 45%)',
        }}
      />
      <div className="container relative">
        <motion.div
          className="reveal mb-14 text-center sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label justify-center">Your journey</div>
          <h2 className="section-title">
            From first spark to <em>standing ovation</em>
          </h2>
          <p className="section-subtitle mx-auto mt-3 max-w-2xl text-[var(--text-secondary)]">
            One continuous flow — theme, package, add-ons, slot, and payment — designed to feel effortless.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          <div
            className="absolute left-[1.35rem] top-4 bottom-4 hidden w-px bg-gradient-to-b from-[rgba(201,168,76,0.45)] via-[rgba(201,168,76,0.12)] to-transparent sm:left-8 sm:block"
            aria-hidden
          />
          <ul className="relative flex flex-col gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <motion.li
                key={s.step}
                className="relative flex gap-4 sm:gap-8"
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative z-[1] flex shrink-0 flex-col items-center">
                  <motion.div
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(201,168,76,0.35)] bg-[rgba(8,6,22,0.92)] text-sm font-semibold text-gold-light shadow-glow-gold sm:h-14 sm:w-14 sm:text-base"
                    whileHover={{ scale: 1.06, boxShadow: '0 0 28px rgba(201,168,76,0.25)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    {s.icon}
                  </motion.div>
                </div>
                <motion.div
                  className="flex-1 rounded-2xl border border-[rgba(201,168,76,0.12)] bg-[rgba(10,8,24,0.58)] px-5 py-5 text-left shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 ease-luxury hover:border-[rgba(201,168,76,0.28)] hover:shadow-glow-gold sm:px-7 sm:py-6"
                  whileHover={{ y: -3 }}
                >
                  <div className="mb-2 font-body text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]">
                    {s.step}
                  </div>
                  <h3 className="mb-2 font-display text-2xl text-[var(--text-primary)]">{s.title}</h3>
                  <p className="text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
                </motion.div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
