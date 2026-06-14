const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertNumber, requireFields } = require("../utils/validation");
const { DEFAULT_PACKAGE_IDS, defaultPackages } = require("../data/defaultCatalog");

const packages = createRepository("packages");

/* ─────────────────────────────────────────────────────────────────────────
   Build a master addon catalog from ALL default packages keyed by name.
   This is used as a fallback so img/desc are never lost.
───────────────────────────────────────────────────────────────────────── */
const DEFAULT_ADDON_CATALOG = (() => {
  const map = new Map();
  for (const pkg of defaultPackages) {
    for (const addon of pkg.addons || []) {
      if (!map.has(addon.name)) map.set(addon.name, { ...addon });
    }
  }
  return map;
})();

const normalizeCatalogItems = (items = []) =>
  items.map((item) => {
    const normalized = {
      name: String(item.name || item.text || "").trim(),
      free: item.free === true,
    };

    if (item.price !== undefined && item.price !== "") {
      normalized.price = Number(item.price);
    }

    if (item.note) {
      normalized.note = item.note;
    }

    if (item.desc) {
      normalized.desc = String(item.desc).trim();
    }

    if (item.img) {
      normalized.img = String(item.img).trim();
    }

    // Persist emoji so admin changes to the icon are saved
    if (item.emoji !== undefined) {
      normalized.emoji = String(item.emoji);
    }

    // Persist _originalName so the admin UI can track renames
    if (item._originalName) {
      normalized._originalName = String(item._originalName);
    }

    return normalized;
  }).filter((item) => item.name);

const normalizePackagePayload = (body) => ({
  ...body,
  ...(body.price !== undefined ? { price: Number(body.price) } : {}),
  ...(body.maxGuests !== undefined ? { maxGuests: Number(body.maxGuests) } : {}),
  ...(body.included !== undefined ? { included: normalizeCatalogItems(body.included) } : {}),
  ...(body.addons !== undefined ? { addons: normalizeCatalogItems(body.addons) } : {}),
});

/* ─────────────────────────────────────────────────────────────────────────
   mergeAddons — deep-merges a stored addon list with defaults.
   For every addon, img/desc/price fall back to the default catalog entry
   if the stored value is missing or empty.  This means a freshly-saved
   package (or one that was never edited) always has complete addon data.
───────────────────────────────────────────────────────────────────────── */
function mergeAddons(storedAddons, defaultAddons) {
  // Build a lookup of stored addons by name so we can patch defaults
  const storedByName = new Map((storedAddons || []).map((a) => [a.name, a]));
  const defaultByName = new Map((defaultAddons || []).map((a) => [a.name, a]));

  // Start from the stored addon list (preserves order & custom addons)
  // Fall back to defaultAddons if nothing was stored yet
  const base = (storedAddons && storedAddons.length > 0) ? storedAddons : (defaultAddons || []);

  return base.map((addon) => {
    const stored  = storedByName.get(addon.name) || addon;
    const defPkg  = defaultByName.get(addon.name) || {};
    const defCat  = DEFAULT_ADDON_CATALOG.get(addon.name) || {};

    return {
      ...stored,
      // Never lose img — fall back through: stored → default for this pkg → master catalog
      img:  stored.img  || defPkg.img  || defCat.img  || "",
      desc: stored.desc || defPkg.desc || defCat.desc || "",
      // Preserve emoji — stored value wins, then defaults
      emoji: stored.emoji !== undefined ? stored.emoji : (defPkg.emoji || defCat.emoji || ""),
      // price: always keep stored value (admin intentionally sets it)
    };
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   mergeWithDefaults — shallow-merges package-level fields, but
   deep-merges addons by name so img/desc are never clobbered.
───────────────────────────────────────────────────────────────────────── */
const mergeWithDefaults = (storedPackages) => {
  const byId = new Map(storedPackages.map((pkg) => [pkg.id, pkg]));

  const defaults = defaultPackages.map((defPkg) => {
    const stored = byId.get(defPkg.id) || {};
    return {
      ...defPkg,
      ...stored,
      visible: stored.visible !== undefined ? stored.visible : true,
      // Deep-merge addons so img/desc/price are never lost
      addons: mergeAddons(stored.addons, defPkg.addons),
    };
  });

  const custom = storedPackages.filter((pkg) => !DEFAULT_PACKAGE_IDS.has(pkg.id));
  return [...defaults, ...custom];
};

/* ─────────────────────────────────────────────────────────────────────────
   syncAddonChanges — when one package's addon list is saved, propagate
   any changed img/desc/price fields to the same-named addon in ALL other
   stored packages.  This is what makes "change once, reflect everywhere" work.
───────────────────────────────────────────────────────────────────────── */
async function syncAddonChanges(savedPackageId, savedAddons) {
  if (!savedAddons || savedAddons.length === 0) return;

  // Build lookup by both current name AND _originalName so renames still match
  // the same addon stored under its old name in other packages.
  const updatedByName = new Map();
  const updatedByOriginal = new Map();
  for (const a of savedAddons) {
    updatedByName.set(a.name, a);
    if (a._originalName && a._originalName !== a.name) {
      updatedByOriginal.set(a._originalName, a);
    }
  }

  const all = await packages.list();

  for (const pkg of all) {
    if (pkg.id === savedPackageId) continue; // already saved
    if (!pkg.addons || pkg.addons.length === 0) continue;

    let changed = false;
    const newAddons = pkg.addons.map((addon) => {
      // Match by: current name first, then by _originalName stored in other pkg,
      // then by the savedAddon's _originalName matching this addon's current name.
      const updated =
        updatedByName.get(addon.name) ||
        updatedByOriginal.get(addon.name) ||
        updatedByName.get(addon._originalName) ||
        updatedByOriginal.get(addon._originalName);

      if (!updated) return addon;

      const next = {
        ...addon,
        // Propagate name change
        name: updated.name,
        ...(updated.img   ? { img:   updated.img   } : {}),
        ...(updated.desc  ? { desc:  updated.desc  } : {}),
        ...(updated.price !== undefined ? { price: updated.price } : {}),
        ...(updated.emoji !== undefined ? { emoji: updated.emoji } : {}),
        // Carry forward _originalName so future edits still resolve correctly
        _originalName: addon._originalName || addon.name,
      };

      if (
        next.name  !== addon.name  ||
        next.img   !== addon.img   ||
        next.desc  !== addon.desc  ||
        next.price !== addon.price ||
        next.emoji !== addon.emoji
      ) {
        changed = true;
      }
      return next;
    });

    if (changed) {
      await packages.set(pkg.id, { ...pkg, addons: newAddons });
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Route handlers
───────────────────────────────────────────────────────────────────────── */

const listPackages = asyncHandler(async (req, res) => {
  const data = mergeWithDefaults(await packages.list());
  res.json({ success: true, data });
});

const createPackage = asyncHandler(async (req, res) => {
  requireFields(req.body, ["title", "price"]);
  assertNumber(req.body.price, "price");
  assertNumber(req.body.maxGuests, "maxGuests");

  const item = await packages.create({
    title: req.body.title,
    price: Number(req.body.price),
    duration: req.body.duration || null,
    maxGuests: req.body.maxGuests ? Number(req.body.maxGuests) : null,
    description: req.body.description || null,
    imageUrl: req.body.imageUrl || null,
    active: req.body.active !== false,
  });

  res.status(201).json({ success: true, data: item });
});

const updatePackage = asyncHandler(async (req, res) => {
  assertNumber(req.body.price, "price");
  assertNumber(req.body.maxGuests, "maxGuests");

  const payload = normalizePackagePayload(req.body);

  const item = DEFAULT_PACKAGE_IDS.has(req.params.id)
    ? await packages.set(req.params.id, payload)
    : await packages.update(req.params.id, payload);

  if (!item) {
    throw createHttpError(404, "Package not found");
  }

  // Propagate addon changes (img / desc / price) to all other packages
  // so that a change made in the admin always reflects everywhere.
  if (payload.addons && payload.addons.length > 0) {
    await syncAddonChanges(req.params.id, payload.addons).catch((err) =>
      console.error("[packageController] syncAddonChanges error:", err.message)
    );
  }

  res.json({ success: true, data: item });
});

const deletePackage = asyncHandler(async (req, res) => {
  const deleted = await packages.remove(req.params.id);

  if (!deleted) {
    throw createHttpError(404, "Package not found");
  }

  res.json({ success: true, message: "Package deleted" });
});

module.exports = {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
