const express = require('express');
const fs = require('fs');
const path = require('path');
const { upload, uploadDir } = require('../middleware/upload');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function getPublicUrl(req, filename) {
  const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
  return `${backendUrl}/uploads/${filename}`;
}

// POST /api/upload (Admin only - Single file)
router.post('/', authenticate, requireAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const publicUrl = getPublicUrl(req, req.file.filename);

    return res.status(201).json({
      success: true,
      url: publicUrl,
      relativeUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

// POST /api/upload/multiple (Admin only - Multiple files)
router.post('/multiple', authenticate, requireAdmin, (req, res) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const uploaded = req.files.map((file) => ({
      url: getPublicUrl(req, file.filename),
      relativeUrl: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }));

    return res.status(201).json({ success: true, files: uploaded });
  });
});

// DELETE /api/upload/:filename (Admin only)
router.delete('/:filename', authenticate, requireAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    // Security: sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadDir, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: 'File removed successfully' });
    } else {
      return res.status(404).json({ success: false, error: 'File not found on storage' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

module.exports = router;
