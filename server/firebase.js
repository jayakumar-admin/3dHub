
const admin = require('firebase-admin');

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.FIREBASE_STORAGE_BUCKET) {
    throw new Error('Firebase environment variables not set. Image uploads will fail.');
  }
  
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  const bucket = admin.storage().bucket();
  console.log('Firebase Admin SDK initialized successfully.');

  module.exports = { bucket };

} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  // Provide a mock bucket object so the server doesn't crash on startup
  // if Firebase isn't configured. Uploads will fail at runtime.
  module.exports = { 
    bucket: {
      upload: () => Promise.reject(new Error('Firebase not configured')),
      file: () => ({
        createWriteStream: () => {
          const stream = require('stream');
          const passthrough = new stream.PassThrough();
          passthrough.end = () => {};
          return passthrough;
        }
      })
    }
  };
}
