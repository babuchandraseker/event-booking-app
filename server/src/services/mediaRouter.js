/**
 * mediaRouter.js
 *
 * Central media routing logic:
 *   isVideo(file)  →  uploadToCloudinary
 *   isImage(file)  →  uploadToImageKit
 *
 * This is the single source of truth for the routing decision.
 * All upload services (imagekitService) call through here instead of
 * picking a destination themselves.
 *
 * Folder conventions:
 *   Cloudinary (video):
 *     hero/videos/<panelId>
 *     themes/<themeId>/video
 *
 *   ImageKit (image):
 *     hero/images/
 *     themes/<themeId>/
 *     gallery/
 *     addons/
 */

const fs = require('fs/promises');
const path = require('path');

const {
  isEnabled:          imagekitEnabled,
  uploadToImageKit,
  deleteFromImageKit,
  buildImageUrl,
  buildVideoUrl: buildImageKitVideoUrl,
} = require('../config/imagekit');

const {
  isEnabled:           cloudinaryEnabled,
  uploadToCloudinary,
  deleteFromCloudinary,
  publicIdFromUrl,
} = require('../config/cloudinary');

// ─── MIME helpers ────────────────────────────────────────────────────────────

const VIDEO_MIMES = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/mov']);
const IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

const EXT_TO_MIME = {
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/mp4',
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp', gif: 'image/gif',
};

const EXT_BY_MIME = {
  'video/mp4': 'mp4', 'video/webm': 'webm',
  'image/jpeg': 'jpg', 'image/jpg': 'jpg',
  'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
};

function mimeFromPath(filePath) {
  const ext = path.extname(String(filePath)).toLowerCase().replace('.', '');
  return EXT_TO_MIME[ext] || 'application/octet-stream';
}

function extFromMime(mime) {
  return EXT_BY_MIME[mime] || 'bin';
}

function isVideo(mime) {
  return VIDEO_MIMES.has(mime);
}

function isImage(mime) {
  return IMAGE_MIMES.has(mime);
}

function safeName(str) {
  return String(str || 'file')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'file';
}

// ─── Core routing function ────────────────────────────────────────────────────

/**
 * Route a media upload to the correct CDN based on MIME type.
 *
 * Videos  → Cloudinary
 * Images  → ImageKit
 *
 * @param {Buffer}  buffer
 * @param {string}  mime          – MIME type of the file
 * @param {object}  opts
 * @param {string}  opts.folder   – destination folder (CDN-specific)
 * @param {string}  opts.baseName – filename / public_id base (no extension)
 * @returns {Promise<MediaUploadResult>}
 *
 * @typedef {object} MediaUploadResult
 * @property {string}       url       – final CDN URL
 * @property {string|null}  hlsUrl    – HLS playlist URL (videos only)
 * @property {string|null}  fileId    – ImageKit fileId (images only)
 * @property {string|null}  publicId  – Cloudinary public_id (videos only)
 * @property {'cloudinary'|'imagekit'|'local'} source
 */
async function routeUpload(buffer, mime, { folder, baseName }) {
  if (isVideo(mime)) {
    // ── Videos → Cloudinary ────────────────────────────────────────────────
    if (!cloudinaryEnabled) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env to upload videos.');
    }
    // IMPORTANT: pass only safeName(baseName) as publicId — do NOT include the
    // folder prefix here. When Cloudinary receives both `folder` and `public_id`,
    // it prepends folder to public_id automatically. Passing `folder/baseName`
    // as public_id produces a double-path asset (e.g. themes/romantic/themes/romantic/upload-xxx)
    // whose secure_url is valid-looking but points to a non-existent asset → 404.
    const publicId = safeName(baseName);
    const result   = await uploadToCloudinary(buffer, {
      folder,
      publicId,
      resourceType: 'video',
    });
    if (!result || !result.url) {
      throw new Error('Cloudinary upload returned no secure_url — check Cloudinary credentials and account limits');
    }
    console.log('[mediaRouter] Video → Cloudinary:', result.url);
    return {
      url:      result.url,
      hlsUrl:   result.hlsUrl || null,
      fileId:   null,
      publicId: result.publicId,
      source:   'cloudinary',
    };
  }

  if (isImage(mime)) {
    // ── Images → ImageKit ──────────────────────────────────────────────────
    if (!imagekitEnabled) {
      throw new Error('ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT in .env to upload images.');
    }
    const ext      = extFromMime(mime);
    const fileName = `${safeName(baseName)}.${ext}`;
    const result   = await uploadToImageKit(buffer, { fileName, folder, resourceType: 'image' });
    const finalUrl = buildImageUrl(result.url);
    console.log('[mediaRouter] Image → ImageKit:', finalUrl);
    return {
      url:      finalUrl,
      hlsUrl:   null,
      fileId:   result.fileId,
      name:     result.name || fileName,
      publicId: null,
      source:   'imagekit',
    };
  }

  throw Object.assign(new Error(`Unsupported MIME type: ${mime}`), { statusCode: 400 });
}

/**
 * Convenience wrapper: read a file from disk, detect MIME, and route upload.
 *
 * @param {string} filePath   – absolute path to temp file on disk
 * @param {object} opts       – same as routeUpload opts
 * @returns {Promise<MediaUploadResult>}
 */
async function routeFileUpload(filePath, { folder, baseName }) {
  const buffer = await fs.readFile(filePath);
  const mime   = mimeFromPath(filePath);
  return routeUpload(buffer, mime, { folder, baseName });
}

/**
 * Convenience wrapper: parse a base64 dataUrl, detect MIME, and route upload.
 *
 * @param {string} dataUrl    – data:<mime>;base64,<data>
 * @param {object} opts       – same as routeUpload opts
 * @returns {Promise<MediaUploadResult>}
 */
async function routeDataUrlUpload(dataUrl, { folder, baseName }) {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw Object.assign(new Error('Invalid dataUrl format'), { statusCode: 400 });

  const mime   = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  return routeUpload(buffer, mime, { folder, baseName });
}

// ─── Delete helpers ───────────────────────────────────────────────────────────

/**
 * Delete a video from Cloudinary.
 *
 * @param {string} publicId  – Cloudinary public_id, or pass a full URL and
 *                             we'll extract it automatically.
 */
async function deleteVideo(publicId) {
  if (!publicId) return;
  const id = publicId.startsWith('http') ? publicIdFromUrl(publicId) : publicId;
  if (id) await deleteFromCloudinary(id);
}

/**
 * Delete an image from ImageKit.
 *
 * @param {string} fileId  – ImageKit fileId
 */
async function deleteImage(fileId) {
  if (!fileId) return;
  await deleteFromImageKit(fileId);
}

module.exports = {
  // Core routing
  routeUpload,
  routeFileUpload,
  routeDataUrlUpload,
  // Delete helpers
  deleteVideo,
  deleteImage,
  // MIME utilities (re-exported for convenience)
  isVideo,
  isImage,
  mimeFromPath,
  extFromMime,
  safeName,
};
