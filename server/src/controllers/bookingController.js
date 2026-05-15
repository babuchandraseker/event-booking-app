const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const {
  assertEmail,
  assertFutureDate,
  assertPositiveNumber,
  assertPhone,
  requireFields,
} = require("../utils/validation");
const { notifyAdminAboutBooking } = require("../services/notificationService");
const { appendBookingToSheet } = require("../services/bookingSheetService");
const { DEFAULT_PACKAGE_IDS, defaultPackages } = require("../data/defaultCatalog");

const bookings = createRepository("bookings");
const packages = createRepository("packages");
const addons = createRepository("addons");
const LEGACY_PACKAGE_IDS = new Set(["signature", "romantic", "birthday", "surprise"]);
const BUILT_IN_ADDON_IDS = new Set([
  "Cake",
  "Fog Entry",
  "Photography",
  "Rose Pathway",
  "Balloon Setup",
  "Extra 30 Minutes",
  "cake",
  "fog-entry",
  "photography",
  "rose-pathway",
  "balloon-setup",
  "extra-30-minutes",
  "addon-cake",
  "addon-photography",
]);
const BOOKING_LOCK_STATUSES = new Set(["pending", "confirmed"]);
let bookingWriteQueue = Promise.resolve();

const withBookingWriteLock = (operation) => {
  const run = bookingWriteQueue.catch(() => undefined).then(operation);
  bookingWriteQueue = run.catch(() => undefined);
  return run;
};

const normalizeAddons = (value) => {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [];
};

const mergePackagesWithDefaults = async () => {
  const storedPackages = await packages.list();
  const byId = new Map(storedPackages.map((pkg) => [pkg.id, pkg]));
  return defaultPackages.map((pkg) => ({ ...pkg, ...(byId.get(pkg.id) || {}) }));
};

const getPackageForBooking = async (packageId) => {
  const catalogPackage = (await mergePackagesWithDefaults()).find((pkg) => pkg.id === packageId);
  return catalogPackage || await packages.getById(packageId);
};

const packageExists = async (packageId) => {
  if (DEFAULT_PACKAGE_IDS.has(packageId) || LEGACY_PACKAGE_IDS.has(packageId)) {
    return true;
  }

  return Boolean(await packages.getById(packageId));
};

const assertPackageExists = async (packageId) => {
  if (!(await packageExists(packageId))) {
    throw createHttpError(400, "packageId must reference an existing package");
  }
};

const assertAddonsExist = async (addonIds = [], packageId = null) => {
  if (!Array.isArray(addonIds)) {
    throw createHttpError(400, "addons must be an array");
  }

  const missing = [];
  const packageInfo = packageId ? await getPackageForBooking(packageId) : null;
  const packageAddonNames = new Set((packageInfo?.addons || []).map((addon) => addon.name));

  for (const addonId of addonIds) {
    if (BUILT_IN_ADDON_IDS.has(addonId) || packageAddonNames.has(addonId)) {
      continue;
    }

    const addon = await addons.getById(addonId);
    if (!addon) {
      missing.push(addonId);
    }
  }

  if (missing.length) {
    throw createHttpError(400, `addons must reference existing add-ons: ${missing.join(", ")}`);
  }
};

const normalizeAddonDetails = (packageInfo, addonNames = []) => {
  const selectedNames = Array.isArray(addonNames) ? addonNames : [];
  const packageAddons = Array.isArray(packageInfo?.addons) ? packageInfo.addons : [];

  return selectedNames.map((name) => {
    const matched = packageAddons.find((addon) => addon.name === name);
    return {
      name,
      price: Number(matched?.price || 0),
    };
  });
};

const assertSlotAvailable = async (candidate, ignoreId = null) => {
  if (candidate.status && !BOOKING_LOCK_STATUSES.has(candidate.status)) {
    return;
  }

  if (!candidate.eventDate || !candidate.eventTime) {
    return;
  }

  const allBookings = await bookings.list();
  const duplicate = allBookings.find((booking) => {
    if (booking.id === ignoreId) {
      return false;
    }

    if (!BOOKING_LOCK_STATUSES.has(booking.status)) {
      return false;
    }

    return (
      booking.eventDate === candidate.eventDate &&
      booking.eventTime === candidate.eventTime
    );
  });

  if (duplicate) {
    throw createHttpError(409, "This date and slot is already booked");
  }
};

const validateBookingPayload = async (payload, { partial = false } = {}) => {
  if (!partial) {
    requireFields(payload, ["name", "phone", "email", "eventType", "eventDate", "eventTime", "packageId"]);
  }

  if (payload.phone !== undefined) {
    assertPhone(payload.phone);
  }

  if (payload.email !== undefined && payload.email !== null && payload.email !== "") {
    assertEmail(payload.email);
  }

  if (payload.eventDate !== undefined) {
    assertFutureDate(payload.eventDate);
  }

  if (payload.guestCount !== undefined) {
    assertPositiveNumber(payload.guestCount, "guestCount");
  }

  if (payload.packageId !== undefined) {
    await assertPackageExists(payload.packageId);
  }

  if (payload.addons !== undefined) {
    await assertAddonsExist(payload.addons, payload.packageId);
  }
};

const listBookings = asyncHandler(async (req, res) => {
  const data = await bookings.list();
  res.json({ success: true, data });
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookings.getById(req.params.id);

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  res.json({ success: true, data: booking });
});

const getSlotAvailability = asyncHandler(async (req, res) => {
  const eventDate = String(req.query.date || "").trim();

  if (!eventDate) {
    throw createHttpError(400, "date query parameter is required");
  }

  assertFutureDate(eventDate, "date");

  const data = await bookings.list();
  const bookedSlots = data
    .filter((booking) => (
      booking.eventDate === eventDate &&
      BOOKING_LOCK_STATUSES.has(booking.status)
    ))
    .map((booking) => booking.eventTime)
    .filter(Boolean);

  res.json({ success: true, data: { eventDate, bookedSlots } });
});

const createBooking = asyncHandler(async (req, res) => {
  await validateBookingPayload(req.body);
  const packageInfo = await getPackageForBooking(req.body.packageId);
  const addonDetails = Array.isArray(req.body.addonsDetailed)
    ? req.body.addonsDetailed.map((addon) => ({
      name: addon.name,
      price: Number(addon.price || 0),
    })).filter((addon) => addon.name)
    : normalizeAddonDetails(packageInfo, req.body.addons);
  const amount = Number(req.body.amount || 0) || Number(packageInfo?.price || 0)
    + addonDetails.reduce((sum, addon) => sum + Number(addon.price || 0), 0);

  const payload = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email || null,
    eventType: req.body.eventType,
    eventDate: req.body.eventDate,
    eventTime: req.body.eventTime || null,
    packageId: req.body.packageId,
    packageTitle: req.body.packageTitle || packageInfo?.title || req.body.packageId,
    amount,
    paidAmount: Number(req.body.paidAmount || 0),
    paymentMode: req.body.paymentMode || null,
    guestCount: Number(req.body.guestCount || 1),
    location: req.body.location || null,
    addons: normalizeAddons(req.body.addons) || [],
    addonsDetailed: addonDetails,
    notes: req.body.notes || null,
    status: "pending",
    paymentStatus: req.body.paymentStatus || "not_started",
  };

  const booking = await withBookingWriteLock(async () => {
    await assertSlotAvailable(payload);
    return bookings.create(payload);
  });

  await notifyAdminAboutBooking(booking);

  try {
    await appendBookingToSheet(booking);
  } catch (error) {
    console.error("Booking Excel/CSV sync failed:", error.message);
  }

  res.status(201).json({ success: true, data: booking });
});

const updateBooking = asyncHandler(async (req, res) => {
  const existing = await bookings.getById(req.params.id);

  if (!existing) {
    throw createHttpError(404, "Booking not found");
  }

  const allowedFields = [
    "eventDate",
    "eventTime",
    "guestCount",
    "packageId",
    "addons",
    "notes",
    "location",
  ];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (!Object.keys(updates).length) {
    throw createHttpError(400, `At least one field is required: ${allowedFields.join(", ")}`);
  }

  const nextBooking = {
    ...existing,
    ...updates,
    ...(updates.guestCount !== undefined ? { guestCount: Number(updates.guestCount) } : {}),
    ...(updates.addons !== undefined ? { addons: normalizeAddons(updates.addons) } : {}),
    ...(updates.notes !== undefined ? { notes: updates.notes || null } : {}),
    ...(updates.location !== undefined ? { location: updates.location || null } : {}),
    ...(updates.eventTime !== undefined ? { eventTime: updates.eventTime || null } : {}),
  };

  await validateBookingPayload(updates, { partial: true });
  await assertSlotAvailable(nextBooking, existing.id);

  const booking = await bookings.update(req.params.id, updates.guestCount !== undefined
    ? { ...updates, guestCount: Number(updates.guestCount) }
    : updates);

  res.json({ success: true, data: booking });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  requireFields(req.body, ["status"]);

  const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

  if (!allowedStatuses.includes(req.body.status)) {
    throw createHttpError(400, `status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const existing = await bookings.getById(req.params.id);

  if (!existing) {
    throw createHttpError(404, "Booking not found");
  }

  if (BOOKING_LOCK_STATUSES.has(req.body.status)) {
    await assertSlotAvailable({ ...existing, status: req.body.status }, existing.id);
  }

  const booking = await bookings.update(req.params.id, {
    status: req.body.status,
  });

  res.json({ success: true, data: booking });
});

const deleteBooking = asyncHandler(async (req, res) => {
  const deleted = await bookings.remove(req.params.id);

  if (!deleted) {
    throw createHttpError(404, "Booking not found");
  }

  res.json({ success: true, message: "Booking deleted" });
});

module.exports = {
  listBookings,
  getBooking,
  getSlotAvailability,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
};
