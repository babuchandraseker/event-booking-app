import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ThemeCard({ theme, index, inView }) {
  const navigate = useNavigate();
  const { key, tag, emoji, img, title, desc, price, priceSub, features, mediaStyle } = theme;

  const goToExperience = () => navigate(`/experience/${key}`);

  return (
    <motion.div
      className="theme-card"
      data-theme={key}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      role="article"
      aria-label={`${title} theme`}
    >
      <div
        className="theme-card-media"
        onClick={goToExperience}
        style={{ cursor: 'pointer' }}
      >
        {img ? (
          <img
            className="theme-card-img"
            src={img}
            alt={`${title} event setup`}
            loading="lazy"
            onError={e => { e.target.src = ''; e.target.onerror = null; }}
          />
        ) : (
          <div className="theme-card-img" style={mediaStyle}>{emoji}</div>
        )}
        <div className="theme-card-media-overlay" aria-hidden="true" />
        <div className="theme-card-play" aria-hidden="true">▶</div>
        <div className="theme-card-tag">{tag}</div>
        <div className="theme-card-glow-border" aria-hidden="true" />
      </div>

      <div className="theme-card-body">
        <h3 className="theme-card-title">{title}</h3>
        <p className="theme-card-desc">{desc}</p>
        <div className="theme-card-price">{price} <span>{priceSub}</span></div>
        <div className="theme-card-footer">
          <div className="theme-card-features">
            {features.map(f => <span key={f} className="feature-chip">{f}</span>)}
          </div>
          <button
            className="btn btn-ghost"
            onClick={goToExperience}
            aria-label={`Explore ${title} theme`}
          >
            Explore Experience
          </button>
        </div>
      </div>
    </motion.div>
  );
}
