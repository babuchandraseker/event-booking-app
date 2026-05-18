import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PACKAGES, fetchPackages, formatMoney } from '../data/packageCatalog';
import { useBooking } from '../context/BookingContext';

/* ── The 7 common add-ons shared across all packages ── */
const COMMON_ADDONS = [
  {
    id: 'balloons',
    name: 'Room Filled with Balloon',
    price: 350,
    img: '/addons/balloons.png',
    icon: '🎈',
    desc: 'Transform your room into a sea of celebration balloons.',
  },
  {
    id: 'bouquet',
    name: 'Flower Bouquet',
    price: 300,
    img: '/addons/bouquet_gen.png',
    icon: '💐',
    desc: 'Fresh hand-crafted floral bouquet to cherish the moment.',
  },
  {
    id: 'photo_hanging',
    name: '15 Photo Hanging',
    price: 250,
    img: '/addons/photo_hanging.png',
    icon: '🖼️',
    desc: 'Display your favourite 15 memories on a lit string wall.',
  },
  {
    id: 'entry_video',
    name: 'Entry Video & 15min Group Photos',
    price: 350,
    img: '/addons/photographer.png',
    icon: '🎬',
    desc: 'Capture your grand entry on video plus 15 min group photo session.',
  },
  {
    id: 'fog',
    name: 'Fog Entry',
    price: 500,
    img: '/addons/fog_gen.png',
    icon: '🌫️',
    desc: 'Dramatic fog machine entry for a breathtaking entrance.',
  },
  {
    id: 'red_carpet',
    name: 'Red Carpet Path',
    price: 300,
    img: '/addons/red_carpet.png',
    icon: '🟥',
    desc: 'Walk in like a star with a VIP red carpet entrance.',
  },
  {
    id: 'candle_path',
    name: 'Candle Path Way',
    price: 500,
    img: '/addons/candle_path.png',
    icon: '🕯️',
    desc: 'Romantic tealight candles lining your path into the room.',
  },
  {
    id: 'cake',
    name: 'Cake 1/2 KG',
    price: 450,
    img: '/addons/cake.png',
    icon: '🎂',
    desc: 'Delicious half-kg custom celebration cake for your special day.',
  },
];

const PACKAGE_COLORS = {
  basic: 'silver',
  premium: 'gold',
  luxury: 'platinum',
};

const PACKAGE_ICONS = {
  basic: '🌟',
  premium: '✨',
  luxury: '👑',
};

/* 3D coverflow position for each card offset from active */
function getSliderCardStyle(offset) {
  const abs = Math.abs(offset);
  if (abs > 2) return { display: 'none' };
  const sign = offset === 0 ? 0 : offset > 0 ? 1 : -1;
  const xPct  = [0, 110, 200][abs] * sign;
  const rotY  = [0,  30,  50][abs] * -sign;
  const scale = [1, 0.82, 0.64][abs];
  const opacity = [1, 0.58, 0.28][abs];
  const zIndex  = [10, 6, 2][abs];
  return {
    transform: `translateX(${xPct}%) rotateY(${rotY}deg) scale(${scale})`,
    opacity,
    zIndex,
    transition: 'transform 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.55s',
    pointerEvents: abs > 1 ? 'none' : 'auto',
  };
}

function getPackageAddons(pkg) {
  if (!pkg) return [];
  // Use explicit freeAddonNames list — immune to API data variations
  const freeNames = new Set(pkg.freeAddonNames || []);
  return COMMON_ADDONS.map((addon) => ({
    ...addon,
    key: addon.id,
    included: freeNames.has(addon.name),
  }));
}

export default function PackagesSection({ themeKey, selectedPackageId = null, onSelectPackage }) {
  const navigate = useNavigate();
  const { setSelectedPackageId } = useBooking();
  const gridRef = useRef(null);
  const viewportRef = useRef(null);

  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState(selectedPackageId);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardWidth, setCardWidth] = useState(280);

  /* ── Fetch packages from API, fall back to defaults ── */
  useEffect(() => {
    let ignore = false;
    fetchPackages()
      .then((data) => { if (!ignore) setPackages(data); })
      .catch(() => { if (!ignore) setPackages(DEFAULT_PACKAGES); });
    return () => { ignore = true; };
  }, []);

  /* ── Reveal animation on scroll into view ── */
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.reveal') || [];
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [packages]);

  /* ── Measure viewport to compute 2-up card width ── */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const gap = 24;
      setCardWidth(Math.floor((el.offsetWidth - gap) / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedPkg]); // re-measure when addon section appears

  /* ── Derived state ── */
  const pkgData = useMemo(
    () => (selectedPkg ? (packages.find((pkg) => pkg.id === selectedPkg) || null) : null),
    [packages, selectedPkg]
  );

  const packageAddons = useMemo(() => getPackageAddons(pkgData), [pkgData]);

  const selectedAddonItems = useMemo(
    () => packageAddons.filter((addon) => !addon.included && selectedAddons.includes(addon.key)),
    [packageAddons, selectedAddons]
  );

  const addonTotal = selectedAddonItems.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  const grandTotal = Number(pkgData?.price || 0) + addonTotal;

  /* ── Slider computed values ── */
  const GAP = 24;
  const maxSlide = Math.max(0, packageAddons.length - 2);
  const trackX = -(activeSlide * (cardWidth + GAP));

  /* ── Handlers ── */
  const toggleAddon = useCallback((key) => {
    setSelectedAddons((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  const handleSelectPackage = (pkgId) => {
    setSelectedPkg(pkgId);
    setSelectedAddons([]);
    setActiveSlide(0);
    setSelectedPackageId(pkgId);
    onSelectPackage?.(pkgId);
    setTimeout(() => {
      document.getElementById('pkg-addons-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBookNow = () => {
    if (!pkgData) return;
    try {
      const existing = JSON.parse(sessionStorage.getItem('vn_booking_context') || '{}');
      sessionStorage.setItem('vn_booking_context', JSON.stringify({
        ...existing,
        packageId: pkgData.id,
        packageName: pkgData.title,
        packagePrice: Number(pkgData.price || 0),
        addons: selectedAddonItems.map((addon) => ({
          id: addon.key,
          text: addon.name,
          price: Number(addon.price || 0),
        })),
        addonTotal,
        grandTotal,
        extraTime: selectedAddonItems.some((addon) => addon.name === 'Extra 30 Minutes'),
      }));
    } catch (err) {
      console.warn('Could not save booking context', err);
    }
    navigate(themeKey ? `/reserve/${themeKey}` : '/reserve/birthday');
  };

  return (
    <section className="pkg-section" id="packages" aria-label="Packages & Pricing">
      <div className="pkg-bg-glow" aria-hidden="true" />

      <div className="container">
        {/* ── Header ── */}
        <div className="pkg-header">
          <div className="section-label">Packages &amp; Pricing</div>
          <h2 className="section-title">Choose Your <em>Package</em></h2>
          <p className="section-subtitle">
            Silver, Gold, and Platinum can be updated from admin. Pick a package, then personalise with add-ons.
          </p>
        </div>

        {/* ── Package Cards ── */}
        <div className="pkg-grid" ref={gridRef}>
          {packages.map((pkg, i) => {
            const isSelected = selectedPkg === pkg.id;
            const color = PACKAGE_COLORS[pkg.id] || 'gold';
            const icon = PACKAGE_ICONS[pkg.id] || '✨';

            return (
              <div
                key={pkg.id}
                className={`pkg-card reveal reveal-delay-${i + 1} pkg-card--${color}${pkg.popular ? ' pkg-card--popular' : ''}${isSelected ? ' pkg-card--selected' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => handleSelectPackage(pkg.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectPackage(pkg.id);
                  }
                }}
              >
                {pkg.popular && <div className="pkg-popular-badge">Most Popular</div>}
                {isSelected && <div className="pkg-selected-badge">✓ Selected</div>}

                <div className="pkg-card-head">
                  <div className="pkg-icon">{icon}</div>
                  <span className="pkg-tier">{pkg.title}</span>
                  <div className="pkg-price">
                    <span className="pkg-rupee">Rs</span>
                    <span className="pkg-amount">{formatMoney(pkg.price)}</span>
                  </div>
                  <p className="pkg-meta">{pkg.duration} &middot; Up to {pkg.maxGuests} guests</p>
                </div>

                <div className="pkg-card-body">
                  <p className="pkg-list-label">What&apos;s Included</p>
                  <ul className="pkg-list">
                    {(pkg.included || []).map((item, idx) => (
                      <li key={`${item.name}-${idx}`} className="pkg-item">
                        <span className="pkg-check">✓</span>
                        <span>
                          {item.name}
                          {item.free && <span className="pkg-free">Free</span>}
                          {Number(item.price) > 0 && (
                            <span className="pkg-item-price">Rs {formatMoney(item.price)}</span>
                          )}
                          {item.note && <span className="pkg-note"> ({item.note})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {(pkg.addons || []).length === 0 && (
                    <div className="pkg-all-inclusive">
                      <span>👑</span> All Add-Ons Included
                    </div>
                  )}
                </div>

                <div className="pkg-card-foot">
                  <button
                    className={`pkg-cta-btn${isSelected ? ' pkg-cta-btn--selected' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSelectPackage(pkg.id); }}
                  >
                    {isSelected ? `✓ ${pkg.title} Selected` : `Select ${pkg.title}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Prompt if no package selected yet ── */}
        {!selectedPkg && (
          <div style={{
            textAlign: 'center',
            padding: '24px 0 40px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
          }}>
            ↑ Select a package above to view add-ons and your total
          </div>
        )}

        {/* ── Add-Ons Section ── */}
        {selectedPkg && (
          <div className="pkg-addons-wrapper" id="pkg-addons-section">
            <div className="pkg-addons-header">
              <div className="section-label">Personalise Your Experience</div>
              <h3 className="pkg-addons-title">Add-<em>Ons</em></h3>
              <p className="pkg-addons-subtitle">
                Swipe through premium extras. <span className="addon-green-hint">🟢 Green dot = included free in your package.</span>
              </p>
            </div>

            {/* ── 2-Up Slider ── */}
            <div className="addon-slider-wrapper">

              {/* Prev */}
              <button
                className="addon-slider-btn addon-slider-btn--prev"
                onClick={() => setActiveSlide(p => Math.max(0, p - 1))}
                disabled={activeSlide === 0}
                aria-label="Previous add-on"
              >&#8249;</button>

              {/* Viewport */}
              <div className="addon-slider-viewport" ref={viewportRef}>
                <div
                  className="addon-slider-track-2up"
                  style={{ transform: `translateX(${trackX}px)` }}
                >
                  {packageAddons.map((addon) => {
                    const isFree = addon.included;
                    const isChecked = isFree || selectedAddons.includes(addon.key);

                    const handleTilt = (e) => {
                      const card = e.currentTarget;
                      const rect = card.getBoundingClientRect();
                      const rx = -((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 7;
                      const ry =  ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 9;
                      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.02)`;
                    };
                    const handleTiltReset = (e) => { e.currentTarget.style.transform = ''; };

                    return (
                      <div
                        key={addon.key}
                        style={{ width: cardWidth, flexShrink: 0 }}
                        className={`addon-card addon-card--3d${
                          isChecked ? ' addon-card--checked' : ''
                        }${isFree ? ' addon-card--free' : ''}`}
                        onClick={() => !isFree && toggleAddon(addon.key)}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        onMouseMove={handleTilt}
                        onMouseLeave={handleTiltReset}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && !isFree) {
                            e.preventDefault();
                            toggleAddon(addon.key);
                          }
                          if (e.key === 'ArrowRight') setActiveSlide(p => Math.min(maxSlide, p + 1));
                          if (e.key === 'ArrowLeft')  setActiveSlide(p => Math.max(0, p - 1));
                        }}
                      >
                        {/* Green indicator — only for free/included addons */}
                        {isFree && (
                          <div className="addon-pkg-indicator">
                            <span className="addon-pkg-dot" />
                            Included in {pkgData?.title}
                          </div>
                        )}

                        <div className="addon-img-wrap">
                          <img src={addon.img} alt={addon.name} className="addon-img" loading="lazy" />
                          <div className="addon-img-overlay" />
                          <div className={`addon-checkbox${isChecked ? ' addon-checkbox--checked' : ''}`}>
                            {isChecked ? '✓' : '+'}
                          </div>
                        </div>

                        <div className="addon-body">
                          <div className="addon-icon">{addon.icon}</div>
                          <div className="addon-name">{addon.name}</div>
                          <div className="addon-desc">{addon.desc}</div>
                          <div className="addon-price">
                            {isFree ? (
                              <span className="addon-price--free">✓ Free with {pkgData?.title}</span>
                            ) : (
                              <><span className="addon-rupee-sym">Rs</span> {formatMoney(addon.price)}</>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next */}
              <button
                className="addon-slider-btn addon-slider-btn--next"
                onClick={() => setActiveSlide(p => Math.min(maxSlide, p + 1))}
                disabled={activeSlide >= maxSlide}
                aria-label="Next add-on"
              >&#8250;</button>

              {/* Dot nav */}
              <div className="addon-slider-dots" role="tablist">
                {packageAddons.map((addon, i) => (
                  <button
                    key={addon.key}
                    className={`addon-slider-dot${
                      i >= activeSlide && i <= activeSlide + 1 ? ' addon-slider-dot--active' : ''
                    }${addon.included ? ' addon-slider-dot--free' : ''}`}
                    onClick={() => setActiveSlide(Math.min(i, maxSlide))}
                    role="tab"
                    aria-selected={i >= activeSlide && i <= activeSlide + 1}
                    aria-label={addon.name}
                    title={addon.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Sticky Summary Bar ── */}
        <div className={`pkg-summary-bar${pkgData ? ' pkg-summary-bar--visible' : ''}`}>
          <div className="pkg-summary-inner">
            <div className="pkg-summary-left">
              <div className="pkg-summary-pkg">
                <span className="pkg-summary-label">Live Cart</span>
                <span className="pkg-summary-value">
                  {themeKey ? `${themeKey.charAt(0).toUpperCase()}${themeKey.slice(1)} Theme` : 'Selected Theme'}
                </span>
              </div>
              <div className="pkg-summary-pkg">
                <span className="pkg-summary-label">Package</span>
                <span className="pkg-summary-value">{pkgData?.title || '—'}</span>
              </div>
              {selectedAddonItems.length > 0 && (
                <div className="pkg-summary-addons">
                  <span className="pkg-summary-label">Add-Ons</span>
                  <span className="pkg-summary-value">
                    {selectedAddonItems.map((a) => a.name).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="pkg-summary-right">
              <div className="pkg-summary-breakdown">
                {pkgData && (
                  <div className="pkg-summary-row">
                    <span>{pkgData.title}</span>
                    <span>Rs {formatMoney(pkgData.price)}</span>
                  </div>
                )}
                {selectedAddonItems.map((addon) => (
                  <div key={addon.key} className="pkg-summary-row pkg-summary-row--addon">
                    <span>+ {addon.name}</span>
                    <span>Rs {formatMoney(addon.price)}</span>
                  </div>
                ))}
                {packageAddons.some((a) => a.included) && (
                  <div className="pkg-summary-row pkg-summary-row--free">
                    <span>Included add-ons</span>
                    <span>Free</span>
                  </div>
                )}
              </div>

              <div className="pkg-summary-total">
                <span>Total</span>
                <strong>Rs {formatMoney(grandTotal)}</strong>
              </div>

              <button className="pkg-book-btn" onClick={handleBookNow} disabled={!pkgData}>
                Book Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}