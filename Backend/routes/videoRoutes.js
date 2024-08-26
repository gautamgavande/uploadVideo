// routes/videoRoutes.js
const express = require('express');
const multer = require('multer');
const { uploadVideo } = require('../controllers/videoController');

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only video files are allowed!'), false);
    }
  },
});

router.post('/upload', upload.array('videos', 1), uploadVideo);

module.exports = router;
