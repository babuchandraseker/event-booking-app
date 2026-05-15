/**
 * useGallery — gallery data management hook.
 *
 * Currently uses localStorage for persistence (no backend required).
 * Firebase-ready: replace localStorage calls with Firestore reads/writes.
 *
 * Returns:
 *   items         — array of gallery items
 *   loading       — boolean
 *   addItem       — (item) => void
 *   updateItem    — (id, patch) => void
 *   deleteItem    — (id) => void
 *   reorderItems  — (newOrder: id[]) => void
 */

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'vn_gallery_items'

// ─── Default seed items using existing public images ───────────────────────
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
    title: 'Candlelit Séance',
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
    caption: 'Tears of joy — every single time',
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
  } catch (_) {}
  return null
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (_) {}
}

function generateId() {
  return `gal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = loadFromStorage()
    setItems(stored ?? DEFAULT_ITEMS)
    setLoading(false)

    // ── Firebase hook-in point ─────────────────────────────────────────────
    // import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
    // const q = query(collection(db, 'gallery'), orderBy('order'))
    // const unsub = onSnapshot(q, snap => {
    //   setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    //   setLoading(false)
    // })
    // return () => unsub()
  }, [])

  // Persist on every change
  useEffect(() => {
    if (!loading) saveToStorage(items)
  }, [items, loading])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addItem = useCallback((item) => {
    const newItem = {
      id: generateId(),
      visible: true,
      featured: false,
      order: (items.length || 0) + 1,
      addedAt: new Date().toISOString(),
      ...item,
    }
    setItems(prev => [...prev, newItem])

    // Firebase: addDoc(collection(db, 'gallery'), newItem)
  }, [items.length])

  const updateItem = useCallback((id, patch) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))

    // Firebase: updateDoc(doc(db, 'gallery', id), patch)
  }, [])

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))

    // Firebase: deleteDoc(doc(db, 'gallery', id))
  }, [])

  const reorderItems = useCallback((orderedIds) => {
    setItems(prev => {
      const map = Object.fromEntries(prev.map(i => [i.id, i]))
      return orderedIds
        .filter(id => map[id])
        .map((id, idx) => ({ ...map[id], order: idx + 1 }))
        .concat(prev.filter(i => !orderedIds.includes(i.id)))
    })
  }, [])

  const toggleVisibility = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, visible: !i.visible } : i))
  }, [])

  const toggleFeatured = useCallback((id) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, featured: !i.featured } : i
    ))
  }, [])

  const resetToDefaults = useCallback(() => {
    setItems(DEFAULT_ITEMS)
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
