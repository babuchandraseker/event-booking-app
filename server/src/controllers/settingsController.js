const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { requireFields } = require("../utils/validation");

const settings = createRepository("settings");
const SETTINGS_ID = "business";

const defaultSettings = {
  profileName: "Admin",
  profileEmail: process.env.ADMIN_EMAIL || "admin@velvetnights.in",
  businessName: "Velvet Nights",
  tagline: "Private Event Studio",
  description: "Chennai's premier indoor private event studio, crafting unforgettable moments for every occasion. Premium, intimate, and entirely yours.",
  city: "Chennai",
  address: "T. Nagar, Chennai - 600017",
  openingHours: "9 AM - 11 PM",
  phone: "+91 99999 99999",
  whatsapp: "+91 99999 99999",
  email: "hello@velvetnights.in",
  instagram: "@velvetnights",
};

const editableFields = [
  "profileName",
  "profileEmail",
  "businessName",
  "tagline",
  "description",
  "city",
  "address",
  "openingHours",
  "phone",
  "whatsapp",
  "email",
  "instagram",
];

const publicSettings = (data = {}) => {
  const merged = { ...defaultSettings, ...data };
  const sanitized = {};

  for (const field of editableFields) {
    sanitized[field] = merged[field] || "";
  }

  return sanitized;
};

const getStoredSettings = async () => {
  const stored = await settings.getById(SETTINGS_ID);
  return { ...defaultSettings, ...(stored || {}) };
};

const getBusinessSettings = asyncHandler(async (req, res) => {
  const stored = await getStoredSettings();
  res.json({ success: true, data: publicSettings(stored) });
});

const updateBusinessSettings = asyncHandler(async (req, res) => {
  const updates = {};

  for (const field of editableFields) {
    if (req.body[field] !== undefined) {
      updates[field] = String(req.body[field]).trim();
    }
  }

  if (!Object.keys(updates).length) {
    throw createHttpError(400, `At least one field is required: ${editableFields.join(", ")}`);
  }

  const saved = await settings.set(SETTINGS_ID, updates);
  res.json({ success: true, data: publicSettings(saved) });
});

const updateAdminPassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["currentPassword", "newPassword"]);

  const stored = await getStoredSettings();
  const currentPassword = stored.adminPassword || process.env.ADMIN_PASSWORD || "admin123";

  if (req.body.currentPassword !== currentPassword) {
    throw createHttpError(401, "Current password is incorrect");
  }

  if (String(req.body.newPassword).length < 6) {
    throw createHttpError(400, "New password must be at least 6 characters");
  }

  await settings.set(SETTINGS_ID, {
    adminPassword: req.body.newPassword,
  });

  res.json({ success: true, message: "Password updated" });
});

module.exports = {
  getBusinessSettings,
  getStoredSettings,
  updateAdminPassword,
  updateBusinessSettings,
};
