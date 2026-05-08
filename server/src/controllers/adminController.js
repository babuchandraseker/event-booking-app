const jwt = require("jsonwebtoken");
const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { requireFields } = require("../utils/validation");
const { buildBookingsExcelHtml } = require("../services/bookingSheetService");
const { getJwtSecret } = require("../middleware/adminAuth");

const bookings = createRepository("bookings");
const contactMessages = createRepository("contactMessages");

const sortNewestFirst = (items) =>
  [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

const loginAdmin = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@velvetnights.in";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (req.body.email !== adminEmail || req.body.password !== adminPassword) {
    throw createHttpError(401, "Invalid admin credentials");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "2h";
  const token = jwt.sign(
    {
      role: "admin",
      email: adminEmail,
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
        email: adminEmail,
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

module.exports = {
  exportAdminBookings,
  getAdminDashboard,
  loginAdmin,
  listAdminBookings,
};
