import { useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/** Lightweight weekly snapshot for marketing urgency (replace with live API later). */
function buildWeekSlots() {
  const base = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const slots = []
  for (let d = 1; d <= 5; d += 1) {
    const dt = new Date(base)
    dt.setDate(base.getDate() + d)
    const name = dayNames[dt.getDay()]
    const label = `${name.slice(0, 3)} ${dt.getDate()}`
    const urgency = d <= 2 ? Math.max(1, 4 - d) : Math.max(2, 6 - d)
    slots.push({
      id: d,
      label,
      fullDay: name,
      left: urgency,
      evening: d % 2 === 0,
    })
  }
  return slots
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export default function SlotAvailabilitySection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const rows = useMemo(() => buildWeekSlots(), [])

  return (
    <section
      ref={ref}
      id="slots"
      className="relative overflow-hidden py-20 sm:py-28"
      aria-label="Slot availability"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(201,168,76,0.08),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(74,63,143,0.12),transparent_45%)]"
        aria-hidden
      />
      <div className="container relative">
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label justify-center">Limited evenings</div>
          <h2 className="section-title">
            Studio <em>availability</em>
          </h2>
          <p className="section-subtitle mx-auto max-w-xl text-[var(--text-secondary)]">
            Private slots disappear quickly on weekends. Reserve early to hold your date and time.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {rows.map((row) => (
            <motion.div
              key={row.id}
              variants={item}
              className="group relative flex flex-col rounded-2xl border border-[rgba(201,168,76,0.15)] bg-[rgba(12,12,20,0.72)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 ease-luxury hover:-translate-y-1 hover:border-[rgba(201,168,76,0.35)] hover:shadow-glow-gold-lg"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="font-display text-lg text-[var(--text-primary)]">{row.label}</span>
                {row.evening && (
                  <span className="rounded-full border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-gold-light">
                    Prime
                  </span>
                )}
              </div>
              <p className="mb-5 text-sm text-[var(--text-muted)]">{row.fullDay}</p>
              <div className="mt-auto">
                <motion.div
                  layout
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    row.left <= 2
                      ? 'border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] text-[#fecaca]'
                      : 'border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.06)] text-[#bbf7d0]'
                  }`}
                >
                  <span
                    className={`relative flex h-2 w-2 rounded-full ${
                      row.left <= 2 ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  >
                    <span
                      className={`absolute inset-0 animate-ping rounded-full opacity-60 ${
                        row.left <= 2 ? 'bg-red-400' : 'bg-emerald-400'
                      }`}
                      aria-hidden
                    />
                  </span>
                  {row.left <= 2 ? (
                    <span>
                      Only <strong>{row.left}</strong> slots left
                    </span>
                  ) : (
                    <span>
                      <strong>{row.left}</strong> slots open
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="mt-10 text-center text-sm text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Availability shown for planning — final confirmation happens at checkout.
        </motion.p>
      </div>
    </section>
  )
}
