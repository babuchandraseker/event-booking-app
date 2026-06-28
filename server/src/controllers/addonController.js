const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertNumber, requireFields } = require("../utils/validation");

const addons = createRepository("addons");

const listAddons = asyncHandler(async (req, res) => {
  const data = await addons.list();
  res.json({ success: true, data });
});

const createAddon = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "price"]);
  assertNumber(req.body.price, "price");

  const addon = await addons.create({
    name: req.body.name,
    price: Number(req.body.price),
    category: req.body.category || "general",
    active: req.body.active !== false,
  });

  res.status(201).json({ success: true, data: addon });
});

const updateAddon = asyncHandler(async (req, res) => {
  assertNumber(req.body.price, "price");

  const payload = {
    ...req.body,
    ...(req.body.price !== undefined ? { price: Number(req.body.price) } : {}),
  };

  const addon = await addons.update(req.params.id, payload);

  if (!addon) {
    throw createHttpError(404, "Add-on not found");
  }

  res.json({ success: true, data: addon });
});

const deleteAddon = asyncHandler(async (req, res) => {
  const deleted = await addons.remove(req.params.id);

  if (!deleted) {
    throw createHttpError(404, "Add-on not found");
  }

  res.json({ success: true, message: "Add-on deleted" });
});

module.exports = {
  listAddons,
  createAddon,
  updateAddon,
  deleteAddon,
};
