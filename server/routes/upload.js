const router = require('express').Router();
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { randomUUID } = require('crypto');
const verifyToken = require('../middleware/verifyToken');
const { bucket } = require('../firebase');

// Middleware to check for Admin role
const adminOnly = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        return res.status(403).json({ message: 'Access Denied. Admin privileges required.' });
    }
};

// @route   POST /api/upload
// @desc    Upload an image to Firebase Storage.
// @access  Private (Admin only)
router.post('/', verifyToken, adminOnly, (req, res) => {
  const busboy = Busboy({
    headers: req.headers,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  const tmpdir = os.tmpdir();
  const fields = {};
  const uploads = {};
  let uploadError = null;

  busboy.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  busboy.on('file', (fieldname, file, info) => {
    const { filename, mimeType } = info;

    const allowedMimeTypes = /jpeg|jpg|png|gif|webp/;
    if (!allowedMimeTypes.test(mimeType)) {
      uploadError = `Invalid file type: ${mimeType}. Only images are allowed.`;
      file.resume();
      return;
    }

    const uniqueFilename = `${randomUUID()}-${filename}`;
    const filepath = path.join(tmpdir, uniqueFilename);
    uploads[fieldname] = { filepath, mimeType, filename };

    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    file.on('limit', () => {
      uploadError = 'File size limit reached (5MB).';
      file.unpipe(writeStream);
      fs.unlink(filepath, () => {});
    });
  });

  busboy.on('finish', async () => {
    if (uploadError) {
      Object.values(uploads).forEach((fileInfo) => {
        if (fs.existsSync(fileInfo.filepath)) {
          fs.unlinkSync(fileInfo.filepath);
        }
      });
      return res.status(400).json({ message: uploadError });
    }

    const fileToWrite = uploads['image'];
    if (!fileToWrite) {
      return res.status(400).json({ message: 'No file uploaded or file was invalid.' });
    }

    const destinationPath = fields.folder || 'general';
    const uniqueFilenameForStorage = `${randomUUID()}${path.extname(fileToWrite.filename)}`;
    const gcsPath = `3dHub/${destinationPath}/${uniqueFilenameForStorage}`;

    try {
      await bucket.upload(fileToWrite.filepath, {
        destination: gcsPath,
        metadata: {
          contentType: fileToWrite.mimeType,
        },
      });

      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(gcsPath)}?alt=media`;
      
      res.json({ imageUrl: publicUrl });

    } catch (error) {
      console.error('Firebase upload failed:', error);
      res.status(500).json({ message: 'Error uploading to Firebase Storage.' });
    } finally {
      if (fs.existsSync(fileToWrite.filepath)) {
        fs.unlinkSync(fileToWrite.filepath);
      }
    }
  });
  
  if (req.rawBody) {
    busboy.end(req.rawBody);
  } else {
    req.pipe(busboy);
  }
});

// @route   DELETE /api/upload
// @desc    Delete an image from Firebase Storage using its URL
// @access  Private (Admin only)
router.delete('/', verifyToken, adminOnly, async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ message: 'File URL is required.' });
    }

    try {
        const url = new URL(imageUrl);
        // Extract the URL-encoded path part and decode it
        const gcsPath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
        
        if (!gcsPath) {
          throw new Error('Could not parse file path from URL.');
        }

        await bucket.file(gcsPath).delete();
        res.status(204).send();

    } catch (error) {
        if (error.code === 404) {
             console.warn(`Attempted to delete non-existent file from Firebase: ${imageUrl}`);
             return res.status(204).send(); // Still success if file doesn't exist
        }
        console.error('Error deleting file from Firebase:', error);
        return res.status(500).json({ message: 'Error deleting file.' });
    }
});

module.exports = router;
