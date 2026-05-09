import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onBook }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

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
          <a href="#" className="nav-logo" onClick={e => { e.preventDefault(); scrollTo('#home'); }}>
            <span className="nav-logo-name">Velvet Nights</span>
            <span className="nav-logo-tagline">Private Event Studio</span>
          </a>

          <ul className="nav-links">
            {[['#home','Home'],['#themes','Themes'],['#booking','Bookings']].map(([href, label]) => (
              <li key={href}>
                <a href={href} onClick={e => { e.preventDefault(); scrollTo(href); }}>{label}</a>
              </li>
            ))}
          </ul>

          <div className="nav-cta">
            <button className="btn btn-primary" onClick={() => onBook()}>
              <span>✦</span> Reserve Now
            </button>
          </div>

          <button
            className="hamburger"
            aria-label="Open menu"
            onClick={() => { setMobileOpen(true); document.body.style.overflow = 'hidden'; }}
          >
            <span/><span/><span/>
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
            <button className="mobile-nav-close" onClick={() => { setMobileOpen(false); document.body.style.overflow = ''; }}>✕</button>
            {[['#home','Home'],['#themes','Themes']].map(([href, label]) => (
              <a key={href} href={href} onClick={e => { e.preventDefault(); scrollTo(href); }}>{label}</a>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setMobileOpen(false); document.body.style.overflow = ''; onBook(); }}>
              ✦ Reserve Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
