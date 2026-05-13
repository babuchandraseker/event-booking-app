import useBusinessSettings from '../hooks/useBusinessSettings'
import { whatsappHref } from '../utils/contact'

export default function Footer() {
  const settings = useBusinessSettings()

  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const phoneHref = settings.phone.replace(/[^\d+]/g, '')
  const instagramHandle = settings.instagram.replace('@', '')
  const waUrl = whatsappHref(settings.whatsapp)

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
                href={`https://instagram.com/${instagramHandle}`}
                className="social-link transition-colors hover:border-[rgba(201,168,76,0.45)] hover:text-gold-light"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href={waUrl}
                className="social-link transition-colors hover:border-[rgba(201,168,76,0.45)] hover:text-gold-light"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
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
            <div className="footer-contact-item">
              <span className="footer-contact-icon">Location</span>
              <span>{settings.address}</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">City</span>
              <span>{settings.city}</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">Phone</span>
              <a href={`tel:${phoneHref}`} className="transition-colors hover:text-gold-light">
                {settings.phone}
              </a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">WhatsApp</span>
              <a href={waUrl} className="transition-colors hover:text-gold-light" target="_blank" rel="noopener noreferrer">
                {settings.whatsapp}
              </a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">Email</span>
              <a href={`mailto:${settings.email}`} className="transition-colors hover:text-gold-light">
                {settings.email}
              </a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">Hours</span>
              <span>Open daily — {settings.openingHours}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom mt-12 flex flex-col gap-4 border-t border-[rgba(201,168,76,0.1)] pt-8 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {settings.businessName}. All rights reserved.</span>
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
