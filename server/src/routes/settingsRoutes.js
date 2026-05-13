const express = require("express");
const { getBusinessSettings } = require("../controllers/settingsController");

const router = express.Router();

router.get("/", getBusinessSettings);

module.exports = router;
