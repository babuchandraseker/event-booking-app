const express = require("express");
const {
  createBlockedSlot,
  deleteBlockedSlot,
  exportAdminBookings,
  getAdminDashboard,
  listBlockedSlots,
  listAdminBookings,
  loginAdmin,
} = require("../controllers/adminController");
const {
  getBusinessSettings,
  updateAdminPassword,
  updateBusinessSettings,
} = require("../controllers/settingsController");
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
router.route("/blocked-slots").get(listBlockedSlots).post(createBlockedSlot);
router.delete("/blocked-slots/:id", deleteBlockedSlot);
router.get("/settings", getBusinessSettings);
router.patch("/settings", updateBusinessSettings);
router.patch("/settings/password", updateAdminPassword);

module.exports = router;
