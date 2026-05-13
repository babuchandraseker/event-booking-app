const fs = require("fs/promises");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const PUBLIC_UPLOAD_PATH = "/uploads";
const DATA_URL_PATTERN = /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/;
const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

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

module.exports = {
  saveReviewImage,
};
