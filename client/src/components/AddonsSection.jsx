import { useState, useRef } from 'react';

const ADDONS = [
  { emoji: '💐', name: 'Flower Bouquet', desc: 'Fresh premium bouquet with seasonal blooms, wrapped elegantly.', price: '+ ₹799', img: '/addons/bouquet_gen.png' },
  { emoji: '🎂', name: 'Custom Cake', desc: 'Handcrafted fondant or cream cake with personalized design and message.', price: '+ ₹999', img: '/addons/cake.png' },
  { emoji: '📸', name: 'Photographer', desc: 'Professional candid shoot for 2 hours. 100+ edited photos delivered in 48hrs.', price: '+ ₹1,999', img: '/addons/photographer.png' },
  { emoji: '🌫️', name: 'Fog Machine', desc: 'Dramatic low-lying fog effect that turns every room into a dreamscape.', price: '+ ₹599', img: '/addons/fog_gen.png' },
  { emoji: '💡', name: 'LED Light Setup', desc: 'Color-changing LED strips and spotlights to match your theme perfectly.', price: '+ ₹499', img: '/addons/red_carpet.png' },
  { emoji: '🎵', name: 'DJ & Music', desc: 'Live DJ or curated Spotify playlist with premium speaker system.', price: '+ ₹2,499', img: '/addons/dj.png' },
  { emoji: '🤳', name: 'Photo Booth', desc: 'Instant print photo booth with props, frames, and digital copies included.', price: '+ ₹1,499', img: '/addons/photo_hanging.png' },
  { emoji: '🥂', name: 'Welcome Drinks', desc: 'Chilled mocktail welcome drinks for all guests on arrival — served elegantly.', price: '+ ₹699', img: '/addons/bouquet.png' },
  { emoji: '🕯️', name: 'Candle Path', desc: 'A dramatic pathway of tea-light candles leading to your private setup.', price: '+ ₹449', img: '/addons/candle_path.png' },
  { emoji: '🎈', name: 'Balloon Arch', desc: 'Custom balloon arch in your chosen colors — the perfect photo backdrop.', price: '+ ₹899', img: '/addons/balloons.png' },
];

/* Ken Burns animation directions for variety */
const KB_VARIANTS = [
  'addon-kb-zoom-in',
  'addon-kb-pan-left',
  'addon-kb-pan-right',
  'addon-kb-zoom-out',
  'addon-kb-pan-up',
];

export default function AddonsSection() {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [scrollStart, setScrollStart] = useState(0);

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
          <p className="section-subtitle">Personalize every detail. Add a little or a lot — each extra is designed to amplify the magic.</p>
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
          {ADDONS.map((addon, i) => (
            <div key={addon.name} className="addon-card addon-card-animated">
              <div className="addon-img-wrap addon-cinemagraph">
                {/* Animated image with Ken Burns effect */}
                <img
                  src={addon.img}
                  alt={addon.name}
                  loading="lazy"
                  className={`addon-kb-img ${KB_VARIANTS[i % KB_VARIANTS.length]}`}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="addon-emoji" style={{ display: 'none' }}>{addon.emoji}</div>

                {/* Shimmer overlay */}
                <div className="addon-shimmer"></div>

                {/* Floating particles */}
                <div className="addon-particles">
                  <span className="addon-particle"></span>
                  <span className="addon-particle"></span>
                  <span className="addon-particle"></span>
                </div>

                {/* Emoji badge */}
                <div className="addon-emoji-badge">{addon.emoji}</div>
              </div>
              <div className="addon-body">
                <h4 className="addon-name">{addon.name}</h4>
                <p className="addon-desc">{addon.desc}</p>
                <div className="addon-price">{addon.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        ← Drag to scroll · More add-ons available on request →
      </p>
    </section>
  );
}
