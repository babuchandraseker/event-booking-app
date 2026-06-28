const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertNumber, requireFields } = require("../utils/validation");
const { DEFAULT_PACKAGE_IDS, defaultPackages } = require("../data/defaultCatalog");
const { db, isFirebaseEnabled } = require("../config/firebase");

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

    // Persist ImageKit fileId so we can delete old images on re-upload
    if (item.fileId) {
      normalized.fileId = String(item.fileId).trim();
    }

    // Persist ImageKit filePath for reference
    if (item.filePath) {
      normalized.filePath = String(item.filePath).trim();
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
  // Always persist freeAddonNames so free-addon state survives saves
  ...(body.freeAddonNames !== undefined
    ? { freeAddonNames: Array.isArray(body.freeAddonNames) ? body.freeAddonNames : [] }
    : {}),
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

    // img resolution:
    //   1. If Firestore has a non-empty img for this addon (ImageKit URL or any path), always use it.
    //   2. Only fall back to the default catalog when Firestore has no img field at all.
    const resolvedImg = (stored.img != null && stored.img !== '')
      ? stored.img
      : (defPkg.img || defCat.img || '');

    const merged = {
      ...stored,
      img:  resolvedImg,
      desc: stored.desc || defPkg.desc || defCat.desc || "",
      // Preserve emoji — stored value wins, then defaults
      emoji: stored.emoji !== undefined ? stored.emoji : (defPkg.emoji || defCat.emoji || ""),
      // price: always keep stored value (admin intentionally sets it)
    };

    // Preserve ImageKit metadata when present so images can be managed on CDN
    if (stored.fileId)   merged.fileId   = stored.fileId;
    if (stored.filePath) merged.filePath = stored.filePath;

    return merged;
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
    // Use stored freeAddonNames if present; otherwise fall back to default
    const freeAddonNames = Array.isArray(stored.freeAddonNames)
      ? stored.freeAddonNames
      : (defPkg.freeAddonNames || []);
    console.log(`[Packages] Loading package "${defPkg.id}" from ${Object.keys(stored).length > 0 ? 'Firestore' : 'defaults'}`);
    return {
      ...defPkg,
      ...stored,
      freeAddonNames,
      visible: stored.visible !== undefined ? stored.visible : true,
      // Deep-merge addons so img/desc/price are never lost
      addons: mergeAddons(stored.addons, defPkg.addons),
    };
  });

  const custom = storedPackages.filter((pkg) => !DEFAULT_PACKAGE_IDS.has(pkg.id));
  return [...defaults, ...custom];
};

/* ─────────────────────────────────────────────────────────────────────────
   computeSyncedAddons — pure helper. Given the LATEST addons array for a
   package (read fresh, never from a stale snapshot) and the set of addon
   fields that were just saved elsewhere, returns the patched addons array
   plus whether anything actually changed. No I/O happens in here.
───────────────────────────────────────────────────────────────────────── */
function computeSyncedAddons(latestAddons, updatedByName, updatedByOriginal) {
  let changed = false;
  const newAddons = (latestAddons || []).map((addon) => {
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
      // Propagate ImageKit metadata so all packages have consistent CDN references
      ...(updated.fileId   ? { fileId:   updated.fileId   } : {}),
      ...(updated.filePath ? { filePath: updated.filePath } : {}),
      // Carry forward _originalName so future edits still resolve correctly
      _originalName: addon._originalName || addon.name,
    };

    if (
      next.name     !== addon.name    ||
      next.img      !== addon.img     ||
      next.desc     !== addon.desc    ||
      next.price    !== addon.price   ||
      next.emoji    !== addon.emoji   ||
      next.fileId   !== addon.fileId  ||
      next.filePath !== addon.filePath
    ) {
      changed = true;
    }
    return next;
  });

  return { newAddons, changed };
}

/* ─────────────────────────────────────────────────────────────────────────
   syncAddonChanges — when one package's addon list is saved, propagate
   any changed img/desc/price fields to the same-named addon in ALL other
   stored packages.  This is what makes "change once, reflect everywhere" work.

   CONCURRENCY-SAFE BY DESIGN:
   - We never read a list() snapshot and later write it back wholesale.
   - For Firestore, each OTHER package is updated inside its own
     db.runTransaction(): the transaction reads that single document fresh
     at commit-time, patches ONLY the matching addon fields, and writes the
     full merged document back atomically. If another request modified the
     same document in between, Firestore aborts and retries the transaction
     automatically against the new latest data — so a slower request can
     never clobber a faster one's write.
   - For the non-Firestore (in-memory/local JSON) fallback, there is no
     cross-process concurrency, but we still re-read the latest in-memory
     document immediately before computing the patch (never reusing the
     list() snapshot taken earlier) to keep the same guarantee.
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

  // Figure out which OTHER package ids could possibly need this addon synced.
  // IMPORTANT: this must include every default package id (basic/premium/
  // luxury) even if that package has never been saved to Firestore yet —
  // i.e. it has no document at all, or a document with no `addons` field.
  // Relying only on the raw list() snapshot here was the bug: a package
  // that was never edited has no Firestore doc, so it was silently skipped
  // and kept showing its old local default image forever, even though the
  // *other* (edited) package correctly got the new ImageKit URL.
  const all = await packages.list();
  const storedById = new Map(all.map((pkg) => [pkg.id, pkg]));

  const candidateIds = new Set(DEFAULT_PACKAGE_IDS);
  for (const pkg of all) candidateIds.add(pkg.id); // include any custom packages too
  candidateIds.delete(savedPackageId);

  // Default-catalog addons to seed from when a package has no Firestore
  // document (or no addons field) yet, keyed by package id.
  const defaultAddonsById = new Map(defaultPackages.map((p) => [p.id, p.addons || []]));

  const otherPackageIds = [...candidateIds].filter((id) => {
    const stored = storedById.get(id);
    const storedHasAddons = stored && Array.isArray(stored.addons) && stored.addons.length > 0;
    const hasDefaultAddons = (defaultAddonsById.get(id) || []).length > 0;
    return storedHasAddons || hasDefaultAddons;
  });

  if (otherPackageIds.length === 0) return;

  if (isFirebaseEnabled) {
    const collection = db.collection("packages");

    await Promise.all(
      otherPackageIds.map((pkgId) =>
        db.runTransaction(async (tx) => {
          const docRef = collection.doc(pkgId);
          const snap = await tx.get(docRef); // latest document at transaction time

          // If this package has no addons stored yet (new doc, or an existing
          // doc that simply never had its addons field set), seed from the
          // default catalog for this package id so the sync has something to
          // patch instead of silently doing nothing.
          const existingData = snap.exists ? snap.data() : {};
          const baseAddons = (Array.isArray(existingData.addons) && existingData.addons.length > 0)
            ? existingData.addons
            : (defaultAddonsById.get(pkgId) || []).map((a) => ({ ...a, _originalName: a.name }));

          const { newAddons, changed } = computeSyncedAddons(
            baseAddons,
            updatedByName,
            updatedByOriginal
          );

          if (!changed) return;

          if (snap.exists) {
            // Patch ONLY the addons field; every other field on the document
            // is left completely untouched.
            tx.update(docRef, {
              addons: newAddons,
              updatedAt: new Date().toISOString(),
            });
          } else {
            // No document yet for this default package — create it seeded
            // from defaults plus the freshly-synced addon, so the website
            // (which reads straight from Firestore via mergeWithDefaults)
            // immediately reflects the new image instead of waiting for an
            // unrelated future edit to that package.
            tx.set(docRef, {
              addons: newAddons,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        })
      )
    );
    return;
  }

  // Non-Firestore fallback (local dev / tests): re-read the latest copy of
  // each document right before patching it, rather than reusing the list()
  // snapshot from above, and write back only the addons field. Seed from
  // defaults the same way when no document/addons exist yet.
  for (const pkgId of otherPackageIds) {
    const latest = await packages.getById(pkgId);
    const baseAddons = (latest && Array.isArray(latest.addons) && latest.addons.length > 0)
      ? latest.addons
      : (defaultAddonsById.get(pkgId) || []).map((a) => ({ ...a, _originalName: a.name }));

    const { newAddons, changed } = computeSyncedAddons(
      baseAddons,
      updatedByName,
      updatedByOriginal
    );

    if (!changed) continue;

    if (latest) {
      await packages.update(pkgId, { addons: newAddons });
    } else {
      await packages.set(pkgId, { addons: newAddons });
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Route handlers
───────────────────────────────────────────────────────────────────────── */

const listPackages = asyncHandler(async (req, res) => {
  console.log('[Packages] Loading packages from Firestore');
  const raw = await packages.list();
  const data = mergeWithDefaults(raw);
  console.log(`[Packages] Returning ${data.length} packages`);
  data.forEach((pkg) => {
    console.log(`[Frontend loaded package] id="${pkg.id}" title="${pkg.title}" price=${pkg.price} addonsCount=${pkg.addons?.length ?? 0}`);
    (pkg.addons || []).forEach((a) => {
      console.log(`[Package API] Firestore addon image: pkg="${pkg.id}" addon="${a.name}" img="${a.img || '(empty)'}"`);
    });
  });
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
  console.log(`[Package Save] Package ID: ${req.params.id}`);
  console.log(`[Package Save] Firestore write started — title="${payload.title}" price=${payload.price}`);

  const item = DEFAULT_PACKAGE_IDS.has(req.params.id)
    ? await packages.set(req.params.id, payload)
    : await packages.update(req.params.id, payload);

  if (!item) {
    throw createHttpError(404, "Package not found");
  }

  console.log(`[Package Save] Firestore write finished — package "${req.params.id}" saved successfully`);

  // Read back the document from Firestore to verify the write
  const verified = await packages.getById(req.params.id);
  console.log(`[Package Save] Updated document:`, JSON.stringify({
    id: verified?.id,
    title: verified?.title,
    price: verified?.price,
    duration: verified?.duration,
    maxGuests: verified?.maxGuests,
    offerPrice: verified?.offerPrice,
    addonsCount: verified?.addons?.length ?? 0,
    addons: (verified?.addons || []).map((a) => ({
      name: a.name,
      img: a.img,
      fileId: a.fileId || null,
    })),
  }));

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
