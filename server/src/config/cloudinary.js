/**
 * cloudinary.js
 *
 * Cloudinary configuration — secrets stay server-side only.
 * Used exclusively for VIDEO uploads (hero videos, theme videos).
 * Images always go to ImageKit.
 */
const cloudinary = require('cloudinary').v2;

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;

const isEnabled = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isEnabled) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key:    API_KEY,
    api_secret: API_SECRET,
    secure:     true,
  });
  console.log('[cloudinary] Configured — cloud:', CLOUD_NAME);
} else {
  console.log('[cloudinary] Not configured — video uploads will fall back to local storage.');
}

/**
 * Upload a video buffer to Cloudinary.
 *
 * @param {Buffer} buffer
 * @param {object} opts
 * @param {string} opts.folder       – e.g. 'hero/videos', 'themes/romantic'
 * @param {string} opts.publicId     – stable asset ID (no extension)
 * @param {string} [opts.resourceType] – always 'video' but kept explicit
 * @returns {Promise<{url, publicId, secureUrl}>}
 */
async function uploadToCloudinary(buffer, { folder, publicId, resourceType = 'video' }) {
  if (!isEnabled) throw new Error('Cloudinary not configured');

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id:      publicId,
        resource_type:  resourceType,
        overwrite:      true,
        invalidate:     true,
        // Adaptive streaming (HLS) — Cloudinary generates it on first play
        eager: [{ streaming_profile: 'hd', format: 'm3u8' }],
        eager_async: true,
      },
      (error, result) => {
        if (error) return reject(error);
        // Guard: Cloudinary must return a secure_url — never construct URLs manually.
        // A missing secure_url means the upload silently failed (quota, policy, etc.).
        if (!result || !result.secure_url) {
          return reject(new Error(
            `Cloudinary upload completed but returned no secure_url. ` +
            `public_id=${result?.public_id}, http_code=${result?.http_code}`
          ));
        }
        resolve({
          url:       result.secure_url,
          secureUrl: result.secure_url,
          publicId:  result.public_id,
          // Cloudinary HLS URL (may be available after eager processing)
          hlsUrl: result.eager?.[0]?.secure_url || null,
        });
      },
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete a video from Cloudinary by public ID.
 *
 * @param {string} publicId – Cloudinary public_id (without extension)
 */
async function deleteFromCloudinary(publicId) {
  if (!isEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video', invalidate: true });
  } catch (err) {
    console.warn('[cloudinary] delete failed for publicId', publicId, err.message);
  }
}

/**
 * Extract the public_id from a Cloudinary URL.
 * e.g. https://res.cloudinary.com/demo/video/upload/hero/videos/romantic
 *   → hero/videos/romantic
 */
function publicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    // URL format: .../upload/<version>?/<folder/public_id>.<ext>
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

module.exports = {
  cloudinary,
  isEnabled,
  uploadToCloudinary,
  deleteFromCloudinary,
  publicIdFromUrl,
};
