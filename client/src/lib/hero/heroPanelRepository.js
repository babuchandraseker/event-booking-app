import { HERO_STORAGE_KEY } from './constants.js'
import { buildDefaultHeroPanels } from './defaultHeroPanels.js'

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
    themeKey: panel.themeKey ?? d.themeKey ?? panel.id,
    title: panel.title ?? d.title,
    subtitle: panel.subtitle ?? d.subtitle,
    videoUrl: panel.videoUrl || d.videoUrl,
    posterImage: panel.posterImage || d.posterImage,
    buttonText: panel.buttonText ?? d.buttonText ?? 'Explore Experience',
    buttonLink: panel.buttonLink ?? '',
    isVisible: panel.isVisible !== false,
    order: typeof panel.order === 'number' ? panel.order : d.order ?? 0,
    overlay: panel.overlay ?? d.overlay,
    glow: panel.glow ?? d.glow,
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

export function loadHeroStore() {
  const raw = localStorage.getItem(HERO_STORAGE_KEY)
  const parsed = raw ? safeParse(raw) : null
  const defaults = buildDefaultHeroPanels()

  if (!parsed || !Array.isArray(parsed.published)) {
    return {
      published: enrichAll(defaults),
      draft: enrichAll(defaults.map((p) => ({ ...p }))),
    }
  }

  const published = enrichAll(parsed.published.length ? parsed.published : defaults)
  const draft = enrichAll(
    Array.isArray(parsed.draft) && parsed.draft.length
      ? parsed.draft
      : published.map((p) => ({ ...p })),
  )

  return { published, draft }
}

export function saveHeroStore({ published, draft }) {
  const payload = {
    version: 1,
    updatedAt: Date.now(),
    published: sortPanels(published),
    draft: sortPanels(draft),
  }
  localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(payload))
}

export function publishDraft(draft) {
  const next = sortPanels(draft).map((p, i) => ({ ...p, order: i }))
  saveHeroStore({ published: next.map((p) => ({ ...p })), draft: next.map((p) => ({ ...p })) })
  return next
}

export function saveDraftOnly(draft) {
  const { published } = loadHeroStore()
  saveHeroStore({ published, draft: sortPanels(draft).map((p, i) => ({ ...p, order: i })) })
}
