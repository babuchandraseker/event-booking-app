/**
 * Local persistent blob store for hero uploads (mock / pre-Firebase).
 * Swap for Firebase Storage later — keep the same logical keys in panel JSON.
 */

const DB_NAME = 'velvet_nights_hero_media'
const STORE = 'blobs'
const VERSION = 1

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
}

export async function heroIdbPut(id, blob, mimeType = '') {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).put({ id, blob, mimeType, savedAt: Date.now() })
  })
}

export async function heroIdbGet(id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    tx.onerror = () => reject(tx.error)
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result || null)
  })
}

export async function heroIdbDelete(id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).delete(id)
  })
}
