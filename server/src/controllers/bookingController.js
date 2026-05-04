const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertNumber, requireFields } = require("../utils/validation");
const { notifyAdminAboutBooking } = require("../services/notificationService");

const bookings = createRepository("bookings");

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
  requireFields(req.body, ["name", "phone", "eventType", "eventDate", "packageId"]);
  assertNumber(req.body.guestCount, "guestCount");

  const booking = await bookings.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email || null,
    eventType: req.body.eventType,
    eventDate: req.body.eventDate,
    eventTime: req.body.eventTime || null,
    packageId: req.body.packageId,
    guestCount: Number(req.body.guestCount || 1),
    location: req.body.location || null,
    addons: Array.isArray(req.body.addons) ? req.body.addons : [],
    notes: req.body.notes || null,
    status: "pending",
    paymentStatus: "not_started",
  });

  await notifyAdminAboutBooking(booking);

  res.status(201).json({ success: true, data: booking });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  requireFields(req.body, ["status"]);

  const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

  if (!allowedStatuses.includes(req.body.status)) {
    throw createHttpError(400, `status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const booking = await bookings.update(req.params.id, {
    status: req.body.status,
  });

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

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
  updateBookingStatus,
  deleteBooking,
};
