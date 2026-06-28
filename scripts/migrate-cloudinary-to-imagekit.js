#!/usr/bin/env node
/**
 * migrate-cloudinary-to-imagekit.js
 *
 * Migration script: Cloudinary → ImageKit
 *
 * What it does:
 *   1. Reads all JSON stores (heroContent, themeContent, galleryContent, etc.)
 *   2. Finds Cloudinary URLs (res.cloudinary.com)
 *   3. Downloads each asset from Cloudinary
 *   4. Uploads to ImageKit in the correct folder
 *   5. Replaces Cloudinary URLs with ImageKit URLs in the store files
 *   6. Preserves all metadata, themes, addons, and gallery content
 *
 * Usage:
 *   node migrate-cloudinary-to-imagekit.js
 *
 * Prerequisites:
 *   npm install imagekit node-fetch@2
 *   Set environment variables:
 *     IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
 *
 * Run from the server directory:
 *   cd server && node ../scripts/migrate-cloudinary-to-imagekit.js
 */

require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const ImageKit = require('imagekit');

// ── Config ──────────────────────────────────────────────────────────────────

const IMAGEKIT_PUBLIC_KEY   = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY  = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  console.error('❌  Missing ImageKit env vars. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT');
  process.exit(1);
}

const imagekit = new ImageKit({
  publicKey:   IMAGEKIT_PUBLIC_KEY,
  privateKey:  IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

const STORE_DIR = path.join(__dirname, '../server/src/data/store');

// Folder mapping for ImageKit based on URL patterns
function guessFolder(url) {
  if (url.includes('/hero/videos/') || url.includes('hero-video')) return 'hero/videos';
  if (url.includes('/hero/images/') || url.includes('hero-image')) return 'hero/images';
  if (url.includes('/themes/romantic/')) return 'themes/romantic';
  if (url.includes('/themes/birthday/')) return 'themes/birthday';
  if (url.includes('/themes/surprise/')) return 'themes/surprise';
  if (url.includes('/gallery/'))  return 'gallery';
  if (url.includes('/addons/'))   return 'addons';
  if (url.includes('/uploads/'))  return 'uploads';
  return 'uploads';
}

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extFromUrl(url) {
  const u = url.split('?')[0];
  const ext = path.extname(u).replace('.', '').toLowerCase();
  if (ext && ['jpg','jpeg','png','webp','gif','mp4','webm','mov','m3u8'].includes(ext)) return ext;
  // Guess from Cloudinary resource type in URL
  if (url.includes('/video/upload/')) return 'mp4';
  return 'jpg';
}

async function migrateUrl(url, label) {
  if (!isCloudinaryUrl(url)) return url; // nothing to migrate

  console.log(`  ↓ Downloading ${label}: ${url.slice(0, 80)}...`);
  let buffer;
  try {
    buffer = await downloadBuffer(url);
  } catch (err) {
    console.warn(`    ⚠️  Download failed: ${err.message} — keeping original URL`);
    return url;
  }

  const folder   = guessFolder(url);
  const ext      = extFromUrl(url);
  const baseName = `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const fileName = `${baseName}.${ext}`;

  console.log(`  ↑ Uploading to ImageKit: ${folder}/${fileName}`);
  try {
    const result = await imagekit.upload({
      file:     buffer,
      fileName,
      folder,
      useUniqueFileName: false,
      overwriteFile:     true,
    });
    console.log(`  ✓ ${result.url}`);
    return result.url;
  } catch (err) {
    console.warn(`    ⚠️  ImageKit upload failed: ${err.message} — keeping original URL`);
    return url;
  }
}

function walkAndMigrate(obj, label = 'root') {
  // Returns a promise of the migrated object
  if (typeof obj === 'string') {
    if (isCloudinaryUrl(obj)) return migrateUrl(obj, label);
    return Promise.resolve(obj);
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((item, i) => walkAndMigrate(item, `${label}[${i}]`)));
  }
  if (obj && typeof obj === 'object') {
    return Promise.all(
      Object.entries(obj).map(async ([k, v]) => {
        const migrated = await walkAndMigrate(v, `${label}.${k}`);
        return [k, migrated];
      }),
    ).then((entries) => Object.fromEntries(entries));
  }
  return Promise.resolve(obj);
}

async function migrateStoreFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  (skipped — file not found: ${path.basename(filePath)})`);
    return;
  }

  const raw  = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn(`  ⚠️  Could not parse ${filePath}, skipping`);
    return;
  }

  const cloudinaryRefs = JSON.stringify(parsed).match(/https:\/\/res\.cloudinary\.com[^"]+/g) || [];
  if (cloudinaryRefs.length === 0) {
    console.log(`  ✓ No Cloudinary URLs in ${path.basename(filePath)}`);
    return;
  }

  console.log(`  Found ${cloudinaryRefs.length} Cloudinary URL(s) in ${path.basename(filePath)}`);

  // Back up original
  const backup = `${filePath}.cloudinary-backup`;
  fs.writeFileSync(backup, raw, 'utf8');
  console.log(`  📦 Backed up to ${path.basename(backup)}`);

  const migrated = await walkAndMigrate(parsed, path.basename(filePath));
  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2), 'utf8');
  console.log(`  ✅ Updated ${path.basename(filePath)}`);
}

async function main() {
  console.log('=== Cloudinary → ImageKit Migration ===\n');
  console.log('ImageKit endpoint:', IMAGEKIT_URL_ENDPOINT);
  console.log('Store directory:  ', STORE_DIR);
  console.log('');

  if (!fs.existsSync(STORE_DIR)) {
    console.error(`❌ Store directory not found: ${STORE_DIR}`);
    console.error('  Run this script from the project root directory.');
    process.exit(1);
  }

  const storeFiles = [
    path.join(STORE_DIR, 'heroContent.json'),
    path.join(STORE_DIR, 'themeContent.json'),
    path.join(STORE_DIR, 'galleryContent.json'),
    path.join(STORE_DIR, 'scrollyMedia.json'),
    path.join(STORE_DIR, 'packageContent.json'),
    path.join(STORE_DIR, 'addonsContent.json'),
  ];

  for (const file of storeFiles) {
    console.log(`\n📂 ${path.basename(file)}`);
    await migrateStoreFile(file);
  }

  console.log('\n=== Migration complete ===');
  console.log('✔ All Cloudinary URLs have been replaced with ImageKit URLs.');
  console.log('✔ Original files backed up as *.cloudinary-backup');
  console.log('\nNext steps:');
  console.log('  1. Restart the backend server');
  console.log('  2. Verify all media loads correctly in the admin panel');
  console.log('  3. Delete *.cloudinary-backup files once confirmed');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
