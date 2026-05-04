const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");

const bookings = createRepository("bookings");
const contactMessages = createRepository("contactMessages");

const sortNewestFirst = (items) =>
  [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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

module.exports = {
  getAdminDashboard,
  listAdminBookings,
};
