Cinematic UI layer (Feb 2026)

What changed
- New file: client/src/styles/cinematic-atmosphere.css — ambient violet/gold field, navbar glass, typography depth, button shimmer, glass cards, gallery (rc-*), theme cards, trust stats, hero overlay, footer atmosphere.
- New file: client/src/styles/cinematic-hero.css — hero grain, dust motes, snap scrollbar hide.
- client/src/main.jsx — imports cinematic-atmosphere.css and cinematic-hero.css after style.css.
- client/src/App.jsx — HomePage wrapped in .home-cinematic-root with fixed .cinematic-atmosphere layers; main has .site-main site-main--cinematic.

Hero — cinematic split triptych (Feb 2026)
- client/src/data/heroThemes.js — HERO_TRIPTYCH_THEMES (Romantic, Birthday, Luxury Surprise): video paths, posters, overlay Tailwind tokens, themeKey for #themes scroll.
- client/src/components/hero/HeroPanel.jsx — reusable panel (video play when expanded, overlays, Explore Experience CTA).
- client/src/components/hero/CinematicSplitHero.jsx — lg+ three-column grid with animated gridTemplateColumns on hover; mobile horizontal snap carousel (initial slide = Birthday); bottom Book + All themes + Scroll.
- client/src/components/HeroSection.jsx — renders CinematicSplitHero (onBook unchanged for Navbar/wizard).

Zip this folder (event-booking-app-refactored) or run from client/: npm install && npm run dev
