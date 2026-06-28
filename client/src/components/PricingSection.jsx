const plans = [
  {
    tier: 'Tier 01',
    name: 'Essentials',
    tagline: 'Perfect for intimate moments',
    price: '2,999',
    duration: 'Per session · Up to 2 guests · 1.5 hours',
    features: [
      { text: 'Theme decoration setup', active: true },
      { text: 'Ambient lighting & music', active: true },
      { text: 'Welcome drink (non-alcoholic)', active: true },
      { text: 'Basic photo opportunity setup', active: true },
      { text: '30-min room access before event', active: true },
      { text: 'Dedicated host', active: false },
      { text: 'Cake & desserts', active: false },
      { text: 'Photographer included', active: false },
    ],
    cta: 'Get Started',
    ctaClass: 'btn btn-outline',
    revealDelay: 1,
    popular: false,
  },
  {
    tier: 'Tier 02',
    name: 'Signature',
    tagline: 'Our most-loved experience',
    price: '5,999',
    duration: 'Per session · Up to 8 guests · 3 hours',
    features: [
      { text: 'Premium theme decoration', active: true },
      { text: 'Full ambiance: lights, music, scent', active: true },
      { text: 'Welcome drinks for all guests', active: true },
      { text: 'Professional photo station', active: true },
      { text: '60-min pre-event room access', active: true },
      { text: 'Dedicated personal host', active: true },
      { text: 'Complimentary dessert platter', active: true },
      { text: 'Photographer included', active: false },
    ],
    cta: 'Choose Signature',
    ctaClass: 'btn btn-primary',
    revealDelay: 2,
    popular: true,
  },
  {
    tier: 'Tier 03',
    name: 'Grand',
    tagline: 'The ultimate luxury experience',
    price: '9,999',
    duration: 'Per session · Up to 20 guests · 4 hours',
    features: [
      { text: 'Bespoke luxury decoration', active: true },
      { text: 'Full A/V & lighting rig', active: true },
      { text: 'Premium welcome cocktails', active: true },
      { text: 'Live photo & video coverage', active: true },
      { text: '90-min pre-event preparation', active: true },
      { text: 'Dedicated host + assistant', active: true },
      { text: 'Cake, desserts & light bites', active: true },
      { text: 'Professional photographer (2hr)', active: true },
    ],
    cta: 'Go Grand',
    ctaClass: 'btn btn-outline',
    revealDelay: 3,
    popular: false,
  },
];

export default function PricingSection() {
  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="pricing-section" id="pricing" aria-label="Pricing plans">
      <div className="container">
        <div className="pricing-header reveal">
          <div className="section-label">Transparent Pricing</div>
          <h2 className="section-title">Simple, <em>Honest</em> Plans</h2>
          <p className="section-subtitle">No hidden fees, no surprises — just premium experiences at fair prices. Customize further with our add-ons.</p>
        </div>

        <div className="pricing-grid">
          {plans.map(plan => (
            <div key={plan.name} className={`pricing-card reveal reveal-delay-${plan.revealDelay}${plan.popular ? ' popular' : ''}`}>
              {plan.popular && <div className="pricing-popular-badge">Most Popular</div>}
              <div className="pricing-tier">{plan.tier}</div>
              <h3 className="pricing-name">{plan.name}</h3>
              <p className="pricing-tagline">{plan.tagline}</p>
              <div className="pricing-price"><sub>₹</sub>{plan.price}</div>
              <div className="pricing-duration">{plan.duration}</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                {plan.features.map(f => (
                  <li key={f.text} className={f.active ? '' : 'muted'}>{f.text}</li>
                ))}
              </ul>
              <a
                href="#booking"
                className={plan.ctaClass}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={e => handleAnchorClick(e, '#booking')}
              >
                {plan.popular && <span>✦</span>} {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.8rem', color: 'var(--text-muted)' }} className="reveal">
          * Prices are indicative. Final pricing depends on selected theme, guest count, and add-ons. GST applicable.
        </p>
      </div>
    </section>
  );
}
