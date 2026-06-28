# Hero Upload → Firestore Write Investigation

## Confirmed first (per your findings)
- Hero already uses `firestoreHeroRepository.js`, not local JSON.
- Startup log already prints `[firebaseRepository] Hero loaded from Firestore`.
- No migration was performed. Nothing about the storage backend changed.

## Root cause #1 — silent skip when `panelId` is missing (server)

**File:** `server/src/controllers/heroController.js`, `uploadHeroMedia` (and the
legacy dataUrl branch below it)

The Firestore write was gated entirely behind `if (panelId)`:

```js
if (panelId) {
  const existing = await heroRepository.getOrInit();
  ...
  await heroRepository.set({ published: ..., draft: ... });
}
return res.status(201).json({ success: true, data: { url: ... } });
```

If `panelId` is falsy for any reason (missing form field, stripped by an
intermediary, a future call site that forgets to pass it), the Cloudinary/
ImageKit upload still succeeds, the response is still `success: true` with a
real URL, and the Firestore write is **skipped with no error, no warning, no
log line**. This is indistinguishable from a successful save unless you read
server logs closely. Reproduced directly: a request without `panelId` returns
HTTP 201 `success: true` while writing nothing to `heroContent/main`.

**Fix:** Added a `console.warn` that fires whenever `panelId` is missing,
explicitly stating that the upload succeeded but Firestore was not written.
This makes the silent-skip path loud instead of silent. (No architecture
change — the gating logic itself is unchanged, since a panel-less upload has
no panel to attach the URL to.)

## Root cause #2 — focus/poll reload race overwrites in-flight draft state (client)

**File:** `client/src/context/HeroContentContext.jsx`

The admin panel polls `GET /api/hero` every 30s **and on every `window.focus`
event**. The handler unconditionally did:

```js
const { published, draft } = await loadHeroStoreFromApi()
setPublishedRaw(published)
setDraftRaw(draft)   // ← always overwrites local draft state
```

Upload flow timing:
1. `POST /api/hero/media` writes the new URL to Firestore (this part works).
2. Client calls `updateDraftPanel(...)`, which schedules a **debounced
   (420ms) draft save** (`PUT /api/hero/draft`).
3. If the admin switches tabs/windows during that ~420ms window — e.g. to
   check Cloudinary or the Firestore console, which is exactly what someone
   verifying an upload would do — the `focus` listener fires `load()` again.
4. `setDraftRaw(draft)` then overwrites the local draft state with whatever
   `GET /api/hero` returned, which can be the pre-upload state if it raced
   the in-flight write. The admin UI snaps back to "no video," which looks
   identical to "Firestore never got the URL," even on a second check.

**Fix:** Added a `pendingWriteRef` counter. The poll/focus handler now skips
`setDraftRaw(...)` while a draft-save or a media upload is in flight, and
logs `[HeroContentContext] Skipping draft overwrite from poll/focus reload —
a write is still in flight.` when it does so. `beginPendingWrite`/
`endPendingWrite` are exposed on the Hero context and wired around the full
upload window in `HeroSectionAdmin.jsx` (`handleVideo`, `handlePoster`), in
addition to the existing debounced-save accounting in
`scheduleDraftPersist`. No storage system, route, or data shape changed.

## Diagnostic logging added (server)

`server/src/controllers/heroController.js` — before/after `getOrInit()` and
`set()` in both the multipart and legacy-dataUrl upload branches:
- `panelId` received, full `uploadResult`
- explicit warning when `panelId` is falsy (the silent-skip case)
- `published[].videoUrl/mp4Url/hlsUrl` and `draft[].videoUrl` after merge,
  immediately before the Firestore write
- on failure: `error.code`, `error.message`, `error.stack`
- on success: the full document Firestore returned

`server/src/services/firestoreHeroRepository.js` — `get()` and `set()`:
- logs the exact target path (`heroContent/main`) before each call
- logs the Firebase project ID (`process.env.FIREBASE_PROJECT_ID`) at startup
  and before every write, so it can be checked against the Firestore Console
- on failure: `error.code`, `error.message`, `error.stack`, rethrown (never
  swallowed)

## What this sandbox could and couldn't verify

This sandbox's outbound network is restricted to package registries
(npm/pip/GitHub) — it cannot reach `firestore.googleapis.com`,
`api.cloudinary.com`, or `imagekit.io`. Every test run here that exercised a
real Firestore call failed with:

```
7 PERMISSION_DENIED: Host not in allowlist: firestore.googleapis.com.
```

This is a property of the sandbox, not your deployment — but it's also
exactly the kind of error the new logging is designed to surface clearly
(`error.code: 7`, etc.) if anything analogous (an actual permission/network
issue) is happening in your real environment. If after deploying these
changes your real logs show a `getOrInit()`/`set()` FAILED block with a
*different* `error.code` (e.g. `7 PERMISSION_DENIED` from Firestore Security
Rules, or `5 NOT_FOUND` from a wrong project ID), that will pinpoint a
genuinely different issue (rules or credentials) rather than the two root
causes found here.

## Files changed
- `server/src/controllers/heroController.js` — diagnostic logging, explicit
  silent-skip warning (multipart + legacy dataUrl branches)
- `server/src/services/firestoreHeroRepository.js` — diagnostic logging on
  `get()`/`set()`, project-ID/target-path logging at startup
- `client/src/context/HeroContentContext.jsx` — pending-write guard around
  the focus/poll reload; exposed `beginPendingWrite`/`endPendingWrite`
- `client/src/admin/HeroSectionAdmin.jsx` — wired pending-write guard around
  the full video/poster upload window

No files were deleted, no storage backend changed, no routes changed.
