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
router.post('/', [verifyToken, upload.single('image')], async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image file uploaded.');
  }
  
  const folder = req.body.folder || 'misc'; // e.g., 'products', 'settings', 'avatars'
  const blob = bucket.file(`3dHub/${folder}/${Date.now()}_${req.file.originalname}`);
  
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobStream.on('error', (err) => {
    console.error('Firebase upload stream error:', err);
    res.status(500).send({ message: `Error uploading to Firebase: ${err.message}` });
  });

  blobStream.on('finish', async () => {
    // The public URL can be accessed via this format if the bucket rules are set to public read.
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
    res.status(200).send({ imageUrl: publicUrl });
  });

  blobStream.end(req.file.buffer);
});

module.exports = router;