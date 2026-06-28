/**
 * imagekitService.js
 *
 * Media upload facade — delegates to mediaRouter for CDN selection:
 *   Videos  → Cloudinary  (hero videos, theme videos)
 *   Images  → ImageKit    (hero thumbnails, theme images, gallery images)
 *
 * Falls back to local storage when the required CDN is not configured.
 *
 * Folder conventions:
 *   Cloudinary: hero/videos/, themes/<themeId>/
 *   ImageKit:   hero/images/, themes/<themeId>/, gallery/, addons/
 */

const fs   = require('fs/promises');
const path = require('path');

const {
  routeFileUpload,
  routeDataUrlUpload,
  deleteVideo,
  deleteImage,
  mimeFromPath,
  isVideo: isMimeVideo,
  safeName,
} = require('./mediaRouter');

const {
  deleteFromImageKit,
  buildImageUrl,
  buildVideoUrl,
  isEnabled: imagekitEnabled,
} = require('../config/imagekit');

const { isEnabled: cloudinaryEnabled } = require('../config/cloudinary');
const { saveHeroMedia, deleteLocalMedia, MAX_HERO_VIDEOS } = require('./imageUploadService');

// ─── Hero media ───────────────────────────────────────────────────────────────

/**
 * Upload hero media from a multer temp file.
 *
 * kind === 'video' → Cloudinary
 * kind === 'image' → ImageKit
 *
 * Returns { videoUrl, mp4Url, hlsUrl, posterUrl, fileId, publicId, source }
 */
async function uploadHeroMediaFile(tempFilePath, { kind = 'video', panelId = null } = {}) {
  // Derive isVid from the actual file MIME — not the caller-supplied `kind` string.
  // This ensures the routing decision and result-unpacking always agree with what
  // mediaRouter will do internally.
  const fileMime = mimeFromPath(tempFilePath);
  const isVid    = isMimeVideo(fileMime);
  const folder   = isVid ? 'hero/videos' : 'hero/images';
  const baseName = panelId ? safeName(panelId) : `hero-${Date.now()}`;
  const cdnReady = isVid ? cloudinaryEnabled : imagekitEnabled;

  // ── CDN upload ─────────────────────────────────────────────────────────────
  if (cdnReady) {
    try {
      const result = await routeFileUpload(tempFilePath, { folder, baseName });
      await fs.unlink(tempFilePath).catch(() => {});

      if (isVid) {
        return {
          videoUrl:  result.url,
          mp4Url:    result.url,
          hlsUrl:    result.hlsUrl || null,
          posterUrl: null,
          fileId:    null,
          publicId:  result.publicId,
          source:    'cloudinary',
        };
      } else {
        return {
          videoUrl:  null,
          mp4Url:    null,
          hlsUrl:    null,
          posterUrl: result.url,
          fileId:    result.fileId,
          publicId:  null,
          source:    'imagekit',
        };
      }
    } catch (err) {
      console.error('[imagekitService] CDN upload failed, trying local fallback:', err.message);
    }
  }

  // ── Local fallback ─────────────────────────────────────────────────────────
  const buffer  = await fs.readFile(tempFilePath);
  await fs.unlink(tempFilePath).catch(() => {});

  const dataUrl = `data:${fileMime};base64,${buffer.toString('base64')}`;
  // Pass original `kind` to saveHeroMedia so it applies the right size/type validation
  const url     = await saveHeroMedia(dataUrl, kind, { panelId });

  return {
    videoUrl:  isVid ? url : null,
    mp4Url:    isVid ? url : null,
    hlsUrl:    null,
    posterUrl: isVid ? null : url,
    fileId:    null,
    publicId:  null,
    source:    'local',
  };
}

/**
 * Delete hero media from Cloudinary / ImageKit / local.
 *
 * @param {object} opts
 * @param {string}  [opts.publicId]   – Cloudinary public_id (videos)
 * @param {string}  [opts.fileId]     – ImageKit fileId (images)
 * @param {string}  [opts.videoUrl]   – fallback URL for local delete
 * @param {string}  [opts.posterUrl]  – fallback URL for local delete
 * @param {'video'|'image'} [opts.kind]
 */
async function deleteHeroMedia({ publicId, fileId, videoUrl, posterUrl, kind = 'video' }) {
  if (kind === 'video' && publicId) {
    await deleteVideo(publicId);
  } else if (kind === 'image' && fileId) {
    await deleteImage(fileId);
  } else {
    // Legacy / local fallback
    if (fileId)    await deleteFromImageKit(fileId).catch(() => {});
    if (videoUrl)  await deleteLocalMedia(videoUrl).catch(() => {});
    if (posterUrl) await deleteLocalMedia(posterUrl).catch(() => {});
  }
}

// ─── Theme media ──────────────────────────────────────────────────────────────

/**
 * Upload theme media from a base64 dataUrl.
 *
 * Videos  → Cloudinary  (under themes/<themeId>/)
 * Images  → ImageKit    (under themes/<themeId>/)
 *
 * @param {string} dataUrl
 * @param {string} themeId   – e.g. "romantic"
 * @param {'image'|'video'} mediaKind
 * @returns {Promise<string>} CDN URL
 */
async function uploadThemeMedia(dataUrl, themeId, mediaKind) {
  if (!dataUrl) return null;

  // Parse the actual MIME from the dataUrl — do not trust the caller-supplied mediaKind string.
  // This ensures mediaRouter's routing decision matches our cdnReady gate and fallback logic.
  const mimeMatch = String(dataUrl).match(/^data:([^;]+);base64,/);
  if (!mimeMatch) throw Object.assign(new Error('Invalid dataUrl format'), { statusCode: 400 });

  const actualMime = mimeMatch[1];
  const isVid      = isMimeVideo(actualMime);
  const folder     = `themes/${safeName(themeId)}`;
  const baseName   = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cdnReady   = isVid ? cloudinaryEnabled : imagekitEnabled;

  if (cdnReady) {
    try {
      const result = await routeDataUrlUpload(dataUrl, { folder, baseName });
      // Always use the CDN-returned secure_url — never construct URLs manually.
      if (!result || !result.url) {
        throw new Error('CDN upload returned no URL — upload may have silently failed');
      }
      return result.url;
    } catch (err) {
      console.error('[imagekitService] Theme CDN upload failed:', err.message);
      // For videos, do NOT fall through to local storage — Cloudinary is required.
      if (isVid) throw err;
      // For images, fall through to local storage below.
    }
  }

  // Image-only local fallback — videos must go through Cloudinary.
  if (isVid) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env to upload theme videos.');
  }

  const { saveToClientPublic } = require('./imageUploadService');
  return saveToClientPublic(dataUrl, themeId, mediaKind);
}

// ─── Gallery media ────────────────────────────────────────────────────────────

/**
 * Upload a gallery IMAGE from a base64 dataUrl → ImageKit (gallery/).
 *
 * Gallery only stores images; videos are never in the gallery.
 *
 * @param {string} dataUrl
 * @param {object} opts
 * @param {number} [opts.currentCount]
 * @param {string} [opts.oldSrc]
 * @param {string} [opts.oldFileId]
 * @returns {Promise<{url, fileId}>}
 */
async function uploadGalleryImage(dataUrl, { currentCount = 0, oldSrc = null, oldFileId = null } = {}) {
  if (!dataUrl) return { url: null, fileId: null };

  const MAX_GALLERY_ITEMS = 7;
  if (!oldSrc && !oldFileId && currentCount >= MAX_GALLERY_ITEMS) {
    const err = new Error(`Maximum ${MAX_GALLERY_ITEMS} gallery items allowed.`);
    err.statusCode = 400;
    throw err;
  }

  const baseName = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (imagekitEnabled) {
    try {
      // Delete old ImageKit file if replacing
      if (oldFileId) await deleteFromImageKit(oldFileId).catch(() => {});

      const result = await routeDataUrlUpload(dataUrl, { folder: 'gallery', baseName });
      return { url: result.url, fileId: result.fileId };
    } catch (err) {
      console.error('[imagekitService] Gallery ImageKit upload failed, trying local fallback:', err.message);
    }
  }

  // Local fallback
  const { saveGalleryImage } = require('./imageUploadService');
  const url = await saveGalleryImage(dataUrl, { currentCount, oldSrc });
  return { url, fileId: null };
}

/**
 * Delete a gallery image from ImageKit (or local fallback).
 */
async function deleteGalleryFile({ fileId, src }) {
  if (imagekitEnabled && fileId) {
    await deleteFromImageKit(fileId).catch(() => {});
    return;
  }
  if (src) {
    await deleteLocalMedia(src).catch(() => {});
  }
}

// ─── Addon media ──────────────────────────────────────────────────────────────

/**
 * Upload addon media from a base64 dataUrl.
 * Addons are always images → ImageKit.
 */
async function uploadAddonMedia(dataUrl, { name = 'addon', mediaKind = 'image' } = {}) {
  if (!dataUrl) return { url: null, fileId: null };

  // Parse actual MIME from the dataUrl so cdnReady matches what mediaRouter will do.
  const mimeMatch = String(dataUrl).match(/^data:([^;]+);base64,/);
  if (!mimeMatch) throw Object.assign(new Error('Invalid dataUrl format'), { statusCode: 400 });

  const actualMime = mimeMatch[1];
  const isVid      = isMimeVideo(actualMime);
  const baseName   = `${safeName(name)}-${Date.now()}`;
  const cdnReady   = isVid ? cloudinaryEnabled : imagekitEnabled;

  if (cdnReady) {
    try {
      const result = await routeDataUrlUpload(dataUrl, { folder: 'addons', baseName });
      return { url: result.url, fileId: result.fileId || null, name: result.name || baseName };
    } catch (err) {
      console.error('[imagekitService] Addon CDN upload failed, trying local fallback:', err.message);
    }
  }

  // Local fallback
  const { saveUploadedMedia } = require('./imageUploadService');
  const url = await saveUploadedMedia(dataUrl, { folder: 'addons' });
  return { url, fileId: null, name: url ? path.basename(url) : null };
}

// ─── Generic upload (used by external callers) ────────────────────────────────

/**
 * Upload any media Buffer — delegates to mediaRouter.
 * Maintained for backward compatibility with any direct callers.
 */
async function uploadMedia(source, { resourceType = 'image', folder, baseName, mime }) {
  let buffer;
  let resolvedMime = mime;

  if (Buffer.isBuffer(source)) {
    buffer = source;
  } else {
    buffer = await fs.readFile(source);
    if (!resolvedMime) resolvedMime = mimeFromPath(String(source));
  }

  const { routeUpload } = require('./mediaRouter');
  return routeUpload(buffer, resolvedMime, { folder, baseName });
}

module.exports = {
  uploadHeroMediaFile,
  deleteHeroMedia,
  uploadThemeMedia,
  uploadGalleryImage,
  deleteGalleryFile,
  uploadAddonMedia,
  uploadMedia,
  // Re-export for callers that import deleteFromImageKit directly
  deleteFromImageKit,
};
