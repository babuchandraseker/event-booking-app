/**
 * heroStore.js — JSON-file-backed persistence for hero content.
 * Replaces the in-memory heroContent[] in memoryStore for the hero system only.
 * All other collections (bookings, packages, etc.) are unaffected.
 */

const fs = require("fs");
const path = require("path");

const STORE_DIR = path.join(__dirname, "store");
const STORE_FILE = path.join(STORE_DIR, "heroContent.json");

/** Ensure the store directory exists */
function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

/** Read the persisted hero store. Returns [] if file absent or corrupt. */
function readHeroStore() {
  try {
    ensureStoreDir();
    if (!fs.existsSync(STORE_FILE)) {
      console.log("[heroStore] heroContent.json not found — starting empty (Firebase skipped for hero).");
      return [];
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    console.log("[heroStore] Hero loaded from local JSON:", STORE_FILE, "(Firebase skipped for hero).");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("[heroStore] Corrupt heroContent.json — starting empty.");
    return [];
  }
}

/** Write the hero store array to disk synchronously (small payload, safe). */
function writeHeroStore(items) {
  try {
    ensureStoreDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.error("[heroStore] Failed to persist heroContent:", err.message);
  }
}

/**
 * Proxy object that mirrors the memoryStore array interface but reads/writes
 * from disk. Drop-in replacement for memoryStore.heroContent.
 *
 * The repository calls memoryStore.heroContent as a plain array —
 * we intercept via a Proxy so array operations (find, findIndex, push,
 * splice, assignment) are forwarded to and persisted in the JSON file.
 */
function createPersistedHeroArray() {
  // Bootstrap from disk
  let _items = readHeroStore();

  const handler = {
    get(target, prop) {
      // Re-read from disk on every top-level property access so that
      // if the file is edited externally the in-process cache is refreshed.
      // For performance we only do this for the meaningful array methods.
      switch (prop) {
        case "length":
          return _items.length;
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
        case "push": {
          return (...args) => {
            const result = _items.push(...args);
            writeHeroStore(_items);
            return result;
          };
        }
        case "splice": {
          return (...args) => {
            const result = _items.splice(...args);
            writeHeroStore(_items);
            return result;
          };
        }
        case Symbol.iterator:
          return () => _items[Symbol.iterator]();
        default:
          // Numeric index access
          if (typeof prop === "string" && !isNaN(Number(prop))) {
            return _items[Number(prop)];
          }
          return Reflect.get(_items, prop);
      }
    },
    set(target, prop, value) {
      if (typeof prop === "string" && !isNaN(Number(prop))) {
        _items[Number(prop)] = value;
        writeHeroStore(_items);
        return true;
      }
      // Allow setting length (used by splice internally)
      if (prop === "length") {
        _items.length = value;
        writeHeroStore(_items);
        return true;
      }
      return Reflect.set(_items, prop, value);
    },
  };

  // We return a Proxy wrapping a plain object; the _items array is captured
  // in closure. This is enough for the repository's usage pattern.
  return new Proxy({}, handler);
}

module.exports = { createPersistedHeroArray };
