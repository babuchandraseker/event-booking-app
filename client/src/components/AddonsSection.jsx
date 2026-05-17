import { useState, useRef } from 'react';

const ADDONS = [
  { emoji: '🎈', name: 'Room Filled with Balloon', desc: 'Transform your room into a sea of celebration balloons.', price: '+ ₹350', img: '/addons/balloons.png', video: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4' },
  { emoji: '💐', name: 'Flower Bouquet', desc: 'Fresh hand-crafted floral bouquet to cherish the moment.', price: '+ ₹300', img: '/addons/bouquet_gen.png', video: 'https://media.giphy.com/media/26tP4gFBQewkLnMv6/giphy.mp4' },
  { emoji: '🖼️', name: '15 Photo Hanging', desc: 'Display your favourite 15 memories on a lit string wall.', price: '+ ₹250', img: '/addons/photo_hanging.png', video: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.mp4' },
  { emoji: '🎬', name: 'Entry Video & 15min Group Photos', desc: 'Capture your grand entry on video plus 15 min group photo session.', price: '+ ₹350', img: '/addons/photographer.png', video: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.mp4' },
  { emoji: '🌫️', name: 'Fog Entry', desc: 'Dramatic fog machine entry for a breathtaking entrance.', price: '+ ₹500', img: '/addons/fog_gen.png', video: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.mp4' },
  { emoji: '🟥', name: 'Red Carpet Path', desc: 'Walk in like a star with a VIP red carpet entrance.', price: '+ ₹300', img: '/addons/red_carpet.png', video: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.mp4' },
  { emoji: '🕯️', name: 'Candle Path Way', desc: 'Romantic tealight candles lining your path into the room.', price: '+ ₹500', img: '/addons/candle_path.png', video: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.mp4' },
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
                {/* Animated video or image with Ken Burns effect */}
                {addon.video ? (
                  <>
                    <video
                      src={addon.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={`addon-kb-img ${KB_VARIANTS[i % KB_VARIANTS.length]}`}
                      poster={addon.img}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const img = e.target.parentNode.querySelector('img');
                        if (img) img.style.display = 'block';
                      }}
                    />
                    <img
                      src={addon.img}
                      alt={addon.name}
                      loading="lazy"
                      className={`addon-kb-img ${KB_VARIANTS[i % KB_VARIANTS.length]}`}
                      style={{ display: 'none' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  </>
                ) : (
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
                )}
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
