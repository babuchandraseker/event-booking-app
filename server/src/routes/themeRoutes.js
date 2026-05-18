const express = require("express");
const { listThemes, createTheme, updateTheme, deleteTheme } = require("../controllers/themeController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Public — used by the frontend ThemeSection
router.get("/", listThemes);

// Admin only — mutations require auth
router.post("/", adminAuth, createTheme);
router.patch("/:id", adminAuth, updateTheme);
router.delete("/:id", adminAuth, deleteTheme);

module.exports = router;