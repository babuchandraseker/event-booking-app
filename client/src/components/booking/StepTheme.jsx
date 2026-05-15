import { motion } from 'framer-motion';

const THEMES = [
  {
    key: 'romantic',
    tag: '🌹 Romantic',
    img: '/themes/romantic/romantic1.jpg',
    title: 'Heart Theme',
    desc: 'Petals, candlelight, and intimate elegance. Perfect for proposals and anniversaries.',
    price: '₹4,999',
    priceSub: '/ 2 hrs · 2 guests',
  },
  {
    key: 'birthday',
    tag: '🎉 Birthday',
    emoji: '🎂',
    bg: 'linear-gradient(135deg,#1a0a2e,#2d1b4e)',
    title: 'Balloon Theme',
    desc: 'Grand celebration with vibrant décor, custom banners, and a personalized setup.',
    price: '₹6,499',
    priceSub: '/ 3 hrs · up to 10',
  },
  {
    key: 'surprise',
    tag: '✨ Surprise',
    emoji: '🎁',
    bg: 'linear-gradient(135deg,#0d1a2e,#1a2d4e)',
    title: 'Partition Theme',
    desc: 'A perfectly orchestrated reveal — completely secret, perfectly timed.',
    price: '₹5,999',
    priceSub: '/ 2.5 hrs · up to 8',
  },
];

export default function StepTheme({ booking, update, onNext, onBack }) {
  return (
    <div className="step-theme">
      <div className="step-title-wrap">
        <h2 className="step-title">Select Your Theme</h2>
        <p className="step-subtitle">Each theme creates a completely different world. Choose the story you want to tell.</p>
      </div>

      <div className="wizard-themes-grid">
        {THEMES.map((t, i) => {
          const selected = booking.theme === t.key;
          return (
            <motion.div
              key={t.key}
              className={`wizard-theme-card ${selected ? 'selected' : ''}`}
              onClick={() => update({ theme: t.key })}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="radio"
              aria-checked={selected}
              tabIndex={0}
            >
              <div className="wizard-theme-media">
                {t.img ? (
                  <img src={t.img} alt={t.title} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {t.emoji}
                  </div>
                )}
                <div className="wizard-theme-overlay" />
                <div className="wizard-theme-tag">{t.tag}</div>
                {selected && (
                  <motion.div className="wizard-theme-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
                )}
              </div>
              <div className="wizard-theme-body">
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <div className="wizard-theme-price">
                  <strong>{t.price}</strong>
                  <span>{t.priceSub}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="wizard-footer">
        <button className="btn btn-outline-sm" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!booking.theme}
          style={{ opacity: booking.theme ? 1 : 0.5 }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
