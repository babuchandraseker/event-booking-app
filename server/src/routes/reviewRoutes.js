const express = require("express");
const {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
} = require("../controllers/reviewController");
const requireAdminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", listReviews);
router.post("/", requireAdminAuth, createReview);
router.patch("/:id", requireAdminAuth, updateReview);
router.delete("/:id", requireAdminAuth, deleteReview);

module.exports = router;
