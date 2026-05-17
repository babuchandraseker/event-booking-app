const fs = require("fs/promises");
const path = require("path");
const { bucket, isFirebaseStorageEnabled } = require("../config/firebase");

const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const PUBLIC_UPLOAD_PATH = "/uploads";
const DATA_URL_PATTERN = /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/;
const MEDIA_DATA_URL_PATTERN = /^data:((?:image\/(?:png|jpe?g|webp|gif))|(?:video\/(?:mp4|webm)));base64,([A-Za-z0-9+/=]+)$/;
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

const saveReviewImage = async (dataUrl) => {
  if (!dataUrl) {
    return null;
  }

  const match = String(dataUrl).match(DATA_URL_PATTERN);
  if (!match) {
    const error = new Error("image must be a png, jpg, jpeg, or webp file");
    error.statusCode = 400;
    throw error;
  }

  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, "base64");

  if (buffer.length > MAX_IMAGE_BYTES) {
    const error = new Error("image must be 4MB or smaller");
    error.statusCode = 400;
    throw error;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT_BY_MIME[mime]}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `${PUBLIC_UPLOAD_PATH}/${filename}`;
};

const saveUploadedMedia = async (dataUrl, { folder = "media", maxBytes = MAX_MEDIA_BYTES } = {}) => {
  if (!dataUrl) {
    return null;
  }

  const match = String(dataUrl).match(MEDIA_DATA_URL_PATTERN);
  if (!match) {
    const error = new Error("media must be a png, jpg, jpeg, webp, gif, mp4, or webm file");
    error.statusCode = 400;
    throw error;
  }

  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, "base64");

  if (buffer.length > maxBytes) {
    const error = new Error(`media must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller`);
    error.statusCode = 400;
    throw error;
  }

  const safeFolder = String(folder).replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "media";
  const filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT_BY_MIME[mime]}`;

  if (isFirebaseStorageEnabled) {
    const storagePath = `${safeFolder}/${filename}`;
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      metadata: {
        contentType: mime,
        cacheControl: "public, max-age=31536000",
      },
      resumable: false,
    });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  }

  await fs.mkdir(path.join(UPLOAD_DIR, safeFolder), { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, safeFolder, filename), buffer);

  return `${PUBLIC_UPLOAD_PATH}/${safeFolder}/${filename}`;
};

module.exports = {
  saveReviewImage,
  saveUploadedMedia,
};
