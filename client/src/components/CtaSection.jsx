import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useBusinessSettings from '../hooks/useBusinessSettings'
import { digitsOnly, whatsappHref } from '../utils/contact'

export default function CtaSection({ onBook }) {
  const settings = useBusinessSettings()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const handleAnchorClick = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const phoneDigits = digitsOnly(settings.phone)
  const telHref = phoneDigits ? `tel:+${phoneDigits}` : `tel:${settings.phone}`
  const waUrl = whatsappHref(settings.whatsapp)

  return (
    <section
      ref={ref}
      id="booking"
      className="cta-section relative overflow-hidden"
      aria-label="Call to action"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 120%, rgba(200,168,75,0.15), transparent 55%), radial-gradient(circle at 20% 30%, rgba(50,35,115,0.22), transparent 40%)',
        }}
      />
      <div className="container relative">
        <motion.div
          className="cta-inner reveal relative overflow-hidden rounded-3xl border border-[rgba(200,168,75,0.18)] bg-[rgba(6,4,18,0.80)] px-6 py-14 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-12 sm:py-16"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[rgba(200,168,75,0.1)] blur-3xl"
            aria-hidden
          />
          <div className="section-label relative justify-center" style={{ marginBottom: '24px' }}>
            <span
              style={{ width: '32px', height: '1px', background: 'var(--gold)', opacity: 0.6 }}
              aria-hidden
            />
            Ready to begin?
          </div>
          <h2 className="cta-title relative">
            Your perfect
            <br />
            <em>evening awaits</em>
          </h2>
          <p className="cta-desc relative mx-auto mt-4 max-w-xl">
            Reserve your private studio window - we will guide you through theme, package, and add-ons in one
            seamless flow.
          </p>
          <div className="cta-actions relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button
              type="button"
              className="btn btn-primary w-full justify-center sm:w-auto"
              style={{ fontSize: '1rem', padding: '16px 40px' }}
              onClick={() => onBook && onBook()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{'\u2726'}</span> Book your experience
            </motion.button>
            <motion.a
              href={waUrl}
              className="btn btn-outline w-full justify-center sm:w-auto"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '1rem', padding: '16px 40px' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              WhatsApp concierge
            </motion.a>
            <motion.button
              type="button"
              className="btn btn-glass w-full sm:w-auto"
              style={{ fontSize: '1rem', padding: '16px 32px' }}
              onClick={(e) => handleAnchorClick(e, '#themes')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore themes
            </motion.button>
          </div>
          <div className="cta-contact relative mt-10 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <a href={telHref} className="cta-contact-item transition-colors hover:text-gold-light">
              <span className="cta-contact-icon" aria-hidden="true">{'\u260E'}</span>
              {settings.phone}
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="cta-contact-item transition-colors hover:text-gold-light"
            >
              <span className="cta-contact-icon" aria-hidden="true">{'\u2709'}</span>
              {settings.email}
            </a>
            <div className="cta-contact-item">
              <span className="cta-contact-icon" aria-hidden="true">{'\u25CF'}</span>
              {settings.address}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
