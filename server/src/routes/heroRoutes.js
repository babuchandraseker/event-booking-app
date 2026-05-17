const express = require("express");
const {
  getHeroContent,
  publishHeroDraft,
  saveHeroDraft,
  uploadHeroMedia,
} = require("../controllers/heroController");
const requireAdminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", getHeroContent);
router.put("/draft", requireAdminAuth, saveHeroDraft);
router.post("/publish", requireAdminAuth, publishHeroDraft);
router.post("/media", requireAdminAuth, uploadHeroMedia);

module.exports = router;
