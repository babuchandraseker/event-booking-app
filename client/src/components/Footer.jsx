import { useState, useEffect, useRef } from 'react'
import useBusinessSettings from '../hooks/useBusinessSettings'
import { instagramHref, whatsappHref } from '../utils/contact'
import '../styles/footer-luxury.css'

/* ── Tiny SVG icons ── */
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)
const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.48 2 2 0 0 1 3.54 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.38-1.38a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

/* ── Particle canvas ── */
function FooterParticles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, particles = []
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const W = () => canvas.width, H = () => canvas.height
    for (let i = 0; i < 38; i++) {
      particles.push({
        x: Math.random() * W(), y: Math.random() * H(),
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -Math.random() * 0.22 - 0.06,
        alpha: Math.random() * 0.55 + 0.1,
        gold: Math.random() > 0.5,
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, W(), H())
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < -4) { p.y = H() + 4; p.x = Math.random() * W() }
        if (p.x < -4) p.x = W() + 4
        if (p.x > W() + 4) p.x = -4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(215,172,40,${p.alpha})`
          : `rgba(170,100,230,${p.alpha * 0.7})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="ftr-particles" aria-hidden="true" />
}

export default function Footer() {
  const settings = useBusinessSettings()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const phoneHref = settings.phone.replace(/[^\d+]/g, '')
  const instagramHandle = 'awonderonesuprise'
  const instagramUrl = instagramHref(instagramHandle)
  const waUrl = whatsappHref(settings.whatsapp)
  const emailUrl = `mailto:${settings.email}`
  const mapAddress = settings.address || 'No.3, Railway Colony, 1st Street, Aminjikarai, Nelson Manickam Road, Chennai, India'
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`

  const experienceLinks = [
    ['#themes', 'Romantic Theme'],
    ['#themes', 'Birthday Theme'],
    ['#themes', 'Surprise Theme'],
  ]

  const exploreLinks = [
    ['#themes', 'Themes & Packages'],
    ['#gallery', 'Gallery'],
    ['#reviews', 'Reviews'],
    ['#faq', 'FAQ'],
    ['#slots', 'Slot Availability'],
    ['#booking', 'Reserve'],
  ]

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="ftr-root" aria-label="Site footer">
      {/* Decorative ambient glows */}
      <div className="ftr-glow ftr-glow--left" aria-hidden="true" />
      <div className="ftr-glow ftr-glow--right" aria-hidden="true" />
      <div className="ftr-glow ftr-glow--center" aria-hidden="true" />

      {/* Gold top border */}
      <div className="ftr-top-rule" aria-hidden="true">
        <div className="ftr-top-rule-inner" />
        <div className="ftr-top-rule-gem">✦</div>
      </div>

      {/* Floating particles */}
      <FooterParticles />

      {/* SVG floral corner — left */}
      <svg className="ftr-floral ftr-floral--left" viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="60" cy="130" rx="55" ry="75" fill="rgba(130,56,179,0.07)" />
        <circle cx="50" cy="80" r="30" fill="rgba(215,172,40,0.05)" />
        <path d="M20,200 Q60,140 100,180 Q80,220 40,240 Z" fill="rgba(130,56,179,0.09)"/>
        <path d="M10,100 Q50,60 80,90 Q55,120 20,115 Z" fill="rgba(215,172,40,0.07)"/>
        {[0,60,120,180,240,300].map((deg, i) => (
          <ellipse key={i} cx={55 + Math.cos(deg*Math.PI/180)*28} cy={120 + Math.sin(deg*Math.PI/180)*28} rx="9" ry="18"
            fill={`rgba(${i%2?'215,172,40':'150,70,200'},0.12)`}
            transform={`rotate(${deg},${55+Math.cos(deg*Math.PI/180)*28},${120+Math.sin(deg*Math.PI/180)*28})`} />
        ))}
        <circle cx="55" cy="120" r="7" fill="rgba(215,172,40,0.18)" />
        <line x1="55" y1="120" x2="55" y2="240" stroke="rgba(215,172,40,0.12)" strokeWidth="1"/>
        <line x1="55" y1="120" x2="10" y2="60" stroke="rgba(150,70,200,0.1)" strokeWidth="1"/>
      </svg>

      {/* SVG floral corner — right */}
      <svg className="ftr-floral ftr-floral--right" viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="140" cy="130" rx="55" ry="75" fill="rgba(130,56,179,0.07)" />
        <circle cx="150" cy="80" r="30" fill="rgba(215,172,40,0.05)" />
        <path d="M180,200 Q140,140 100,180 Q120,220 160,240 Z" fill="rgba(130,56,179,0.09)"/>
        <path d="M190,100 Q150,60 120,90 Q145,120 180,115 Z" fill="rgba(215,172,40,0.07)"/>
        {[0,60,120,180,240,300].map((deg, i) => (
          <ellipse key={i} cx={145 + Math.cos(deg*Math.PI/180)*28} cy={120 + Math.sin(deg*Math.PI/180)*28} rx="9" ry="18"
            fill={`rgba(${i%2?'215,172,40':'150,70,200'},0.12)`}
            transform={`rotate(${deg},${145+Math.cos(deg*Math.PI/180)*28},${120+Math.sin(deg*Math.PI/180)*28})`} />
        ))}
        <circle cx="145" cy="120" r="7" fill="rgba(215,172,40,0.18)" />
        <line x1="145" y1="120" x2="145" y2="240" stroke="rgba(215,172,40,0.12)" strokeWidth="1"/>
        <line x1="145" y1="120" x2="190" y2="60" stroke="rgba(150,70,200,0.1)" strokeWidth="1"/>
      </svg>

      <div className="ftr-container">
        <div className="ftr-grid">

          {/* ── BRAND COLUMN ── */}
          <div className="ftr-brand">
            <div className="ftr-brand-crown" aria-hidden="true">♛</div>
            <div className="ftr-brand-name">{settings.businessName}</div>
            <p className="ftr-brand-desc">{settings.description}</p>

            {/* Social icons */}
            <div className="ftr-socials">
              <a href={instagramUrl} className="ftr-social-btn" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <IconInstagram /><span>Instagram</span>
              </a>
              <a href={waUrl} className="ftr-social-btn" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <IconWhatsApp /><span>WhatsApp</span>
              </a>
              <a href={mapUrl} className="ftr-social-btn" aria-label="Location" target="_blank" rel="noopener noreferrer">
                <IconLocation /><span>Location</span>
              </a>
              <a href={emailUrl} className="ftr-social-btn" aria-label="Email">
                <IconMail /><span>Email</span>
              </a>
            </div>

            {/* Booking CTA card */}
            <div className="ftr-booking-card">
              <div className="ftr-booking-card__icon"><IconCalendar /></div>
              <div className="ftr-booking-card__body">
                <div className="ftr-booking-card__title">Book Your Experience</div>
                <div className="ftr-booking-card__sub">Reserve your private studio window for your special day.</div>
              </div>
              <button
                className="ftr-booking-card__btn"
                onClick={() => scrollTo('#booking')}
                aria-label="Go to booking"
              >→</button>
            </div>
          </div>

          {/* ── EXPERIENCES COLUMN ── */}
          <div className="ftr-col">
            <div className="ftr-col-title">
              <span className="ftr-col-title__line" />
              Experiences
              <span className="ftr-col-title__line" />
            </div>
            <ul className="ftr-nav-list">
              {experienceLinks.map(([href, label]) => (
                <li key={label}>
                  <a href={href} className="ftr-nav-link" onClick={e => { e.preventDefault(); scrollTo(href) }}>
                    <span className="ftr-nav-link__chevron"><IconChevron /></span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── EXPLORE COLUMN ── */}
          <div className="ftr-col">
            <div className="ftr-col-title">
              <span className="ftr-col-title__line" />
              Explore
              <span className="ftr-col-title__line" />
            </div>
            <ul className="ftr-nav-list">
              {exploreLinks.map(([href, label]) => (
                <li key={href + label}>
                  <a href={href} className="ftr-nav-link" onClick={e => { e.preventDefault(); scrollTo(href) }}>
                    <span className="ftr-nav-link__chevron"><IconChevron /></span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── CONTACT COLUMN ── */}
          <div className="ftr-col">
            <div className="ftr-col-title">
              <span className="ftr-col-title__line" />
              Contact
              <span className="ftr-col-title__line" />
            </div>
            <div className="ftr-contact-list">
              <a href={`tel:${phoneHref}`} className="ftr-contact-item">
                <span className="ftr-contact-item__icon"><IconPhone /></span>
                <div>
                  <div className="ftr-contact-item__label">Phone</div>
                  <div className="ftr-contact-item__val">{settings.phone}</div>
                </div>
              </a>
              <a href={waUrl} className="ftr-contact-item" target="_blank" rel="noopener noreferrer">
                <span className="ftr-contact-item__icon"><IconWhatsApp /></span>
                <div>
                  <div className="ftr-contact-item__label">WhatsApp</div>
                  <div className="ftr-contact-item__val">{settings.whatsapp}</div>
                </div>
              </a>
              <a href={mapUrl} className="ftr-contact-item" target="_blank" rel="noopener noreferrer">
                <span className="ftr-contact-item__icon"><IconLocation /></span>
                <div>
                  <div className="ftr-contact-item__label">Location</div>
                  <div className="ftr-contact-item__val">{settings.city}</div>
                </div>
              </a>
              <div className="ftr-contact-item">
                <span className="ftr-contact-item__icon"><IconClock /></span>
                <div>
                  <div className="ftr-contact-item__label">Hours</div>
                  <div className="ftr-contact-item__val">Open daily — {settings.openingHours}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── STAY UPDATED COLUMN ── */}
          <div className="ftr-col ftr-col--subscribe">
            <div className="ftr-col-title">
              <span className="ftr-col-title__line" />
              Stay Updated
              <span className="ftr-col-title__line" />
            </div>
            <p className="ftr-subscribe-desc">Subscribe for exclusive offers, event inspirations &amp; updates.</p>
            {/* Dust particles around subscribe */}
            <div className="ftr-subscribe-wrap" style={{ position: 'relative' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="ftr-dust-particle" aria-hidden="true" />
              ))}
            {subscribed ? (
              <div className="ftr-subscribed">✦ Thank you — you're on the list.</div>
            ) : (
              <form className="ftr-subscribe-form" onSubmit={handleSubscribe}>
                <div className="ftr-subscribe-field">
                  <input
                    type="email"
                    className="ftr-subscribe-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    aria-label="Email address"
                  />
                  <button type="submit" className="ftr-subscribe-btn" aria-label="Subscribe">
                    <IconSend />
                  </button>
                </div>
              </form>
            )}
            </div>{/* end ftr-subscribe-wrap */}

            {/* Decorative candle scene */}
            <div className="ftr-candle-scene" aria-hidden="true">
              <div className="ftr-candle ftr-candle--tall">
                <div className="ftr-flame"><div className="ftr-flame__inner"/></div>
                <div className="ftr-candle__body ftr-candle__body--tall"/>
              </div>
              <div className="ftr-candle ftr-candle--mid">
                <div className="ftr-flame"><div className="ftr-flame__inner"/></div>
                <div className="ftr-candle__body ftr-candle__body--mid"/>
              </div>
              <div className="ftr-candle ftr-candle--short">
                <div className="ftr-flame"><div className="ftr-flame__inner"/></div>
                <div className="ftr-candle__body ftr-candle__body--short"/>
              </div>
              <div className="ftr-candle-glow"/>
            </div>
          </div>

        </div>

        {/* ── TRUST BADGES ── */}
        <div className="ftr-badges">
          <div className="ftr-badge">
            <span className="ftr-badge__icon">🛡</span>
            <div>
              <div className="ftr-badge__title">100% Privacy</div>
              <div className="ftr-badge__sub">Your moments are safe with us.</div>
            </div>
          </div>
          <div className="ftr-badge-divider" />
          <div className="ftr-badge">
            <span className="ftr-badge__icon">💎</span>
            <div>
              <div className="ftr-badge__title">Premium Experience</div>
              <div className="ftr-badge__sub">Designed for unforgettable memories.</div>
            </div>
          </div>
          <div className="ftr-badge-divider" />
          <div className="ftr-badge">
            <span className="ftr-badge__icon">🎧</span>
            <div>
              <div className="ftr-badge__title">24/7 Concierge</div>
              <div className="ftr-badge__sub">We're here to assist you anytime.</div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="ftr-bottom">
          <div className="ftr-bottom__rule" />
          <div className="ftr-bottom__inner">
            <span className="ftr-bottom__copy">© 2026 {settings.businessName}. All rights reserved.</span>
            <div className="ftr-bottom__links">
              <a href="#" className="ftr-bottom__link">Privacy Policy</a>
              <span className="ftr-bottom__sep">·</span>
              <a href="#" className="ftr-bottom__link">Terms of Service</a>
              <span className="ftr-bottom__sep">·</span>
              <a href="#" className="ftr-bottom__link">Refund Policy</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
