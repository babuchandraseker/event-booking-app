import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import FeaturedGalleryCard from './FeaturedGalleryCard'
import GalleryCard from './GalleryCard'
import MobileGalleryExperience from './MobileGalleryExperience'
import { resolveMemoriesGallery } from '../../data/curatedMemoriesGallery'

/**
 * Premium memory wall — featured left, 3×2 grid right.
 * Uses curated unique images; API items merge when available.
 */
export default function GalleryGrid({ items = [], onCta }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const { featured, cards } = resolveMemoriesGallery(items)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.04 },
    },
  }

  return (
    <>
      <motion.div
        ref={ref}
        className="rc-gallery-grid rc-gallery-desktop"
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        variants={containerVariants}
        role="list"
        aria-label="Real Celebrations image gallery"
      >
        <FeaturedGalleryCard
          item={{
            ...featured,
            cta: featured.cta || 'Explore Experience',
          }}
          onCta={onCta}
          className="rc-grid-featured"
          luxury
        />

        <div className="rc-gallery-side" role="group" aria-label="Experience categories">
          {cards.map((item, i) => (
            <GalleryCard key={item.id || i} item={item} index={i + 1} luxury />
          ))}
        </div>
      </motion.div>

      <MobileGalleryExperience onCta={onCta} />
    </>
  )
}
