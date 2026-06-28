/**
 * themeController.js
 *
 * Theme content — persisted in Firebase Firestore (collection: themeContent, doc: main).
 * Media uploads go to Cloudinary (video) / ImageKit (image).
 * Local JSON files (themeContent.json, themeStore.js) are no longer used.
 */
const asyncHandler    = require('../middleware/asyncHandler');
const createHttpError = require('../utils/httpError');
const { uploadThemeMedia } = require('../services/imagekitService');
const themes = require('../services/firestoreThemeRepository');

const BUILTIN_IDS = new Set(['romantic', 'birthday', 'surprise']);

const DEFAULT_THEMES = [
  {
    id: 'romantic', key: 'romantic', title: 'Heart Theme', tag: '🌹 Romantic',
    desc: 'An intimate escape draped in petals, soft candlelight, and whispered elegance. Perfect for proposals, anniversaries, and heartfelt date nights.',
    features: ['Candles', 'Rose petals', 'Music'],
    img: '/themes/romantic/romantic1.jpg', videoSrc: null,
    emoji: '', active: true,
  },
  {
    id: 'birthday', key: 'birthday', title: 'Balloon Theme', tag: '🎉 Birthday',
    desc: 'Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory worth celebrating.',
    features: ['Balloons', 'Custom banner', 'Cake'],
    img: '', videoSrc: null,
    emoji: '🎂', active: true,
  },
  {
    id: 'surprise', key: 'surprise', title: 'Partition Theme', tag: '✨ Surprise',
    desc: 'A perfectly orchestrated surprise that leaves them breathless. We coordinate every detail in complete secrecy — you just show up and enjoy.',
    features: ['Secret setup', 'Reveal décor', 'Timing'],
    img: '', videoSrc: null,
    emoji: '🎁', active: true,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   URL sanity helpers
───────────────────────────────────────────────────────────────────────────── */

/**
 * Detect Cloudinary double-path URLs caused by the pre-fix mediaRouter bug.
 * Pattern: .../upload/v<num>/themes/romantic/themes/romantic/...
 */
function isDoublePathUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\/upload\/[^/]+\/([a-z/]+)\/\1\//.test(url);
}

/**
 * On startup: scan Firestore themeContent and wipe any double-path 404 URLs.
 */
async function healDoublePathUrls() {
  try {
    const stored = await themes.list();
    for (const theme of stored) {
      let changed = false;
      const patch = {};

      if (theme.scrollyMedia) {
        const cleanScrolly = { ...theme.scrollyMedia };
        for (const [slot, url] of Object.entries(cleanScrolly)) {
          if (isDoublePathUrl(url)) {
            console.warn(`[themeController] Clearing double-path URL from ${theme.id}.scrollyMedia.${slot}: ${url}`);
            delete cleanScrolly[slot];
            changed = true;
          }
        }
        if (changed) patch.scrollyMedia = cleanScrolly;
      }

      if (isDoublePathUrl(theme.videoSrc)) {
        console.warn(`[themeController] Clearing double-path videoSrc from ${theme.id}: ${theme.videoSrc}`);
        patch.videoSrc = null;
        changed = true;
      }

      if (changed) {
        await themes.set(theme.id, patch);
      }
    }
  } catch (err) {
    console.error('[themeController] healDoublePathUrls failed:', err.message);
  }
}

// Run healing on module load (server startup)
healDoublePathUrls();

/* ─────────────────────────────────────────────────────────────────────────────
   scrollyMedia persistence — stored in Firestore (themeContent/main).
   Each theme override may include a `scrollyMedia` object,
   e.g. { video: "https://res.cloudinary.com/...", scene1: "https://ik.imagekit.io/..." }
───────────────────────────────────────────────────────────────────────────── */

/**
 * Read scrollyMedia for a specific theme from Firestore.
 * Returns {} if the theme has no stored scrollyMedia.
 */
async function getScrollyMedia(themeId) {
  const record = await themes.getById(themeId);
  return (record && record.scrollyMedia) ? record.scrollyMedia : {};
}

/**
 * Persist a single scrollyMedia slot for a theme into Firestore.
 * If slot === 'video', also sets videoSrc on the theme record.
 *
 * @param {string} themeId
 * @param {string} slot    – e.g. 'video', 'scene1'
 * @param {string} url     – CDN URL returned by imagekitService / Cloudinary
 * @returns {object}       – the updated scrollyMedia map for this theme
 */
async function setScrollyMediaSlot(themeId, slot, url) {
  const existing      = await themes.getById(themeId) || {};
  const existingScrolly = existing.scrollyMedia || {};
  const updatedScrolly  = { ...existingScrolly, [slot]: url };

  const payload = { scrollyMedia: updatedScrolly };
  if (slot === 'video') {
    payload.videoSrc = url;
  }

  await themes.set(themeId, payload);

  console.log(`[themeController] scrollyMedia.${slot} persisted for theme "${themeId}" → ${url}`);
  return updatedScrolly;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
async function mergeWithDefaults(stored) {
  const byId = new Map(stored.map((t) => [t.id, t]));

  const defaults = DEFAULT_THEMES.map((def) => {
    const s = byId.get(def.id) || {};
    const { scrollyMedia: _ignored, ...storedWithoutScrolly } = s;
    return {
      ...def,
      ...storedWithoutScrolly,
      scrollyMedia: s.scrollyMedia || {},
    };
  });

  const custom = stored.filter((t) => !BUILTIN_IDS.has(t.id));
  return [...defaults, ...custom];
}

function normalizeTheme(body) {
  const features = Array.isArray(body.features)
    ? body.features
    : typeof body.features === 'string'
    ? body.features.split(',').map((f) => f.trim()).filter(Boolean)
    : [];

  return {
    ...(body.key      !== undefined ? { key:      String(body.key).trim().toLowerCase() } : {}),
    ...(body.title    !== undefined ? { title:    String(body.title).trim() }             : {}),
    ...(body.tag      !== undefined ? { tag:      String(body.tag).trim() }               : {}),
    ...(body.desc     !== undefined ? { desc:     String(body.desc).trim() }              : {}),
    ...(body.img      !== undefined ? { img:      String(body.img).trim() }               : {}),
    ...(body.videoSrc !== undefined ? { videoSrc: String(body.videoSrc).trim() }          : {}),
    ...(body.emoji    !== undefined ? { emoji:    String(body.emoji).trim() }             : {}),
    ...(body.active   !== undefined ? { active:   body.active !== false }                 : {}),
    features,
  };
}

/* ─────────────────────────────────────────────
   Route handlers
───────────────────────────────────────────── */

// GET /api/themes  — public
const listThemes = asyncHandler(async (req, res) => {
  const data = await mergeWithDefaults(await themes.list());
  res.json({ success: true, data });
});

// POST /api/themes  — admin only
const createTheme = asyncHandler(async (req, res) => {
  const { key, title } = req.body;
  if (!key || !title) throw createHttpError(400, 'key and title are required');

  const all = await mergeWithDefaults(await themes.list());
  if (all.some((t) => t.key === key.toLowerCase()))
    throw createHttpError(409, `A theme with key "${key}" already exists`);

  const item = await themes.create({ id: key.toLowerCase(), ...normalizeTheme(req.body) });
  res.status(201).json({ success: true, data: item });
});

// PATCH /api/themes/:id  — admin only
const updateTheme = asyncHandler(async (req, res) => {
  const payload = normalizeTheme(req.body);
  const item = BUILTIN_IDS.has(req.params.id)
    ? await themes.set(req.params.id, payload)
    : await themes.update(req.params.id, payload);

  if (!item) throw createHttpError(404, 'Theme not found');
  res.json({ success: true, data: item });
});

// DELETE /api/themes/:id  — admin only
const deleteTheme = asyncHandler(async (req, res) => {
  if (BUILTIN_IDS.has(req.params.id))
    throw createHttpError(403, 'Built-in themes cannot be deleted. Set active=false to hide.');

  const deleted = await themes.remove(req.params.id);
  if (!deleted) throw createHttpError(404, 'Theme not found');
  res.json({ success: true, message: 'Theme deleted' });
});

// POST /api/themes/:id/media  — admin only
const uploadThemeMediaHandler = asyncHandler(async (req, res) => {
  const { dataUrl, kind = 'image', slot } = req.body;
  if (!dataUrl) throw createHttpError(400, 'dataUrl is required');
  if (!slot)    throw createHttpError(400, 'slot is required (e.g. scene1, video)');

  const themeId   = req.params.id;
  const mediaKind = kind === 'video' ? 'video' : 'image';

  // 1. Upload to Cloudinary (video) / ImageKit (image) — or local fallback
  const url = await uploadThemeMedia(dataUrl, themeId, mediaKind);

  // 2. Persist slot → url into Firestore immediately.
  //    If slot === 'video', also sets videoSrc on the theme record.
  const updatedScrollyMedia = await setScrollyMediaSlot(themeId, slot, url);

  // 3. Return updated theme
  const allThemes    = await mergeWithDefaults(await themes.list());
  const updatedTheme = allThemes.find((t) => t.id === themeId);

  res.status(201).json({
    success: true,
    data: { url, slot, theme: updatedTheme },
  });
});

// DELETE /api/themes/:id/media/:slot  — admin only
const clearThemeMedia = asyncHandler(async (req, res) => {
  const { id: themeId, slot } = req.params;
  if (!slot) throw createHttpError(400, 'slot is required');

  const existing = await themes.getById(themeId);
  if (existing && existing.scrollyMedia) {
    const updatedScrolly = { ...existing.scrollyMedia };
    delete updatedScrolly[slot];
    const payload = { scrollyMedia: updatedScrolly };
    if (slot === 'video') {
      const def = DEFAULT_THEMES.find((d) => d.id === themeId);
      payload.videoSrc = (def && def.videoSrc) ? def.videoSrc : '';
    }
    await themes.set(themeId, payload);
  }

  const allThemes    = await mergeWithDefaults(await themes.list());
  const updatedTheme = allThemes.find((t) => t.id === themeId);

  res.json({
    success: true,
    data: { slot, theme: updatedTheme },
  });
});

module.exports = {
  listThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  uploadThemeMedia: uploadThemeMediaHandler,
  clearThemeMedia,
};
