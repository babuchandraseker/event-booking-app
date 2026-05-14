import useBusinessSettings from '../hooks/useBusinessSettings'
import { instagramHref, whatsappHref } from '../utils/contact'

export default function Footer() {
  const settings = useBusinessSettings()

  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const phoneHref = settings.phone.replace(/[^\d+]/g, '')
  const instagramHandle = 'awonderonesuprise'
  const instagramUrl = instagramHref(instagramHandle)
  const waUrl = whatsappHref(settings.whatsapp)
  const emailUrl = `mailto:${settings.email}`
  const mapAddress = settings.address || 'No.3 ,Railway Colony , 1st Street ,Aminjikarai , Nelson Manickam Road ,Chennai, India, 600029'
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`

  const quick = [
    ['#themes', 'Themes & packages'],
    ['#gallery', 'Gallery'],
    ['#how-it-works', 'How it works'],
    ['#reviews', 'Reviews'],
    ['#slots', 'Slot availability'],
    ['#why-us', 'Why choose us'],
    ['#faq', 'FAQ'],
    ['#booking', 'Reserve'],
  ]

  return (
    <footer
      className="border-t border-[rgba(201,168,76,0.12)] bg-gradient-to-b from-vn-black to-[#020204] pb-10 pt-16"
      aria-label="Site footer"
    >
      <div className="container">
        <div className="footer-grid gap-y-12">
          <div className="footer-brand max-w-md">
            <div className="footer-brand-name">{settings.businessName}</div>
            <p className="footer-brand-desc">{settings.description}</p>
            <div className="social-links mt-6 flex flex-wrap gap-3">
              <a
                href={instagramUrl}
                className="social-link transition-colors hover:border-[rgba(201,168,76,0.45)] hover:text-gold-light"
                aria-label={`Instagram ${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-link-mark">IG</span>
                <span>Instagram</span>
              </a>
              <a
                href={waUrl}
                className="social-link transition-colors hover:border-[rgba(201,168,76,0.45)] hover:text-gold-light"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-link-mark">WA</span>
                <span>WhatsApp</span>
              </a>
              <a
                href={mapUrl}
                className="social-link transition-colors hover:border-[rgba(201,168,76,0.45)] hover:text-gold-light"
                aria-label="Open location in Google Maps"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-link-mark">LO</span>
                <span>Location</span>
              </a>
              <a
                href={emailUrl}
                className="social-link transition-colors hover:border-[rgba(201,168,76,0.45)] hover:text-gold-light"
                aria-label={`Email ${settings.email}`}
              >
                <span className="social-link-mark">EM</span>
                <span>Email</span>
              </a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Experiences</div>
            <ul className="footer-links">
              {[
                ['#themes', 'Romantic theme'],
                ['#themes', 'Birthday theme'],
                ['#themes', 'Surprise theme'],
              ].map(([href, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="transition-colors hover:text-gold-light"
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
          </div>

          <div>
            <div className="footer-col-title">Explore</div>
            <ul className="footer-links">
              {quick.map(([href, label]) => (
                <li key={href + label}>
                  <a
                    href={href}
                    className="transition-colors hover:text-gold-light"
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
          </div>

          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-contact-row footer-contact-row--actions">
              <a href={`tel:${phoneHref}`} className="footer-contact-action transition-colors hover:text-gold-light">
                <span className="footer-contact-icon">Phone</span>
                <span>{settings.phone}</span>
              </a>
              <a href={waUrl} className="footer-contact-action transition-colors hover:text-gold-light" target="_blank" rel="noopener noreferrer">
                <span className="footer-contact-icon">WhatsApp</span>
                <span>{settings.whatsapp}</span>
              </a>
            </div>
            <div className="footer-contact-row footer-contact-row--meta">
              <div className="footer-contact-meta">
                <span className="footer-contact-icon">City</span>
                <span>{settings.city}</span>
              </div>
              <div className="footer-contact-meta">
                <span className="footer-contact-icon">Hours</span>
                <span>Open daily - {settings.openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom mt-12 flex flex-col gap-4 border-t border-[rgba(201,168,76,0.1)] pt-8 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>{'\u00A9'} 2026 {settings.businessName}. All rights reserved.</span>
          <div className="footer-bottom-links flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="transition-colors hover:text-gold-light">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-gold-light">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-gold-light">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
