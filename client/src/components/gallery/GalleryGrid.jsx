import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import FeaturedGalleryCard from './FeaturedGalleryCard'
import GalleryCard from './GalleryCard'

/**
 * GalleryGrid — image-only masonry-style layout orchestrator.
 *
 * Replaces MediaGrid but keeps the same CSS grid classes for layout continuity.
 * No video slots — replaced with additional image cards for richer gallery.
 *
 * Layout (desktop 12-col):
 *   Row 1: featured(1/6, rows 1-2) | img-A(6/9, row 1) | img-B(9/11, row 1) | img-C(11/13, row 1)
 *   Row 2:                          | img-D(6/9, row 2) | img-E(9/11, row 2) | img-F(11/13, row 2)
 *
 * Tablet: 2-col balanced
 * Mobile: stacked premium cards
 *
 * Props:
 *   items: array of gallery items (sorted by order, filtered by visible)
 *   onCta: function
 */
export default function GalleryGrid({ items = [], onCta }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  }

  // Sort by display order, filter visible
  const sorted = [...items]
    .filter(item => item.visible !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  // Featured = first item with featured:true, or first item
  const featuredItem = sorted.find(i => i.featured) || sorted[0]
  const otherItems = sorted.filter(i => i !== featuredItem)

  // Grid slots for non-featured items (6 slots to fill the 2-row right side)
  const slots = otherItems.slice(0, 6)

  // Grid placement classes mirroring previous layout but replacing video slots
  const slotClasses = [
    'rc-grid-slot-1',  // col 6-9, row 1
    'rc-grid-slot-2',  // col 9-11, row 1
    'rc-grid-slot-3',  // col 11-13, row 1
    'rc-grid-slot-4',  // col 6-9, row 2
    'rc-grid-slot-5',  // col 9-11, row 2
    'rc-grid-slot-6',  // col 11-13, row 2
  ]

  return (
    <motion.div
      ref={ref}
      className="rc-gallery-grid"
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={containerVariants}
      role="list"
      aria-label="Real Celebrations image gallery"
    >
      {/* Featured large card */}
      {featuredItem && (
        <FeaturedGalleryCard
          item={{
            ...featuredItem,
            cta: 'Explore Experience',
          }}
          onCta={onCta}
          className="rc-grid-featured"
        />
      )}

      {/* Standard image cards — fills all right-side slots */}
      {slots.map((item, i) => (
        <GalleryCard
          key={item.id || i}
          item={item}
          index={i + 1}
          className={slotClasses[i] || ''}
        />
      ))}

      {/* Empty state */}
      {sorted.length === 0 && (
        <motion.div
          className="rc-gallery-empty"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0.5 } },
          }}
        >
          <span className="rc-gallery-empty-icon">✦</span>
          <p>Gallery coming soon. Luxury memories are being curated.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
