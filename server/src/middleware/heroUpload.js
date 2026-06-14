/**
 * Multer middleware for hero media uploads.
 * Writes to a temp directory; the controller moves/deletes after ImageKit upload.
 */
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const os     = require('os');

const TEMP_DIR = path.join(os.tmpdir(), 'hero-uploads');

// Ensure temp dir exists
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TEMP_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || '.bin';
    const name = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_VIDEO_BYTES    = 200 * 1024 * 1024; // 200 MB (ImageKit handles compression)
const MAX_IMAGE_BYTES    =  12 * 1024 * 1024; //  12 MB

function fileFilter(_req, file, cb) {
  const allowed = [...ALLOWED_VIDEO_MIME, ...ALLOWED_IMAGE_MIME];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Unsupported media type: ${file.mimetype}`), false);
}

const heroUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_BYTES },
});

// Clean up temp file if multer or downstream throws
function cleanTempFile(req) {
  if (req.file?.path) {
    fs.unlink(req.file.path, () => {});
  }
}

module.exports = { heroUpload, cleanTempFile, MAX_VIDEO_BYTES, MAX_IMAGE_BYTES };
