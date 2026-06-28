import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FeedbackButton from './FeedbackButton'
import useBusinessSettings from '../hooks/useBusinessSettings'
import { scrollToSection } from '../utils/scrollTo'

const NAV_LINKS = [
  ['#home',    'HOME'],
  ['#themes',  'THEMES'],
  ['#gallery', 'GALLERY'],
  ['#reviews', 'REVIEWS'],
]

const BRAND_DISPLAY = 'A WonderOne Surprise'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const settings = useBusinessSettings()
  const menuRef = useRef(null)
  const hamburgerRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const handleOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        hamburgerRef.current && !hamburgerRef.current.contains(e.target)
      ) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [mobileOpen])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  /**
   * Close the menu first, then scroll after the exit animation completes.
   * The AnimatePresence exit transition is ~200ms; we wait 220ms to be safe.
   * scrollToSection itself also waits for the element to appear (handles lazy sections).
   */
  const scrollTo = useCallback((selector) => {
    if (mobileOpen) {
      setMobileOpen(false)
      setTimeout(() => scrollToSection(selector), 220)
    } else {
      scrollToSection(selector)
    }
  }, [mobileOpen])

  const toggle = useCallback(() => setMobileOpen(prev => !prev), [])

  return (
    <>
      <motion.nav
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        id="navbar"
        aria-label="Primary navigation"
      >
        <div className="navbar-inner">
          <div className="navbar-col navbar-col--brand">
            <a
              href="#home"
              className="nav-logo"
              onClick={(e) => { e.preventDefault(); scrollTo('#home') }}
            >
              <span className="nav-logo-name nav-logo-name--gold nav-logo-name--desktop">{BRAND_DISPLAY}</span>
              <span className="nav-logo-name nav-logo-name--gold nav-logo-name--mobile">
                <span className="nav-logo-line1">A WonderOne</span>
                <span className="nav-logo-line2">Surprise</span>
              </span>
              <span className="nav-logo-tagline">{settings.tagline}</span>
            </a>
          </div>

          <div className="navbar-col navbar-col--center">
            <ul className="nav-links">
              {NAV_LINKS.map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="nav-link transition-colors duration-300 ease-luxury"
                    onClick={(e) => { e.preventDefault(); scrollTo(href) }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="navbar-col navbar-col--actions nav-cta">
            <FeedbackButton placement="nav" />

            <button
              ref={hamburgerRef}
              type="button"
              className={`hamburger${mobileOpen ? ' is-open' : ''}`}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={toggle}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={menuRef}
            className="mobile-nav open"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <button
              type="button"
              className="mobile-nav-close"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>

            {NAV_LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={(e) => { e.preventDefault(); scrollTo(href) }}
              >
                {label}
              </a>
            ))}

            {/* Feedback — styled to match nav link rows on mobile */}
            <div className="mobile-nav__feedback-row">
              <FeedbackButton placement="mobile" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
