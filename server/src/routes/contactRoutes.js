const express = require("express");
const {
  createContactMessage,
  listContactMessages,
} = require("../controllers/contactController");
const createRateLimiter = require("../middleware/rateLimiter");

const router = express.Router();
const contactCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many contact messages. Please try again later.",
});

router.route("/").get(listContactMessages).post(contactCreateLimiter, createContactMessage);

module.exports = router;
