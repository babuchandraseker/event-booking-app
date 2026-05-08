export default function Footer() {
  const handleAnchorClick = (e, href) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer aria-label="Site footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-name">WonderOne-Suprises</div>
            <p className="footer-brand-desc">
              Chennai's premier indoor private event studio, crafting unforgettable moments for every occasion. Premium, intimate, and entirely yours.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="YouTube">▶️</a>
              <a href="https://wa.me/919999999999" className="social-link" aria-label="WhatsApp" target="_blank" rel="noopener">💬</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Experiences</div>
            <ul className="footer-links">
              {[['#themes','Romantic Theme'],['#themes','Birthday Theme'],['#themes','Surprise Theme'],['#pricing','View Pricing'],['#addons','Add-ons']].map(([href, label]) => (
                <li key={label}><a href={href} onClick={e => handleAnchorClick(e, href)}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              {['About Us','Our Story','How It Works','Gallery','Careers'].map(label => (
                <li key={label}><a href="#">{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📍</span>
              <span>123 Dream Street, T. Nagar, Chennai — 600017</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📞</span>
              <a href="tel:+919999999999">+91 99999 99999</a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">✉️</span>
              <a href="mailto:hello@WonderOne-Suprises.in">hello@WonderOne-Suprises.in</a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">🕐</span>
              <span>Open daily · 9 AM – 11 PM</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 WonderOne-Suprises. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
