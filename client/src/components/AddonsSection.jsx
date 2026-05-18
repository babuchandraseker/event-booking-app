import { useRef, useState } from 'react';
import { useBooking } from '../context/BookingContext';

const ADDONS = [
  { id: 'balloons',      emoji: '🎈', name: 'Room Filled with Balloon',        desc: 'Transform your room into a sea of celebration balloons.',            price: 'Rs 350', img: '/addons/balloons.png'      },
  { id: 'bouquet',       emoji: '💐', name: 'Flower Bouquet',                   desc: 'Fresh hand-crafted floral bouquet to cherish the moment.',           price: 'Rs 300', img: '/addons/bouquet_gen.png'   },
  { id: 'photo_hanging', emoji: '🖼️', name: '15 Photo Hanging',                 desc: 'Display your favourite 15 memories on a lit string wall.',           price: 'Rs 250', img: '/addons/photo_hanging.png' },
  { id: 'entry_video',   emoji: '🎬', name: 'Entry Video & 15min Group Photos', desc: 'Capture your grand entry on video plus 15 min group photo session.', price: 'Rs 350', img: '/addons/photographer.png'  },
  { id: 'fog',           emoji: '🌫️', name: 'Fog Entry',                        desc: 'Dramatic fog machine entry for a breathtaking entrance.',            price: 'Rs 500', img: '/addons/fog_gen.png'        },
  { id: 'red_carpet',    emoji: '🟥', name: 'Red Carpet Path',                  desc: 'Walk in like a star with a VIP red carpet entrance.',                price: 'Rs 300', img: '/addons/red_carpet.png'     },
  { id: 'candle_path',   emoji: '🕯️', name: 'Candle Path Way',                  desc: 'Romantic tealight candles lining your path into the room.',          price: 'Rs 500', img: '/addons/candle_path.png'    },
];

export default function AddonsSection() {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [scrollStart, setScrollStart] = useState(0);

  const { selectedPackage, includedAddonNames } = useBooking();

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

            return (
              <div
                key={addon.name}
                className={`addon-card addon-card-fullbg${isIncluded ? ' addon-card--pkg-included' : ''}`}
              >
                {/* Full image — natural height, no cropping */}
                <img
                  src={addon.img}
                  alt={addon.name}
                  loading="lazy"
                  className="addon-bg-media"
                  onError={(e) => { e.target.style.opacity = '0.2'; }}
                />

                {/* Bottom gradient for text legibility */}
                <div className="addon-bg-overlay" />

                {/* Emoji — top right */}
                <div className="addon-emoji-badge">{addon.emoji}</div>

                {/* Green included badge — top left */}
                {isIncluded && (
                  <div className="addon-pkg-included-badge">
                    <span className="addon-pkg-included-dot" />
                    Included in {selectedPackage?.title}
                  </div>
                )}

                {/* Text directly over image — no background box */}
                <div className="addon-body-overlay">
                  <h4 className="addon-name">{addon.name}</h4>
                  <p className="addon-desc">{addon.desc}</p>
                  <span className={`addon-price${isIncluded ? ' addon-price--free-badge' : ''}`}>
                    {isIncluded ? `✓ Free with ${selectedPackage?.title}` : addon.price}
                  </span>
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