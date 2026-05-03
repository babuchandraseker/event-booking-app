import { useState, useEffect } from 'react';

const celebItems = [
  { caption: 'Her reaction was priceless 💖', type: 'image', img: '/themes/romantic/romantic1.jpg', alt: 'Romantic surprise moment', fallback: '💑' },
  { caption: 'Best birthday surprise ever 🎂', type: 'image', img: '/themes/romantic/romantic2.jpg', alt: 'Birthday celebration', fallback: '🎂' },
  { caption: 'A moment to remember ✨', type: 'image', img: '/themes/romantic/romantic3.jpg', alt: 'Special moment', fallback: '✨' },
  { caption: 'They said YES! 💍', type: 'image', img: '/themes/romantic/romantic4.jpg', alt: 'Proposal moment', fallback: '💍' },
  { caption: 'Pure magic, every single time 🌟', type: 'video', video: '/themes/romantic/romantic.mp4', fallback: '🎬' },
  { caption: 'Tears of joy — mission accomplished 🥹', type: 'emoji', emoji: '🥹', label: 'Surprise Reveal' },
  { caption: 'The décor took our breath away 🌹', type: 'emoji', emoji: '🌹', label: 'Floral Dream' },
  { caption: '10 years of love, celebrated right 🥂', type: 'emoji', emoji: '🥂', label: 'Anniversary' },
  { caption: "She walked in and couldn't stop smiling 🎈", type: 'emoji', emoji: '🎈', label: 'Grand Reveal' },
];

export default function CelebrationsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (i) => { setCurrentIndex(i); setModalOpen(true); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setModalOpen(false); document.body.style.overflow = ''; };
  const navigate = (dir) => setCurrentIndex(prev => (prev + dir + celebItems.length) % celebItems.length);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalOpen]);

  const currentItem = celebItems[currentIndex];

  return (
    <section className="celebrations-section" id="celebrations" aria-label="Real customer celebrations">
      <div className="container">
        <div className="celebrations-header reveal">
          <div className="section-label">Real Stories</div>
          <h2 className="section-title">Real Celebrations <em>🎉</em></h2>
          <p className="section-subtitle">See how we turn moments into unforgettable experiences</p>
        </div>

        <div className="celebrations-stats reveal">
          <div className="celeb-stat"><span className="celeb-stat-num">100+</span><span className="celeb-stat-label">Happy Celebrations</span></div>
          <div className="celeb-stat-divider"></div>
          <div className="celeb-stat"><span className="celeb-stat-num">500+</span><span className="celeb-stat-label">Smiles Created</span></div>
          <div className="celeb-stat-divider"></div>
          <div className="celeb-stat"><span className="celeb-stat-num">98%</span><span className="celeb-stat-label">Would Recommend Us</span></div>
        </div>

        <div className="celebrations-grid reveal">
          {celebItems.map((item, i) => (
            <div
              key={i}
              className={`celeb-item${item.type === 'video' ? ' celeb-item--video' : ''}`}
              data-caption={item.caption}
              data-type={item.type}
              tabIndex={0}
              role="button"
              aria-label={`Open: ${item.caption}`}
              onClick={() => openModal(i)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openModal(i)}
            >
              <div className="celeb-media">
                {item.type === 'image' && (
                  <>
                    <img src={item.img} alt={item.alt} loading="lazy"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    <div className="celeb-emoji-placeholder" style={{ display: 'none' }}>{item.fallback}</div>
                  </>
                )}
                {item.type === 'video' && (
                  <>
                    <video autoPlay muted loop playsInline>
                      <source src={item.video} type="video/mp4" />
                    </video>
                    <div className="celeb-emoji-placeholder" style={{ display: 'none' }}>{item.fallback}</div>
                  </>
                )}
                {item.type === 'emoji' && (
                  <div className="celeb-media celeb-emoji-only">
                    <span>{item.emoji}</span>
                    <p>{item.label}</p>
                  </div>
                )}
              </div>
              <div className="celeb-overlay"><span className="celeb-caption">{item.caption}</span></div>
              {item.type === 'video' && <div className="celeb-video-badge">▶ Video</div>}
              <div className="celeb-hover-icon">{item.type === 'video' ? '▶' : '🔍'}</div>
            </div>
          ))}
        </div>

        <div className="celebrations-cta reveal">
          <a href="#" className="btn btn-outline celebrations-insta-btn" target="_blank" rel="noopener">
            <span>📷</span> View More on Instagram
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {modalOpen && (
        <div
          className="celeb-modal-overlay open"
          role="dialog"
          aria-modal="true"
          aria-label="Celebration photo viewer"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="celeb-modal">
            <button className="celeb-modal-close" onClick={closeModal} aria-label="Close lightbox">✕</button>
            <div className="celeb-modal-media-wrap">
              {currentItem.type === 'video' ? (
                <video src={currentItem.video} autoPlay muted loop playsInline controls />
              ) : currentItem.type === 'image' ? (
                <img src={currentItem.img} alt={currentItem.caption} />
              ) : (
                <div className="celeb-modal-emoji">{currentItem.emoji}</div>
              )}
            </div>
            <div className="celeb-modal-caption">{currentItem.caption}</div>
            <div className="celeb-modal-nav">
              <button className="celeb-modal-nav-btn" onClick={() => navigate(-1)} aria-label="Previous">‹</button>
              <button className="celeb-modal-nav-btn" onClick={() => navigate(1)} aria-label="Next">›</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
