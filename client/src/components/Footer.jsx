import { motion } from 'framer-motion';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer aria-label="Site footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-name">Velvet Nights</div>
            <p className="footer-brand-desc">
              Chennai's premier indoor private event studio, crafting unforgettable moments for every occasion. Premium, intimate, and entirely yours.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="YouTube">▶️</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Experiences</div>
            <ul className="footer-links">
              {[['#themes','Romantic Theme'],['#themes','Birthday Theme'],['#themes','Surprise Theme']].map(([href, label]) => (
                <li key={label}>
                  <a href={href} onClick={e => { e.preventDefault(); scrollTo(href); }}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              {['About Us','Our Story','Gallery'].map(label => (
                <li key={label}><a href="#">{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📍</span>
              <span>T. Nagar, Chennai — 600017</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📞</span>
              <a href="tel:+919999999999">+91 99999 99999</a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">✉️</span>
              <a href="mailto:hello@velvetnights.in">hello@velvetnights.in</a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">🕐</span>
              <span>Open daily · 9 AM – 11 PM</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Velvet Nights. All rights reserved.</span>
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
