const router = require('express').Router();
const multer = require('multer');
const { bucket } = require('../firebase');
const verifyToken = require('../middleware/verifyToken');

// --------------------
// Multer config
// --------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// --------------------
// Upload Route
// --------------------
router.post(
  '/',
  upload.single('image'),   // ✅ MUST come first
  // verifyToken,              // ✅ after multer
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      const folder = req.body.folder || 'misc';
      const safeName = req.file.originalname.replace(/\s+/g, '_');
      const filePath = `3dHub/${folder}/${Date.now()}_${safeName}`;

      const blob = bucket.file(filePath);

      const blobStream = blob.createWriteStream({
        resumable: false, // ✅ IMPORTANT for Cloud Run
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        console.error('Firebase upload error:', err);
        return res.status(500).json({
          message: 'Firebase upload failed',
          error: err.message,
        });
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          blob.name
        )}?alt=media`;

        return res.status(200).json({ imageUrl: publicUrl });
      });

      blobStream.end(req.file.buffer);

    } catch (err) {
      console.error('Upload handler error:', err);
      return res.status(500).json({
        message: 'Server error during upload',
        error: err.message,
      });
    }
  }
);

module.exports = router;
