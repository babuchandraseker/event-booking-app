import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBusinessSettings from '../hooks/useBusinessSettings'

const NAV_LINKS = [
  ['#home', 'Home'],
  ['#themes', 'Themes'],
  ['#gallery', 'Gallery'],
  ['#how-it-works', 'Journey'],
  ['#reviews', 'Reviews'],
  ['#booking', 'Reserve'],
]

export default function Navbar({ onBook }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const settings = useBusinessSettings()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
    document.body.style.overflow = ''
  }

  return (
    <>
      <motion.nav
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        id="navbar"
      >
        <div className="navbar-inner">
          <a
            href="#home"
            className="nav-logo"
            onClick={(e) => {
              e.preventDefault()
              scrollTo('#home')
            }}
          >
            <span className="nav-logo-name">{settings.businessName}</span>
            <span className="nav-logo-tagline">{settings.tagline}</span>
          </a>

          <ul className="nav-links">
            {NAV_LINKS.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="transition-colors duration-300 ease-luxury hover:text-gold-light"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo(href)
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-cta">
            <button type="button" className="btn btn-primary" onClick={() => onBook()}>
              <span>✦</span> Reserve Now
            </button>
          </div>

          <button
            type="button"
            className="hamburger"
            aria-label="Open menu"
            onClick={() => {
              setMobileOpen(true)
              document.body.style.overflow = 'hidden'
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-nav open"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <button
              type="button"
              className="mobile-nav-close"
              onClick={() => {
                setMobileOpen(false)
                document.body.style.overflow = ''
              }}
            >
              ✕
            </button>
            {NAV_LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(href)
                }}
              >
                {label}
              </a>
            ))}
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => {
                setMobileOpen(false)
                document.body.style.overflow = ''
                onBook()
              }}
            >
              ✦ Reserve Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
