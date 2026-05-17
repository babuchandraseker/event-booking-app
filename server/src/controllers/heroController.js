const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const { saveUploadedMedia } = require("../services/imageUploadService");

const heroContent = createRepository("heroContent");
const HERO_DOC_ID = "main";

const sortPanels = (panels = []) => [...panels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const normalizePanel = (panel, index = 0) => ({
  id: panel.id,
  themeKey: panel.themeKey || panel.id,
  title: panel.title || "",
  subtitle: panel.subtitle || "",
  videoUrl: panel.videoUrl || "",
  posterImage: panel.posterImage || "",
  buttonText: panel.buttonText || "Explore Experience",
  buttonLink: panel.buttonLink || "",
  isVisible: panel.isVisible !== false,
  order: typeof panel.order === "number" ? panel.order : index,
  overlay: panel.overlay || "",
  glow: panel.glow || "",
});

const normalizePanels = (panels = []) => sortPanels(panels.map(normalizePanel));

const getHeroContent = asyncHandler(async (req, res) => {
  const data = await heroContent.getById(HERO_DOC_ID);
  res.json({
    success: true,
    data: data || { id: HERO_DOC_ID, published: [], draft: [] },
  });
});

const saveHeroDraft = asyncHandler(async (req, res) => {
  const existing = await heroContent.getById(HERO_DOC_ID);
  const draft = normalizePanels(req.body.draft || []);
  const item = await heroContent.set(HERO_DOC_ID, {
    published: normalizePanels(existing?.published || []),
    draft,
  });

  res.json({ success: true, data: item });
});

const publishHeroDraft = asyncHandler(async (req, res) => {
  const draft = normalizePanels(req.body.draft || []);
  const published = draft.map((panel, index) => ({ ...panel, order: index }));
  const item = await heroContent.set(HERO_DOC_ID, {
    published,
    draft: published.map((panel) => ({ ...panel })),
  });

  res.json({ success: true, data: item });
});

const uploadHeroMedia = asyncHandler(async (req, res) => {
  const kind = req.body.kind === "video" ? "video" : "image";
  const url = await saveUploadedMedia(req.body.dataUrl, {
    folder: `hero/${kind}s`,
    maxBytes: kind === "video" ? 130 * 1024 * 1024 : 12 * 1024 * 1024,
  });

  res.status(201).json({ success: true, data: { ref: url, url } });
});

module.exports = {
  getHeroContent,
  publishHeroDraft,
  saveHeroDraft,
  uploadHeroMedia,
};
