/**
 * firestoreThemeRepository.js
 *
 * Firestore-backed repository for theme content (scrollyMedia overrides).
 * Collection: themeContent  |  Document: main
 *
 * Document shape:
 *   { themes: [], updatedAt: "" }
 *
 * "themes" is an array of theme override objects. Built-in defaults are
 * merged at read-time inside themeController (mergeWithDefaults), exactly
 * as before. Only stored overrides live here.
 *
 * Falls back to in-memory if Firebase is not configured (dev / test).
 */

const { db, isFirebaseEnabled } = require('../config/firebase');

const COLLECTION = 'themeContent';
const DOC_ID     = 'main';

/** In-memory fallback when Firebase is disabled */
let _memThemes = null;

const withUpdatedAt = (data) => ({
  ...data,
  updatedAt: new Date().toISOString(),
});

const themeRepository = {
  /**
   * List all stored theme overrides.
   * @returns {Promise<Array>}
   */
  async list() {
    if (isFirebaseEnabled) {
      const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
      if (!snap.exists) return [];
      return snap.data().themes || [];
    }
    return _memThemes || [];
  },

  /**
   * Fetch a single theme override by id.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async getById(id) {
    const all = await this.list();
    return all.find((t) => t.id === id) || null;
  },

  /**
   * Upsert a theme record. Creates or replaces the entry for the given id.
   * @param {string} id
   * @param {object} data
   */
  async set(id, data) {
    const all = await this.list();
    const idx = all.findIndex((t) => t.id === id);

    const timestamp = new Date().toISOString();
    const entry = {
      ...( idx !== -1 ? all[idx] : {} ),
      ...data,
      id,
      updatedAt: timestamp,
    };

    let updated;
    if (idx !== -1) {
      updated = [...all];
      updated[idx] = entry;
    } else {
      updated = [...all, { ...entry, createdAt: timestamp }];
    }

    await this._saveAll(updated);
    return entry;
  },

  /**
   * Create a new theme record.
   * @param {object} data  (must NOT include id if you want auto-id, or include id)
   */
  async create(data) {
    const all      = await this.list();
    const timestamp = new Date().toISOString();
    const entry    = {
      id: data.id || `theme_${Date.now()}`,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await this._saveAll([...all, entry]);
    return entry;
  },

  /**
   * Partial update for an existing record.
   * @param {string} id
   * @param {object} data
   */
  async update(id, data) {
    const all = await this.list();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const updated = [...all];
    updated[idx] = { ...all[idx], ...data, id, updatedAt: new Date().toISOString() };
    await this._saveAll(updated);
    return updated[idx];
  },

  /**
   * Remove a theme record.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async remove(id) {
    const all = await this.list();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const updated = all.filter((t) => t.id !== id);
    await this._saveAll(updated);
    return true;
  },

  /** Internal — write the full themes array to Firestore (or memory). */
  async _saveAll(themes) {
    const payload = withUpdatedAt({ themes });
    if (isFirebaseEnabled) {
      await db.collection(COLLECTION).doc(DOC_ID).set(payload, { merge: false });
      console.log(`[firestoreThemeRepository] themeContent/main saved — ${themes.length} override(s).`);
    } else {
      _memThemes = themes;
    }
  },
};

module.exports = themeRepository;
