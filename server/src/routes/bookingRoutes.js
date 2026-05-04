const express = require("express");
const {
  createBooking,
  deleteBooking,
  getBooking,
  listBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const router = express.Router();

router.route("/").get(listBookings).post(createBooking);
router.route("/:id").get(getBooking).delete(deleteBooking);
router.patch("/:id/status", updateBookingStatus);

module.exports = router;
