/**
 * themeStore.js — JSON-file-backed persistence for themes (scrollyMedia overrides).
 * Mirrors galleryStore.js so that admin-uploaded images survive server restarts.
 *
 * Seeding: the store file is created empty on first startup.
 * Built-in theme defaults (romantic/birthday/surprise) are merged in
 * themeController.js via mergeWithDefaults — this store only holds overrides.
 */

const fs = require("fs");
const path = require("path");

const STORE_DIR = path.join(__dirname, "store");
const STORE_FILE = path.join(STORE_DIR, "themeContent.json");

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function readThemeStore() {
  try {
    ensureStoreDir();
    if (!fs.existsSync(STORE_FILE)) {
      return null; // first startup
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    console.log("[themeStore] Themes loaded from persistent storage:", STORE_FILE);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("[themeStore] Corrupt theme store, starting empty.");
    return [];
  }
}

function writeThemeStore(items) {
  try {
    ensureStoreDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), "utf8");
    console.log("[themeStore] Themes saved:", items.length, "item(s)");
  } catch (err) {
    console.error("[themeStore] Failed to persist themes:", err.message);
  }
}

function createPersistedThemeArray() {
  const persisted = readThemeStore();

  let _items;
  if (persisted === null) {
    _items = [];
    writeThemeStore(_items);
    console.log("[themeStore] First startup — empty theme overrides store created.");
  } else {
    _items = persisted;
  }

  const handler = {
    get(target, prop) {
      switch (prop) {
        case "length":     return _items.length;
        case "find":       return (fn) => _items.find(fn);
        case "findIndex":  return (fn) => _items.findIndex(fn);
        case "filter":     return (fn) => _items.filter(fn);
        case "map":        return (fn) => _items.map(fn);
        case "forEach":    return (fn) => _items.forEach(fn);
        case "some":       return (fn) => _items.some(fn);
        case "every":      return (fn) => _items.every(fn);
        case "includes":   return (fn) => _items.includes(fn);
        case "push": {
          return (...args) => {
            const result = _items.push(...args);
            writeThemeStore(_items);
            return result;
          };
        }
        case "splice": {
          return (...args) => {
            const result = _items.splice(...args);
            writeThemeStore(_items);
            return result;
          };
        }
        case Symbol.iterator:
          return () => _items[Symbol.iterator]();
        default:
          if (typeof prop === "string" && !isNaN(Number(prop))) {
            return _items[Number(prop)];
          }
          return Reflect.get(_items, prop);
      }
    },
    set(target, prop, value) {
      if (typeof prop === "string" && !isNaN(Number(prop))) {
        _items[Number(prop)] = value;
        writeThemeStore(_items);
        return true;
      }
      if (prop === "length") {
        _items.length = value;
        writeThemeStore(_items);
        return true;
      }
      return Reflect.set(_items, prop, value);
    },
  };

  return new Proxy({}, handler);
}

module.exports = { createPersistedThemeArray };