import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import useBusinessSettings from '../hooks/useBusinessSettings'
import { digitsOnly, whatsappHref } from '../utils/contact'
import { clearQuickReserveContext } from '../utils/bookingContext'
import '../styles/cta-cinematic-luxury.css'

/* ── Floral SVG corner art ── */
const FloralCornerTL = () => (
  <svg className="cta-floral cta-floral--tl" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g opacity="0.55" stroke="#C8A84B" strokeWidth="0.8">
      <path d="M10,140 Q30,80 80,60 Q110,50 140,20" strokeLinecap="round"/>
      <path d="M20,150 Q50,100 90,75 Q120,55 150,10" strokeLinecap="round" opacity="0.5"/>
      <path d="M60,80 Q70,60 80,55" strokeLinecap="round"/>
      <circle cx="82" cy="53" r="4" fill="none"/>
      <circle cx="82" cy="53" r="1.5" fill="#C8A84B"/>
      <path d="M78,57 Q72,68 65,72 M86,57 Q92,66 98,68"/>
      <path d="M30,120 Q40,108 48,100"/>
      <circle cx="50" cy="97" r="3" fill="none"/>
      <circle cx="50" cy="97" r="1.2" fill="#C8A84B"/>
      <path d="M47,100 Q42,108 36,112 M53,100 Q58,107 62,108"/>
      <path d="M110,40 Q118,32 122,28"/>
      <circle cx="124" cy="26" r="3" fill="none"/>
      <circle cx="124" cy="26" r="1.2" fill="#C8A84B"/>
      <path d="M121,29 Q116,36 112,40 M127,29 Q132,33 135,32"/>
      <path d="M5,90 Q25,85 35,70" opacity="0.4"/>
      <path d="M55,145 Q65,125 75,115" opacity="0.4"/>
    </g>
  </svg>
)

const FloralCornerBR = () => (
  <svg className="cta-floral cta-floral--br" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g opacity="0.45" stroke="#C8A84B" strokeWidth="0.8">
      <path d="M150,20 Q130,80 80,100 Q50,110 20,140" strokeLinecap="round"/>
      <path d="M140,10 Q110,60 70,85 Q40,105 10,150" strokeLinecap="round" opacity="0.5"/>
      <path d="M100,80 Q90,100 80,105" strokeLinecap="round"/>
      <circle cx="78" cy="107" r="4" fill="none"/>
      <circle cx="78" cy="107" r="1.5" fill="#C8A84B"/>
      <path d="M82,103 Q88,92 95,88 M74,103 Q68,94 62,92"/>
      <path d="M40,125 Q50,113 58,102"/>
      <path d="M120,50 Q108,55 102,62" opacity="0.4"/>
    </g>
  </svg>
)

/* ── Animated Particles ── */
const GoldParticles = () => {
  const [particles] = useState(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
  })))

  return (
    <div className="cta-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="cta-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Feature row data ── */
const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
        <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Luxury Experiences',
    sub: 'Tailored for you',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: '100% Privacy',
    sub: 'Guaranteed',
    gold: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
      </svg>
    ),
    title: '24/7 Concierge',
    sub: 'At your service',
  },
]

export default function CtaSection() {
  const settings = useBusinessSettings()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const handleAnchorClick = (e, href) => {
    e.preventDefault()
    if (href === '#themes') clearQuickReserveContext()
    const target = document.querySelector(href)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const phoneDigits = digitsOnly(settings.phone)
  const telHref = phoneDigits ? `tel:+${phoneDigits}` : `tel:${settings.phone}`
  const waUrl = whatsappHref(settings.whatsapp)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
  }

  return (
    <section
      ref={ref}
      id="booking"
      className="cta-lux-section"
      aria-label="Call to action"
    >
      {/* ── Deep atmospheric backdrop ── */}
      <div className="cta-lux-backdrop" aria-hidden="true">
        <div className="cta-lux-backdrop__radial cta-lux-backdrop__radial--center" />
        <div className="cta-lux-backdrop__radial cta-lux-backdrop__radial--left" />
        <div className="cta-lux-backdrop__radial cta-lux-backdrop__radial--right" />
        <div className="cta-lux-backdrop__streak cta-lux-backdrop__streak--1" />
        <div className="cta-lux-backdrop__streak cta-lux-backdrop__streak--2" />
      </div>

      {/* ── Floating particles ── */}
      <GoldParticles />

      <div className="cta-lux-container">
        <motion.div
          className="cta-lux-card"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ── Card border glow ── */}
          <div className="cta-lux-card__border-glow" aria-hidden="true" />

          {/* ── Floral corners ── */}
          <FloralCornerTL />
          <FloralCornerBR />

          {/* ── Inner spotlight ── */}
          <div className="cta-lux-card__spotlight" aria-hidden="true" />

          {/* ── Content ── */}
          <motion.div
            className="cta-lux-content"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {/* Label */}
            <motion.div className="cta-lux-label" variants={itemVariants}>
              <span className="cta-lux-label__line" aria-hidden="true" />
              <span className="cta-lux-label__diamond" aria-hidden="true">✦</span>
              <span>Ready to Begin?</span>
              <span className="cta-lux-label__diamond" aria-hidden="true">✦</span>
              <span className="cta-lux-label__line" aria-hidden="true" />
            </motion.div>

            {/* Headline */}
            <motion.h2 className="cta-lux-title" variants={itemVariants}>
              Your perfect
              <br />
              <em>evening awaits</em>
            </motion.h2>

            {/* Ornamental rule */}
            <motion.div className="cta-lux-rule" variants={itemVariants} aria-hidden="true">
              <span className="cta-lux-rule__line" />
              <span className="cta-lux-rule__gem">◆</span>
              <span className="cta-lux-rule__line" />
            </motion.div>

            {/* Description */}
            <motion.p className="cta-lux-desc" variants={itemVariants}>
              Reserve your private studio window — we will guide you through theme,
              package, and add-ons in one seamless flow.
            </motion.p>

            {/* Feature highlights */}
            <motion.div className="cta-lux-features" variants={itemVariants}>
              {FEATURES.map((f, i) => (
                <div key={i} className={`cta-lux-feature${f.gold ? ' cta-lux-feature--gold' : ''}`}>
                  <div className="cta-lux-feature__icon">{f.icon}</div>
                  <div className="cta-lux-feature__text">
                    <span className="cta-lux-feature__title">{f.title}</span>
                    <span className="cta-lux-feature__sub">{f.sub}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div className="cta-lux-actions" variants={itemVariants}>
              <motion.button
                type="button"
                className="cta-lux-btn cta-lux-btn--primary"
                onClick={(e) => handleAnchorClick(e, '#themes')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="cta-lux-btn__sparkle" aria-hidden="true">✦</span>
                Book your experience
                <span className="cta-lux-btn__glow" aria-hidden="true" />
              </motion.button>

              <motion.a
                href={waUrl}
                className="cta-lux-btn cta-lux-btn--glass"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg className="cta-lux-btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Concierge
              </motion.a>

              <motion.button
                type="button"
                className="cta-lux-btn cta-lux-btn--outline"
                onClick={(e) => handleAnchorClick(e, '#themes')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg className="cta-lux-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Explore Themes
              </motion.button>
            </motion.div>

            {/* Contact footer */}
            <motion.div className="cta-lux-contact" variants={itemVariants}>
              <div className="cta-lux-contact__divider" aria-hidden="true">
                <span className="cta-lux-contact__divider-line" />
                <span className="cta-lux-contact__divider-gem" aria-hidden="true">◈</span>
                <span className="cta-lux-contact__divider-line" />
              </div>
              <div className="cta-lux-contact__items">
                <a href={telHref} className="cta-lux-contact__item">
                  <span className="cta-lux-contact__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 8.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {settings.phone}
                </a>
                <span className="cta-lux-contact__sep" aria-hidden="true">|</span>
                <a href={`mailto:${settings.email}`} className="cta-lux-contact__item">
                  <span className="cta-lux-contact__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {settings.email}
                </a>
                <span className="cta-lux-contact__sep" aria-hidden="true">|</span>
                <div className="cta-lux-contact__item">
                  <span className="cta-lux-contact__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {settings.address}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
