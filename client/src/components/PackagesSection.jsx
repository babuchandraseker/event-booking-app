import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PACKAGES, fetchPackages, formatMoney } from '../data/packageCatalog';

const ADDON_META = {
  'Room Filled with Balloons': {
    id: 'balloons',
    img: '/addons/balloons.png',
    video: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
    icon: '🎈',
    desc: 'Transform your room into a sea of celebration balloons.',
  },
  'Flower Bouquet': {
    id: 'bouquet',
    img: '/addons/bouquet.png',
    video: 'https://media.giphy.com/media/26tP4gFBQewkLnMv6/giphy.mp4',
    icon: '💐',
    desc: 'Fresh hand-crafted floral bouquet to cherish the moment.',
  },
  '15 Photo Hanging': {
    id: 'photo_hanging',
    img: '/addons/photo_hanging.png',
    video: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.mp4',
    icon: '🖼️',
    desc: 'Display your favourite 15 memories on a lit string wall.',
  },
  'Entry Video & 15 min Group Photos': {
    id: 'entry_video',
    img: '/addons/entry_video.png',
    video: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.mp4',
    icon: '🎬',
    desc: 'Capture your grand entry on video plus 15 min group photo session.',
  },
  'Fog Entry': {
    id: 'fog',
    img: '/addons/fog.png',
    video: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.mp4',
    icon: '🌫️',
    desc: 'Dramatic fog machine entry for a breathtaking entrance.',
  },
  'Red Carpet Path': {
    id: 'red_carpet',
    img: '/addons/red_carpet.png',
    video: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.mp4',
    icon: '🟥',
    desc: 'Walk in like a star with a VIP red carpet entrance.',
  },
  'Candle Pathway': {
    id: 'candle_path',
    img: '/addons/candle_path.png',
    video: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.mp4',
    icon: '🕯️',
    desc: 'Romantic tealight candles lining your path into the room.',
  },
};

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

function getAddonKey(addon) {
  return addon.id || ADDON_META[addon.name]?.id || addon.name;
}

function getPackageAddons(pkg) {
  if (!pkg) return [];

  const included = (pkg.included || [])
    .filter((item) => ADDON_META[item.name])
    .map((item) => ({
      ...item,
      ...ADDON_META[item.name],
      key: getAddonKey(item),
      price: Number(item.price || 0),
      included: true,
    }));

  const paid = (pkg.addons || []).map((addon) => ({
    ...addon,
    ...(ADDON_META[addon.name] || {}),
    key: getAddonKey(addon),
    price: Number(addon.price || 0),
    included: false,
  }));

  const seen = new Set();
  return [...included, ...paid].filter((addon) => {
    const key = addon.key || addon.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function PackagesSection({ themeKey, selectedPackageId = null, onSelectPackage }) {
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState(selectedPackageId);
  const [selectedAddons, setSelectedAddons] = useState([]);

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

  /* ── Handlers ── */
  const toggleAddon = useCallback((key) => {
    setSelectedAddons((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  const handleSelectPackage = (pkgId) => {
    setSelectedPkg(pkgId);
    setSelectedAddons([]);
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
            Select a package that suits your celebration — then personalise it with add-ons. Your total will appear at the bottom.
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

        {/* ── Add-Ons Section (only shown after package selection) ── */}
        {selectedPkg && (
          <div className="pkg-addons-wrapper" id="pkg-addons-section">
            <div className="pkg-addons-header">
              <div className="section-label">Personalise Your Experience</div>
              <h3 className="pkg-addons-title">Add-<em>Ons</em></h3>
              <p className="pkg-addons-subtitle">
                Enhance your celebration with premium extras.
                Items already included in your package are highlighted in green.
              </p>
            </div>

            <div className="pkg-addons-grid">
              {packageAddons.map((addon) => {
                const isFree = addon.included;
                const isChecked = isFree || selectedAddons.includes(addon.key);
                const hasImage = Boolean(addon.img);
                const hasVideo = Boolean(addon.video);

                return (
                  <div
                    key={addon.key}
                    className={`addon-card${isChecked ? ' addon-card--checked' : ''}${isFree ? ' addon-card--free' : ''}`}
                    onClick={() => !isFree && toggleAddon(addon.key)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={isFree ? -1 : 0}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isFree) {
                        e.preventDefault();
                        toggleAddon(addon.key);
                      }
                    }}
                  >
                    <div className="addon-img-wrap">
                      {hasVideo ? (
                        <video
                          className="addon-img addon-video"
                          src={addon.video}
                          poster={addon.img || undefined}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                          onError={(e) => {
                            // Fallback to image if video fails
                            const img = document.createElement('img');
                            img.src = addon.img;
                            img.alt = addon.name;
                            img.className = 'addon-img';
                            img.loading = 'lazy';
                            e.target.parentNode.replaceChild(img, e.target);
                          }}
                        />
                      ) : hasImage ? (
                        <img src={addon.img} alt={addon.name} className="addon-img" loading="lazy" />
                      ) : (
                        <div className="addon-img addon-img--placeholder">{addon.icon || '+'}</div>
                      )}
                      <div className="addon-img-overlay" />
                      <div className={`addon-checkbox${isChecked ? ' addon-checkbox--checked' : ''}`}>
                        {isChecked ? '✓' : '+'}
                      </div>
                      {isFree && <div className="addon-free-badge">Included Free</div>}
                    </div>
                    <div className="addon-body">
                      <div className="addon-icon">{addon.icon || '*'}</div>
                      <div className="addon-name">{addon.name}</div>
                      <div className="addon-desc">{addon.desc || 'Available as part of this celebration package.'}</div>
                      <div className="addon-price">
                        {isFree ? (
                          <span className="addon-price--free">Free with your package</span>
                        ) : (
                          <>Rs {formatMoney(addon.price)}</>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Sticky Summary Bar ── */}
        <div className={`pkg-summary-bar${pkgData ? ' pkg-summary-bar--visible' : ''}`}>
          <div className="pkg-summary-inner">
            <div className="pkg-summary-left">
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
