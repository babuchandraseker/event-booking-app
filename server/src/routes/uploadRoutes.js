const express = require("express");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../middleware/asyncHandler");
const requireAdminAuth = require("../middleware/adminAuth");
const createHttpError = require("../utils/httpError");

const router = express.Router();

const ALLOWED_MIME = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const DATA_URL_RE = /^data:(image\/(?:jpe?g|png|webp));base64,([A-Za-z0-9+/=]+)$/;

// Save addon images directly into client/public/addons/ so Vite (dev) and
// Express static (prod) serve them under /addons/:filename — the same URL
// pattern the default addon images use. This means uploaded images show
// immediately on the main page without any proxy or special route.
const ADDONS_UPLOAD_DIR = path.resolve(
  __dirname,
  "../../../client/public/addons"
);

// POST /api/upload/addon-image
router.post(
  "/addon-image",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const { dataUrl } = req.body;
    if (!dataUrl) throw createHttpError(400, "dataUrl is required.");

    const match = String(dataUrl).match(DATA_URL_RE);
    if (!match) throw createHttpError(400, "Only JPEG, PNG, and WebP images are allowed.");

    const [, mime, base64] = match;
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > MAX_SIZE_BYTES) throw createHttpError(413, "Image must be under 5 MB.");

    const ext = ALLOWED_MIME[mime];
    const filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    fs.mkdirSync(ADDONS_UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(ADDONS_UPLOAD_DIR, filename), buffer);

    // Return a root-relative path under /addons/ — served directly by Vite
    // dev server and by Express static middleware in production.
    // This matches the default addon image paths like /addons/balloons.png.
    res.json({ success: true, path: `/addons/${filename}` });
  })
);

// Legacy GET /api/addon-images/:filename — kept for any previously uploaded
// images that stored their path as /api/addon-images/:filename.
// Tries the old server-side uploads folder first, then client/public/addons/.
const LEGACY_UPLOAD_DIR = path.resolve(__dirname, "../../../uploads/addons");

router.get(
  "/:filename",
  asyncHandler(async (req, res) => {
    const filename = path.basename(req.params.filename);

    // Check legacy server upload dir first
    const legacyPath = path.join(LEGACY_UPLOAD_DIR, filename);
    if (fs.existsSync(legacyPath)) {
      return res.sendFile(legacyPath);
    }

    // Fall back to client/public/addons/
    const publicPath = path.join(ADDONS_UPLOAD_DIR, filename);
    if (fs.existsSync(publicPath)) {
      return res.sendFile(publicPath);
    }

    throw createHttpError(404, "Image not found.");
  })
);

module.exports = router;