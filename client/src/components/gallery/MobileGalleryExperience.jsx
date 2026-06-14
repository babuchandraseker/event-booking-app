import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import MobileFeaturedMemoryCard from './MobileFeaturedMemoryCard'
import MobileMemoryMarquee from './MobileMemoryMarquee'

/**
 * Premium mobile-only gallery layout (desktop grid hidden via CSS).
 */
export default function MobileGalleryExperience({ onCta }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-24px' })

  return (
    <motion.div
      ref={ref}
      className="rc-gallery-mobile"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <MobileFeaturedMemoryCard onCta={onCta} />
      <MobileMemoryMarquee />
    </motion.div>
  )
}
