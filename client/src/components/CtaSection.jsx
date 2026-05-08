export default function CtaSection() {
  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="cta-section" aria-label="Call to action">
      <div className="container">
        <div className="cta-inner reveal">
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{ width: '32px', height: '1px', background: 'var(--gold)', opacity: 0.6 }}></span>
            Ready to Begin?
          </div>
          <h2 className="cta-title">
            Your Perfect<br />
            <em>Evening Awaits</em>
          </h2>
          <p className="cta-desc">
            Don't let another special moment pass by without the celebration it deserves. Book your private event experience today.
          </p>
          <div className="cta-actions">
            <a href="#booking" className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 40px' }}
              onClick={e => handleAnchorClick(e, '#booking')}>
              <span>✦</span> Book Now
            </a>
            <a href="https://wa.me/919999999999" className="btn btn-outline" target="_blank" rel="noopener" style={{ fontSize: '1rem', padding: '16px 40px' }}>
              💬 Chat with Us
            </a>
          </div>
          <div className="cta-contact">
            <a href="tel:+919999999999" className="cta-contact-item">
              <span className="cta-contact-icon">📞</span>
              +91 99999 99999
            </a>
            <a href="mailto:hello@WonderOne-Suprises.in" className="cta-contact-item">
              <span className="cta-contact-icon">✉️</span>
              WonderOne-Suprises.in
            </a>
            <div className="cta-contact-item">
              <span className="cta-contact-icon">📍</span>
              Chennai, Tamil Nadu
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
