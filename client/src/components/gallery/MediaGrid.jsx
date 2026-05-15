import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import FeaturedCard from './FeaturedCard'
import MediaCard from './MediaCard'
import VideoCard from './VideoCard'

/**
 * MediaGrid — masonry-style layout orchestrator.
 *
 * Accepts:
 *   featured: object (FeaturedCard data)
 *   media: array (MediaCard items, shown in medium slots)
 *   videos: array (VideoCard items, vertical reel slots)
 *   onCta: function
 *
 * Layout (desktop 12-col):
 *   Row 1: featured(5) | video1(2) | media1(3) | media2(2)
 *   Row 2: media3(3)   | media4(3) | video2(2) | media5(2) | media6(2)
 *
 * Tablet: 2-col balanced
 * Mobile: stacked single column
 */
export default function MediaGrid({ featured, media = [], videos = [], onCta }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  return (
    <motion.div
      ref={ref}
      className="rc-grid"
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={containerVariants}
      role="list"
      aria-label="Real Celebrations gallery"
    >
      {/* Featured large card */}
      {featured && (
        <FeaturedCard
          item={featured}
          onCta={onCta}
          className="rc-grid-featured"
        />
      )}

      {/* Video reel 1 */}
      {videos[0] && (
        <VideoCard
          item={videos[0]}
          index={1}
          className="rc-grid-video-1"
        />
      )}

      {/* Medium cards 1–2 */}
      {media[0] && (
        <MediaCard item={media[0]} index={2} className="rc-grid-med-1" />
      )}
      {media[1] && (
        <MediaCard item={media[1]} index={3} className="rc-grid-med-2" />
      )}

      {/* Row 2 */}
      {media[2] && (
        <MediaCard item={media[2]} index={4} className="rc-grid-med-3" />
      )}
      {media[3] && (
        <MediaCard item={media[3]} index={5} className="rc-grid-med-4" />
      )}

      {/* Video reel 2 */}
      {videos[1] && (
        <VideoCard
          item={videos[1]}
          index={6}
          className="rc-grid-video-2"
        />
      )}

      {media[4] && (
        <MediaCard item={media[4]} index={7} className="rc-grid-med-5" />
      )}
      {media[5] && (
        <MediaCard item={media[5]} index={8} className="rc-grid-med-6" />
      )}
    </motion.div>
  )
}
