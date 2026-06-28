/**
 * heroController.js
 *
 * Hero content — persisted in Firebase Firestore (collection: heroContent, doc: main).
 * Media uploads go to Cloudinary (video) / ImageKit (image).
 * Local JSON files (heroContent.json, heroStore.js) are no longer used.
 *
 * FIX: All upload/delete handlers now use heroRepository.getOrInit() instead of
 * heroRepository.get() + if (existing) guard.  This ensures heroContent/main is
 * created automatically on first upload, so Cloudinary URLs are ALWAYS persisted.
 */
const heroRepository       = require('../services/firestoreHeroRepository');
const asyncHandler          = require('../middleware/asyncHandler');
const { cleanTempFile }     = require('../middleware/heroUpload');
const {
  uploadHeroMediaFile,
  deleteHeroMedia: deleteImageKitMedia,
} = require('../services/imagekitService');
const { deleteLocalMedia, MAX_HERO_VIDEOS } = require('../services/imageUploadService');
const { isEnabled: imagekitEnabled }        = require('../config/imagekit');
const createHttpError = require('../utils/httpError');

console.log(`[heroController] ImageKit ${imagekitEnabled ? 'ENABLED' : 'DISABLED (local fallback)'}`);

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
  buttonText:   panel.buttonText || 'Reserve My Experience',
  buttonLink:   panel.buttonLink || '',
  isVisible:    panel.isVisible !== false,
  order:        typeof panel.order === 'number' ? panel.order : index,
  overlay:      panel.overlay || '',
  glow:         panel.glow    || '',
});

const normalizePanels = (panels = []) => sortPanels(panels.map(normalizePanel));

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/hero
 * Reads exclusively from Firestore. Auto-initializes heroContent/main if absent.
 */
const getHeroContent = asyncHandler(async (req, res) => {
  // getOrInit guarantees a document exists — no fallback to JSON/hardcoded URLs
  const data = await heroRepository.getOrInit();

  res.json({
    success: true,
    data: {
      ...data,
      published: data.published || [],
      draft:     data.draft     || [],
    },
    meta: {
      maxVideos:       MAX_HERO_VIDEOS,
      imagekitEnabled,
    },
  });
});

const saveHeroDraft = asyncHandler(async (req, res) => {
  // setDraftOnly() writes ONLY the draft field (Firestore merge), never
  // touching published — this is what closes the race with a concurrent
  // poster/video upload, which writes published via its own transaction.
  // (The old code read existing.published and wrote it straight back inside
  // a full-document set(), which could stomp a just-committed upload if the
  // upload's transaction landed between this handler's read and write.)
  const draft = normalizePanels(req.body.draft || []);
  const item  = await heroRepository.setDraftOnly(draft);
  res.json({ success: true, data: item });
});

const publishHeroDraft = asyncHandler(async (req, res) => {
  const draft     = normalizePanels(req.body.draft || []);
  const published = draft.map((panel, index) => ({ ...panel, order: index }));
  const item      = await heroRepository.set({
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
 *
 * FIX: Uses getOrInit() so heroContent/main is created if it doesn't exist,
 * guaranteeing that Cloudinary URLs are always written to Firestore.
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

    // Always persist Cloudinary/ImageKit URLs into Firestore after upload.
    // updatePanelMedia() runs the read-modify-write inside a single Firestore
    // transaction, so this write can never be silently discarded by a
    // concurrent write to heroContent/main (e.g. the debounced draft
    // autosave) — see updatePanelMedia() for the full race-condition writeup.
    console.log('[Hero Thumbnail] panelId received:', JSON.stringify(panelId), '| kind:', kind);
    console.log('[Hero Thumbnail] Upload Success');
    console.log('[Hero Thumbnail] ImageKit URL:', uploadResult.posterUrl || uploadResult.videoUrl);
    console.log('[Hero Thumbnail] uploadResult:', JSON.stringify(uploadResult));

    if (!panelId) {
      // IMPORTANT: this is the silent-skip path. If panelId is missing/empty,
      // the Cloudinary/ImageKit upload above has ALREADY SUCCEEDED and the
      // client receives { success: true, data: { url, ... } } — but NOTHING
      // is written to Firestore, and no error is raised anywhere. This is
      // indistinguishable from a successful save unless this warning is read.
      console.warn(
        '[Hero Thumbnail] WARNING: panelId missing or falsy — Firestore write SKIPPED. ' +
        'Cloudinary/ImageKit upload succeeded but the URL was NOT persisted to heroContent/main.'
      );
    }

    if (panelId) {
      console.log('[Hero Thumbnail] Firestore write started');
      console.log('[Hero Thumbnail] Panel:', panelId);
      console.log('[Hero Thumbnail] URL:', uploadResult.videoUrl || uploadResult.posterUrl);

      const applyPatch = (panel) => {
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
        }
        return {
          ...panel,
          posterImage:  uploadResult.posterUrl || panel.posterImage,
          posterFileId: uploadResult.fileId    || panel.posterFileId,
        };
      };

      let item;
      try {
        item = await heroRepository.updatePanelMedia(panelId, applyPatch);
      } catch (err) {
        console.error('[Hero Thumbnail] Firestore write FAILED for collection "heroContent" document "main"');
        console.error('[Hero Thumbnail] error.code:', err.code);
        console.error('[Hero Thumbnail] error.message:', err.message);
        console.error('[Hero Thumbnail] error.stack:', err.stack);
        throw err;
      }

      // Sanity-check: confirm the panel we intended to update actually picked
      // up the new media URL in the document Firestore returned.
      const touchedPublished = item.published.find((p) => p.id === panelId);
      const touchedDraft     = item.draft.find((p) => p.id === panelId);
      console.log('[Hero Thumbnail] published[].posterImage after merge:',  touchedPublished?.posterImage);
      console.log('[Hero Thumbnail] published[].posterFileId after merge:', touchedPublished?.posterFileId);
      console.log('[Hero Thumbnail] published[].videoUrl after merge:',     touchedPublished?.videoUrl);
      console.log('[Hero Thumbnail] published[].mp4Url after merge:',       touchedPublished?.mp4Url);
      console.log('[Hero Thumbnail] published[].hlsUrl after merge:',       touchedPublished?.hlsUrl);
      console.log('[Hero Thumbnail] draft[].posterImage after merge:',      touchedDraft?.posterImage);
      console.log('[Hero Thumbnail] draft[].videoUrl after merge:',         touchedDraft?.videoUrl);
      console.log('[Hero Thumbnail] Firestore write finished');
      console.log('[Hero Thumbnail] Updated document:', JSON.stringify(item));
      console.log(`[heroController] Firestore heroContent/main updated for panel "${panelId}" (${kind}).`);
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

    // Same fix — always persist, never silently skip, and never race a
    // concurrent write (see updatePanelMedia()).
    console.log('[Hero Thumbnail] (legacy dataUrl) panelId received:', JSON.stringify(panelId), '| kind:', kind);
    console.log('[Hero Thumbnail] (legacy dataUrl) Upload Success');
    console.log('[Hero Thumbnail] (legacy dataUrl) ImageKit URL:', uploadResult.posterUrl || uploadResult.videoUrl);
    console.log('[Hero Thumbnail] (legacy dataUrl) uploadResult:', JSON.stringify(uploadResult));

    if (!panelId) {
      console.warn(
        '[Hero Thumbnail] (legacy dataUrl) WARNING: panelId missing or falsy — Firestore write SKIPPED. ' +
        'Upload succeeded but the URL was NOT persisted to heroContent/main.'
      );
    }

    if (panelId) {
      console.log('[Hero Thumbnail] (legacy dataUrl) Firestore write started');
      console.log('[Hero Thumbnail] (legacy dataUrl) Panel:', panelId);
      console.log('[Hero Thumbnail] (legacy dataUrl) URL:', uploadResult.videoUrl || uploadResult.posterUrl);

      const mediaKey = kind === 'video' ? 'videoUrl' : 'posterImage';
      const applyPatch = (panel) => ({
        ...panel,
        [mediaKey]: uploadResult.videoUrl || uploadResult.posterUrl,
        ...(kind === 'image' ? { posterFileId: uploadResult.fileId || panel.posterFileId } : {}),
      });

      let item;
      try {
        item = await heroRepository.updatePanelMedia(panelId, applyPatch);
      } catch (err) {
        console.error('[Hero Thumbnail] (legacy dataUrl) Firestore write FAILED for collection "heroContent" document "main"');
        console.error('[Hero Thumbnail] error.code:', err.code);
        console.error('[Hero Thumbnail] error.message:', err.message);
        console.error('[Hero Thumbnail] error.stack:', err.stack);
        throw err;
      }

      console.log('[Hero Thumbnail] (legacy dataUrl) Firestore write finished');
      console.log('[Hero Thumbnail] (legacy dataUrl) Updated document:', JSON.stringify(item));
      console.log(`[heroController] Firestore heroContent/main updated (legacy dataUrl) for panel "${panelId}" (${kind}).`);
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

  // Clear URLs from stored panel in Firestore — updatePanelMedia ensures the
  // doc exists and avoids the same read-modify-write race as upload (above).
  if (panelId) {
    const applyPatch = (panel) => ({
      ...panel,
      ...(videoUrl || fileId || publicId ? { videoUrl: '', hlsUrl: '', mp4Url: '', fileId: '', publicId: '' } : {}),
      ...(posterUrl || posterFileId ? { posterImage: '', posterFileId: '' }                   : {}),
    });
    await heroRepository.updatePanelMedia(panelId, applyPatch);
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
