# LUXE EVENTS — Violet + Gold Theme

Visual-only refresh aligned to the luxury reference (deep royal violet, metallic gold, warm cinematic lighting).

## Palette

| Token | Value |
|-------|--------|
| Background void | `#05010A` |
| Violet center glow | `#1A0B2E` |
| Royal purple | `#4B1D7D` – `#5C2D91` |
| Metallic gold | `#D4AF37` / `#C5A059` |
| Gold highlight | `#E8C97A` |
| Warm glow | `#FFF4D1` |

## Updated files (main)

- `client/src/style.css` — CSS variables, buttons, glass, sections
- `client/src/styles/luxe-reference-overrides.css` — **new** global overrides (nav, forms, modals, admin, loading)
- `client/src/styles/cinematic-atmosphere.css`
- `client/src/styles/cinematic-hero.css`
- `client/tailwind.config.js`
- `client/src/main.jsx` — imports overrides
- Admin + homepage JSX (inline gold/violet values)

## Lightweight ZIP (source only)

Heavy folders are **removed from disk** before zipping (`node_modules`, `dist`, `build`, `.vite`, `.cache`, `coverage`, `temp`, `logs`). `.git` is excluded from the archive only.

**Easiest:** double-click `RUN-CLEAN-ZIP.bat`

Or in PowerShell:

```powershell
cd "C:\Users\DELI BABU C\Downloads\event-booking-app-mobile-fixed"
.\clean-and-zip.ps1
```

Output in `Downloads`:

- `event-booking-app-mobile-fixed-luxe-theme.zip`
- `event-booking-app-mobile-fixed (2)-luxe.zip`

After extract, restore dependencies:

```powershell
cd event-booking-app\event-booking-app-main
npm install
cd client && npm install
cd ..\server && npm install
```

Layout, Firebase, Razorpay, admin logic, and responsiveness are unchanged.
