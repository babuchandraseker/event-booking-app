const express = require("express");
const {
  createPackage,
  deletePackage,
  listPackages,
  updatePackage,
} = require("../controllers/packageController");
const requireAdminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", listPackages);
router.post("/", requireAdminAuth, createPackage);
router.patch("/:id", requireAdminAuth, updatePackage);
router.delete("/:id", requireAdminAuth, deletePackage);

module.exports = router;
