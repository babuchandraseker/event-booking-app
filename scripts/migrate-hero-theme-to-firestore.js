#!/usr/bin/env node
/**
 * migrate-hero-theme-to-firestore.js
 *
 * One-time migration: reads existing heroContent.json and themeContent.json
 * and writes them into Firebase Firestore.
 *
 * Usage:
 *   node scripts/migrate-hero-theme-to-firestore.js
 *
 * Requires the same FIREBASE_* env vars used by the server.
 * Run from the project root (or set the correct paths below).
 *
 * Safe to run multiple times — it uses set() with merge:false so the
 * Firestore document will be fully replaced each run.
 */

require('dotenv').config({ path: './server/.env' });

const path = require('path');
const fs   = require('fs');
const admin = require('firebase-admin');

// ── Firebase init ────────────────────────────────────────────────────────────

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('❌  Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in env.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey:  FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// ── Paths ────────────────────────────────────────────────────────────────────

const HERO_JSON  = path.join(__dirname, '../server/src/data/store/heroContent.json');
const THEME_JSON = path.join(__dirname, '../server/src/data/store/themeContent.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️   File not found — skipping: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌  Failed to parse ${filePath}: ${err.message}`);
    return null;
  }
}

// ── Migrate hero ─────────────────────────────────────────────────────────────

async function migrateHero() {
  const raw = readJson(HERO_JSON);
  if (!raw) return;

  // heroContent.json is an array; we use the first element with id "main",
  // or the whole first element if the id differs.
  const record = Array.isArray(raw)
    ? (raw.find((r) => r.id === 'main') || raw[0])
    : raw;

  if (!record) {
    console.log('ℹ️   heroContent.json is empty — nothing to migrate for hero.');
    return;
  }

  const { id: _id, createdAt: _c, ...rest } = record;

  const payload = {
    published: rest.published || [],
    draft:     rest.draft     || [],
    updatedAt: new Date().toISOString(),
  };

  await db.collection('heroContent').doc('main').set(payload, { merge: false });
  console.log(`✅  heroContent/main written to Firestore (${payload.published.length} published panels, ${payload.draft.length} draft panels).`);
}

// ── Migrate themes ───────────────────────────────────────────────────────────

async function migrateThemes() {
  const raw = readJson(THEME_JSON);
  if (!raw) return;

  // themeContent.json is an array of theme override objects.
  const themes = Array.isArray(raw) ? raw : [];

  if (themes.length === 0) {
    console.log('ℹ️   themeContent.json is empty — nothing to migrate for themes.');
    return;
  }

  const payload = {
    themes,
    updatedAt: new Date().toISOString(),
  };

  await db.collection('themeContent').doc('main').set(payload, { merge: false });
  console.log(`✅  themeContent/main written to Firestore (${themes.length} override(s)).`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n🔥  Hero & Theme → Firestore migration\n');
  try {
    await migrateHero();
    await migrateThemes();
    console.log('\n✅  Migration complete. You can now delete heroContent.json and themeContent.json.\n');
  } catch (err) {
    console.error('\n❌  Migration failed:', err);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
})();
