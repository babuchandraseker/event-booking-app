import { HERO_IDB_PREFIX } from './constants.js'
import { heroIdbGet } from './heroMediaIdb.js'

/** @type {Map<string, string>} id -> blob: URL */
const idToObjectUrl = new Map()

export async function resolveHeroMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (!url.startsWith(HERO_IDB_PREFIX)) return url
  const id = url.slice(HERO_IDB_PREFIX.length)
  if (idToObjectUrl.has(id)) return idToObjectUrl.get(id)
  const row = await heroIdbGet(id)
  if (!row?.blob) return ''
  const objectUrl = URL.createObjectURL(row.blob)
  idToObjectUrl.set(id, objectUrl)
  return objectUrl
}

export function revokeHeroId(id) {
  const u = idToObjectUrl.get(id)
  if (u) {
    try {
      URL.revokeObjectURL(u)
    } catch {
      /* ignore */
    }
    idToObjectUrl.delete(id)
  }
}

export function revokeAllHeroBlobs() {
  for (const u of idToObjectUrl.values()) {
    try {
      URL.revokeObjectURL(u)
    } catch {
      /* ignore */
    }
  }
  idToObjectUrl.clear()
}

export function panelToDisplayFields(panel, resolvedVideoUrl, resolvedPosterUrl) {
  return {
    ...panel,
    videoSrc: resolvedVideoUrl || panel.videoUrl,
    poster: resolvedPosterUrl || panel.posterImage,
  }
}
