/**
 * Future Firebase Storage + Firestore sync (stub).
 *
 * Planned env (example):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *
 * When implemented:
 *   - `uploadHeroBinary` → Firebase Storage `ref().put(file, { contentType })` with `task.on('state_changed', ...)`
 *   - Persist panel documents in Firestore collection `hero_panels`
 *   - Replace `idb:` URLs with `https://firebasestorage.googleapis.com/...` download URLs
 *
 * The admin UI and `HeroContentContext` should depend only on `heroMediaService.js`
 * and `heroPanelRepository.js` facades so this swap stays localized.
 */

export const FIREBASE_HERO_FEATURE_FLAG = false
