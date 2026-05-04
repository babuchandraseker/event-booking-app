const express = require("express");
const {
  createPackage,
  deletePackage,
  listPackages,
  updatePackage,
} = require("../controllers/packageController");

const router = express.Router();

router.route("/").get(listPackages).post(createPackage);
router.route("/:id").patch(updatePackage).delete(deletePackage);

module.exports = router;
