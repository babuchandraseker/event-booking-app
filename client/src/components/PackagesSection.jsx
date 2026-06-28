import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../data/packageCatalog';
import { useBooking } from '../context/BookingContext';
import { usePackages } from '../context/PackagesContext';

const ADDON_ICON = {
  'Room Filled with Balloon': '🎈',
  'Flower Bouquet': '💐',
  '15 Photo Hanging': '🖼️',
  'Entry Video & 15min Group Photos': '🎬',
  'Fog Entry': '🌫️',
  'Red Carpet Path': '🟥',
  'Candle Path Way': '🕯️',
  'Cake 1/2 KG': '🎂',
};

const PACKAGE_COLORS = { basic: 'silver', premium: 'gold', luxury: 'platinum' };
const PACKAGE_ICONS  = { basic: '🌟', premium: '✨', luxury: '👑' };

function getPackageAddons(pkg) {
  if (!pkg) return [];
  const freeNames = new Set(pkg.freeAddonNames || []);
  return (pkg.addons || []).map((addon, i) => ({
    ...addon,
    key: addon.name.toLowerCase().replace(/\s+/g, '_') + '_' + i,
    icon: addon.emoji || ADDON_ICON[addon.name] || '✦',
    included: freeNames.has(addon.name),
  }));
}

function getOfferBoundaryTime(value, boundary = 'start') {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const suffix = boundary === 'end' ? 'T23:59:59' : 'T00:00:00';
    return new Date(`${value}${suffix}`).getTime();
  }
  return new Date(value).getTime();
}

function isPackageOfferActive(pkg) {
  if (!pkg?.offerEnabled || !pkg.offerPrice) return false;
  const regularPrice = Number(pkg.price || 0);
  const offerPrice = Number(pkg.offerPrice || 0);
  const now = Date.now();

  return offerPrice > 0 &&
    offerPrice < regularPrice &&
    (!pkg.offerStart || getOfferBoundaryTime(pkg.offerStart, 'start') <= now) &&
    (!pkg.offerEnd || getOfferBoundaryTime(pkg.offerEnd, 'end') >= now);
}

function getActivePackagePrice(pkg) {
  if (!pkg) return 0;
  return isPackageOfferActive(pkg) ? Number(pkg.offerPrice || 0) : Number(pkg.price || 0);
}

export default function PackagesSection({ themeKey, selectedPackageId = null, onSelectPackage }) {
  const navigate = useNavigate();
  const { setSelectedPackageId } = useBooking();
  const { packages } = usePackages();
  const gridRef = useRef(null);

  // ── Package mobile slider ──
  const pkgSliderRef = useRef(null);
  const [pkgSlide, setPkgSlide]     = useState(0);
  const [isMobile, setIsMobile]     = useState(false);

  // ── Addon mobile slider ──
  const addonSliderRef  = useRef(null);
  const [addonSlide, setAddonSlide] = useState(0);

  // ── Desktop addon slider (JS translateX) ──
  const viewportRef    = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardWidth, setCardWidth]     = useState(280);

  const [selectedPkg, setSelectedPkg]       = useState(selectedPackageId);
  const [selectedAddons, setSelectedAddons] = useState([]);

  /* ── Derived ── */
  const pkgData = useMemo(
    () => (selectedPkg ? packages.find((p) => p.id === selectedPkg) || null : null),
    [packages, selectedPkg]
  );
  const packageAddons = useMemo(() => getPackageAddons(pkgData), [pkgData]);
  const selectedAddonItems = useMemo(
    () => packageAddons.filter((a) => !a.included && selectedAddons.includes(a.key)),
    [packageAddons, selectedAddons]
  );
  const addonTotal = selectedAddonItems.reduce((s, a) => s + Number(a.price || 0), 0);
  const activePackagePrice = getActivePackagePrice(pkgData);
  const grandTotal = activePackagePrice + addonTotal;

  /* ── Detect mobile ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Reveal animation (desktop only) ── */
  useEffect(() => {
    if (isMobile) return;
    const cards = gridRef.current?.querySelectorAll('.reveal') || [];
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [packages, isMobile]);

  /* ── Desktop addon slider: measure viewport ── */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || isMobile) return;
    const measure = () => {
      setCardWidth(Math.floor((el.offsetWidth - 24) / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedPkg, isMobile]);

  /* ── Pkg slider: programmatic scroll to slide ── */
  useEffect(() => {
    if (!isMobile || !pkgSliderRef.current) return;
    const el = pkgSliderRef.current;
    const card = el.children[pkgSlide];
    if (card) el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' });
  }, [pkgSlide, isMobile]);

  /* ── Pkg slider: sync dot on free-scroll ── */
  useEffect(() => {
    if (!isMobile) return;
    const el = pkgSliderRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setPkgSlide(Math.min(idx, packages.length - 1));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isMobile, packages.length]);

  /* ── Addon slider mobile: programmatic scroll to slide ── */
  useEffect(() => {
    if (!isMobile || !addonSliderRef.current) return;
    const el = addonSliderRef.current;
    const card = el.children[addonSlide];
    if (card) el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' });
  }, [addonSlide, isMobile]);

  /* ── Addon slider mobile: sync dot on free-scroll ── */
  useEffect(() => {
    if (!isMobile) return;
    const el = addonSliderRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setAddonSlide(Math.min(idx, packageAddons.length - 1));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isMobile, selectedPkg, packageAddons.length]);

  /* ── Desktop addon slider values ── */
  const SLIDE_STEP = 2;
  const maxSlide = Math.max(0, packageAddons.length - 2);
  const trackX   = -(activeSlide * (cardWidth + 24));

  /* ── Handlers ── */
  const toggleAddon = useCallback((key) => {
    setSelectedAddons((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSelectPackage = (pkgId) => {
    setSelectedPkg(pkgId);
    setSelectedAddons([]);
    setActiveSlide(0);
    setAddonSlide(0);
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
        packagePrice: activePackagePrice,
        regularPackagePrice: Number(pkgData.price || 0),
        addons: selectedAddonItems.map((a) => ({ id: a.key, text: a.name, price: Number(a.price || 0) })),
        addonTotal,
        grandTotal,
        extraTime: selectedAddonItems.some((a) => a.name === 'Extra 30 Minutes'),
      }));
    } catch (err) {
      console.warn('Could not save booking context', err);
    }
    navigate(themeKey ? `/reserve/${themeKey}` : '/reserve/birthday');
  };

  /* ── Package card renderer ── */
  const renderPkgCard = (pkg, i, extraClass = '') => {
    const isSelected = selectedPkg === pkg.id;
    const color = PACKAGE_COLORS[pkg.id] || 'gold';
    const icon  = PACKAGE_ICONS[pkg.id]  || '✨';
    return (
      <div
        key={pkg.id}
        className={`pkg-card${extraClass} reveal reveal-delay-${i + 1} pkg-card--${color}${pkg.popular ? ' pkg-card--popular' : ''}${isSelected ? ' pkg-card--selected' : ''}`}
        role="button" tabIndex={0} aria-pressed={isSelected}
        onClick={() => handleSelectPackage(pkg.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectPackage(pkg.id); } }}
      >
        {pkg.popular  && <div className="pkg-popular-badge">Most Popular</div>}
        {isSelected   && <div className="pkg-selected-badge">✓ Selected</div>}

        <div className="pkg-card-head">
          <div className="pkg-icon">{icon}</div>
          <span className="pkg-tier">{pkg.title}</span>
          {/* Offer price: show strikethrough original + offer if active */}
          {(() => {
            return isPackageOfferActive(pkg) ? (
              <div className="pkg-price pkg-price--offer">
                <div className="pkg-price-original">
                  <span className="pkg-rupee">Rs</span>
                  <span className="pkg-amount pkg-amount--strike">{formatMoney(pkg.price)}</span>
                </div>
                <div className="pkg-price-offer-row">
                  <span className="pkg-rupee pkg-rupee--offer">Rs</span>
                  <span className="pkg-amount pkg-amount--offer">{formatMoney(pkg.offerPrice)}</span>
                  <span className="pkg-offer-badge">SALE</span>
                </div>
              </div>
            ) : (
              <div className="pkg-price">
                <span className="pkg-rupee">Rs</span>
                <span className="pkg-amount">{formatMoney(pkg.price)}</span>
              </div>
            )
          })()}
          <p className="pkg-meta">{pkg.duration} &middot; Up to {pkg.maxGuests} guests</p>
        </div>

        <div className="pkg-card-body">
          <p className="pkg-list-label">What&apos;s Included</p>
          <ul className="pkg-list">
            {(pkg.addons || []).map((addon, j) => {
              const isFree = (pkg.freeAddonNames || []).includes(addon.name);
              return (
                <li key={j} className="pkg-item">
                  <span className="pkg-check">✓</span>
                  <span>
                    {addon.name}
                    {isFree && <span className="pkg-free"> FREE</span>}
                    {addon.note && <span className="pkg-note"> ({addon.note})</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          {pkg.allInclusive && <div className="pkg-all-inclusive">⚡ All Inclusive — No Hidden Charges</div>}
        </div>

        <div className="pkg-card-foot">
          <button
            className={`pkg-cta-btn${isSelected ? ' pkg-cta-btn--selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleSelectPackage(pkg.id); }}
          >
            {isSelected ? '✓ Selected' : 'Select Package'}
          </button>
        </div>
      </div>
    );
  };

  /* ── Addon card renderer (shared mobile + desktop) ── */
  const renderAddonCard = (addon, extraClass = '') => {
    const isFree    = addon.included;
    const isChecked = isFree || selectedAddons.includes(addon.key);

    const handleTilt = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const rx = -((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 7;
      const ry =  ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 9;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.02)`;
    };
    const handleTiltReset = (e) => { e.currentTarget.style.transform = ''; };

    return (
      <div
        key={addon.key}
        className={`addon-card addon-card--3d${extraClass}${isChecked ? ' addon-card--checked' : ''}${isFree ? ' addon-card--free' : ''}`}
        onClick={() => !isFree && toggleAddon(addon.key)}
        role="checkbox" aria-checked={isChecked} tabIndex={0}
        onMouseMove={handleTilt} onMouseLeave={handleTiltReset}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isFree) { e.preventDefault(); toggleAddon(addon.key); }
        }}
      >
        {isFree && (
          <div className="addon-pkg-indicator">
            <span className="addon-pkg-dot" />
            Included in {pkgData?.title}
          </div>
        )}
        <div className="addon-img-wrap">
          {addon.img ? (
            <img src={addon.img} alt={addon.name} className="addon-img" loading="lazy" />
          ) : null}
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
            {isFree
              ? <span className="addon-price--free">✓ Free with {pkgData?.title}</span>
              : <><span className="addon-rupee-sym">Rs</span> {formatMoney(addon.price)}</>
            }
          </div>
        </div>
      </div>
    );
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

        {/* ── Package Cards: Mobile swipe slider / Desktop grid ── */}
        {isMobile ? (
          <div className="pkg-mobile-slider-wrap">
            <div className="pkg-mobile-slider" ref={pkgSliderRef}>
              {packages.map((pkg, i) => renderPkgCard(pkg, i, ' pkg-mobile-slide'))}
            </div>
            {packages.length > 1 && (
              <div className="pkg-mobile-dots" role="tablist">
                {packages.map((pkg, i) => (
                  <button
                    key={pkg.id}
                    className={`pkg-mobile-dot${i === pkgSlide ? ' pkg-mobile-dot--active' : ''}`}
                    onClick={() => setPkgSlide(i)}
                    role="tab" aria-selected={i === pkgSlide}
                    aria-label={pkg.title} title={pkg.title}
                  />
                ))}
              </div>
            )}
            <p className="pkg-swipe-hint" aria-hidden="true">← Swipe to compare packages →</p>
          </div>
        ) : (
          <div className="pkg-grid" ref={gridRef}>
            {packages.map((pkg, i) => renderPkgCard(pkg, i))}
          </div>
        )}

        {/* ── Prompt ── */}
        {!selectedPkg && (
          <div style={{ textAlign: 'center', padding: '24px 0 40px', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
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
                Swipe through premium extras.{' '}
                <span className="addon-green-hint">🟢 Green dot = included free in your package.</span>
              </p>
            </div>

            {/* ════ MOBILE: native CSS scroll-snap slider ════ */}
            {isMobile ? (
              <div className="addon-mobile-slider-wrap">
                <div className="addon-mobile-slider" ref={addonSliderRef}>
                  {packageAddons.map((addon) => renderAddonCard(addon, ' addon-mobile-slide'))}
                </div>

                {/* Dot nav */}
                {packageAddons.length > 1 && (
                  <div className="addon-mobile-dots" role="tablist">
                    {packageAddons.map((addon, i) => (
                      <button
                        key={addon.key}
                        className={`addon-mobile-dot${i === addonSlide ? ' addon-mobile-dot--active' : ''}${addon.included ? ' addon-mobile-dot--free' : ''}`}
                        onClick={() => setAddonSlide(i)}
                        role="tab" aria-selected={i === addonSlide}
                        aria-label={addon.name} title={addon.name}
                      />
                    ))}
                  </div>
                )}
                <p className="pkg-swipe-hint" aria-hidden="true">← Swipe to browse add-ons →</p>
              </div>

            ) : (
              /* ════ DESKTOP: JS translateX 2-up slider ════ */
                <div className="addon-slider-wrapper">
                  <button
                    className="addon-slider-btn addon-slider-btn--prev"
                  onClick={() => setActiveSlide(p => Math.max(0, p - SLIDE_STEP))}
                  disabled={activeSlide === 0}
                  aria-label="Previous add-on"
                >&#8249;</button>

                <div className="addon-slider-viewport" ref={viewportRef}>
                  <div
                    className="addon-slider-track-2up"
                    style={{ transform: `translateX(${trackX}px)` }}
                  >
                    {packageAddons.map((addon) => (
                      <div key={addon.key} style={{ width: cardWidth, flexShrink: 0 }}>
                        {renderAddonCard(addon)}
                      </div>
                    ))}
                  </div>
                </div>

                  <button
                    className="addon-slider-btn addon-slider-btn--next"
                  onClick={() => setActiveSlide(p => Math.min(maxSlide, p + SLIDE_STEP))}
                  disabled={activeSlide >= maxSlide}
                  aria-label="Next add-on"
                >&#8250;</button>

                <div className="addon-slider-dots" role="tablist">
                  {packageAddons.map((addon, i) => (
                      <button
                        key={addon.key}
                        className={`addon-slider-dot${i >= activeSlide && i <= activeSlide + 1 ? ' addon-slider-dot--active' : ''}${addon.included ? ' addon-slider-dot--free' : ''}`}
                      onClick={() => setActiveSlide(Math.min(Math.floor(i / SLIDE_STEP) * SLIDE_STEP, maxSlide))}
                      role="tab" aria-selected={i >= activeSlide && i <= activeSlide + 1}
                      aria-label={addon.name} title={addon.name}
                    />
                  ))}
                </div>
              </div>
            )}
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
                  <span className="pkg-summary-value">{selectedAddonItems.map((a) => a.name).join(', ')}</span>
                </div>
              )}
            </div>

            <div className="pkg-summary-right">
              <div className="pkg-summary-breakdown">
                {pkgData && (
                  <div className="pkg-summary-row">
                    <span>{pkgData.title}</span>
                    <span>Rs {formatMoney(activePackagePrice)}</span>
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
