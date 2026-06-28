import { useState } from 'react'
import { MOBILE_MARQUEE_CARDS } from '../../data/mobileFeaturedMemories'

function MarqueeCard({ item }) {
  const [imgError, setImgError] = useState(false)

  return (
    <article className="rc-mmq-card" aria-label={item.alt || item.title}>
      <div className="rc-mmq-card-glow" aria-hidden />
      <div className="rc-mmq-card-media">
        {item.src && !imgError ? (
          <img
            src={item.src}
            alt={item.alt || item.title || ''}
            className="rc-mmq-card-img"
            loading="lazy"
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="rc-mmq-card-fallback" aria-hidden>
            <span>{item.icon || '✦'}</span>
          </div>
        )}
      </div>
      <div className="rc-mmq-card-shade" aria-hidden />
      <div className="rc-mmq-card-label">
        {item.icon && <span className="rc-mmq-card-icon" aria-hidden>{item.icon}</span>}
        <span className="rc-mmq-card-title">{item.category || item.title}</span>
      </div>
    </article>
  )
}

/**
 * Continuous horizontal marquee of compact memory cards (mobile only).
 */
export default function MobileMemoryMarquee({ cards }) {
  const resolvedCards = cards && cards.length ? cards : MOBILE_MARQUEE_CARDS
  const loop = [...resolvedCards, ...resolvedCards]

  return (
    <div className="rc-mmq" aria-label="Celebration memories carousel">
      <div className="rc-mmq-fade rc-mmq-fade--left" aria-hidden />
      <div className="rc-mmq-fade rc-mmq-fade--right" aria-hidden />
      <div className="rc-mmq-viewport">
        <div className="rc-mmq-track">
          {loop.map((item, i) => (
            <MarqueeCard key={`${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
