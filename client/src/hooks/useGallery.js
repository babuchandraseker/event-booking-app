/**
 * useGallery — fetches gallery items from the backend.
 *
 * Fix: removed the 5-second polling interval and window focus listener.
 * The admin gallery page was re-fetching every 5 s even when idle.
 * Gallery data only changes when an admin explicitly uploads/removes an item,
 * so polling is wasteful. The hook now fetches once on mount and exposes a
 * manual `refresh()` function for explicit refetch after mutations.
 */
import { useCallback, useEffect, useState } from 'react'
import { API_BASE_URL, API_ORIGIN } from '../config/api.js'

const STORAGE_KEY = 'vn_gallery_items'
const STORAGE_VERSION_KEY = 'vn_gallery_version'
const STORAGE_VERSION = '2'

// Bust stale cache once on module load
;(function bustStaleCache() {
  try {
    if (localStorage.getItem(STORAGE_VERSION_KEY) !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
    }
  } catch { /* ignore in private browsing */ }
})()

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* Storage can fail in private browsing */ }
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

async function fetchGalleryItems() {
  const response = await fetch(`${API_BASE_URL}/gallery`)
  const result = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not load gallery.')
  }
  return normalizeRemoteItems(result.data || []).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
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
  const [items, setItems] = useState(() => loadFromStorage() ?? [])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const remoteItems = await fetchGalleryItems()
      setItems(remoteItems)
    } catch {
      const cached = loadFromStorage()
      if (cached !== null) setItems(cached)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch once on mount — no polling, no focus listener
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchGalleryItems()
      .then((remoteItems) => { if (!cancelled) setItems(remoteItems) })
      .catch(() => {
        if (!cancelled) {
          const cached = loadFromStorage()
          if (cached !== null) setItems(cached)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
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
    setItems((prev) => {
      const updated = [...prev.filter((i) => i.id !== saved.id), { ...saved, src: absolutizeMediaUrl(saved.src) }]
      return updated.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    })
    return saved
  }, [items.length])

  const updateItem = useCallback(async (id, patch) => {
    const saved = await requestGallery(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...saved, src: absolutizeMediaUrl(saved.src ?? i.src) } : i))
    )
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
      body: JSON.stringify({ items: [] }),
    })
    setItems(normalizeRemoteItems(saved || []))
  }, [])

  return {
    items,
    loading,
    refresh: load,
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
