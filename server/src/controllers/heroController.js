/**
 * heroController.js
 *
 * Hero content — loaded from local JSON (heroContent.json).
 * Media uploads go to ImageKit when configured; falls back to local storage.
 */
const createRepository   = require('../services/localRepository');
const asyncHandler        = require('../middleware/asyncHandler');
const { cleanTempFile }   = require('../middleware/heroUpload');
const {
  uploadHeroMediaFile,
  deleteHeroMedia: deleteImageKitMedia,
} = require('../services/imagekitService');
const { deleteLocalMedia, MAX_HERO_VIDEOS } = require('../services/imageUploadService');
const { isEnabled: imagekitEnabled }        = require('../config/imagekit');
const createHttpError = require('../utils/httpError');

console.log(`[heroController] ImageKit ${imagekitEnabled ? 'ENABLED' : 'DISABLED (local fallback)'}`);

const heroContent = createRepository('heroContent');
const HERO_DOC_ID = 'main';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sortPanels = (panels = []) =>
  [...panels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const normalizePanel = (panel, index = 0) => ({
  id:           panel.id,
  themeKey:     panel.themeKey || panel.id,
  title:        panel.title    || '',
  subtitle:     panel.subtitle || '',
  videoUrl:     panel.videoUrl     || '',
  hlsUrl:       panel.hlsUrl       || '',
  mp4Url:       panel.mp4Url       || '',
  posterImage:  panel.posterImage  || '',
  fileId:       panel.fileId       || '',       // ImageKit fileId (poster image)
  publicId:     panel.publicId     || '',       // Cloudinary public_id (video)
  posterFileId: panel.posterFileId || '',       // ImageKit fileId for poster
  buttonText:   panel.buttonText || 'Explore Experience',
  buttonLink:   panel.buttonLink || '',
  isVisible:    panel.isVisible !== false,
  order:        typeof panel.order === 'number' ? panel.order : index,
  overlay:      panel.overlay || '',
  glow:         panel.glow    || '',
});

const normalizePanels = (panels = []) => sortPanels(panels.map(normalizePanel));

// ─── Route Handlers ───────────────────────────────────────────────────────────

const getHeroContent = asyncHandler(async (req, res) => {
  const data   = await heroContent.getById(HERO_DOC_ID);
  const result = data || { id: HERO_DOC_ID, published: [], draft: [] };

  res.json({
    success: true,
    data: {
      ...result,
      published: result.published || [],
      draft:     result.draft     || [],
    },
    meta: {
      maxVideos:       MAX_HERO_VIDEOS,
      imagekitEnabled,
    },
  });
});

const saveHeroDraft = asyncHandler(async (req, res) => {
  const existing = await heroContent.getById(HERO_DOC_ID);
  const draft    = normalizePanels(req.body.draft || []);
  const item     = await heroContent.set(HERO_DOC_ID, {
    published: normalizePanels(existing?.published || []),
    draft,
  });
  res.json({ success: true, data: item });
});

const publishHeroDraft = asyncHandler(async (req, res) => {
  const draft     = normalizePanels(req.body.draft || []);
  const published = draft.map((panel, index) => ({ ...panel, order: index }));
  const item      = await heroContent.set(HERO_DOC_ID, {
    published,
    draft: published.map((p) => ({ ...p })),
  });
  res.json({ success: true, data: item });
});

/**
 * POST /api/hero/media
 * Accepts multipart/form-data with fields:
 *   file     – the media file (multer handled by router)
 *   kind     – "video" | "image"
 *   panelId  – panel ID for deterministic naming
 *
 * Also still accepts the legacy base64 dataUrl body for backward compat.
 */
const uploadHeroMedia = asyncHandler(async (req, res) => {
  const kind    = req.body.kind === 'video' ? 'video' : 'image';
  const panelId = req.body.panelId || null;

  // ── Multipart file upload (preferred) ────────────────────────────────────
  if (req.file) {
    let uploadResult;
    try {
      uploadResult = await uploadHeroMediaFile(req.file.path, { kind, panelId });
    } catch (err) {
      cleanTempFile(req);
      throw err;
    }

    // Persist ImageKit URLs + fileId into the stored panel
    if (panelId) {
      const existing = await heroContent.getById(HERO_DOC_ID);
      if (existing) {
        const updatePanels = (panels = []) =>
          panels.map((panel) => {
            if (panel.id !== panelId) return panel;
            if (kind === 'video') {
              return {
                ...panel,
                videoUrl: uploadResult.videoUrl  || panel.videoUrl,
                hlsUrl:   uploadResult.hlsUrl    || '',
                mp4Url:   uploadResult.mp4Url    || '',
                publicId: uploadResult.publicId  || panel.publicId || '',
                fileId:   '',  // video no longer has an IK fileId
                posterImage: panel.posterImage || uploadResult.posterUrl || '',
              };
            } else {
              return {
                ...panel,
                posterImage:  uploadResult.posterUrl || panel.posterImage,
                posterFileId: uploadResult.fileId    || panel.posterFileId,
              };
            }
          });
        await heroContent.set(HERO_DOC_ID, {
          published: updatePanels(existing.published),
          draft:     updatePanels(existing.draft),
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        url:       uploadResult.videoUrl || uploadResult.posterUrl,
        ref:       uploadResult.videoUrl || uploadResult.posterUrl,
        hlsUrl:    uploadResult.hlsUrl,
        mp4Url:    uploadResult.mp4Url,
        posterUrl: uploadResult.posterUrl,
        fileId:    uploadResult.fileId,
        source:    uploadResult.source,
      },
    });
  }

  // ── Legacy base64 dataUrl body (backward compat) ─────────────────────────
  if (req.body.dataUrl) {
    const os   = require('os');
    const path = require('path');
    const fs   = require('fs/promises');

    const match = String(req.body.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw createHttpError(400, 'Invalid dataUrl format');

    const mime    = match[1];
    const ext     = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
    const tmpPath = path.join(os.tmpdir(), `hero-legacy-${Date.now()}.${ext}`);
    await fs.writeFile(tmpPath, Buffer.from(match[2], 'base64'));

    let uploadResult;
    try {
      uploadResult = await uploadHeroMediaFile(tmpPath, { kind, panelId });
    } catch (err) {
      await fs.unlink(tmpPath).catch(() => {});
      throw err;
    }

    if (panelId) {
      const existing = await heroContent.getById(HERO_DOC_ID);
      if (existing) {
        const mediaKey = kind === 'video' ? 'videoUrl' : 'posterImage';
        const updatePanels = (panels = []) =>
          panels.map((p) => p.id === panelId ? { ...p, [mediaKey]: uploadResult.videoUrl || uploadResult.posterUrl } : p);
        await heroContent.set(HERO_DOC_ID, {
          published: updatePanels(existing.published),
          draft:     updatePanels(existing.draft),
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        url:    uploadResult.videoUrl || uploadResult.posterUrl,
        ref:    uploadResult.videoUrl || uploadResult.posterUrl,
        hlsUrl: uploadResult.hlsUrl,
        mp4Url: uploadResult.mp4Url,
        source: uploadResult.source,
      },
    });
  }

  throw createHttpError(400, 'No file or dataUrl provided');
});

/**
 * POST /api/hero/delete-media
 */
const deleteHeroMedia = asyncHandler(async (req, res) => {
  const { panelId, posterUrl, videoUrl, fileId, posterFileId, publicId, kind } = req.body;

  if (!posterUrl && !videoUrl && !fileId && !posterFileId && !publicId) {
    throw createHttpError(400, 'videoUrl, posterUrl, fileId, publicId, or posterFileId is required');
  }

  // Delete video from Cloudinary (publicId) or ImageKit (fileId) or local
  if (publicId) {
    await deleteImageKitMedia({ publicId, kind: 'video' });
  } else if (fileId) {
    await deleteImageKitMedia({ fileId, kind: kind || 'video' });
  } else {
    if (videoUrl) await deleteLocalMedia(videoUrl).catch(() => {});
  }
  if (posterFileId) {
    await deleteImageKitMedia({ fileId: posterFileId, kind: 'image' });
  } else {
    if (posterUrl) await deleteLocalMedia(posterUrl).catch(() => {});
  }

  // Clear URLs from stored panel
  if (panelId) {
    const existing = await heroContent.getById(HERO_DOC_ID);
    if (existing) {
      const clearMedia = (panels = []) =>
        panels.map((panel) => {
          if (panel.id !== panelId) return panel;
          return {
            ...panel,
            ...(videoUrl || fileId || publicId ? { videoUrl: '', hlsUrl: '', mp4Url: '', fileId: '', publicId: '' } : {}),
            ...(posterUrl || posterFileId ? { posterImage: '', posterFileId: '' }                   : {}),
          };
        });
      await heroContent.set(HERO_DOC_ID, {
        published: clearMedia(existing.published),
        draft:     clearMedia(existing.draft),
      });
    }
  }

  res.json({ success: true, message: 'Hero media deleted' });
});

module.exports = {
  getHeroContent,
  publishHeroDraft,
  saveHeroDraft,
  uploadHeroMedia,
  deleteHeroMedia,
};
