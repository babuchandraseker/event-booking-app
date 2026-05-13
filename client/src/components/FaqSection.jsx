import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'

const faqs = [
  {
    q: 'How far in advance should we book?',
    a: 'Weekends and surprise proposals fill fastest. We recommend at least 2–3 weeks ahead, though limited last-minute openings sometimes appear.',
  },
  {
    q: 'What is included in a theme experience?',
    a: 'Each signature theme includes private studio time, curated décor, ambient lighting, and our team’s on-site coordination. Packages and add-ons layer on photography, cakes, florals, and more.',
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

  return (
    <section
      ref={ref}
      id="faq"
      className="faq-section"
      aria-label="Frequently asked questions"
    >
      <div className="container">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label justify-center">Questions, answered</div>
          <h2 className="section-title">
            Before you <em>say yes</em>
          </h2>
          <p className="section-subtitle mx-auto max-w-xl text-[var(--text-secondary)]">
            Straightforward answers — no jargon, no pressure. Tap a question to reveal details.
          </p>
        </motion.div>

        <motion.div
          className="faq-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={faq.q} className="faq-row">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="faq-trigger"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{faq.q}</span>
                  <motion.span
                    aria-hidden
                    className="faq-icon"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="faq-answer">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
