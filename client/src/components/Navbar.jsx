import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    setMobileOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          <a href="#" className="nav-logo" aria-label="WonderOne-Suprises Home" onClick={e => handleAnchorClick(e, '#home')}>
            <span className="nav-logo-name">WonderOne-Suprises</span>
            <span className="nav-logo-tagline">Private Event Studio</span>
          </a>

          <ul className="nav-links" role="list">
            {[['#themes','Themes'],['#celebrations','Gallery'],['#pricing','Pricing'],['#booking','Booking'],['#addons','Add-ons'],['#gallery','Gallery'],['#trust','Reviews']].map(([href, label]) => (
              <li key={href}><a href={href} onClick={e => handleAnchorClick(e, href)}>{label}</a></li>
            ))}
          </ul>

          <div className="nav-cta">
            <a href="https://wa.me/919999999999" className="btn btn-outline" target="_blank" rel="noopener">
              <span>📞</span> WhatsApp
            </a>
            <a href="#booking" className="btn btn-primary" onClick={e => handleAnchorClick(e, '#booking')}>Book Now</a>
          </div>

          <button className="hamburger" aria-label="Open menu" aria-expanded={mobileOpen} onClick={openMenu}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <button className="mobile-nav-close" aria-label="Close menu" onClick={closeMenu}>✕</button>
        {[['#themes','Themes'],['#pricing','Pricing'],['#booking','Booking'],['#addons','Add-ons'],['#gallery','Gallery'],['#trust','Reviews']].map(([href, label]) => (
          <a key={href} href={href} onClick={e => handleAnchorClick(e, href)}>{label}</a>
        ))}
        <a href="#booking" className="btn btn-primary" style={{marginTop:'20px'}} onClick={e => handleAnchorClick(e, '#booking')}>Book Now</a>
      </div>
    </>
  );
}
