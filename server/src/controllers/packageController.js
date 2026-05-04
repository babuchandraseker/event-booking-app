const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertNumber, requireFields } = require("../utils/validation");

const packages = createRepository("packages");

const listPackages = asyncHandler(async (req, res) => {
  const data = await packages.list();
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

  const payload = {
    ...req.body,
    ...(req.body.price !== undefined ? { price: Number(req.body.price) } : {}),
    ...(req.body.maxGuests !== undefined ? { maxGuests: Number(req.body.maxGuests) } : {}),
  };

  const item = await packages.update(req.params.id, payload);

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
