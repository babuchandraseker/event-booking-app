const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const { requireFields } = require("../utils/validation");
const { saveUploadedMedia } = require("../services/imageUploadService");

const gallery = createRepository("gallery");

const normalizeGalleryItem = (item) => ({
  ...(item.id !== undefined ? { id: item.id } : {}),
  ...(item.src !== undefined ? { src: item.src || null } : {}),
  ...(item.alt !== undefined ? { alt: item.alt || "" } : {}),
  ...(item.title !== undefined ? { title: String(item.title || "").trim() } : {}),
  ...(item.caption !== undefined ? { caption: item.caption || "" } : {}),
  ...(item.category !== undefined ? { category: item.category || "Romantic" } : {}),
  ...(item.featured !== undefined ? { featured: item.featured === true } : {}),
  ...(item.visible !== undefined ? { visible: item.visible !== false } : {}),
  ...(item.order !== undefined ? { order: Number(item.order) || 0 } : {}),
  ...(item.addedAt !== undefined ? { addedAt: item.addedAt } : {}),
});

const listGallery = asyncHandler(async (req, res) => {
  const data = (await gallery.list()).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  res.json({ success: true, data });
});

const createGalleryItem = asyncHandler(async (req, res) => {
  requireFields(req.body, ["title", "category"]);
  const uploadedSrc = await saveUploadedMedia(req.body.imageDataUrl, {
    folder: "gallery",
    maxBytes: 12 * 1024 * 1024,
  });

  const payload = normalizeGalleryItem({
    ...req.body,
    src: uploadedSrc || req.body.src,
    visible: req.body.visible,
    featured: req.body.featured,
    addedAt: req.body.addedAt || new Date().toISOString(),
  });
  const item = payload.id
    ? await gallery.set(payload.id, payload)
    : await gallery.create(payload);

  res.status(201).json({ success: true, data: item });
});

const updateGalleryItem = asyncHandler(async (req, res) => {
  const uploadedSrc = await saveUploadedMedia(req.body.imageDataUrl, {
    folder: "gallery",
    maxBytes: 12 * 1024 * 1024,
  });
  const payload = normalizeGalleryItem({
    ...req.body,
    src: uploadedSrc || req.body.src,
  });

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  const item = await gallery.set(req.params.id, payload);

  res.json({ success: true, data: item });
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
  const deleted = await gallery.remove(req.params.id);
  if (!deleted) {
    throw createHttpError(404, "Gallery item not found");
  }

  res.json({ success: true, message: "Gallery item deleted" });
});

const resetGallery = asyncHandler(async (req, res) => {
  const current = await gallery.list();
  await Promise.all(current.map((item) => gallery.remove(item.id)));

  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const saved = [];
  for (const item of items) {
    const payload = normalizeGalleryItem(item);
    saved.push(payload.id ? await gallery.set(payload.id, payload) : await gallery.create(payload));
  }

  res.json({ success: true, data: saved });
});

module.exports = {
  createGalleryItem,
  deleteGalleryItem,
  listGallery,
  resetGallery,
  updateGalleryItem,
};
