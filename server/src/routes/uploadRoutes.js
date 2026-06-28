const express = require("express");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../middleware/asyncHandler");
const requireAdminAuth = require("../middleware/adminAuth");
const createHttpError = require("../utils/httpError");
const { uploadAddonMedia } = require("../services/imagekitService");

const router = express.Router();

const ALLOWED_MIME = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const DATA_URL_RE = /^data:(image\/(?:jpe?g|png|webp));base64,([A-Za-z0-9+/=]+)$/;

// Legacy local directory — still used as a fallback destination when
// ImageKit is not configured (see uploadAddonMedia's local fallback) and
// to serve any images that were uploaded here before this fix.
const ADDONS_UPLOAD_DIR = path.resolve(
  __dirname,
  "../../../client/public/addons"
);

// POST /api/upload/addon-image
//
// Uploads the add-on image to ImageKit (folder: "addons"), exactly like the
// Hero/Theme media endpoints, via the shared imagekitService. Falls back to
// local storage automatically only if ImageKit is not configured/unavailable
// (handled inside uploadAddonMedia/mediaRouter).
router.post(
  "/addon-image",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const { dataUrl } = req.body;
    if (!dataUrl) throw createHttpError(400, "dataUrl is required.");

    const match = String(dataUrl).match(DATA_URL_RE);
    if (!match) throw createHttpError(400, "Only JPEG, PNG, and WebP images are allowed.");

    const [, , base64] = match;
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > MAX_SIZE_BYTES) throw createHttpError(413, "Image must be under 5 MB.");

    const { url, fileId, name } = await uploadAddonMedia(dataUrl, { name: "addon" });
    if (!url) throw createHttpError(502, "Add-on image upload failed.");

    console.log(`[Addon Upload] ImageKit upload success`);
    console.log(`[Addon Upload] Image URL: ${url}`);
    console.log(`[Addon Upload] fileId: ${fileId || '(none)'}`);

    // `path` is kept for backward compatibility with the existing admin UI,
    // which reads `result.path` as the image source — it now points at the
    // ImageKit CDN URL instead of a local /addons/ path.
    res.json({ success: true, path: url, url, fileId, name });
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