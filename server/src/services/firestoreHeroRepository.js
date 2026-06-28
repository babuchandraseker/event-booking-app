/**
 * firestoreHeroRepository.js
 *
 * Firestore-backed repository for hero content.
 * Collection: heroContent  |  Document: main
 *
 * Document shape:
 *   { published: [], draft: [], updatedAt: "" }
 *
 * Falls back to in-memory if Firebase is not configured (dev / test).
 */

const { db, isFirebaseEnabled } = require('../config/firebase');

const COLLECTION = 'heroContent';
const DOC_ID     = 'main';

/** In-memory fallback used when Firebase is disabled */
let _memFallback = null;

/** Default panels used to seed Firestore on first access */
const DEFAULT_PANELS = [
  { id: 'romantic',  themeKey: 'romantic',  title: 'Romantic',       subtitle: 'Moments meant only for two',    videoUrl: '', hlsUrl: '', mp4Url: '', posterImage: '/themes/romantic/romantic1.webp',  publicId: '', fileId: '', posterFileId: '', buttonText: 'Reserve My Experience', buttonLink: '', isVisible: true, order: 0, overlay: 'from-[rgba(246,235,199,0.14)] via-[rgba(215,172,40,0.08)] to-[rgba(255,255,255,0.04)]', glow: 'from-[rgba(246,235,199,0.12)] via-transparent to-[rgba(215,172,40,0.08)]' },
  { id: 'birthday',  themeKey: 'birthday',  title: 'Birthday',       subtitle: 'Birthdays remembered forever', videoUrl: '', hlsUrl: '', mp4Url: '', posterImage: '/themes/birthday/bday1.webp',   publicId: '', fileId: '', posterFileId: '', buttonText: 'Reserve My Experience', buttonLink: '', isVisible: true, order: 1, overlay: 'from-[rgba(246,235,199,0.12)] via-[rgba(255,255,255,0.04)] to-[rgba(215,172,40,0.08)]', glow: 'from-[rgba(215,172,40,0.08)] via-[rgba(246,235,199,0.06)] to-transparent' },
  { id: 'surprise',  themeKey: 'surprise',  title: 'Luxury Surprise', subtitle: 'The night they never expected', videoUrl: '', hlsUrl: '', mp4Url: '', posterImage: '/themes/surprise/surprise1.webp', publicId: '', fileId: '', posterFileId: '', buttonText: 'Reserve My Experience', buttonLink: '', isVisible: true, order: 2, overlay: 'from-[rgba(215,172,40,0.08)] via-[rgba(246,235,199,0.12)] to-[rgba(255,255,255,0.04)]', glow: 'from-[rgba(246,235,199,0.1)] via-[rgba(215,172,40,0.06)] to-transparent' },
];

const withUpdatedAt = (data) => ({
  ...data,
  updatedAt: new Date().toISOString(),
});

const heroRepository = {
  /**
   * Fetch the main hero document.
   * Returns { id, published, draft, updatedAt } or null if not yet created.
   */
  async get() {
    if (isFirebaseEnabled) {
      console.log(`[firebaseRepository] Reading ${COLLECTION}/${DOC_ID} from Firestore...`);
      try {
        const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
        if (!snap.exists) {
          console.log(`[firebaseRepository] ${COLLECTION}/${DOC_ID} does not exist yet.`);
          return null;
        }
        return { id: snap.id, ...snap.data() };
      } catch (err) {
        console.error(`[firebaseRepository] READ FAILED for ${COLLECTION}/${DOC_ID}`);
        console.error('[firebaseRepository] error.code:', err.code);
        console.error('[firebaseRepository] error.message:', err.message);
        console.error('[firebaseRepository] error.stack:', err.stack);
        throw err;
      }
    }
    return _memFallback;
  },

  /**
   * Fetch the main hero document, creating it with defaults if it doesn't exist.
   * This ensures uploads always have a document to update — fixes the silent-skip bug.
   * Returns { id, published, draft, updatedAt }
   */
  async getOrInit() {
    const existing = await this.get();
    if (existing) return existing;

    console.log('[firebaseRepository] heroContent/main does not exist — initializing with defaults.');
    const defaultDoc = {
      published: DEFAULT_PANELS.map((p) => ({ ...p })),
      draft:     DEFAULT_PANELS.map((p) => ({ ...p })),
    };
    return await this.set(defaultDoc);
  },

  /**
   * Full replace / upsert of the main hero document.
   * @param {{ published: any[], draft: any[] }} data
   */
  async set(data) {
    const payload = withUpdatedAt(data);
    if (isFirebaseEnabled) {
      console.log(`[firebaseRepository] Writing ${COLLECTION}/${DOC_ID} to Firestore (project: ${process.env.FIREBASE_PROJECT_ID})...`);
      try {
        await db.collection(COLLECTION).doc(DOC_ID).set(payload, { merge: false });
      } catch (err) {
        console.error(`[firebaseRepository] WRITE FAILED for ${COLLECTION}/${DOC_ID}`);
        console.error('[firebaseRepository] error.code:', err.code);
        console.error('[firebaseRepository] error.message:', err.message);
        console.error('[firebaseRepository] error.stack:', err.stack);
        throw err;
      }
      console.log('[firebaseRepository] heroContent/main saved to Firestore.');
      return { id: DOC_ID, ...payload };
    }
    _memFallback = { id: DOC_ID, ...payload };
    return _memFallback;
  },

  /**
   * Partial update — merges fields into the existing document.
   * @param {object} data
   */
  async merge(data) {
    const payload = withUpdatedAt(data);
    if (isFirebaseEnabled) {
      await db.collection(COLLECTION).doc(DOC_ID).set(payload, { merge: true });
      const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
      return { id: snap.id, ...snap.data() };
    }
    _memFallback = { id: DOC_ID, ...(_memFallback || {}), ...payload };
    return _memFallback;
  },

  /**
   * Atomically patch ONE panel's media fields inside `published` and `draft`,
   * inside a Firestore transaction.
   *
   * Root-cause fix for the thumbnail-sync bug: `set()` is a full-document
   * replace (`merge: false`) built from a `getOrInit()` snapshot taken before
   * the write. If the poster upload's read+write overlaps with ANY other
   * read+write to heroContent/main — most commonly the 420ms-debounced draft
   * autosave that fires after any field edit — whichever `set()` call
   * resolves last wins completely and silently discards the other write's
   * changes, including a freshly-uploaded posterImage/posterFileId. A fast
   * ImageKit round-trip overlaps that debounce window far more often than the
   * slower Cloudinary video pipeline does, which is why this showed up for
   * thumbnails specifically. Reproduced directly in isolation (see
   * HERO_THUMBNAIL_SYNC_FIX.md) and fixed by reading-and-writing inside a
   * single Firestore transaction, so a concurrent writer either fully
   * precedes or fully follows this update — never interleaves with it.
   *
   * @param {string} panelId
   * @param {(panel: object) => object} applyPatch — returns the patched panel
   * @returns {Promise<{id, published, draft, updatedAt}>}
   */
  async updatePanelMedia(panelId, applyPatch) {
    const updatePanels = (panels = []) =>
      panels.map((panel) => (panel.id === panelId ? applyPatch({ ...panel }) : panel));

    if (isFirebaseEnabled) {
      const docRef = db.collection(COLLECTION).doc(DOC_ID);
      console.log(`[firebaseRepository] updatePanelMedia: starting transaction for panel "${panelId}" on ${COLLECTION}/${DOC_ID}`);
      try {
        const result = await db.runTransaction(async (tx) => {
          const snap = await tx.get(docRef);
          const existing = snap.exists
            ? { id: snap.id, ...snap.data() }
            : { published: DEFAULT_PANELS.map((p) => ({ ...p })), draft: DEFAULT_PANELS.map((p) => ({ ...p })) };

          const payload = withUpdatedAt({
            published: updatePanels(existing.published || []),
            draft:     updatePanels(existing.draft || []),
          });
          tx.set(docRef, payload, { merge: false });
          return { id: DOC_ID, ...payload };
        });
        console.log(`[firebaseRepository] updatePanelMedia: transaction committed for panel "${panelId}"`);
        return result;
      } catch (err) {
        console.error(`[firebaseRepository] updatePanelMedia: transaction FAILED for panel "${panelId}"`);
        console.error('[firebaseRepository] error.code:', err.code);
        console.error('[firebaseRepository] error.message:', err.message);
        console.error('[firebaseRepository] error.stack:', err.stack);
        throw err;
      }
    }

    // In-memory fallback (dev / test) — single-threaded, so a plain
    // read-modify-write is already atomic with respect to JS event-loop turns.
    const existing = _memFallback || {
      published: DEFAULT_PANELS.map((p) => ({ ...p })),
      draft:     DEFAULT_PANELS.map((p) => ({ ...p })),
    };
    const payload = withUpdatedAt({
      published: updatePanels(existing.published || []),
      draft:     updatePanels(existing.draft || []),
    });
    _memFallback = { id: DOC_ID, ...payload };
    return _memFallback;
  },

  /**
   * Write ONLY the `draft` field via a Firestore field-path merge — never
   * touches `published` at all (not even a copy of it), so this can never
   * race with / stomp a concurrent `published` write from an upload. This
   * replaces the old pattern of reading `existing.published` and writing it
   * straight back inside a full-document `set()`, which was the second half
   * of the lost-update race described on `updatePanelMedia()` above: if an
   * upload's transaction committed a new `published[].posterImage` between
   * this call's read and write, the old code would silently overwrite it
   * with the stale copy it read moments earlier.
   *
   * @param {any[]} draft
   * @returns {Promise<{id, published, draft, updatedAt}>}
   */
  async setDraftOnly(draft) {
    const updatedAt = new Date().toISOString();
    if (isFirebaseEnabled) {
      const docRef = db.collection(COLLECTION).doc(DOC_ID);
      console.log(`[firebaseRepository] setDraftOnly: writing draft field only on ${COLLECTION}/${DOC_ID}`);
      try {
        const snap = await docRef.get();
        if (!snap.exists) {
          // No doc yet — seed it fully (draft + published) once, same as getOrInit().
          const defaultDoc = withUpdatedAt({
            published: DEFAULT_PANELS.map((p) => ({ ...p })),
            draft,
          });
          await docRef.set(defaultDoc, { merge: false });
          return { id: DOC_ID, ...defaultDoc };
        }
        await docRef.set({ draft, updatedAt }, { merge: true });
        const updated = await docRef.get();
        return { id: updated.id, ...updated.data() };
      } catch (err) {
        console.error(`[firebaseRepository] setDraftOnly: WRITE FAILED for ${COLLECTION}/${DOC_ID}`);
        console.error('[firebaseRepository] error.code:', err.code);
        console.error('[firebaseRepository] error.message:', err.message);
        console.error('[firebaseRepository] error.stack:', err.stack);
        throw err;
      }
    }

    const existing = _memFallback || {
      published: DEFAULT_PANELS.map((p) => ({ ...p })),
    };
    _memFallback = { id: DOC_ID, ...existing, draft, updatedAt };
    return _memFallback;
  },
};

/**
 * Startup confirmation log.
 *
 * Runs once when this module is first required (i.e. on server boot, via
 * heroController → heroRoutes → server.js). Confirms Hero is being served
 * from Firestore — never from local JSON — and surfaces a clear warning if
 * Firebase credentials are missing so a silent in-memory fallback is never
 * mistaken for a working Firestore connection.
 */
if (isFirebaseEnabled) {
  console.log('[firebaseRepository] Hero loaded from Firestore');
  console.log(`[firebaseRepository] Firebase Admin SDK project: ${process.env.FIREBASE_PROJECT_ID} — verify this matches the project shown in your Firestore Console.`);
  console.log(`[firebaseRepository] Target path: ${COLLECTION}/${DOC_ID}`);
} else {
  console.warn(
    '[firebaseRepository] Firebase is NOT configured — Hero is running on a ' +
      'temporary in-memory fallback (data will NOT persist across restarts). ' +
      'Set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY to enable Firestore.'
  );
}

module.exports = heroRepository;
