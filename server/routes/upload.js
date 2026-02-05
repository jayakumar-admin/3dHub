const router = require('express').Router();
const multer = require('multer');
const { bucket } = require('../firebase');
const verifyToken = require('../middleware/verifyToken');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * @route   POST /api/upload
 * @desc    Upload an image to Firebase Storage
 * @access  Private (Any authenticated user)
 */
router.post('/', [verifyToken, upload.single('image')], async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    
    const folder = req.body.folder || 'misc'; // e.g., 'products', 'settings', 'avatars'
    const blob = bucket.file(`3dHub/${folder}/${Date.now()}_${req.file.originalname}`);
    
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      // This will handle errors during the upload stream to Firebase.
      console.error('Firebase upload stream error:', err);
      const streamError = new Error(`Error uploading to Firebase: ${err.message}`);
      next(streamError);
    });

    blobStream.on('finish', async () => {
      // The public URL can be accessed via this format if the bucket rules are set to public read.
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
      // Check if headers have been sent to avoid "Cannot set headers after they are sent to the client" error
      if (!res.headersSent) {
        res.status(200).json({ imageUrl: publicUrl });
      }
    });

    blobStream.end(req.file.buffer);

  } catch (err) {
    // This will catch synchronous errors (e.g., from blob creation) or multer errors.
    console.error('Image upload endpoint error:', err);
    next(err);
  }
});

module.exports = router;