import { useCallback, useEffect, useState } from 'react'
import { API_BASE_URL } from '../data/packageCatalog'

const STORAGE_KEY = 'vn_gallery_items'
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '')

const DEFAULT_ITEMS = [
  {
    id: 'gal-1',
    src: '/themes/romantic/romantic1.jpg',
    alt: 'Cinematic romantic event setup',
    title: 'Where Every Moment Becomes Forever',
    caption: 'Luxury private events crafted with obsessive attention to detail, emotion, and elegance.',
    category: 'Romantic',
    featured: true,
    visible: true,
    order: 1,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-2',
    src: '/themes/romantic/romantic2.jpg',
    alt: 'Candlelit table decor',
    title: 'Candlelit Seance',
    caption: 'Every candle placed with intention',
    category: 'Romantic',
    featured: false,
    visible: true,
    order: 2,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-3',
    src: '/themes/romantic/romantic3.jpg',
    alt: 'Floral luxury arrangement',
    title: 'Bloom & Elegance',
    caption: 'Florals that speak the unspeakable',
    category: 'Anniversary',
    featured: false,
    visible: true,
    order: 3,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-4',
    src: '/themes/birthday/bday1.jpeg',
    alt: 'Grand birthday celebration',
    title: 'Grand Birthday Reveal',
    caption: 'A moment frozen in gold',
    category: 'Birthday',
    featured: false,
    visible: true,
    order: 4,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-5',
    src: '/themes/romantic/romantic4.jpg',
    alt: 'Surprise reveal moment',
    title: 'The Reveal',
    caption: 'Tears of joy every single time',
    category: 'Luxury Surprise',
    featured: false,
    visible: true,
    order: 5,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-6',
    src: '/themes/birthday/bday2.jpeg',
    alt: 'Intimate birthday setup',
    title: 'A Night to Remember',
    caption: 'Because every birthday deserves magic',
    category: 'Birthday',
    featured: false,
    visible: true,
    order: 6,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-7',
    src: '/themes/surprise/surprise1.jpeg',
    alt: 'Luxury surprise setup',
    title: 'The Perfect Surprise',
    caption: 'Crafted in secrecy, delivered in awe',
    category: 'Luxury Surprise',
    featured: false,
    visible: true,
    order: 7,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-8',
    src: '/themes/surprise/surprise2.jpeg',
    alt: 'Proposal setup with luxury decor',
    title: 'She Said Yes',
    caption: 'The night that changed everything',
    category: 'Proposal',
    featured: false,
    visible: true,
    order: 8,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'gal-9',
    src: '/themes/birthday/bday3.jpeg',
    alt: 'Anniversary dinner setup',
    title: 'A Decade of Us',
    caption: 'Ten years, celebrated in splendour',
    category: 'Anniversary',
    featured: false,
    visible: true,
    order: 9,
    addedAt: new Date().toISOString(),
  },
]

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Ignore corrupt local gallery data and fall back to defaults.
  }
  return null
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage can fail in private browsing or quota-limited contexts.
  }
}

function generateId() {
  return `gal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function authHeaders() {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function absolutizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`
  return url
}

function normalizeRemoteItems(items = []) {
  return items.map((item) => ({
    ...item,
    src: absolutizeMediaUrl(item.src),
  }))
}

function mergeWithDefaultItems(remoteItems = []) {
  const byId = new Map(normalizeRemoteItems(remoteItems).map((item) => [item.id, item]))
  const mergedDefaults = DEFAULT_ITEMS.map((fallback) => ({
    ...fallback,
    ...(byId.get(fallback.id) || {}),
  }))
  const customItems = normalizeRemoteItems(remoteItems).filter((item) => !DEFAULT_ITEMS.some((fallback) => fallback.id === item.id))

  return [...mergedDefaults, ...customItems].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
}

async function fetchGalleryItems() {
  const response = await fetch(`${API_BASE_URL}/gallery`)
  const result = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not load gallery.')
  }
  return mergeWithDefaultItems(result.data || [])
}

async function requestGallery(path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/gallery${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })
  const result = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not save gallery.')
  }
  return result.data
}

export function useGallery() {
  const [items, setItems] = useState(() => loadFromStorage() ?? DEFAULT_ITEMS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const remoteItems = await fetchGalleryItems()
        if (cancelled) return
        setItems(remoteItems.length ? remoteItems : DEFAULT_ITEMS)
      } catch {
        if (!cancelled) setItems(loadFromStorage() ?? DEFAULT_ITEMS)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const timer = window.setInterval(load, 5000)
    window.addEventListener('focus', load)

    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [])

  useEffect(() => {
    if (!loading) saveToStorage(items)
  }, [items, loading])

  const addItem = useCallback(async (item) => {
    const newItem = {
      id: generateId(),
      visible: true,
      featured: false,
      order: (items.length || 0) + 1,
      addedAt: new Date().toISOString(),
      ...item,
    }
    const saved = await requestGallery('', {
      method: 'POST',
      body: JSON.stringify(newItem),
    })
    setItems((prev) => mergeWithDefaultItems([...prev, saved]))
    return saved
  }, [items.length])

  const updateItem = useCallback(async (id, patch) => {
    const saved = await requestGallery(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    setItems((prev) => mergeWithDefaultItems(prev.map((i) => (i.id === id ? { ...i, ...saved } : i))))
    return saved
  }, [])

  const deleteItem = useCallback(async (id) => {
    await requestGallery(`/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const reorderItems = useCallback(async (orderedIds) => {
    const map = Object.fromEntries(items.map((i) => [i.id, i]))
    const nextItems = orderedIds
      .filter((id) => map[id])
      .map((id, idx) => ({ ...map[id], order: idx + 1 }))
      .concat(items.filter((i) => !orderedIds.includes(i.id)))

    setItems(nextItems)
    await Promise.all(nextItems.map((item) => requestGallery(`/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ order: item.order }),
    })))
  }, [items])

  const toggleVisibility = useCallback(async (id) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    await updateItem(id, { visible: item.visible === false })
  }, [items, updateItem])

  const toggleFeatured = useCallback(async (id) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    await updateItem(id, { featured: !item.featured })
  }, [items, updateItem])

  const resetToDefaults = useCallback(async () => {
    const saved = await requestGallery('/reset', {
      method: 'POST',
      body: JSON.stringify({ items: DEFAULT_ITEMS }),
    })
    setItems(mergeWithDefaultItems(saved.length ? saved : DEFAULT_ITEMS))
  }, [])

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    toggleVisibility,
    toggleFeatured,
    resetToDefaults,
  }
}

export default useGallery
