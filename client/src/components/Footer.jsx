import useBusinessSettings from '../hooks/useBusinessSettings';

export default function Footer() {
  const settings = useBusinessSettings();

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const phoneHref = settings.phone.replace(/[^\d+]/g, '');
  const instagramHandle = settings.instagram.replace('@', '');

  return (
    <footer aria-label="Site footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-name">{settings.businessName}</div>
            <p className="footer-brand-desc">{settings.description}</p>
            <div className="social-links">
              <a href={`https://instagram.com/${instagramHandle}`} className="social-link" aria-label="Instagram">IG</a>
              <a href="#" className="social-link" aria-label="Facebook">FB</a>
              <a href="#" className="social-link" aria-label="YouTube">YT</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Experiences</div>
            <ul className="footer-links">
              {[['#themes', 'Romantic Theme'], ['#themes', 'Birthday Theme'], ['#themes', 'Surprise Theme']].map(([href, label]) => (
                <li key={label}>
                  <a href={href} onClick={e => { e.preventDefault(); scrollTo(href); }}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              {['About Us', 'Our Story', 'Gallery'].map(label => (
                <li key={label}><a href="#">{label}</a></li>
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
              <span className="footer-contact-icon">Phone</span>
              <a href={`tel:${phoneHref}`}>{settings.phone}</a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">Email</span>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">Hours</span>
              <span>Open daily - {settings.openingHours}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 {settings.businessName}. All rights reserved.</span>
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
