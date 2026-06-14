const fs = require("fs/promises");
const path = require("path");
const { bucket, isFirebaseStorageEnabled } = require("../config/firebase");

const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const PUBLIC_UPLOAD_PATH = "/uploads";

const ALLOWED_GALLERY_MIME = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_HERO_VIDEO_MIME = ["video/mp4", "video/webm"];
const ALLOWED_HERO_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/;
const MEDIA_DATA_URL_PATTERN =
  /^data:((?:image\/(?:png|jpe?g|webp|gif))|(?:video\/(?:mp4|webm)));base64,([A-Za-z0-9+/=]+)$/;

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_MEDIA_BYTES = 130 * 1024 * 1024;
const MAX_GALLERY_BYTES = 5 * 1024 * 1024;
const MAX_HERO_VIDEO_BYTES = 30 * 1024 * 1024;
const MAX_HERO_IMAGE_BYTES = 12 * 1024 * 1024; // matches admin UI 12 MB limit
const MAX_GALLERY_ITEMS = 7;
const MAX_HERO_VIDEOS = 3;

function generateFilename(mime, prefix = "upload") {
  const ext = EXT_BY_MIME[mime] || "bin";
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/**
 * Generate a deterministic (stable) filename for a hero media asset.
 * Uses panelId as the base — each theme always gets the same filename, so
 * uploading a new file naturally overwrites the old one with no duplicates.
 * e.g. "romantic.mp4", "birthday.jpg", "surprise.webp"
 */
function deterministicHeroFilename(mime, panelId) {
  const ext = EXT_BY_MIME[mime] || "bin";
  const safeId = String(panelId || "hero")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "hero";
  return `${safeId}.${ext}`;
}

/**
 * Delete all existing hero media files for a given panelId in the target folder.
 * Removes any extension variant so old files (romantic.mp4, romantic.webm, etc.)
 * are fully cleaned up before writing the new file.
 */
async function deleteExistingHeroFiles(folder, panelId) {
  const dir = path.join(UPLOAD_DIR, folder);
  try {
    const files = await fs.readdir(dir);
    const safeId = String(panelId || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!safeId) return;
    for (const file of files) {
      if (path.parse(file).name === safeId) {
        await deleteLocalFile(path.join(dir, file)).catch(() => {});
      }
    }
  } catch {
    // Directory may not exist yet — that's fine
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

const publicUrlToLocalPath = (publicUrl) => {
  if (!publicUrl || typeof publicUrl !== "string") return null;
  const relative = publicUrl.replace(/^https?:\/\/[^/]+/, "");
  if (!relative.startsWith(PUBLIC_UPLOAD_PATH)) return null;
  const stripped = relative.slice(PUBLIC_UPLOAD_PATH.length).replace(/^\/+/, "");
  const resolved = path.resolve(UPLOAD_DIR, stripped);
  return resolved.startsWith(UPLOAD_DIR) ? resolved : null;
};

async function deleteLocalFile(localPath) {
  try {
    await fs.unlink(localPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const deleteLocalMedia = async (publicUrl) => {
  const localPath = publicUrlToLocalPath(publicUrl);
  if (!localPath) return;
  console.log("[galleryStore] Deleting local file:", localPath);
  await deleteLocalFile(localPath);
};

async function listHeroVideoFiles() {
  const dir = path.join(UPLOAD_DIR, "hero/videos");
  try {
    const files = await fs.readdir(dir);
    return files.filter((file) => /\.(mp4|webm)$/i.test(file));
  } catch {
    return [];
  }
}

const cleanOrphanHeroVideos = async (knownVideoUrls = []) => {
  const dir = path.join(UPLOAD_DIR, "hero/videos");
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    return;
  }

  const knownFilenames = new Set(
    knownVideoUrls
      .map((url) => {
        const localPath = publicUrlToLocalPath(url);
        return localPath ? path.basename(localPath) : null;
      })
      .filter(Boolean)
  );

  for (const file of files) {
    if (!/\.(mp4|webm)$/i.test(file) || knownFilenames.has(file)) continue;
    await deleteLocalFile(path.join(dir, file)).catch(() => {});
  }
};

const parseDataUrl = (dataUrl, pattern, message) => {
  const match = String(dataUrl || "").match(pattern);
  if (!match) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
};

const assertMaxBytes = (buffer, maxBytes, message) => {
  if (buffer.length <= maxBytes) return;
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const saveBuffer = async (buffer, mime, folder, { prefix = "upload", contentType = mime, filename = null } = {}) => {
  const safeFolder = String(folder || "").replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
  const finalFilename = filename || generateFilename(mime, prefix);

  if (isFirebaseStorageEnabled) {
    const storagePath = safeFolder ? `${safeFolder}/${finalFilename}` : finalFilename;
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000",
      },
      resumable: false,
    });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  }

  const dir = safeFolder ? path.join(UPLOAD_DIR, safeFolder) : UPLOAD_DIR;
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, finalFilename), buffer);
  return safeFolder ? `${PUBLIC_UPLOAD_PATH}/${safeFolder}/${finalFilename}` : `${PUBLIC_UPLOAD_PATH}/${finalFilename}`;
};

const saveReviewImage = async (dataUrl) => {
  if (!dataUrl) return null;

  const { mime, buffer } = parseDataUrl(
    dataUrl,
    DATA_URL_PATTERN,
    "image must be a png, jpg, jpeg, or webp file"
  );
  assertMaxBytes(buffer, MAX_IMAGE_BYTES, "image must be 4MB or smaller");

  return saveBuffer(buffer, mime, "", { prefix: "review" });
};

const saveUploadedMedia = async (dataUrl, { folder = "media", maxBytes = MAX_MEDIA_BYTES } = {}) => {
  if (!dataUrl) return null;

  const { mime, buffer } = parseDataUrl(
    dataUrl,
    MEDIA_DATA_URL_PATTERN,
    "media must be a png, jpg, jpeg, webp, gif, mp4, or webm file"
  );
  assertMaxBytes(buffer, maxBytes, `media must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller`);

  return saveBuffer(buffer, mime, folder);
};

const saveGalleryImage = async (dataUrl, { currentCount = 0, oldSrc = null } = {}) => {
  if (!dataUrl) return null;
  if (!oldSrc && currentCount >= MAX_GALLERY_ITEMS) {
    const error = new Error(`Maximum ${MAX_GALLERY_ITEMS} gallery items allowed. Delete an existing item first.`);
    error.statusCode = 400;
    throw error;
  }

  const { mime, buffer } = parseDataUrl(
    dataUrl,
    DATA_URL_PATTERN,
    "Gallery images must be JPG, JPEG, PNG, or WebP."
  );
  if (!ALLOWED_GALLERY_MIME.includes(mime)) {
    const error = new Error("Gallery images must be JPG, JPEG, PNG, or WebP.");
    error.statusCode = 400;
    throw error;
  }
  assertMaxBytes(buffer, MAX_GALLERY_BYTES, "Gallery images must be 5MB or smaller.");

  const url = await saveBuffer(buffer, mime, "gallery");
  if (oldSrc) await deleteLocalMedia(oldSrc).catch(() => {});
  return url;
};

/**
 * Save a hero media file using a deterministic filename derived from panelId.
 *
 * Fix: Use stable filenames (e.g. romantic.mp4) so each theme always has
 * exactly ONE file.  All existing files for that panelId+folder are deleted
 * before writing the new one, preventing duplicates.
 *
 * @param {string} dataUrl  - base64 data URL of the file
 * @param {"video"|"image"} kind
 * @param {{ currentVideoCount?: number, oldUrl?: string|null, panelId?: string|null }} opts
 */
const saveHeroMedia = async (dataUrl, kind, { currentVideoCount = 0, oldUrl = null, panelId = null } = {}) => {
  if (!dataUrl) return null;

  const isVideo = kind === "video";
  if (isVideo && !oldUrl && !panelId && currentVideoCount >= MAX_HERO_VIDEOS) {
    const error = new Error(`Maximum ${MAX_HERO_VIDEOS} hero videos allowed. Delete an existing video first.`);
    error.statusCode = 400;
    throw error;
  }

  const { mime, buffer } = parseDataUrl(
    dataUrl,
    MEDIA_DATA_URL_PATTERN,
    isVideo
      ? "Hero videos must be MP4 or WebM. Only mp4 and webm formats are accepted."
      : "Hero images must be JPG, PNG, or WebP."
  );

  const allowedTypes = isVideo ? ALLOWED_HERO_VIDEO_MIME : ALLOWED_HERO_IMAGE_MIME;
  if (!allowedTypes.includes(mime)) {
    const error = new Error(isVideo ? "Hero videos must be MP4 or WebM." : "Hero images must be JPG, PNG, or WebP.");
    error.statusCode = 400;
    throw error;
  }

  assertMaxBytes(
    buffer,
    isVideo ? MAX_HERO_VIDEO_BYTES : MAX_HERO_IMAGE_BYTES,
    isVideo ? "Hero videos must be 30MB or smaller." : "Hero images must be 5MB or smaller."
  );

  const folder = `hero/${isVideo ? "videos" : "images"}`;

  // Delete all existing files for this panelId before writing the new one.
  // This prevents duplicates like romantic.mp4 + romantic-old.mp4.
  if (panelId) {
    await deleteExistingHeroFiles(folder, panelId);
  } else if (oldUrl) {
    // Fallback: delete the specific old URL if no panelId
    await deleteLocalMedia(oldUrl).catch(() => {});
  }

  // Use deterministic filename if panelId is available, otherwise fall back
  // to timestamp-based (e.g. for non-panel uploads).
  const filename = panelId
    ? deterministicHeroFilename(mime, panelId)
    : generateFilename(mime, isVideo ? "hero-video" : "hero-image");

  const url = await saveBuffer(buffer, mime, folder, { filename });
  return url;
};

module.exports = {
  cleanOrphanHeroVideos,
  deleteLocalMedia,
  listHeroVideoFiles,
  MAX_GALLERY_ITEMS,
  MAX_HERO_VIDEOS,
  saveGalleryImage,
  saveHeroMedia,
  saveReviewImage,
  saveUploadedMedia,
};

// Path to the Vite client's public folder so uploaded theme media is served
// directly as static assets (e.g. /themes/romantic/romantic2.jpg)
const CLIENT_PUBLIC_THEMES_DIR = path.resolve(
  __dirname,
  "../../../client/public/themes"
);

/**
 * Save an uploaded theme image or video directly into
 * client/public/themes/<themeId>/ so Vite serves it as a static asset.
 *
 * Returns a root-relative URL like /themes/romantic/romantic2.jpg
 * which the scrollytelling components can use as-is.
 *
 * @param {string} dataUrl   - base64 data URL from the admin panel upload
 * @param {string} themeId   - e.g. "romantic", "birthday", "surprise"
 * @param {"image"|"video"}  mediaKind
 * @returns {Promise<string>} public URL e.g. "/themes/romantic/upload-xyz.jpg"
 */
const saveToClientPublic = async (dataUrl, themeId, mediaKind) => {
  if (!dataUrl) return null;

  const isVideo = mediaKind === "video";

  const { mime, buffer } = parseDataUrl(
    dataUrl,
    MEDIA_DATA_URL_PATTERN,
    isVideo
      ? "Theme videos must be MP4 or WebM."
      : "Theme images must be JPG, PNG, WebP, or GIF."
  );

  const maxBytes = isVideo ? MAX_HERO_VIDEO_BYTES : MAX_HERO_IMAGE_BYTES;
  assertMaxBytes(
    buffer,
    maxBytes,
    isVideo ? "Video must be 30 MB or smaller." : "Image must be 12 MB or smaller."
  );

  // Sanitise themeId to prevent path traversal
  const safeThemeId = String(themeId || "theme")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "theme";

  const dir = path.join(CLIENT_PUBLIC_THEMES_DIR, safeThemeId);
  await ensureDir(dir);

  const filename = generateFilename(mime, "upload");
  await fs.writeFile(path.join(dir, filename), buffer);

  return `/themes/${safeThemeId}/${filename}`;
};

// Re-export everything including the new function
module.exports = {
  ...module.exports,
  saveToClientPublic,
};