const PACKAGES = [
  {
    tier: 'Basic',
    price: '1,699',
    duration: '1.5 hours',
    guests: 'Up to 7 members',
    popular: false,
    included: [
      { text: 'Balloon Décor', free: true, note: 'Customised ₹1,000' },
      { text: 'Crown', free: true },
      { text: 'Satin Sash Ribbon', free: true, note: 'Based on occasion' },
      { text: 'Unlimited Music Songs', free: true },
    ],
    addons: [
      { text: 'Room Filled with Balloons', price: '350' },
      { text: 'Flower Bouquet', price: '300' },
      { text: '15 Photo Hanging', price: '250' },
      { text: 'Entry Video & 15 min Group Photos', price: '350' },
      { text: 'Fog Entry', price: '500' },
      { text: 'Red Carpet Path', price: '300' },
      { text: 'Candle Pathway', price: '500' },
    ],
    cta: 'Select Basic',
    ctaClass: 'btn btn-outline',
  },
  {
    tier: 'Premium',
    price: '2,700',
    duration: '1.5 hours',
    guests: 'Up to 7 members',
    popular: true,
    included: [
      { text: 'Balloon Décor', free: true, note: 'Customised ₹1,000' },
      { text: 'Crown', free: true },
      { text: 'Satin Sash Ribbon', free: true, note: 'Based on occasion' },
      { text: 'Unlimited Music Songs', free: true },
      { text: 'Room Filled with Balloons', free: false, price: '350' },
      { text: 'Flower Bouquet', free: false, price: '300' },
      { text: '15 Photo Hanging', free: false, price: '250' },
      { text: 'Entry Video & 15 min Group Photos', free: false, price: '350' },
    ],
    addons: [
      { text: 'Fog Entry', price: '500' },
      { text: 'Red Carpet Path', price: '300' },
      { text: 'Candle Pathway', price: '500' },
    ],
    cta: 'Select Premium',
    ctaClass: 'btn btn-primary',
  },
  {
    tier: 'Luxury',
    price: '4,500',
    duration: '1.5 hours',
    guests: 'Up to 10 members',
    popular: false,
    included: [
      { text: 'Balloon Décor', free: true, note: 'Customised ₹1,000' },
      { text: 'Crown', free: true },
      { text: 'Satin Sash Ribbon', free: true, note: 'Based on occasion' },
      { text: 'Unlimited Music Songs', free: true },
      { text: 'Room Filled with Balloons', free: true },
      { text: 'Flower Bouquet', free: true },
      { text: '15 Photo Hanging', free: true },
      { text: 'Entry Video & 15 min Group Photos', free: true },
      { text: 'Fog Entry', free: true },
      { text: 'Red Carpet Path', free: true },
      { text: 'Candle Pathway', free: true },
      { text: 'Cake ½ KG', free: true },
    ],
    addons: [],
    cta: 'Select Luxury',
    ctaClass: 'btn btn-outline',
  },
];

export default function PackagesSection() {
  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pkg-section" id="packages" aria-label="Packages & Pricing">
      <div className="container">
        <div className="pkg-header reveal">
          <div className="section-label">Packages & Pricing</div>
          <h2 className="section-title">Choose Your <em>Package</em></h2>
          <p className="section-subtitle">
            All packages are available across our three themes — Balloon, Heart & Partition.
            Pick the one that suits your celebration best.
          </p>
        </div>

        <div className="pkg-grid">
          {PACKAGES.map((pkg, i) => (
            <div
              key={pkg.tier}
              className={`pkg-card reveal reveal-delay-${i + 1}${pkg.popular ? ' pkg-card--popular' : ''}`}
            >
              {pkg.popular && <div className="pkg-popular-badge">Most Popular</div>}

              <div className="pkg-card-head">
                <span className="pkg-tier">{pkg.tier}</span>
                <div className="pkg-price">
                  <span className="pkg-rupee">₹</span>
                  <span className="pkg-amount">{pkg.price}</span>
                </div>
                <p className="pkg-meta">{pkg.duration} · {pkg.guests}</p>
              </div>

              <div className="pkg-card-body">
                <p className="pkg-list-label">What's Included</p>
                <ul className="pkg-list">
                  {pkg.included.map((item) => (
                    <li key={item.text} className="pkg-item pkg-item--included">
                      <span className="pkg-check">✓</span>
                      <span>
                        {item.text}
                        {item.free && <span className="pkg-free"> Free</span>}
                        {item.price && <span className="pkg-item-price"> ₹{item.price}</span>}
                        {item.note && <span className="pkg-note"> ({item.note})</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                {pkg.addons.length > 0 && (
                  <>
                    <p className="pkg-list-label pkg-list-label--addon">Add-Ons</p>
                    <ul className="pkg-list">
                      {pkg.addons.map((addon) => (
                        <li key={addon.text} className="pkg-item pkg-item--addon">
                          <span className="pkg-plus">+</span>
                          <span>
                            {addon.text}
                            <span className="pkg-item-price"> ₹{addon.price}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="pkg-card-foot">
                <button
                  className={pkg.ctaClass}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={scrollToBooking}
                >
                  <span>✦</span> {pkg.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
