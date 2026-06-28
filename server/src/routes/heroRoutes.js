const express         = require('express');
const { heroUpload }  = require('../middleware/heroUpload');
const {
  getHeroContent,
  publishHeroDraft,
  saveHeroDraft,
  uploadHeroMedia,
  deleteHeroMedia,
} = require('../controllers/heroController');
const requireAdminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/',                getHeroContent);
router.put('/draft',           requireAdminAuth, saveHeroDraft);
router.post('/publish',        requireAdminAuth, publishHeroDraft);

// Accept both multipart (file) and JSON (legacy dataUrl)
router.post('/media',
  requireAdminAuth,
  (req, res, next) => {
    // Only run multer on multipart requests
    const ct = req.headers['content-type'] || '';
    if (ct.includes('multipart/form-data')) {
      heroUpload.single('file')(req, res, next);
    } else {
      next();
    }
  },
  uploadHeroMedia
);

router.post('/delete-media',   requireAdminAuth, deleteHeroMedia);

module.exports = router;
