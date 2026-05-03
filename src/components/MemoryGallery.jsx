const memoryItems = [
  { cls: 'memory-item-1', src: '/themes/romantic/romantic1.jpg', alt: 'Romantic event', fallback: '🌹', label: 'Romantic Evenings' },
  { cls: 'memory-item-2', src: '/themes/romantic/romantic2.jpg', alt: 'Event setup', fallback: '🕯️', label: 'Candlelit Décor' },
  { cls: 'memory-item-3', src: null, fallback: '🎂', label: 'Birthday Celebrations' },
  { cls: 'memory-item-4', src: '/themes/romantic/romantic3.jpg', alt: 'Romantic decor', fallback: '🌸', label: 'Floral Arrangements' },
  { cls: 'memory-item-5', src: null, fallback: '🎁', label: 'Surprise Reveals' },
  { cls: 'memory-item-6', src: '/themes/romantic/romantic4.jpg', alt: 'Event photography', fallback: '📸', label: 'Captured Moments' },
  { cls: 'memory-item-7', video: '/themes/romantic/romantic.mp4', fallback: '🌟', label: 'Live the Moment' },
];

export default function MemoryGallery() {
  return (
    <section className="memory-section" id="gallery" aria-label="Photo and video gallery">
      <div className="container">
        <div className="memory-header reveal">
          <div className="section-label">Real Moments</div>
          <h2 className="section-title">Memories We've <em>Crafted</em></h2>
        </div>

        <div className="memory-grid reveal">
          {memoryItems.map((item) => (
            <div key={item.cls} className={`memory-item ${item.cls}`}>
              {item.video ? (
                <>
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                    <source src={item.video} type="video/mp4" />
                  </video>
                  <div className="memory-placeholder" style={{ display: 'none' }}>{item.fallback}</div>
                </>
              ) : item.src ? (
                <>
                  <img src={item.src} alt={item.alt} loading="lazy"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="memory-placeholder" style={{ display: 'none' }}>{item.fallback}</div>
                </>
              ) : (
                <div className="memory-placeholder">{item.fallback}</div>
              )}
              <div className="memory-overlay">
                <span className="memory-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
