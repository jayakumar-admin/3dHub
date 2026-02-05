const router = require('express').Router();
const Busboy = require('busboy');
const { bucket } = require('../firebase');
const verifyToken = require('../middleware/verifyToken');

/**
 * @route   POST /api/upload
 * @desc    Upload an image to Firebase Storage
 * @access  Private
 */
router.post('/', verifyToken, async (req, res, next) => {
  try {
    // Must be multipart request
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      return res.status(400).json({ message: 'Content-Type must be multipart/form-data' });
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    });

    let fileBuffer = null;
    let fileName = '';
    let mimeType = '';
    let folder = 'misc';

    // 📁 Read fields (folder name)
    busboy.on('field', (fieldname, value) => {
      if (fieldname === 'folder') folder = value;
    });

    // 📦 Read file
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      fileName = `${Date.now()}_${filename}`;
      mimeType = mimetype;

      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('finish', async () => {
      if (!fileBuffer) {
        return res.status(400).json({ message: 'No image file uploaded.' });
      }

      const blob = bucket.file(`3dHub/${folder}/${fileName}`);

      const blobStream = blob.createWriteStream({
        metadata: { contentType: mimeType },
      });

      blobStream.on('error', (err) => {
        console.error('Firebase upload stream error:', err);
        return next(new Error(`Error uploading to Firebase: ${err.message}`));
      });

      blobStream.on('finish', async () => {
        const publicUrl =
          `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;

        if (!res.headersSent) {
          res.status(200).json({ imageUrl: publicUrl });
        }
      });

      blobStream.end(fileBuffer);
    });

    // ⭐⭐⭐ FIREBASE MAGIC LINE ⭐⭐⭐
    busboy.end(req.rawBody);

  } catch (err) {
    console.error('Image upload endpoint error:', err);
    next(err);
  }
});

module.exports = router;
