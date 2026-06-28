/**
 * galleryStore.js — JSON-file-backed persistence for gallery items.
 * Mirrors heroStore.js exactly so gallery data survives server restarts.
 * All other collections (bookings, packages, etc.) are unaffected.
 *
 * Seeding: default items are written ONLY on first startup when the
 * store file does not yet exist. Once the file exists the saved state
 * is always used, never overwritten by defaults.
 */

const fs = require("fs");
const path = require("path");

const STORE_DIR = path.join(__dirname, "store");
const STORE_FILE = path.join(STORE_DIR, "galleryContent.json");

/** Ensure the store directory exists */
function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

/**
 * Read the persisted gallery store.
 * Returns null if the file does not exist yet (first boot → seed).
 * Returns [] if the file exists but is empty/corrupt (don't re-seed).
 */
function readGalleryStore() {
  try {
    ensureStoreDir();
    if (!fs.existsSync(STORE_FILE)) {
      // File absent → first startup, caller should seed defaults
      return null;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    console.log("[galleryStore] Gallery loaded from persistent storage:", STORE_FILE);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // File corrupt → treat as empty saved state, don't re-seed
    console.warn("[galleryStore] Corrupt gallery store, starting empty.");
    return [];
  }
}

/** Write the gallery store array to disk synchronously (small payload, safe). */
function writeGalleryStore(items) {
  try {
    ensureStoreDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), "utf8");
    console.log("[galleryStore] Gallery saved successfully:", items.length, "item(s)");
  } catch (err) {
    console.error("[galleryStore] Failed to persist gallery:", err.message);
  }
}

/**
 * Proxy object that mirrors the memoryStore array interface but reads/writes
 * from disk. Drop-in replacement for memoryStore.gallery.
 *
 * The repository calls memoryStore.gallery as a plain array —
 * we intercept via a Proxy so array operations (find, findIndex, push,
 * splice, assignment) are forwarded to and persisted in the JSON file.
 *
 * @param {Array} defaultItems  Seed data written only on very first startup
 *                              (when galleryContent.json does not yet exist).
 */
function createPersistedGalleryArray(defaultItems = []) {
  // Bootstrap from disk
  const persisted = readGalleryStore();

  let _items;
  if (persisted === null) {
    // First startup — seed defaults and persist immediately
    _items = defaultItems.map((item) => ({ ...item }));
    if (_items.length > 0) {
      console.log("[galleryStore] First startup — seeding", _items.length, "default gallery item(s).");
      writeGalleryStore(_items);
    } else {
      // No defaults provided, create empty store file so next boot knows it's initialized
      writeGalleryStore([]);
      console.log("[galleryStore] First startup — no default gallery items, starting empty.");
    }
  } else {
    // Existing saved state — use it, never overwrite with defaults
    _items = persisted;
  }

  const handler = {
    get(target, prop) {
      switch (prop) {
        case "find":
          return (fn) => _items.find(fn);
        case "findIndex":
          return (fn) => _items.findIndex(fn);
        case "filter":
          return (fn) => _items.filter(fn);
        case "map":
          return (fn) => _items.map(fn);
        case "forEach":
          return (fn) => _items.forEach(fn);
        case "some":
          return (fn) => _items.some(fn);
        case "every":
          return (fn) => _items.every(fn);
        case "includes":
          return (fn) => _items.includes(fn);
        // `sort` mutates `_items` in place (like native Array#sort) and must
        // return the Proxy itself so chained calls (e.g. `list().sort(...)`)
        // keep working through the same trapped array methods.
        case "sort":
          return (fn) => {
            _items.sort(fn);
            return target;
          };
        case "push": {
          return (...args) => {
            const result = _items.push(...args);
            writeGalleryStore(_items);
            return result;
          };
        }
        case "splice": {
          return (...args) => {
            const result = _items.splice(...args);
            writeGalleryStore(_items);
            return result;
          };
        }
        case Symbol.iterator:
          return () => _items[Symbol.iterator]();
        // Real array as the Proxy target (see below) — JSON.stringify(),
        // Array.isArray(), spreading, and any other unlisted Array.prototype
        // method (length, slice, etc.) all resolve correctly via the target
        // itself, so no further interception is needed here.
        default:
          return Reflect.get(target, prop);
      }
    },
    set(target, prop, value) {
      const result = Reflect.set(target, prop, value);
      writeGalleryStore(_items);
      return result;
    },
  };

  // Return a Proxy wrapping a REAL array (not `{}`). Using a real array as
  // the target means Array.isArray(), JSON.stringify(), spreading, and any
  // array method not explicitly trapped above (length, slice, etc.) behave
  // exactly like a normal array out of the box — only the methods that need
  // to persist to disk (push, splice, sort, index/length assignment) are
  // intercepted above.
  return new Proxy(_items, handler);
}

module.exports = { createPersistedGalleryArray };
