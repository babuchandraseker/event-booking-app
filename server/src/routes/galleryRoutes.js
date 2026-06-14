const express = require("express");
const {
  createGalleryItem,
  deleteGalleryItem,
  listGallery,
  resetGallery,
  updateGalleryItem,
} = require("../controllers/galleryController");
const requireAdminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", listGallery);
router.post("/", requireAdminAuth, createGalleryItem);
router.post("/reset", requireAdminAuth, resetGallery);
router.patch("/:id", requireAdminAuth, updateGalleryItem);
router.delete("/:id", requireAdminAuth, deleteGalleryItem);

module.exports = router;
