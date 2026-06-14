/**
 * heroMediaService.js
 *
 * Uploads hero media via multipart FormData (preferred, supports large files + ImageKit)
 * with XMLHttpRequest for real progress events.
 *
 * Falls back to local IndexedDB if the backend is unreachable.
 */
import { HERO_IDB_PREFIX } from './constants.js'
import { heroIdbDelete, heroIdbPut } from './heroMediaIdb.js'
import { validateHeroImage, validateHeroVideo } from './validateHeroMedia.js'
import { API_BASE_URL } from '../../config/api.js'

function authHeaders() {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Upload via multipart FormData with XHR progress.
 * Returns { ref, hlsUrl, mp4Url, posterUrl, fileId, source }
 */
function uploadViaFormData(file, kind, { onProgress, panelId } = {}) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file',    file)
    form.append('kind',    kind)
    if (panelId) form.append('panelId', panelId)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (!e.lengthComputable) return
      // Upload is ~80% of the work; ImageKit processing is the rest
      const pct = Math.round((e.loaded / e.total) * 80)
      onProgress?.(pct)
    })

    xhr.addEventListener('load', () => {
      onProgress?.(95)
      try {
        const result = JSON.parse(xhr.responseText)
        if (xhr.status >= 400 || !result.success) {
          const err = new Error(result.message || 'Upload failed')
          err.fromApi = true
          reject(err)
          return
        }
        onProgress?.(100)
        resolve({
          ref:       result.data.url || result.data.ref,
          hlsUrl:    result.data.hlsUrl   || null,
          mp4Url:    result.data.mp4Url   || null,
          posterUrl: result.data.posterUrl || null,
          fileId:    result.data.fileId    || null,
          source:    result.data.source    || 'unknown',
        })
      } catch {
        reject(new Error('Invalid server response'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

    const token = localStorage.getItem('adminToken')
    xhr.open('POST', `${API_BASE_URL}/hero/media`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(form)
  })
}

/**
 * Fallback: store in IndexedDB (offline / backend unreachable).
 */
async function uploadToLocalIdb(file, onProgress) {
  const id  = crypto.randomUUID()
  let   acc = 4
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
  return {
    ref:       `${HERO_IDB_PREFIX}${id}`,
    hlsUrl:    null,
    mp4Url:    null,
    posterUrl: null,
    fileId:    null,
    source:    'idb',
  }
}

/**
 * Primary export — upload hero binary (video or image).
 *
 * Returns { ref, hlsUrl, mp4Url, posterUrl, fileId, source }
 *   ref: the canonical URL to store in panel.videoUrl / panel.posterImage
 */
export async function uploadHeroBinary(file, kind, { onProgress, panelId } = {}) {
  const v = kind === 'video' ? validateHeroVideo(file) : validateHeroImage(file)
  if (!v.ok) throw new Error(v.message)

  onProgress?.(3)
  try {
    return await uploadViaFormData(file, kind, { onProgress, panelId })
  } catch (error) {
    if (error.fromApi) throw error
    console.warn('[heroMediaService] Backend unavailable, using local IDB fallback:', error.message)
    return uploadToLocalIdb(file, onProgress)
  }
}

/**
 * Delete hero media from backend (ImageKit or local).
 * Handles both ImageKit fileId and legacy /uploads/ URLs.
 */
export async function deleteHeroBinaryIfStored(url, kind = 'video', { panelId, fileId, posterFileId } = {}) {
  if (!url && !fileId && !posterFileId) return

  const value = String(url || '')

  // IDB cleanup
  if (value.startsWith(HERO_IDB_PREFIX)) {
    const id = value.slice(HERO_IDB_PREFIX.length)
    await heroIdbDelete(id)
    return
  }

  // Backend delete (covers ImageKit fileId and local /uploads/)
  const body = {}
  if (panelId)      body.panelId      = panelId
  if (fileId)       body.fileId       = fileId
  if (posterFileId) body.posterFileId = posterFileId
  if (kind === 'video' && value.includes('/uploads/'))  body.videoUrl  = value.replace(/^https?:\/\/[^/]+/, '')
  if (kind === 'image' && value.includes('/uploads/'))  body.posterUrl = value.replace(/^https?:\/\/[^/]+/, '')
  body.kind = kind

  await fetch(`${API_BASE_URL}/hero/delete-media`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify(body),
  }).catch(() => {})
}
