const express = require("express");
const {
  createBooking,
  deleteBooking,
  getBooking,
  listBookings,
  updateBooking,
  updateBookingStatus,
} = require("../controllers/bookingController");
const requireAdminAuth = require("../middleware/adminAuth");
const createRateLimiter = require("../middleware/rateLimiter");

const router = express.Router();
const bookingCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many booking attempts. Please try again later.",
});

router.route("/").get(requireAdminAuth, listBookings).post(bookingCreateLimiter, createBooking);
router.route("/:id").get(requireAdminAuth, getBooking).patch(requireAdminAuth, updateBooking).delete(requireAdminAuth, deleteBooking);
router.patch("/:id/status", requireAdminAuth, updateBookingStatus);

module.exports = router;
