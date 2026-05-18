const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");

const themes = createRepository("themes");

// Built-in theme IDs that cannot be deleted
const BUILTIN_IDS = new Set(["romantic", "birthday", "surprise"]);

const DEFAULT_THEMES = [
  {
    id: "romantic",
    key: "romantic",
    title: "Heart Theme",
    tag: "🌹 Romantic",
    desc: "An intimate escape draped in petals, soft candlelight, and whispered elegance. Perfect for proposals, anniversaries, and heartfelt date nights.",
    features: ["Candles", "Rose petals", "Music"],
    img: "/themes/romantic/romantic1.jpg",
    videoSrc: "/themes/romantic/romantic.mp4",
    emoji: "",
    active: true,
  },
  {
    id: "birthday",
    key: "birthday",
    title: "Balloon Theme",
    tag: "🎉 Birthday",
    desc: "Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory worth celebrating.",
    features: ["Balloons", "Custom banner", "Cake"],
    img: "",
    videoSrc: "/themes/birthday/bday.mp4",
    emoji: "🎂",
    active: true,
  },
  {
    id: "surprise",
    key: "surprise",
    title: "Partition Theme",
    tag: "✨ Surprise",
    desc: "A perfectly orchestrated surprise that leaves them breathless. We coordinate every detail in complete secrecy — you just show up and enjoy.",
    features: ["Secret setup", "Reveal décor", "Timing"],
    img: "",
    videoSrc: "/themes/surprise/surprise.mp4",
    emoji: "🎁",
    active: true,
  },
];

function mergeWithDefaults(stored) {
  const byId = new Map(stored.map((t) => [t.id, t]));
  const defaults = DEFAULT_THEMES.map((def) => ({ ...def, ...(byId.get(def.id) || {}) }));
  const custom = stored.filter((t) => !BUILTIN_IDS.has(t.id));
  return [...defaults, ...custom];
}

function normalizeTheme(body) {
  const features = Array.isArray(body.features)
    ? body.features
    : typeof body.features === "string"
    ? body.features.split(",").map((f) => f.trim()).filter(Boolean)
    : [];

  return {
    ...(body.key !== undefined ? { key: String(body.key).trim().toLowerCase() } : {}),
    ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
    ...(body.tag !== undefined ? { tag: String(body.tag).trim() } : {}),
    ...(body.desc !== undefined ? { desc: String(body.desc).trim() } : {}),
    ...(body.img !== undefined ? { img: String(body.img).trim() } : {}),
    ...(body.videoSrc !== undefined ? { videoSrc: String(body.videoSrc).trim() } : {}),
    ...(body.emoji !== undefined ? { emoji: String(body.emoji).trim() } : {}),
    ...(body.active !== undefined ? { active: body.active !== false } : {}),
    features,
  };
}

// GET /api/themes
const listThemes = asyncHandler(async (req, res) => {
  const data = mergeWithDefaults(await themes.list());
  res.json({ success: true, data });
});

// POST /api/themes  (admin only)
const createTheme = asyncHandler(async (req, res) => {
  const { key, title } = req.body;
  if (!key || !title) {
    throw createHttpError(400, "key and title are required");
  }
  const all = mergeWithDefaults(await themes.list());
  if (all.some((t) => t.key === key.toLowerCase())) {
    throw createHttpError(409, `A theme with key "${key}" already exists`);
  }

  const item = await themes.create({
    id: key.toLowerCase(),
    ...normalizeTheme(req.body),
  });
  res.status(201).json({ success: true, data: item });
});

// PATCH /api/themes/:id  (admin only)
const updateTheme = asyncHandler(async (req, res) => {
  const payload = normalizeTheme(req.body);

  const item = BUILTIN_IDS.has(req.params.id)
    ? await themes.set(req.params.id, payload)
    : await themes.update(req.params.id, payload);

  if (!item) {
    throw createHttpError(404, "Theme not found");
  }
  res.json({ success: true, data: item });
});

// DELETE /api/themes/:id  (admin only)
const deleteTheme = asyncHandler(async (req, res) => {
  if (BUILTIN_IDS.has(req.params.id)) {
    throw createHttpError(403, "Built-in themes cannot be deleted. You can hide them by setting active=false.");
  }
  const deleted = await themes.remove(req.params.id);
  if (!deleted) {
    throw createHttpError(404, "Theme not found");
  }
  res.json({ success: true, message: "Theme deleted" });
});

module.exports = { listThemes, createTheme, updateTheme, deleteTheme };