import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  {
    key: 'romantic',
    tag: 'Romantic',
    tagEmoji: '🌹',
    images: [
      '/themes/romantic/romantic1.jpg',
      '/themes/romantic/romantic2.jpg',
      '/themes/romantic/romantic3.jpg',
      '/themes/romantic/romantic4.jpg',
    ],
    heroImage: '/themes/romantic/romantic1.jpg',
    title: 'Roses & Candlelight',
    shortDesc: 'Petals, candlelight, and intimate elegance.',
    fullDesc: 'The door opens. Thousands of rose petals lie scattered across the floor, leading your gaze toward a candlelit tablescape glowing in amber and gold. Soft strings play in the background — a song chosen just for tonight.',
    tags: ['Perfect for Proposals 💍', 'Anniversaries ❤️', 'Date Night ✨'],
    includes: [
      'Rose petal arrangement', 'Scented candle setup',
      'String fairy lights', 'Welcome drink for 2',
      'Personalized message board', 'Background music',
      'Photography assistance', 'Complimentary dessert',
    ],
    price: '₹4,999',
    priceNote: 'for 2 guests · 2 hrs',
    urgency: 'Only 2 slots left this weekend',
    accentColor: '#C9A84C',
    glowColor: 'rgba(201,100,100,0.15)',
    bg: 'linear-gradient(160deg, #1a0810 0%, #2d0f1f 50%, #0d0508 100%)',
  },
  {
    key: 'birthday',
    tag: 'Birthday',
    tagEmoji: '🎉',
    images: [
      '/themes/birthday/bday1.jpeg',
      '/themes/birthday/bday2.jpeg',
      '/themes/birthday/bday3.jpeg',
      '/themes/birthday/bday4.jpeg',
    ],
    heroImage: '/themes/birthday/bday1.jpeg',
    title: 'Grand Celebration',
    shortDesc: 'Vibrant décor, custom banners, personalized setup.',
    fullDesc: 'The moment they walk in, eyes wide, hands over their mouth — that\'s the reaction we live for. Balloon arches frame the room in colour, a custom banner bears their name, and the air hums with the anticipation of a night that\'s about to become a story they\'ll tell for years.',
    tags: ['Solo Birthdays 🎂', 'Group Parties 🎉', 'Milestone Moments 🥂'],
    includes: [
      'Balloon arch & décor', 'Custom birthday banner',
      'Themed table setup', 'Cake cutting service',
      'Party poppers & confetti', 'Polaroid photo station',
      'Music & ambiance setup', 'Party favors',
    ],
    price: '₹6,499',
    priceNote: 'up to 10 guests · 3 hrs',
    urgency: 'Only 3 slots left this weekend',
    accentColor: '#C9A84C',
    glowColor: 'rgba(100,100,220,0.15)',
    bg: 'linear-gradient(160deg, #0d0820 0%, #1a0f3d 50%, #080512 100%)',
  },
  {
    key: 'surprise',
    tag: 'Surprise',
    tagEmoji: '✨',
    images: [
      '/themes/surprise/surprise1.jpeg',
      '/themes/surprise/surprise2.jpeg',
      '/themes/surprise/surprise3.jpeg',
      '/themes/surprise/surprise4.jpeg',
    ],
    heroImage: '/themes/surprise/surprise1.jpeg',
    title: 'The Grand Reveal',
    shortDesc: 'A perfectly orchestrated surprise — timed to perfection.',
    fullDesc: 'They think they\'re coming in for something ordinary. Then the door opens. The setup is breathtaking. The music swells. Every face in the room is watching — and in that split second, everything shifts.',
    tags: ['Surprise Proposals 💍', 'Blind Celebrations 🙈', 'Secret Events 🎊'],
    includes: [
      'Secret coordination service', 'Dramatic reveal setup',
      'Flash mob arrangement', 'Hidden camera assistance',
      'Custom message timing', 'Surprise music cue',
      'Gift wrapping service', 'Keepsake memory box',
    ],
    price: '₹5,999',
    priceNote: 'up to 8 guests · 2.5 hrs',
    urgency: 'Only 1 slot left this weekend',
    accentColor: '#C9A84C',
    glowColor: 'rgba(100,180,220,0.12)',
    bg: 'linear-gradient(160deg, #080d1a 0%, #0f1a2d 50%, #050810 100%)',
  },
];

export default function ThemeExplorer({ booking, onReserve, onBack }) {
  const [activeTheme, setActiveTheme] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const detailRef = useRef(null);

  const openTheme = (theme) => {
    setActiveTheme(theme);
    setActiveImg(0);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const closeTheme = () => setActiveTheme(null);

  return (
    <div className="theme-explorer">
      {/* Intro Header */}
      <div className="theme-explorer-header">
        <motion.div
          className="te-label"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          ✦ Curated Experiences
        </motion.div>
        <motion.h2
          className="te-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Choose Your <em>World</em>
        </motion.h2>
        <motion.p
          className="te-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
        >
          Each theme transforms the same space into an entirely different story. Explore and find yours.
        </motion.p>
      </div>

      {/* Theme Cards Grid */}
      <div className="te-grid">
        {THEMES.map((theme, i) => (
          <motion.div
            key={theme.key}
            className={`te-card${activeTheme?.key === theme.key ? ' te-card--active' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => openTheme(theme)}
            style={{ '--card-glow': theme.glowColor }}
          >
            {/* Card Image */}
            <div className="te-card-media">
              <img
                src={theme.heroImage}
                alt={theme.title}
                className="te-card-img"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className="te-card-overlay" style={{ background: theme.bg }} />
              <div className="te-card-gradient" />

              {/* Tag badge */}
              <div className="te-card-tag">
                <span>{theme.tagEmoji}</span>
                <span>{theme.tag}</span>
              </div>

              {/* Urgency */}
              <div className="te-card-urgency">
                <span className="te-urgency-dot" />
                {theme.urgency}
              </div>
            </div>

            {/* Card Content */}
            <div className="te-card-body">
              <h3 className="te-card-title">{theme.title}</h3>
              <p className="te-card-desc">{theme.shortDesc}</p>

              <div className="te-card-footer">
                <div className="te-card-price">
                  <span className="te-price-amount">{theme.price}</span>
                  <span className="te-price-note">{theme.priceNote}</span>
                </div>
                <motion.button
                  className="te-card-explore-btn"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={e => { e.stopPropagation(); openTheme(theme); }}
                >
                  Explore →
                </motion.button>
              </div>
            </div>

            {/* Hover glow */}
            <div className="te-card-glow" />
          </motion.div>
        ))}
      </div>

      {/* Theme Detail Expansion */}
      <AnimatePresence>
        {activeTheme && (
          <motion.div
            ref={detailRef}
            className="te-detail"
            key={activeTheme.key}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              className="te-detail-inner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ '--detail-bg': activeTheme.bg }}
            >
              {/* Close Button */}
              <button className="te-detail-close" onClick={closeTheme}>✕ Close</button>

              {/* Left: Gallery + Tags */}
              <div className="te-detail-left">
                {/* Main Image */}
                <div className="te-detail-hero">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={activeTheme.images[activeImg]}
                      alt={activeTheme.title}
                      className="te-detail-hero-img"
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      onError={e => {
                        e.target.style.background = activeTheme.bg;
                        e.target.style.minHeight = '260px';
                      }}
                    />
                  </AnimatePresence>
                  <div className="te-detail-hero-overlay" />
                </div>

                {/* Thumbnail Strip */}
                <div className="te-thumb-strip">
                  {activeTheme.images.map((src, idx) => (
                    <motion.div
                      key={idx}
                      className={`te-thumb${activeImg === idx ? ' te-thumb--active' : ''}`}
                      onClick={() => setActiveImg(idx)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <img src={src} alt="" onError={e => { e.target.style.display = 'none'; }} />
                    </motion.div>
                  ))}
                </div>

                {/* Tags */}
                <div className="te-detail-tags">
                  {activeTheme.tags.map(t => (
                    <span key={t} className="te-detail-tag">{t}</span>
                  ))}
                </div>
              </div>

              {/* Right: Info + Reserve */}
              <div className="te-detail-right">
                <div className="te-detail-badge">{activeTheme.tagEmoji} {activeTheme.tag} Experience</div>
                <h2 className="te-detail-title">{activeTheme.title}</h2>
                <p className="te-detail-story">{activeTheme.fullDesc}</p>

                {/* What's included */}
                <div className="te-includes">
                  <div className="te-includes-label">What's Included</div>
                  <div className="te-includes-grid">
                    {activeTheme.includes.map(item => (
                      <div key={item} className="te-includes-item">
                        <span className="te-includes-dot">✦</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price + Reserve */}
                <div className="te-detail-price-row">
                  <div>
                    <div className="te-detail-price">{activeTheme.price}</div>
                    <div className="te-detail-price-note">{activeTheme.priceNote}</div>
                  </div>
                  <motion.button
                    className="te-reserve-btn"
                    whileHover={{ scale: 1.04, boxShadow: '0 16px 48px rgba(201,168,76,0.45)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onReserve(activeTheme.key)}
                  >
                    <span>✦</span>
                    <span>Reserve This Experience</span>
                  </motion.button>
                </div>

                <div className="te-detail-urgency">
                  <span className="te-urgency-dot" />
                  {activeTheme.urgency}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <div className="te-footer">
        <button className="btn btn-outline-sm" onClick={onBack}>← Back to Time</button>
      </div>
    </div>
  );
}
