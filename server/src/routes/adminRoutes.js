const express = require("express");
const {
  getAdminDashboard,
  listAdminBookings,
} = require("../controllers/adminController");
const requireAdminApiKey = require("../middleware/adminAuth");

const router = express.Router();

router.use(requireAdminApiKey);

router.get("/dashboard", getAdminDashboard);
router.get("/bookings", listAdminBookings);

module.exports = router;
