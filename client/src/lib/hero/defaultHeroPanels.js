import { HERO_TRIPTYCH_THEMES } from '../../data/heroThemes.js'

/**
 * Canonical default hero panels (matches shipped cinematic content).
 * `themeKey` is used for gallery scroll targeting (ThemeCard data-theme).
 */
export function buildDefaultHeroPanels() {
  return HERO_TRIPTYCH_THEMES.map((t, index) => ({
    id: t.id,
    themeKey: t.themeKey,
    title: t.title,
    subtitle: t.subtitle,
    videoUrl: t.videoSrc,
    posterImage: t.poster,
    buttonText: 'Reserve My Experience',
    buttonLink: '',
    isVisible: true,
    order: index,
    overlay: t.overlay,
    glow: t.glow,
  }))
}

export function defaultPanelById(id) {
  return buildDefaultHeroPanels().find((p) => p.id === id) || null
}
