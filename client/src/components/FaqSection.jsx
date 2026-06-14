import { useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'

console.log('[FaqSection] Component mounted — independent dark luxury section')

const SANS = 'var(--font-body, "DM Sans", system-ui, sans-serif)'

const faqs = [
  {
    q: 'How far in advance should we book?',
    a: 'Weekends and surprise proposals fill fastest. We recommend at least 2–3 weeks ahead, though limited last-minute openings sometimes appear.',
  },
  {
    q: 'What is included in a theme experience?',
    a: 'Each signature theme includes private studio time, curated décor, ambient lighting, and our team\'s on-site coordination. Packages and add-ons layer on photography, cakes, florals, and more.',
  },
  {
    q: 'Can we customize add-ons?',
    a: 'Yes — once you choose a theme, you can tailor add-ons to your story. Our team will confirm feasibility and timing before you pay.',
  },
  {
    q: 'How does payment work?',
    a: 'A secure advance secures your slot; the balance is due before your event day. You will see a clear summary before confirming.',
  },
  {
    q: 'Is the venue completely private?',
    a: 'Your celebration runs in a dedicated indoor studio space reserved only for your booking window.',
  },
]

export default function FaqSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [open, setOpen] = useState(-1)

  useEffect(() => {
    if (inView) console.log('[FaqSection] Section entered viewport — accordion ready')
  }, [inView])

  const handleToggle = (i) => {
    const next = open === i ? -1 : i
    console.log(`[FaqSection] Accordion toggle — item ${i} → ${next === -1 ? 'closed' : 'open'}`)
    setOpen(next)
  }

  return (
    <section
      ref={ref}
      id="faq"
      className="faq-luxury-section"
      aria-label="Frequently asked questions"
    >
      {/* Thin cinematic gold hairline — replaces old harsh white bar */}
      <div className="faq-top-accent" aria-hidden />
      {/* Cinematic vignette depth */}
      <div className="faq-vignette" aria-hidden />
      {/* Floating edge particles */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="faq-particle" />
        ))}
      </div>

      <div className="container relative z-[2]">
        {/* ── Header ── */}
        <motion.div
          className="faq-luxury-header"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="faq-luxury-eyebrow">
            <span className="faq-luxury-eyebrow-line" aria-hidden />
            <span className="faq-luxury-eyebrow-text">✧ COMMON QUESTIONS ✧</span>
            <span className="faq-luxury-eyebrow-line right" aria-hidden />
          </div>
          <h2 className="faq-luxury-title">
            Before you{' '}
            <em>say yes</em>
          </h2>
          <p className="faq-luxury-subtitle">
            Straightforward answers — no jargon, no pressure. Tap a question to reveal details.
          </p>
        </motion.div>

        {/* ── Accordion ── */}
        <motion.div
          className="faq-luxury-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={faq.q}
                className={`faq-luxury-item${isOpen ? ' is-open' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.18 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="faq-luxury-trigger"
                  onClick={() => handleToggle(i)}
                >
                  <span>{faq.q}</span>
                  <motion.span
                    aria-hidden
                    className="faq-luxury-icon"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-luxury-answer-wrap"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="faq-luxury-answer">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          aria-hidden
        >
          <span
            className="inline-block h-px w-12"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }}
          />
          <span
            style={{
              fontFamily: SANS,
              fontSize: '0.5rem',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(212,175,55,0.35)',
            }}
          >
            ◆
          </span>
          <span
            className="inline-block h-px w-12"
            style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
