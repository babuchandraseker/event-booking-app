/**
 * Curated memory-wall items — unique images per card (no repeats).
 * API/admin items can override fields when present.
 */

export const CURATED_FEATURED = {
  id: 'curated-featured',
  featured: true,
  visible: true,
  order: 0,
  category: 'FEATURED EXPERIENCE',
  title: 'Luxury Birthday Experience',
  caption:
    "Celebrate another beautiful year with a setup that's as special as the moments you create.",
  alt: 'Luxury birthday celebration with cake and sparklers',
  src: '/themes/birthday/bday1.webp',
  cta: 'Explore Experience',
}

export const CURATED_MEMORY_CARDS = [
  {
    id: 'curated-romantic-dinner',
    category: 'ROMANTIC DINNER',
    icon: '♥',
    title: 'Romantic Dinner',
    alt: 'Romantic candlelit dinner setup',
    src: '/themes/romantic/romantic1.webp',
    order: 1,
    visible: true,
  },
  {
    id: 'curated-proposal',
    category: 'PROPOSAL SETUP',
    icon: '💍',
    title: 'Proposal Setup',
    alt: 'Will you marry me proposal décor',
    src: '/themes/romantic/romantic3.webp',
    order: 2,
    visible: true,
  },
  {
    id: 'curated-anniversary',
    category: 'ANNIVERSARY',
    icon: '🥂',
    title: 'Anniversary',
    alt: 'Happy anniversary celebration setup',
    src: '/themes/romantic/romantic2.webp',
    order: 3,
    visible: true,
  },
  {
    id: 'curated-surprise-room',
    category: 'SURPRISE ROOM',
    icon: '🎁',
    title: 'Surprise Room',
    alt: 'Luxury surprise room with balloons',
    src: '/themes/surprise/surprise1.webp',
    order: 4,
    visible: true,
  },
  {
    id: 'curated-luxury-setup',
    category: 'LUXURY SETUP',
    icon: '💎',
    title: 'Luxury Setup',
    alt: 'Premium outdoor luxury celebration setup',
    src: '/themes/surprise/surprise2.webp',
    order: 5,
    visible: true,
  },
  {
    id: 'curated-celebrations',
    category: 'CELEBRATIONS',
    icon: '✦',
    title: 'Celebrations',
    alt: 'Birthday celebration with cake and lights',
    src: '/themes/birthday/bday3.webp',
    order: 6,
    visible: true,
  },
]

/** Merge API items onto curated layout — keeps unique curated images when API src missing */
export function resolveMemoriesGallery(apiItems = []) {
  const visible = [...apiItems].filter((i) => i.visible !== false).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const apiFeatured = visible.find((i) => i.featured) || visible[0]
  const featured = {
    ...CURATED_FEATURED,
    ...(apiFeatured || {}),
    src: apiFeatured?.src || CURATED_FEATURED.src,
    title: apiFeatured?.title || CURATED_FEATURED.title,
    caption: apiFeatured?.caption || apiFeatured?.alt || CURATED_FEATURED.caption,
    category: apiFeatured?.category || CURATED_FEATURED.category,
    cta: 'Explore Experience',
  }

  const apiRest = visible.filter((i) => i !== apiFeatured)
  const cards = CURATED_MEMORY_CARDS.map((curated, i) => {
    const api = apiRest[i]
    if (!api) return { ...curated }
    return {
      ...curated,
      ...api,
      src: api.src || curated.src,
      category: api.category || curated.category,
      icon: curated.icon,
      title: api.title || curated.title,
    }
  })

  return { featured, cards }
}
