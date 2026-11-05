const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fileController = require('../../controllers/file.controller');
const fileService = require('../../services/file.service');
const { authenticate } = require('../../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileService.getUploadsDir());
  },
  filename: (req, file, cb) => {
    const sanitized = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueKey = `${uuidv4()}-${sanitized}`;
    cb(null, uniqueKey);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB maximum file size
  }
});

const router = express.Router();

router.use(authenticate);

router.post('/', upload.single('file'), fileController.upload);
router.get('/', fileController.list);
router.get('/:id', fileController.getMetadata);
router.get('/:id/download', fileController.download);
router.delete('/:id', fileController.delete);

module.exports = router;

