/**
 * packageStore.js — JSON-file-backed persistence for packages.
 * Mirrors themeStore.js so that admin edits (addon images, prices, descriptions)
 * survive server restarts instead of being lost on every reboot.
 *
 * Place this file at: server/src/data/packageStore.js
 */

const fs = require("fs");
const path = require("path");

const STORE_DIR = path.join(__dirname, "store");
const STORE_FILE = path.join(STORE_DIR, "packageContent.json");

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function readPackageStore() {
  try {
    ensureStoreDir();
    if (!fs.existsSync(STORE_FILE)) {
      return null; // first startup
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    console.log("[packageStore] Packages loaded from persistent storage:", STORE_FILE);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("[packageStore] Corrupt package store, starting empty.");
    return [];
  }
}

function writePackageStore(items) {
  try {
    ensureStoreDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), "utf8");
    console.log("[packageStore] Packages saved:", items.length, "item(s)");
  } catch (err) {
    console.error("[packageStore] Failed to persist packages:", err.message);
  }
}

function createPersistedPackageArray(defaultPackages) {
  const persisted = readPackageStore();

  let _items;
  if (persisted === null) {
    // First startup — seed from defaults
    _items = defaultPackages.map((pkg) => ({ ...pkg }));
    writePackageStore(_items);
    console.log("[packageStore] First startup — package store seeded from defaults.");
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
            writePackageStore(_items);
            return result;
          };
        }
        case "splice": {
          return (...args) => {
            const result = _items.splice(...args);
            writePackageStore(_items);
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
        writePackageStore(_items);
        return true;
      }
      if (prop === "length") {
        _items.length = value;
        writePackageStore(_items);
        return true;
      }
      return Reflect.set(_items, prop, value);
    },
  };

  return new Proxy({}, handler);
}

module.exports = { createPersistedPackageArray };