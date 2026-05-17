import { HERO_IDB_PREFIX } from './constants.js'
import { heroIdbDelete, heroIdbPut } from './heroMediaIdb.js'
import { validateHeroImage, validateHeroVideo } from './validateHeroMedia.js'
import { API_BASE_URL } from '../../data/packageCatalog.js'

function authHeaders() {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function readFileAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error || new Error('Could not read file'))
    reader.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress?.(Math.min(55, Math.round((event.loaded / event.total) * 55)))
    }
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

async function uploadViaBackend(file, kind, onProgress) {
  const dataUrl = await readFileAsDataUrl(file, onProgress)
  onProgress?.(65)

  const response = await fetch(`${API_BASE_URL}/hero/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ kind, dataUrl }),
  })
  const result = await response.json()
  if (!response.ok || !result.success) {
    const error = new Error(result.message || 'Upload failed')
    error.fromApi = true
    throw error
  }

  onProgress?.(100)
  return { ref: result.data.ref, mimeType: file.type }
}

async function uploadToLocalIdb(file, onProgress) {
  const id = crypto.randomUUID()
  let acc = 4
  const tick = window.setInterval(() => {
    acc = Math.min(92, acc + 9)
    onProgress?.(acc)
  }, 70)
  try {
    await heroIdbPut(id, file, file.type)
  } finally {
    window.clearInterval(tick)
  }
  onProgress?.(100)
  return { ref: `${HERO_IDB_PREFIX}${id}`, mimeType: file.type }
}

export async function uploadHeroBinary(file, kind, { onProgress } = {}) {
  const v = kind === 'video' ? validateHeroVideo(file) : validateHeroImage(file)
  if (!v.ok) throw new Error(v.message)

  onProgress?.(3)
  try {
    return await uploadViaBackend(file, kind, onProgress)
  } catch (error) {
    if (error.fromApi) throw error
    return uploadToLocalIdb(file, onProgress)
  }
}

export async function deleteHeroBinaryIfStored(url) {
  if (!url || !String(url).startsWith(HERO_IDB_PREFIX)) return
  const id = String(url).slice(HERO_IDB_PREFIX.length)
  await heroIdbDelete(id)
}
