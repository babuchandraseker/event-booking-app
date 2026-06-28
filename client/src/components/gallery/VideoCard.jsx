import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * VideoCard — vertical reel-style video card with:
 *   - autoplay muted preview on hover
 *   - luxury play button overlay
 *   - smooth transitions
 *
 * Props:
 *   item: { video, poster, fallback, category, title }
 *   index: number
 *   className: additional CSS classes
 */
export default function VideoCard({ item, index = 0, className = '' }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const handleMouseEnter = () => {
    if (videoRef.current && !videoError) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setPlaying(false)
    }
  }

  return (
    <motion.div
      className={`rc-card rc-video-card group ${className}`}
      variants={{
        hidden: { opacity: 0, y: 28, scale: 0.97 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }
        }
      }}
      whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={item.title || item.category || 'Video reel'}
    >
      {/* Gold glow border */}
      <div className="rc-card-glow" aria-hidden />

      {/* Media */}
      <div className="rc-card-media">
        {item.video && !videoError ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={item.poster}
            className="rc-card-img"
            onError={() => setVideoError(true)}
          >
            <source src={item.video} type="video/mp4" />
          </video>
        ) : (
          <div className="rc-card-fallback">
            <span className="rc-card-emoji">{item.fallback}</span>
          </div>
        )}
      </div>

      {/* Play button — fades out when playing */}
      <motion.div
        className="rc-play-btn"
        animate={{ opacity: playing ? 0 : 1, scale: playing ? 0.8 : 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden
      >
        <div className="rc-play-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div className="rc-play-ring" />
      </motion.div>

      {/* Reel label */}
      <div className="rc-reel-badge" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
        </svg>
        Reel
      </div>

      {/* Overlay on hover */}
      <div className="rc-card-overlay rc-card-overlay-video">
        <div className="rc-card-overlay-inner">
          {item.category && <span className="rc-tag">{item.category}</span>}
          {item.title && <p className="rc-card-title">{item.title}</p>}
        </div>
      </div>
    </motion.div>
  )
}
