/**
 * Hero triptych — static defaults used to seed localStorage / Firestore.
 * Runtime content is driven by `HeroContentContext` + `heroPanelRepository`.
 * themeKey matches ThemeCard `data-theme` for scroll targeting.
 */
export const HERO_TRIPTYCH_THEMES = [
  {
    id: 'romantic',
    themeKey: 'romantic',
    title: 'Romantic',
    subtitle: 'Moments meant only for two',
    videoSrc: null,
    poster: '/themes/romantic/romantic1.webp',
    overlay: 'from-[rgba(246,235,199,0.14)] via-[rgba(215,172,40,0.08)] to-[rgba(255,255,255,0.04)]',
    glow: 'from-[rgba(246,235,199,0.12)] via-transparent to-[rgba(215,172,40,0.08)]',
  },
  {
    id: 'birthday',
    themeKey: 'birthday',
    title: 'Birthday',
    subtitle: 'Birthdays remembered forever',
    videoSrc: null,
    poster: '/themes/birthday/bday1.webp',
    overlay: 'from-[rgba(246,235,199,0.12)] via-[rgba(255,255,255,0.04)] to-[rgba(215,172,40,0.08)]',
    glow: 'from-[rgba(215,172,40,0.08)] via-[rgba(246,235,199,0.06)] to-transparent',
  },
  {
    id: 'surprise',
    themeKey: 'surprise',
    title: 'Luxury Surprise',
    subtitle: 'The night they never expected',
    videoSrc: null,
    poster: '/themes/surprise/surprise1.webp',
    overlay: 'from-[rgba(215,172,40,0.08)] via-[rgba(246,235,199,0.12)] to-[rgba(255,255,255,0.04)]',
    glow: 'from-[rgba(246,235,199,0.1)] via-[rgba(215,172,40,0.06)] to-transparent',
  },
]
