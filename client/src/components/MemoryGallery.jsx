import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { API_BASE_URL } from '../config/api.js'

const STATIC_MEMORY_ITEMS = [
  { cls: 'memory-item-1', src: '/themes/romantic/romantic1.jpg', alt: 'Romantic event', fallback: '🌹', label: 'Romantic Evenings' },
  { cls: 'memory-item-2', src: '/themes/romantic/romantic2.jpg', alt: 'Event setup', fallback: '🕯️', label: 'Candlelit Décor' },
  { cls: 'memory-item-3', src: null, fallback: '🎂', label: 'Birthday Celebrations' },
  { cls: 'memory-item-4', src: '/themes/romantic/romantic3.jpg', alt: 'Romantic decor', fallback: '🌸', label: 'Floral Arrangements' },
  { cls: 'memory-item-5', src: null, fallback: '🎁', label: 'Surprise Reveals' },
  { cls: 'memory-item-6', src: '/themes/romantic/romantic4.jpg', alt: 'Event photography', fallback: '📸', label: 'Captured Moments' },
  { cls: 'memory-item-7', video: null, fallback: '🌟', label: 'Live the Moment' },
]

export default function MemoryGallery() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [memoryItems, setMemoryItems] = useState(STATIC_MEMORY_ITEMS)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE_URL}/themes?_=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return
        const romantic = json.data.find((t) => t.id === 'romantic' || t.key === 'romantic')
        if (!romantic) return
        const liveVideoUrl =
          romantic.scrollyMedia?.video ||
          (romantic.videoSrc?.startsWith('http') ? romantic.videoSrc : null)
        if (!liveVideoUrl) return
        setMemoryItems((prev) =>
          prev.map((item) =>
            item.cls === 'memory-item-7' ? { ...item, video: liveVideoUrl } : item
          )
        )
      })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  return (
    <section
      ref={ref}
      className="memory-section relative overflow-hidden"
      id="gallery"
      aria-label="Photo and video gallery"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.06),transparent_55%)]"
        aria-hidden
      />
      <div className="container relative">
        <motion.div
          className="memory-header reveal mb-12 text-center sm:mb-14"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label justify-center">Real Moments</div>
          <h2 className="section-title">
            Memories we&apos;ve <em>crafted</em>
          </h2>
          <p className="section-subtitle mx-auto mt-3 max-w-2xl text-[var(--text-secondary)]">
            A reel of stills and motion — the texture of velvet light, laughter, and surprise.
          </p>
        </motion.div>

        <motion.div
          className="memory-grid reveal"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.07, delayChildren: 0.1 },
            },
          }}
        >
          {memoryItems.map((item) => (
            <motion.div
              key={item.cls}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.98 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
              className={`group memory-item ${item.cls}`}
            >
              {item.video ? (
                <>
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  >
                    <source src={item.video} type="video/mp4" />
                  </video>
                  <div className="memory-placeholder" style={{ display: 'none' }}>
                    {item.fallback}
                  </div>
                </>
              ) : item.src ? (
                <>
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="memory-placeholder" style={{ display: 'none' }}>
                    {item.fallback}
                  </div>
                </>
              ) : (
                <div className="memory-placeholder">{item.fallback}</div>
              )}
              <div className="memory-overlay transition-opacity duration-300">
                <span className="memory-label tracking-wide">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
