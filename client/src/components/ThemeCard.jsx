import { useNavigate } from 'react-router-dom';

export default function ThemeCard({ theme, revealDelay }) {
  const navigate = useNavigate();
  const { key, tag, emoji, img, title, desc, price, priceSub, features, mediaStyle } = theme;

  return (
    <div
      className={`theme-card reveal reveal-delay-${revealDelay}`}
      data-theme={key}
      role="button"
      tabIndex={0}
      aria-label={`View ${title} theme details`}
      onClick={() => navigate(`/experience/${key}`)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(`/experience/${key}`)}
    >
      <div className="theme-card-media">
        {img ? (
          <img
            className="theme-card-img"
            src={img}
            alt={`${title} event setup`}
            loading="lazy"
            onError={e => { e.target.src = `/assets/placeholders/placeholder-${key}.svg`; e.target.onerror = null; }}
          />
        ) : (
          <div className="theme-card-img" style={mediaStyle}>{emoji}</div>
        )}
        <div className="theme-card-media-overlay" aria-hidden="true"></div>
        <div className="theme-card-play" aria-hidden="true">▶</div>
        <div className="theme-card-tag">{tag}</div>
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
            data-theme={key}
            onClick={(e) => { e.stopPropagation(); navigate(`/experience/${key}`); }}
          >
            Experience
          </button>
        </div>
      </div>
    </div>
  );
}