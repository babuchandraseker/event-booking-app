const jwt = require("jsonwebtoken");
const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertFutureDate, requireFields } = require("../utils/validation");
const { buildBookingsExcelHtml } = require("../services/bookingSheetService");
const { getJwtSecret } = require("../middleware/adminAuth");
const { getStoredSettings } = require("./settingsController");
const availabilityCache = require("../services/availabilityCache");

const bookings = createRepository("bookings");
const blockedSlots = createRepository("blockedSlots");
const contactMessages = createRepository("contactMessages");

const sortNewestFirst = (items) =>
  [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

const sortBlocks = (items) =>
  [...items].sort((a, b) => {
    const byDate = String(a.eventDate || "").localeCompare(String(b.eventDate || ""));
    if (byDate !== 0) return byDate;
    return String(a.eventTime || "").localeCompare(String(b.eventTime || ""));
  });

const loginAdmin = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);

  const businessSettings = await getStoredSettings();
  const defaultAdminEmail = process.env.ADMIN_EMAIL || "admin@velvetnights.in";
  const allowedEmails = new Set([
    defaultAdminEmail,
    businessSettings.profileEmail,
  ].filter(Boolean));
  const adminPassword = businessSettings.adminPassword || process.env.ADMIN_PASSWORD || "admin123";

  if (!allowedEmails.has(req.body.email) || req.body.password !== adminPassword) {
    throw createHttpError(401, "Invalid admin credentials");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "2h";
  const token = jwt.sign(
    {
      role: "admin",
      email: req.body.email,
    },
    getJwtSecret(),
    {
      subject: "admin",
      expiresIn,
    }
  );

  res.json({
    success: true,
    data: {
      token,
      expiresIn,
      admin: {
        email: req.body.email,
        role: "admin",
      },
    },
  });
});

const listAdminBookings = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const allBookings = await bookings.list();
  const filteredBookings = status
    ? allBookings.filter((booking) => booking.status === status)
    : allBookings;

  res.json({
    success: true,
    data: sortNewestFirst(filteredBookings),
  });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [allBookings, allMessages] = await Promise.all([
    bookings.list(),
    contactMessages.list(),
  ]);

  const bookingCounts = allBookings.reduce(
    (counts, booking) => ({
      ...counts,
      [booking.status]: (counts[booking.status] || 0) + 1,
    }),
    {}
  );

  res.json({
    success: true,
    data: {
      totalBookings: allBookings.length,
      pendingBookings: bookingCounts.pending || 0,
      confirmedBookings: bookingCounts.confirmed || 0,
      cancelledBookings: bookingCounts.cancelled || 0,
      completedBookings: bookingCounts.completed || 0,
      totalContactMessages: allMessages.length,
      latestBookings: sortNewestFirst(allBookings).slice(0, 10),
      latestContactMessages: sortNewestFirst(allMessages).slice(0, 10),
    },
  });
});

const exportAdminBookings = asyncHandler(async (req, res) => {
  const allBookings = await bookings.list();
  const excelHtml = buildBookingsExcelHtml(sortNewestFirst(allBookings));
  const date = new Date().toISOString().slice(0, 10);

  res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="bookings-${date}.xls"`
  );
  res.send(excelHtml);
});

const listBlockedSlots = asyncHandler(async (req, res) => {
  const data = await blockedSlots.list();
  res.json({ success: true, data: sortBlocks(data) });
});

const createBlockedSlot = asyncHandler(async (req, res) => {
  requireFields(req.body, ["eventDate"]);

  const eventDate = String(req.body.eventDate || "").trim();
  const eventTime = req.body.eventTime ? String(req.body.eventTime).trim() : null;
  const reason = req.body.reason ? String(req.body.reason).trim() : null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    throw createHttpError(400, "eventDate must be in YYYY-MM-DD format");
  }

  assertFutureDate(eventDate);

  const allBlocks = await blockedSlots.list();
  const duplicate = allBlocks.find((item) => (
    item.eventDate === eventDate &&
    (!item.eventTime || !eventTime || item.eventTime === eventTime)
  ));

  if (duplicate) {
    throw createHttpError(409, "This date or slot is already blocked");
  }

  const blockedSlot = await blockedSlots.create({
    eventDate,
    eventTime,
    reason,
  });

  availabilityCache.invalidate(); // Clear cached availability after blocking a slot
  res.status(201).json({ success: true, data: blockedSlot });
});

const deleteBlockedSlot = asyncHandler(async (req, res) => {
  const deleted = await blockedSlots.remove(req.params.id);

  if (!deleted) {
    throw createHttpError(404, "Blocked slot not found");
  }

  availabilityCache.invalidate(); // Clear cached availability after removing a block
  res.json({ success: true, message: "Blocked slot removed" });
});

module.exports = {
  createBlockedSlot,
  deleteBlockedSlot,
  exportAdminBookings,
  getAdminDashboard,
  listBlockedSlots,
  loginAdmin,
  listAdminBookings,
};
