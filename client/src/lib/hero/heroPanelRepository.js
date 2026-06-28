import { HERO_STORAGE_KEY } from './constants.js'
import { buildDefaultHeroPanels } from './defaultHeroPanels.js'
import { API_BASE_URL, API_ORIGIN } from '../../config/api.js'

function sortPanels(list) {
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function defaultsById() {
  const map = new Map()
  for (const d of buildDefaultHeroPanels()) map.set(d.id, d)
  return map
}

/** Ensure styling keys from shipped defaults survive older localStorage rows. */
function enrichPanel(panel, defMap) {
  const d = defMap.get(panel.id) || {}
  return {
    ...d,
    ...panel,
    themeKey:    panel.themeKey    ?? d.themeKey    ?? panel.id,
    title:       panel.title       ?? d.title,
    subtitle:    panel.subtitle    ?? d.subtitle,
    videoUrl:    panel.videoUrl    || d.videoUrl,
    hlsUrl:      panel.hlsUrl      || '',
    mp4Url:      panel.mp4Url      || '',
    posterImage: panel.posterImage || d.posterImage,
    fileId:          panel.fileId          || '',
    posterFileId:    panel.posterFileId    || '',
    buttonText:  panel.buttonText  ?? d.buttonText ?? 'Reserve My Experience',
    buttonLink:  panel.buttonLink  ?? '',
    isVisible:   panel.isVisible   !== false,
    order:       typeof panel.order === 'number' ? panel.order : d.order ?? 0,
    overlay:     panel.overlay     ?? d.overlay,
    glow:        panel.glow        ?? d.glow,
  }
}

function enrichAll(list) {
  const defMap = defaultsById()
  return sortPanels(list.map((p) => enrichPanel(p, defMap)))
}

function safeParse(raw) {
  try {
    const v = JSON.parse(raw)
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}

function authHeaders() {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function absolutizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url
  // ImageKit URLs are already absolute (https://ik.imagekit.io/...)
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`
  return url
}

function normalizeMediaUrls(panel) {
  return {
    ...panel,
    videoUrl:    absolutizeMediaUrl(panel.videoUrl),
    hlsUrl:      absolutizeMediaUrl(panel.hlsUrl),
    mp4Url:      absolutizeMediaUrl(panel.mp4Url),
    posterImage: absolutizeMediaUrl(panel.posterImage),
  }
}

export function loadHeroStore() {
  const raw    = localStorage.getItem(HERO_STORAGE_KEY)
  const parsed = raw ? safeParse(raw) : null
  const defaults = buildDefaultHeroPanels()

  if (!parsed || !Array.isArray(parsed.published)) {
    return {
      published: enrichAll(defaults),
      draft:     enrichAll(defaults.map((p) => ({ ...p }))),
    }
  }

  const published = enrichAll(parsed.published.length ? parsed.published : defaults)
  const draft     = enrichAll(
    Array.isArray(parsed.draft) && parsed.draft.length
      ? parsed.draft
      : published.map((p) => ({ ...p })),
  )

  return { published, draft }
}

export async function loadHeroStoreFromApi() {
  const response = await fetch(`${API_BASE_URL}/hero`)
  const result   = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not load hero content.')
  }

  const defaults = buildDefaultHeroPanels()
  const data     = result.data || {}
  const published = enrichAll(
    Array.isArray(data.published) && data.published.length
      ? data.published.map(normalizeMediaUrls)
      : defaults,
  )
  const draft = enrichAll(
    Array.isArray(data.draft) && data.draft.length
      ? data.draft.map(normalizeMediaUrls)
      : published.map((p) => ({ ...p })),
  )

  const store = { published, draft }
  saveHeroStore(store)
  return store
}

export function saveHeroStore({ published, draft }) {
  const payload = {
    version:   1,
    updatedAt: Date.now(),
    published: sortPanels(published),
    draft:     sortPanels(draft),
  }
  localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(payload))
}

async function requestHero(path, body, method = 'POST') {
  const response = await fetch(`${API_BASE_URL}/hero${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify(body),
  })
  const result = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not save hero content.')
  }
  return result.data
}

export async function publishDraft(draft) {
  const next = sortPanels(draft).map((p, i) => ({ ...p, order: i }))
  saveHeroStore({ published: next.map((p) => ({ ...p })), draft: next.map((p) => ({ ...p })) })
  await requestHero('/publish', { draft: next })
  return next
}

export async function saveDraftOnly(draft) {
  const { published } = loadHeroStore()
  const nextDraft     = sortPanels(draft).map((p, i) => ({ ...p, order: i }))
  saveHeroStore({ published, draft: nextDraft })
  await requestHero('/draft', { draft: nextDraft }, 'PUT')
}
