# A WonderOne Suprise — frontend (Vite + React)

Luxury event booking landing experience with cinematic hero, booking flow, and admin console.

## Setup

```bash
npm install
npm run dev
```

Dev server: `http://127.0.0.1:5173` (see `vite.config.js`).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Local development |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Project layout

- `src/` — components, routes, admin, hooks, styles
- `public/` — static files served at URL root (e.g. `/themes/...`, favicons)
- `index.html` — Vite entry HTML
- `tailwind.config.js` / `postcss.config.js` — Tailwind (preflight disabled; see `src/tailwind.css`)
- `vite.config.js` — build & dev server
- `eslint.config.js` — flat ESLint config

## Admin

Routes are under **`/control-panel-7x9/`** (login, dashboard, hero section, gallery, etc.).

## Environment

Optional API base for admin/dashboard fetches:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Create `.env.local` (gitignored) if needed.

## Lean ZIP (no `node_modules`)

From the parent folder that contains **`client/`** and **`scripts/`**, run:

```powershell
powershell -ExecutionPolicy Bypass -File ..\scripts\Export-LeanClientZip.ps1
```

Or from `event-booking-app`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Export-LeanClientZip.ps1
```

Default output: `velvet-nights-client-lean.zip` next to the `client` folder.

