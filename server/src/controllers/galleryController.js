// Gallery is persisted in Firestore (collection: "gallery", one document per item),
// using the same shared repository as packages/addons/bookings.
const createRepository = require('../services/repository');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../utils/validation');
const {
  uploadGalleryImage,
  deleteGalleryFile,
} = require('../services/imagekitService');
const { MAX_GALLERY_ITEMS } = require('../services/imageUploadService');
const createHttpError = require('../utils/httpError');

const gallery = createRepository('gallery');

const normalizeGalleryItem = (item) => ({
  ...(item.id       !== undefined ? { id:       item.id }                                 : {}),
  ...(item.src      !== undefined ? { src:      item.src || null }                        : {}),
  ...(item.fileId   !== undefined ? { fileId:   item.fileId || null }                     : {}),
  ...(item.alt      !== undefined ? { alt:      item.alt || '' }                          : {}),
  ...(item.title    !== undefined ? { title:    String(item.title || '').trim() }         : {}),
  ...(item.caption  !== undefined ? { caption:  item.caption || '' }                      : {}),
  ...(item.category !== undefined ? { category: item.category || 'Romantic' }             : {}),
  ...(item.featured !== undefined ? { featured: item.featured === true }                  : {}),
  ...(item.visible  !== undefined ? { visible:  item.visible !== false }                  : {}),
  ...(item.order    !== undefined ? { order:    Number(item.order) || 0 }                 : {}),
  ...(item.addedAt  !== undefined ? { addedAt:  item.addedAt }                            : {}),
});

const listGallery = asyncHandler(async (req, res) => {
  const data = (await gallery.list()).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  res.json({ success: true, data, meta: { count: data.length, max: MAX_GALLERY_ITEMS } });
});

const createGalleryItem = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'category']);
  const existing = await gallery.list();
  if (existing.length >= MAX_GALLERY_ITEMS) {
    throw createHttpError(400, `Maximum ${MAX_GALLERY_ITEMS} gallery items allowed. Delete an existing item first.`);
  }

  const { url: uploadedSrc, fileId } = await uploadGalleryImage(req.body.imageDataUrl, {
    currentCount: existing.length,
  });

  const payload = normalizeGalleryItem({
    ...req.body,
    src:     uploadedSrc || req.body.src,
    fileId:  fileId || req.body.fileId || null,
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
  const existing = await gallery.getById(req.params.id);
  const { url: uploadedSrc, fileId } = await uploadGalleryImage(req.body.imageDataUrl, {
    oldSrc:    existing?.src,
    oldFileId: existing?.fileId,
  });
  const payload = normalizeGalleryItem({
    ...req.body,
    src:    uploadedSrc || req.body.src,
    fileId: fileId      || existing?.fileId || null,
  });

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  const item = await gallery.set(req.params.id, payload);
  res.json({ success: true, data: item });
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item    = await gallery.getById(req.params.id);
  const deleted = await gallery.remove(req.params.id);
  if (!deleted) {
    throw createHttpError(404, 'Gallery item not found');
  }
  if (item) {
    await deleteGalleryFile({ fileId: item.fileId, src: item.src });
  }
  res.json({ success: true, message: 'Gallery item deleted' });
});

const resetGallery = asyncHandler(async (req, res) => {
  const current = await gallery.list();
  await Promise.all(
    current.map(async (item) => {
      await gallery.remove(item.id);
      await deleteGalleryFile({ fileId: item.fileId, src: item.src });
    }),
  );

  const items = Array.isArray(req.body.items) ? req.body.items.slice(0, MAX_GALLERY_ITEMS) : [];
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
