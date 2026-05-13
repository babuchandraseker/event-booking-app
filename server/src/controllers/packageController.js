const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertNumber, requireFields } = require("../utils/validation");
const { DEFAULT_PACKAGE_IDS, defaultPackages } = require("../data/defaultCatalog");

const packages = createRepository("packages");

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

    return normalized;
  }).filter((item) => item.name);

const normalizePackagePayload = (body) => ({
  ...body,
  ...(body.price !== undefined ? { price: Number(body.price) } : {}),
  ...(body.maxGuests !== undefined ? { maxGuests: Number(body.maxGuests) } : {}),
  ...(body.included !== undefined ? { included: normalizeCatalogItems(body.included) } : {}),
  ...(body.addons !== undefined ? { addons: normalizeCatalogItems(body.addons) } : {}),
});

const mergeWithDefaults = (storedPackages) => {
  const byId = new Map(storedPackages.map((pkg) => [pkg.id, pkg]));
  const defaults = defaultPackages.map((pkg) => ({
    ...pkg,
    ...(byId.get(pkg.id) || {}),
  }));
  const custom = storedPackages.filter((pkg) => !DEFAULT_PACKAGE_IDS.has(pkg.id));
  return [...defaults, ...custom];
};

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
