# Event booking app (Velvet Nights)

Monorepo-style layout:

- **`client/`** — Vite + React frontend (landing, booking wizard, admin)
- **`server/`** — API backend (if present in your tree)

## Frontend quick start

```bash
cd client
npm install
npm run dev
```

## Full project ZIP (client + server, no `node_modules`)

Creates a **non-empty** archive under your **Downloads** folder (timestamped name).

```powershell
cd "C:\Users\DELI BABU C\Downloads\event-booking-app-production\event-booking-app"
powershell -ExecutionPolicy Bypass -File ".\scripts\Export-FullProjectZip.ps1"
```

Custom output path:

```powershell
.\scripts\Export-FullProjectZip.ps1 -OutZip "D:\Backups\event-booking-app-FULL.zip"
```

Client-only (smaller) zip:

```powershell
.\scripts\Export-LeanClientZip.ps1
```

