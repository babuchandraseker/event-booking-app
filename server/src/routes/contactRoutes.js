const express = require("express");
const {
  createContactMessage,
  listContactMessages,
} = require("../controllers/contactController");

const router = express.Router();

router.route("/").get(listContactMessages).post(createContactMessage);

module.exports = router;
