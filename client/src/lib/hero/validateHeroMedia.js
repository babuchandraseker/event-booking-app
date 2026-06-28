import {
  HERO_IMAGE_MIME,
  HERO_MAX_IMAGE_BYTES,
  HERO_MAX_VIDEO_BYTES,
  HERO_VIDEO_MIME,
} from './constants.js'

export function validateHeroVideo(file) {
  if (!file) return { ok: false, message: 'No file selected.' }
  if (!HERO_VIDEO_MIME.includes(file.type)) {
    return { ok: false, message: 'Only MP4 or WebM video files are allowed.' }
  }
  if (file.size > HERO_MAX_VIDEO_BYTES) {
    return { ok: false, message: `Video must be under ${Math.round(HERO_MAX_VIDEO_BYTES / (1024 * 1024))} MB.` }
  }
  return { ok: true }
}

export function validateHeroImage(file) {
  if (!file) return { ok: false, message: 'No file selected.' }
  if (!HERO_IMAGE_MIME.includes(file.type)) {
    return { ok: false, message: 'Use JPG, PNG, or WebP for poster images.' }
  }
  if (file.size > HERO_MAX_IMAGE_BYTES) {
    return { ok: false, message: `Image must be under ${Math.round(HERO_MAX_IMAGE_BYTES / (1024 * 1024))} MB.` }
  }
  return { ok: true }
}

export function videoMimeFromUrl(url) {
  const u = String(url || '').toLowerCase()
  if (u.endsWith('.webm')) return 'video/webm'
  return 'video/mp4'
}
