/**
 * ImageKit configuration — secrets stay server-side only.
 * Never expose IMAGEKIT_PRIVATE_KEY to the client.
 */
const ImageKit = require('imagekit');

const PUBLIC_KEY    = process.env.IMAGEKIT_PUBLIC_KEY;
const PRIVATE_KEY   = process.env.IMAGEKIT_PRIVATE_KEY;
const URL_ENDPOINT  = process.env.IMAGEKIT_URL_ENDPOINT;

const isEnabled = Boolean(PUBLIC_KEY && PRIVATE_KEY && URL_ENDPOINT);

let imagekit = null;

if (isEnabled) {
  imagekit = new ImageKit({
    publicKey:   PUBLIC_KEY,
    privateKey:  PRIVATE_KEY,
    urlEndpoint: URL_ENDPOINT,
  });
  console.log('[imagekit] Configured — endpoint:', URL_ENDPOINT);
} else {
  console.log('[imagekit] Not configured — falling back to local storage.');
}

/**
 * Upload a file buffer to ImageKit.
 *
 * @param {Buffer} buffer
 * @param {object} opts
 * @param {string} opts.fileName      – filename including extension
 * @param {string} opts.folder        – e.g. 'hero/videos'
 * @param {'image'|'video'} opts.resourceType
 * @returns {Promise<ImageKitUploadResult>}
 */
async function uploadToImageKit(buffer, { fileName, folder, resourceType = 'image' }) {
  if (!isEnabled) throw new Error('ImageKit not configured');

  const result = await imagekit.upload({
    file:       buffer,
    fileName,
    folder,
    useUniqueFileName: false,
    overwriteFile:     true,
    // For images: auto quality/format
    ...(resourceType === 'image' && {
      responseFields: ['url', 'fileId', 'name', 'filePath'],
    }),
  });

  return result;
}

/**
 * Delete a file from ImageKit by fileId.
 */
async function deleteFromImageKit(fileId) {
  if (!isEnabled || !fileId) return;
  try {
    await imagekit.deleteFile(fileId);
  } catch (err) {
    console.warn('[imagekit] delete failed for fileId', fileId, err.message);
  }
}

/**
 * Get file details by fileId.
 */
async function getFileDetails(fileId) {
  if (!isEnabled || !fileId) return null;
  try {
    return await imagekit.getFileDetails(fileId);
  } catch (err) {
    console.warn('[imagekit] getFileDetails failed for fileId', fileId, err.message);
    return null;
  }
}

/**
 * Build an optimised image URL via ImageKit transformations.
 * @param {string} urlOrPath  – full IK URL or file path
 * @param {object} transforms – optional IK transformation params
 */
function buildImageUrl(urlOrPath, transforms = {}) {
  if (!urlOrPath) return null;
  if (!isEnabled) return urlOrPath;

  const defaultTransforms = { quality: 80, format: 'auto' };
  const merged = { ...defaultTransforms, ...transforms };

  // If it's already a full URL, return it with query-based transformations
  // ImageKit supports URL-based transformations via tr parameter
  const base = urlOrPath.startsWith('http') ? urlOrPath : `${URL_ENDPOINT}${urlOrPath}`;
  const trParts = [];
  if (merged.quality)  trParts.push(`q-${merged.quality}`);
  if (merged.format)   trParts.push(`f-${merged.format}`);
  if (merged.width)    trParts.push(`w-${merged.width}`);
  if (merged.height)   trParts.push(`h-${merged.height}`);

  if (!trParts.length) return base;
  // Insert tr segment into IK URL
  return base.includes('/tr:')
    ? base
    : base.replace('//', '//').replace(URL_ENDPOINT, `${URL_ENDPOINT}/tr:${trParts.join(',')}`);
}

/**
 * Build an optimised video URL — ImageKit serves videos as-is from CDN.
 * For mobile optimization, append quality transformation.
 */
function buildVideoUrl(urlOrPath) {
  if (!urlOrPath) return null;
  return urlOrPath.startsWith('http') ? urlOrPath : `${URL_ENDPOINT}${urlOrPath}`;
}

module.exports = {
  imagekit,
  isEnabled,
  uploadToImageKit,
  deleteFromImageKit,
  getFileDetails,
  buildImageUrl,
  buildVideoUrl,
};
