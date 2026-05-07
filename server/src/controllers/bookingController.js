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

const bookings = createRepository("bookings");
const packages = createRepository("packages");
const addons = createRepository("addons");
const BUILT_IN_PACKAGE_IDS = new Set(["signature", "romantic", "birthday", "surprise"]);
const BUILT_IN_ADDON_IDS = new Set(["cake", "photography", "addon-cake", "addon-photography"]);
const BOOKING_LOCK_STATUSES = new Set(["pending", "confirmed"]);

const normalizeLocation = (location) => String(location || "").trim().toLowerCase();

const normalizeAddons = (value) => {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [];
};

const packageExists = async (packageId) => {
  if (BUILT_IN_PACKAGE_IDS.has(packageId)) {
    return true;
  }

  return Boolean(await packages.getById(packageId));
};

const assertPackageExists = async (packageId) => {
  if (!(await packageExists(packageId))) {
    throw createHttpError(400, "packageId must reference an existing package");
  }
};

const assertAddonsExist = async (addonIds = []) => {
  if (!Array.isArray(addonIds)) {
    throw createHttpError(400, "addons must be an array");
  }

  const missing = [];

  for (const addonId of addonIds) {
    if (BUILT_IN_ADDON_IDS.has(addonId)) {
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

const assertSlotAvailable = async (candidate, ignoreId = null) => {
  if (candidate.status && !BOOKING_LOCK_STATUSES.has(candidate.status)) {
    return;
  }

  if (!candidate.eventDate || !candidate.eventTime || !candidate.packageId) {
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
      booking.eventTime === candidate.eventTime &&
      booking.packageId === candidate.packageId &&
      normalizeLocation(booking.location) === normalizeLocation(candidate.location)
    );
  });

  if (duplicate) {
    throw createHttpError(409, "This date, time, package, and location is already booked");
  }
};

const validateBookingPayload = async (payload, { partial = false } = {}) => {
  if (!partial) {
    requireFields(payload, ["name", "phone", "eventType", "eventDate", "packageId"]);
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
    await assertAddonsExist(payload.addons);
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

const createBooking = asyncHandler(async (req, res) => {
  await validateBookingPayload(req.body);

  const payload = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email || null,
    eventType: req.body.eventType,
    eventDate: req.body.eventDate,
    eventTime: req.body.eventTime || null,
    packageId: req.body.packageId,
    guestCount: Number(req.body.guestCount || 1),
    location: req.body.location || null,
    addons: normalizeAddons(req.body.addons) || [],
    notes: req.body.notes || null,
    status: "pending",
    paymentStatus: "not_started",
  };

  await assertSlotAvailable(payload);

  const booking = await bookings.create(payload);

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
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
};
