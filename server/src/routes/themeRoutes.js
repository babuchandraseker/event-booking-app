const express = require("express");
const { listThemes, createTheme, updateTheme, deleteTheme, uploadThemeMedia, clearThemeMedia } = require("../controllers/themeController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Public — used by the frontend ThemeSection
router.get("/", listThemes);

// Admin only — mutations require auth
router.post("/", adminAuth, createTheme);
router.patch("/:id", adminAuth, updateTheme);
router.delete("/:id", adminAuth, deleteTheme);
router.post("/:id/media", adminAuth, uploadThemeMedia);
router.delete("/:id/media/:slot", adminAuth, clearThemeMedia);

module.exports = router;