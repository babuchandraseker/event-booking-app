import { useRef, useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { usePackages } from '../context/PackagesContext';

/* Emoji icons mapped by addon name for a richer display */
const ADDON_EMOJI = {
  'Room Filled with Balloon':        '🎈',
  'Flower Bouquet':                  '💐',
  '15 Photo Hanging':                '🖼️',
  'Entry Video & 15min Group Photos':'🎬',
  'Fog Entry':                       '🌫️',
  'Red Carpet Path':                 '🟥',
  'Candle Path Way':                 '🕯️',
  'Cake 1/2 KG':                     '🎂',
};

/**
 * Build a deduplicated addon list from all packages.
 *
 * IMAGE RULE: addon.img comes exclusively from the API (Firestore / ImageKit).
 * No local file path is ever injected here. If addon.img is empty, no image
 * is shown — there is no fallback to /addons/*.webp or any local asset.
 *
 * When the same addon appears in multiple packages we pick the lowest price
 * and prefer any ImageKit URL (https://) over an empty img.
 */
function buildAddonList(packages) {
  const seen = new Map(); // name → addon object
  for (const pkg of packages) {
    for (const addon of pkg.addons || []) {
      const existing = seen.get(addon.name);
      if (!existing) {
        seen.set(addon.name, {
          id: addon.name.toLowerCase().replace(/\s+/g, '_'),
          name: addon.name,
          price: addon.price,
          emoji: addon.emoji || ADDON_EMOJI[addon.name] || '',
          // img: only from API — empty string if not set
          img: addon.img || '',
          desc: addon.desc || ADDON_DESC[addon.name] || '',
        });
      } else {
        const betterPrice = Number(addon.price) < Number(existing.price);
        // Upgrade to an ImageKit URL if the current entry only has an empty img
        const betterImg = !existing.img && addon.img && addon.img.startsWith('https://');
        if (betterPrice || betterImg) {
          seen.set(addon.name, {
            ...existing,
            ...(betterPrice ? { price: addon.price } : {}),
            ...(betterImg   ? { img: addon.img }     : {}),
          });
        }
      }
    }
  }

  const result = Array.from(seen.values());
  result.forEach((addon) => {
    console.log(`[Website] addon="${addon.name}" img="${addon.img || '(none)'}"`);
  });
  return result;
}

const ADDON_DESC = {
  'Room Filled with Balloon':        'Transform your room into a sea of celebration balloons.',
  'Flower Bouquet':                  'Fresh hand-crafted floral bouquet to cherish the moment.',
  '15 Photo Hanging':                'Display your favourite 15 memories on a lit string wall.',
  'Entry Video & 15min Group Photos':'Capture your grand entry on video plus 15 min group photo session.',
  'Fog Entry':                       'Dramatic fog machine entry for a breathtaking entrance.',
  'Red Carpet Path':                 'Walk in like a star with a VIP red carpet entrance.',
  'Candle Path Way':                 'Romantic tealight candles lining your path into the room.',
  'Cake 1/2 KG':                     'Delicious half-kg custom celebration cake for your special day.',
};

export default function AddonsSection() {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [scrollStart, setScrollStart] = useState(0);

  const { selectedPackage, includedAddonNames } = useBooking();
  const { packages } = usePackages();

  // Build live addon list from packages data
  const ADDONS = buildAddonList(packages);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollStart(sliderRef.current?.scrollLeft || 0);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current || dragStart === null) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current.offsetLeft || 0);
    const walk = (x - dragStart) * 1.5;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  return (
    <section className="addons-section" id="addons" aria-label="Event add-ons">
      <div className="container">
        <div style={{ marginBottom: '56px' }} className="reveal">
          <div className="section-label">Elevate Your Experience</div>
          <h2 className="section-title">Add-ons &amp; <em>Extras</em></h2>
          <p className="section-subtitle">
            Personalize every detail — each extra is designed to amplify the magic.
            {selectedPackage && (
              <span className="addons-pkg-hint">
                &nbsp;·&nbsp;<span className="addons-pkg-dot-inline" aria-hidden="true" />&nbsp;
                Included free in your <strong>{selectedPackage.title}</strong> package
              </span>
            )}
          </p>
        </div>
      </div>

      <div
        className="addons-scroll-wrap"
        ref={sliderRef}
        aria-label="Scroll to see more add-ons"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="addons-row">
          {ADDONS.map((addon) => {
            const isIncluded = includedAddonNames.has(addon.name);
            // addon.desc already contains live API data (or static fallback) from buildAddonList
            const desc = addon.desc || addon.name;

            return (
              <div
                key={addon.name}
                className={`addon-card addon-card-cinematic${isIncluded ? ' addon-card--pkg-included' : ''}`}
              >
                {/* Full-bleed cover image — only rendered when an ImageKit URL exists */}
                {addon.img ? (
                  <img
                    src={addon.img}
                    alt={addon.name}
                    loading="lazy"
                    className="addon-cinematic-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}

                {/* Soft fade at image/text boundary */}
                <div className="addon-cinematic-scrim" />

                {/* Emoji badge — bottom-left over image */}
                {addon.emoji && (
                  <div className="addon-emoji-badge" aria-hidden="true">
                    {addon.emoji}
                  </div>
                )}

                {/* Add button — top right */}
                <button className="addon-add-btn" aria-label={`Add ${addon.name}`}>+</button>

                {/* Floating particles */}
                <div className="addon-particles" aria-hidden="true">
                  <span className="addon-particle addon-particle--heart">♥</span>
                  <span className="addon-particle addon-particle--heart">♥</span>
                  <span className="addon-particle addon-particle--sparkle">✦</span>
                </div>

                {/* Green included badge — top left */}
                {isIncluded && (
                  <div className="addon-pkg-included-badge">
                    <span className="addon-pkg-included-dot" />
                    Included in {selectedPackage?.title}
                  </div>
                )}

                {/* Bottom text panel (sits below image, no overlay) */}
                <div className="addon-cinematic-body">
                  <div className="addon-cinematic-text">
                    <h4 className="addon-name">{addon.name}</h4>
                    <p className="addon-desc">{desc}</p>
                  </div>
                  <div className="addon-cinematic-price-wrap">
                    {isIncluded ? (
                      <span className="addon-price addon-price--free-badge">✓ Free</span>
                    ) : (
                      <span className="addon-price">
                        <span className="addon-price-rs">Rs</span>
                        <span className="addon-price-num">{Number(addon.price).toLocaleString('en-IN')}</span>
                      </span>
                    )}
                    <span className="addon-sparkle-icon">✦</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        ← Drag to scroll · More add-ons available on request →
      </p>
    </section>
  );
}