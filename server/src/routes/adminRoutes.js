const express = require("express");
const {
  exportAdminBookings,
  getAdminDashboard,
  listAdminBookings,
  loginAdmin,
} = require("../controllers/adminController");
const requireAdminAuth = require("../middleware/adminAuth");
const createRateLimiter = require("../middleware/rateLimiter");

const router = express.Router();
const adminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many admin login attempts. Please try again later.",
});

router.post("/login", adminLoginLimiter, loginAdmin);

router.use(requireAdminAuth);

router.get("/dashboard", getAdminDashboard);
router.get("/bookings", listAdminBookings);
router.get("/bookings/export", exportAdminBookings);

module.exports = router;
