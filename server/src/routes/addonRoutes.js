const express = require("express");
const {
  createAddon,
  deleteAddon,
  listAddons,
  updateAddon,
} = require("../controllers/addonController");

const router = express.Router();

router.route("/").get(listAddons).post(createAddon);
router.route("/:id").patch(updateAddon).delete(deleteAddon);

module.exports = router;
