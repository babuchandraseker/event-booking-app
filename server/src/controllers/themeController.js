const fs   = require('fs');
const path = require('path');

const asyncHandler    = require('../middleware/asyncHandler');
const createHttpError = require('../utils/httpError');
const { uploadThemeMedia } = require('../services/imagekitService');
const createRepository = require('../services/repository');

/* ── Non-media theme fields still go through the generic repository ── */
const themes = createRepository('themes');

const BUILTIN_IDS = new Set(['romantic', 'birthday', 'surprise']);

const DEFAULT_THEMES = [
  {
    id: 'romantic', key: 'romantic', title: 'Heart Theme', tag: '🌹 Romantic',
    desc: 'An intimate escape draped in petals, soft candlelight, and whispered elegance. Perfect for proposals, anniversaries, and heartfelt date nights.',
    features: ['Candles', 'Rose petals', 'Music'],
    img: '/themes/romantic/romantic1.jpg', videoSrc: '/themes/romantic/romantic.mp4',
    emoji: '', active: true,
  },
  {
    id: 'birthday', key: 'birthday', title: 'Balloon Theme', tag: '🎉 Birthday',
    desc: 'Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory worth celebrating.',
    features: ['Balloons', 'Custom banner', 'Cake'],
    img: '', videoSrc: '/themes/birthday/bday.mp4',
    emoji: '🎂', active: true,
  },
  {
    id: 'surprise', key: 'surprise', title: 'Partition Theme', tag: '✨ Surprise',
    desc: 'A perfectly orchestrated surprise that leaves them breathless. We coordinate every detail in complete secrecy — you just show up and enjoy.',
    features: ['Secret setup', 'Reveal décor', 'Timing'],
    img: '', videoSrc: '/themes/surprise/surprise.mp4',
    emoji: '🎁', active: true,
  },
];

/* ─────────────────────────────────────────────
   scrollyMedia — its own tiny JSON store
   server/src/data/store/scrollyMedia.json
───────────────────────────────────────────── */
const STORE_DIR  = path.join(__dirname, '../data/store');
const MEDIA_FILE = path.join(STORE_DIR, 'scrollyMedia.json');

function readScrollyMedia() {
  try {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    if (!fs.existsSync(MEDIA_FILE)) return {};
    return JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf8')) || {};
  } catch {
    return {};
  }
}

function writeScrollyMedia(data) {
  try {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(MEDIA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[themeController] Failed to save scrollyMedia:', err.message);
  }
}

function getScrollyMedia(themeId) {
  return readScrollyMedia()[themeId] || {};
}

function setScrollyMediaSlot(themeId, slot, url) {
  const all = readScrollyMedia();
  all[themeId] = { ...(all[themeId] || {}), [slot]: url };
  writeScrollyMedia(all);
  return all[themeId];
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function mergeWithDefaults(stored) {
  const byId = new Map(stored.map((t) => [t.id, t]));
  const allScrolly = readScrollyMedia();

  const defaults = DEFAULT_THEMES.map((def) => {
    const s = byId.get(def.id) || {};
    const { scrollyMedia: _ignored, ...storedWithoutScrolly } = s;
    return {
      ...def,
      ...storedWithoutScrolly,
      scrollyMedia: allScrolly[def.id] || {},
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
  const data = mergeWithDefaults(await themes.list());
  res.json({ success: true, data });
});

// POST /api/themes  — admin only
const createTheme = asyncHandler(async (req, res) => {
  const { key, title } = req.body;
  if (!key || !title) throw createHttpError(400, 'key and title are required');

  const all = mergeWithDefaults(await themes.list());
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

  // 1. Upload to ImageKit (or local fallback)
  const url = await uploadThemeMedia(dataUrl, themeId, mediaKind);

  // 2. Persist slot → url directly to scrollyMedia.json
  const updatedScrollyMedia = setScrollyMediaSlot(themeId, slot, url);

  // 3. Return updated theme
  const allThemes   = mergeWithDefaults(await themes.list());
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

  const all = readScrollyMedia();
  if (all[themeId]) {
    delete all[themeId][slot];
    writeScrollyMedia(all);
  }

  const allThemes   = mergeWithDefaults(await themes.list());
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
