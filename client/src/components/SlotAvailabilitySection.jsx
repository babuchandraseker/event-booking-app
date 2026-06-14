/**
 * SlotAvailabilitySection
 *
 * Fix: Removed the 30-second polling interval and window focus listener from
 * useStudioAvailability. The component was making 5 parallel API requests
 * every 30 seconds (one per day in the next-5-days list), and additional
 * 5-request bursts on every window focus event (every tab switch).
 *
 * New behavior: fetch once on mount (or once when the section enters view for
 * the full-section variant). Data is fresh enough for planning purposes; final
 * confirmation happens at checkout anyway as stated in the UI copy.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { API_BASE_URL } from '../data/packageCatalog'

const TOTAL_DAILY_SLOTS = 5
const SLOT_LABELS = [
  '10:00 AM - 11:30 AM',
  '12:00 PM - 1:30 PM',
  '2:00 PM - 3:30 PM',
  '4:00 PM - 5:30 PM',
  '6:00 PM - 7:30 PM',
]

function toLocalDateInput(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildWeekSlots() {
  const base = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const slots = []
  for (let d = 1; d <= 5; d += 1) {
    const dt = new Date(base)
    dt.setDate(base.getDate() + d)
    const name = dayNames[dt.getDay()]
    const label = `${name.slice(0, 3)} ${dt.getDate()}`
    slots.push({
      id: toLocalDateInput(dt),
      label,
      fullDay: name,
      left: TOTAL_DAILY_SLOTS,
      evening: ['Friday', 'Saturday', 'Sunday'].includes(name),
      loading: true,
    })
  }
  return slots
}

function countBookedSlots(bookedSlots = []) {
  const valid = new Set(SLOT_LABELS)
  return new Set(bookedSlots.filter((slot) => valid.has(slot))).size
}

function useStudioAvailability() {
  const baseRows = useMemo(() => buildWeekSlots(), [])
  const [rows, setRows] = useState(baseRows)
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate fetches (StrictMode double-invoke or component re-mount)
    if (fetchedRef.current) return
    fetchedRef.current = true

    let cancelled = false

    async function loadAvailability() {
      const nextRows = await Promise.all(
        baseRows.map(async (row) => {
          try {
            const response = await fetch(`${API_BASE_URL}/bookings/availability/slots?date=${row.id}`)
            const result = await response.json()
            const bookedCount =
              response.ok && result.success ? countBookedSlots(result.data.bookedSlots || []) : 0
            return {
              ...row,
              left: Math.max(0, TOTAL_DAILY_SLOTS - bookedCount),
              loading: false,
            }
          } catch {
            return { ...row, loading: false, unavailable: true }
          }
        }),
      )

      if (!cancelled) setRows(nextRows)
    }

    loadAvailability()

    return () => {
      cancelled = true
    }
  }, [baseRows])

  return rows
}

function SlotStatusChip({ row }) {
  if (row.loading) {
    return <span className="hero-availability-float__chip hero-availability-float__chip--open">Checking…</span>
  }
  if (row.unavailable) {
    return <span className="hero-availability-float__chip hero-availability-float__chip--low">At checkout</span>
  }
  if (row.left === 0) {
    return <span className="hero-availability-float__chip hero-availability-float__chip--low">Fully booked</span>
  }
  if (row.left <= 2) {
    return (
      <span className="hero-availability-float__chip hero-availability-float__chip--low">
        <span className="relative mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-[#c44b4b]" aria-hidden />
        {row.left} left
      </span>
    )
  }
  return (
    <span className="hero-availability-float__chip hero-availability-float__chip--open">
      <span className="relative mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-[#2e9e5a]" aria-hidden />
      {row.left} open
    </span>
  )
}

function HeroAvailabilityCard({ rows }) {
  return (
    <motion.div
      className="hero-availability-float__card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="hero-availability-float__header">
        <span className="hero-availability-float__badge">✦ Limited evenings</span>
        <h2 className="hero-availability-float__title">
          Studio <em>availability</em>
        </h2>
      </header>
      <div className="hero-availability-float__grid">
        {rows.map((row) => (
          <div key={row.id} className="hero-availability-float__row">
            <div>
              <div className="hero-availability-float__date">
                {row.label}
                {row.evening && <span className="hero-availability-float__prime">Prime</span>}
              </div>
              <div className="hero-availability-float__day">{row.fullDay}</div>
            </div>
            <SlotStatusChip row={row} />
          </div>
        ))}
      </div>
      <p className="hero-availability-float__footnote">
        Availability for planning — confirmed at checkout.
      </p>
    </motion.div>
  )
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

/**
 * Studio availability — full homepage section or floating hero card.
 * @param {'section' | 'hero'} [variant='section']
 */
export default function SlotAvailabilitySection({ variant = 'section', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const rows = useStudioAvailability()

  if (variant === 'hero') {
    return (
      <div
        id="slots"
        className={`hero-availability-float ${className}`.trim()}
        aria-label="Studio availability"
      >
        <HeroAvailabilityCard rows={rows} />
      </div>
    )
  }

  return (
    <section
      ref={ref}
      id="slots"
      className="relative overflow-hidden py-20 sm:py-28"
      aria-label="Slot availability"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(215,172,40,0.1),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(130,56,179,0.12),transparent_45%)]"
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
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5"
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {rows.map((row) => (
            <motion.div
              key={row.id}
              variants={item}
              className="group relative flex flex-col rounded-[26px] border border-[rgba(215,172,40,0.22)] bg-[rgba(255,255,255,0.78)] p-3.5 sm:p-5 shadow-[0_14px_44px_rgba(72,24,117,0.1)] backdrop-blur-md transition-all duration-300 ease-luxury hover:-translate-y-1 hover:border-[rgba(215,172,40,0.38)] hover:shadow-glow-gold-lg"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="font-display text-base sm:text-lg text-[var(--text-primary)] leading-tight">
                  {row.label}
                </span>
                {row.evening && (
                  <span className="rounded-full border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)] px-1.5 sm:px-2 py-0.5 text-[0.58rem] sm:text-[0.65rem] font-semibold uppercase tracking-wider text-gold-light whitespace-nowrap">
                    Prime
                  </span>
                )}
              </div>
              <p className="mb-3 sm:mb-5 text-xs sm:text-sm text-[var(--text-muted)]">{row.fullDay}</p>
              <div className="mt-auto">
                <motion.div
                  layout
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm ${
                    row.unavailable || row.left <= 2
                      ? 'border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] text-[#9b3535]'
                      : 'border border-[rgba(46,158,90,0.25)] bg-[rgba(46,158,90,0.08)] text-[#1f6b42]'
                  }`}
                >
                  <span
                    className={`relative flex h-2 w-2 rounded-full ${
                      row.unavailable || row.left <= 2 ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  >
                    <span
                      className={`absolute inset-0 animate-ping rounded-full opacity-60 ${
                        row.unavailable || row.left <= 2 ? 'bg-red-400' : 'bg-emerald-400'
                      }`}
                      aria-hidden
                    />
                  </span>
                  {row.loading ? (
                    <span>Checking slots...</span>
                  ) : row.unavailable ? (
                    <span>Check at checkout</span>
                  ) : row.left === 0 ? (
                    <span>Fully booked</span>
                  ) : row.left <= 2 ? (
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
