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
    try { URL.revokeObjectURL(u) } catch { /* ignore */ }
    idToObjectUrl.delete(id)
  }
}

export function revokeAllHeroBlobs() {
  for (const u of idToObjectUrl.values()) {
    try { URL.revokeObjectURL(u) } catch { /* ignore */ }
  }
  idToObjectUrl.clear()
}

/**
 * Pick the best video URL from a panel.
 *
 * ImageKit URLs are always absolute (https://ik.imagekit.io/...).
 * Priority: mp4Url > videoUrl (non-HLS) > resolvedVideoUrl
 */
function selectBestMp4Url(panel, resolvedVideoUrl) {
  if (panel.mp4Url && typeof panel.mp4Url === 'string' && panel.mp4Url.trim() !== '') {
    return panel.mp4Url
  }
  if (panel.videoUrl && typeof panel.videoUrl === 'string' && !panel.videoUrl.endsWith('.m3u8')) {
    return panel.videoUrl
  }
  if (resolvedVideoUrl && !resolvedVideoUrl.endsWith('.m3u8')) {
    return resolvedVideoUrl
  }
  return ''
}

export function panelToDisplayFields(panel, resolvedVideoUrl, resolvedPosterUrl) {
  const bestVideo = selectBestMp4Url(panel, resolvedVideoUrl)

  return {
    ...panel,
    videoSrc: bestVideo,
    hlsUrl:   panel.hlsUrl || '',
    mp4Url:   bestVideo,
    poster:   resolvedPosterUrl || panel.posterImage,
  }
}
