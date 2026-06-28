/**
 * migrateScrollyMedia.js
 *
 * Legacy migration stub.
 *
 * The original version migrated scrollyMedia.json → themeContent.json (local JSON).
 * Theme data is now stored in Firebase Firestore (collection: themeContent, doc: main).
 *
 * If the old scrollyMedia.json still exists on disk it is simply deleted —
 * any data it contained should have already been migrated via the
 * scripts/migrate-hero-theme-to-firestore.js one-time script.
 *
 * Safe to call on every startup — it is a fast no-op when the old file is absent.
 */

const fs   = require('fs');
const path = require('path');

const OLD_SCROLLY_FILE = path.join(__dirname, 'store', 'scrollyMedia.json');

function migrateScrollyMedia() {
  if (!fs.existsSync(OLD_SCROLLY_FILE)) return;

  // Old file exists — remove it. Theme data now lives in Firestore.
  try {
    fs.unlinkSync(OLD_SCROLLY_FILE);
    console.log('[migrate] Removed legacy scrollyMedia.json (theme data now in Firestore).');
  } catch (err) {
    console.warn('[migrate] Could not remove scrollyMedia.json:', err.message);
  }
}

module.exports = { migrateScrollyMedia };
