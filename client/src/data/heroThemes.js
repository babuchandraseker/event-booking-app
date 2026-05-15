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
    videoSrc: '/themes/romantic/romantic.mp4',
    poster: '/themes/romantic/romantic1.jpg',
    /** violet-heavy overlay */
    overlay: 'from-[#0a0618]/85 via-[#1a1040]/55 to-[#080612]/90',
    glow: 'from-violet-600/25 via-transparent to-amber-500/10',
  },
  {
    id: 'birthday',
    themeKey: 'birthday',
    title: 'Birthday',
    subtitle: 'Birthdays remembered forever',
    videoSrc: '/themes/birthday/bday.mp4',
    poster: '/themes/birthday/bday1.jpeg',
    overlay: 'from-[#0c0612]/88 via-[#2a1040]/50 to-[#08040c]/92',
    glow: 'from-fuchsia-900/20 via-transparent to-amber-400/15',
  },
  {
    id: 'surprise',
    themeKey: 'surprise',
    title: 'Luxury Surprise',
    subtitle: 'The night they never expected',
    videoSrc: '/themes/surprise/surprise.mp4',
    poster: '/themes/surprise/surprise1.jpeg',
    overlay: 'from-[#050a14]/90 via-[#101838]/55 to-[#040608]/92',
    glow: 'from-amber-500/15 via-indigo-950/30 to-violet-600/20',
  },
]
