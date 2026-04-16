const express = require('express');
const {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', listFiles);
router.get('/:id/download', downloadFile);
router.post('/upload', protect, upload.single('file'), uploadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
