import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Package data ───────────────────────────────────────── */
const PACKAGES = [
  {
    id: 'basic',
    tier: 'Basic',
    price: 1699,
    duration: '1.5 Hours',
    guests: 'Up to 7 Members',
    popular: false,
    color: 'silver',
    icon: '✦',
    included: [
      { text: 'Balloon Décor', free: true, note: 'Customised ₹1,000 extra' },
      { text: 'Crown', free: true },
      { text: 'Satin Sash Ribbon', free: true, note: 'Based on occasion' },
      { text: 'Unlimited Music Songs', free: true },
    ],
    addonsAvailable: true,
    cta: 'Book Basic',
  },
  {
    id: 'premium',
    tier: 'Premium',
    price: 2700,
    duration: '1.5 Hours',
    guests: 'Up to 7 Members',
    popular: true,
    color: 'gold',
    icon: '❋',
    included: [
      { text: 'Balloon Décor', free: true, note: 'Customised ₹1,000 extra' },
      { text: 'Crown', free: true },
      { text: 'Satin Sash Ribbon', free: true, note: 'Based on occasion' },
      { text: 'Unlimited Music Songs', free: true },
      { text: 'Room Filled with Balloons', free: true },
      { text: 'Flower Bouquet', free: true },
      { text: '15 Photo Hanging', free: true },
      { text: 'Entry Video & 15 min Group Photos', free: true },
    ],
    addonsAvailable: true,
    cta: 'Book Premium',
  },
  {
    id: 'luxury',
    tier: 'Luxury',
    price: 4500,
    duration: '1.5 Hours',
    guests: 'Up to 10 Members',
    popular: false,
    color: 'platinum',
    icon: '♛',
    included: [
      { text: 'Balloon Décor', free: true, note: 'Customised ₹1,000 extra' },
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
    addonsAvailable: false,
    cta: 'Book Luxury',
  },
];

/* ── Add-on data ────────────────────────────────────────── */
const ALL_ADDONS = [
  {
    id: 'balloons',
    text: 'Room Filled with Balloons',
    price: 350,
    img: '/addons/balloons.png',
    icon: '🎈',
    desc: 'Transform your room into a sea of celebration balloons.',
  },
  {
    id: 'bouquet',
    text: 'Flower Bouquet',
    price: 300,
    img: '/addons/bouquet.png',
    icon: '💐',
    desc: 'Fresh hand-crafted floral bouquet to cherish the moment.',
  },
  {
    id: 'photo_hanging',
    text: '15 Photo Hanging',
    price: 250,
    img: '/addons/photo_hanging.png',
    icon: '🖼️',
    desc: 'Display your favourite 15 memories on a lit string wall.',
  },
  {
    id: 'fog',
    text: 'Fog Entry',
    price: 500,
    img: '/addons/fog.png',
    icon: '🌫️',
    desc: 'Dramatic fog machine entry for a breathtaking entrance.',
  },
  {
    id: 'red_carpet',
    text: 'Red Carpet Path',
    price: 300,
    img: '/addons/red_carpet.png',
    icon: '🎞️',
    desc: 'Walk in like a star with a VIP red carpet entrance.',
  },
  {
    id: 'candle_path',
    text: 'Candle Pathway',
    price: 500,
    img: '/addons/candle_path.png',
    icon: '🕯️',
    desc: 'Romantic tealight candles lining your path into the room.',
  },
];

/* ── Helper: which addons are already free for a package ── */
const FREE_FOR_PACKAGE = {
  basic: [],
  premium: ['balloons', 'bouquet', 'photo_hanging'],
  luxury: ['balloons', 'bouquet', 'photo_hanging', 'fog', 'red_carpet', 'candle_path'],
};

/* ── Main Component ─────────────────────────────────────── */
export default function PackagesSection({ themeKey }) {
  const navigate = useNavigate();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const freeAddons = FREE_FOR_PACKAGE[selectedPkg] || [];
  const availableAddons = ALL_ADDONS.filter(a => !freeAddons.includes(a.id));

  const toggleAddon = useCallback((id) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleSelectPackage = (pkgId) => {
    setSelectedPkg(pkgId);
    // Reset addons that are now included free
    const newFree = FREE_FOR_PACKAGE[pkgId] || [];
    setSelectedAddons(prev => prev.filter(id => !newFree.includes(id)));
    document.getElementById('pkg-addons-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pkgData = PACKAGES.find(p => p.id === selectedPkg);
  const addonTotal = selectedAddons.reduce((sum, id) => {
    const a = ALL_ADDONS.find(x => x.id === id);
    return sum + (a?.price || 0);
  }, 0);
  const grandTotal = (pkgData?.price || 0) + addonTotal;

  const handleBookNow = () => {
    if (!selectedPkg) return;
    // Save to sessionStorage for ReservePage
    try {
      const existing = JSON.parse(sessionStorage.getItem('vn_booking_context') || '{}');
      sessionStorage.setItem('vn_booking_context', JSON.stringify({
        ...existing,
        packageId: selectedPkg,
        packageName: pkgData?.tier,
        packagePrice: pkgData?.price,
        addons: selectedAddons.map(id => {
          const a = ALL_ADDONS.find(x => x.id === id);
          return { id, text: a?.text, price: a?.price };
        }),
        addonTotal,
        grandTotal,
      }));
    } catch (_) {}
    const dest = themeKey ? `/reserve/${themeKey}` : '/reserve/birthday';
    navigate(dest);
  };

  return (
    <section className="pkg-section" id="packages" aria-label="Packages & Pricing">
      <div className="pkg-bg-glow" aria-hidden="true" />

      <div className="container">
        {/* ── Header ── */}
        <div className="pkg-header">
          <div className="section-label">Packages & Pricing</div>
          <h2 className="section-title">Choose Your <em>Package</em></h2>
          <p className="section-subtitle">
            All packages are available across our three themes. Pick the one that suits your celebration, then personalise with add-ons.
          </p>
        </div>

        {/* ── Package Cards ── */}
        <div className="pkg-grid">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPkg === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`pkg-card pkg-card--${pkg.color}${pkg.popular ? ' pkg-card--popular' : ''}${isSelected ? ' pkg-card--selected' : ''}`}
                role="article"
              >
                {pkg.popular && <div className="pkg-popular-badge">⭐ Most Popular</div>}
                {isSelected && <div className="pkg-selected-badge">✓ Selected</div>}

                <div className="pkg-card-head">
                  <div className="pkg-icon">{pkg.icon}</div>
                  <span className="pkg-tier">{pkg.tier}</span>
                  <div className="pkg-price">
                    <span className="pkg-rupee">₹</span>
                    <span className="pkg-amount">{pkg.price.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="pkg-meta">{pkg.duration} &nbsp;·&nbsp; {pkg.guests}</p>
                </div>

                <div className="pkg-card-body">
                  <p className="pkg-list-label">What's Included</p>
                  <ul className="pkg-list">
                    {pkg.included.map((item) => (
                      <li key={item.text} className="pkg-item">
                        <span className="pkg-check">✓</span>
                        <span>
                          {item.text}
                          {item.free && <span className="pkg-free"> Free</span>}
                          {item.note && <span className="pkg-note"> ({item.note})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {!pkg.addonsAvailable && (
                    <div className="pkg-all-inclusive">
                      <span>✦</span> All Add-Ons Included
                    </div>
                  )}
                </div>

                <div className="pkg-card-foot">
                  <button
                    className={`pkg-cta-btn${isSelected ? ' pkg-cta-btn--selected' : ''}`}
                    onClick={() => handleSelectPackage(pkg.id)}
                  >
                    {isSelected ? '✓ Package Selected' : pkg.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Add-Ons Section ── */}
        <div className="pkg-addons-wrapper" id="pkg-addons-section">
          <div className="pkg-addons-header">
            <div className="section-label">Personalise Your Experience</div>
            <h3 className="pkg-addons-title">Add-<em>Ons</em></h3>
            <p className="pkg-addons-subtitle">
              Enhance your celebration with these premium add-ons. Each item shown with real photos.
            </p>
          </div>

          <div className="pkg-addons-grid">
            {ALL_ADDONS.map((addon) => {
              const isFree = freeAddons.includes(addon.id);
              const isChecked = isFree || selectedAddons.includes(addon.id);

              return (
                <div
                  key={addon.id}
                  className={`addon-card${isChecked ? ' addon-card--checked' : ''}${isFree ? ' addon-card--free' : ''}`}
                  onClick={() => !isFree && toggleAddon(addon.id)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={e => e.key === ' ' && !isFree && toggleAddon(addon.id)}
                >
                  <div className="addon-img-wrap">
                    <img src={addon.img} alt={addon.text} className="addon-img" loading="lazy" />
                    <div className="addon-img-overlay" />
                    <div className={`addon-checkbox${isChecked ? ' addon-checkbox--checked' : ''}`}>
                      {isChecked ? '✓' : '+'}
                    </div>
                    {isFree && (
                      <div className="addon-free-badge">Included Free</div>
                    )}
                  </div>
                  <div className="addon-body">
                    <div className="addon-icon">{addon.icon}</div>
                    <div className="addon-name">{addon.text}</div>
                    <div className="addon-desc">{addon.desc}</div>
                    <div className="addon-price">
                      {isFree
                        ? <span className="addon-price--free">✓ Free with your package</span>
                        : <><span className="addon-rupee">₹</span>{addon.price.toLocaleString('en-IN')}</>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sticky Booking Summary ── */}
        <div className={`pkg-summary-bar${selectedPkg ? ' pkg-summary-bar--visible' : ''}`}>
          <div className="pkg-summary-inner">
            <div className="pkg-summary-left">
              <div className="pkg-summary-pkg">
                <span className="pkg-summary-label">Package</span>
                <span className="pkg-summary-value">{pkgData?.tier || '—'}</span>
              </div>
              {selectedAddons.length > 0 && (
                <div className="pkg-summary-addons">
                  <span className="pkg-summary-label">Add-Ons</span>
                  <span className="pkg-summary-value">
                    {selectedAddons.map(id => ALL_ADDONS.find(a => a.id === id)?.text).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="pkg-summary-right">
              <div className="pkg-summary-breakdown">
                {pkgData && (
                  <div className="pkg-summary-row">
                    <span>{pkgData.tier}</span>
                    <span>₹{pkgData.price.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedAddons.map(id => {
                  const a = ALL_ADDONS.find(x => x.id === id);
                  return a ? (
                    <div key={id} className="pkg-summary-row pkg-summary-row--addon">
                      <span>+ {a.text}</span>
                      <span>₹{a.price.toLocaleString('en-IN')}</span>
                    </div>
                  ) : null;
                })}
                {freeAddons.length > 0 && (
                  <div className="pkg-summary-row pkg-summary-row--free">
                    <span>Included add-ons</span>
                    <span>Free ✓</span>
                  </div>
                )}
              </div>
              <div className="pkg-summary-total">
                <span>Total</span>
                <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>
              </div>
              <button
                className="pkg-book-btn"
                onClick={handleBookNow}
                disabled={!selectedPkg}
              >
                ✦ Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
