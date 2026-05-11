const multer = require('multer');
const path = require('path');
const { MAX_FILE_SIZE } = require('../config/constants');

// Use memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedAudioTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
    'audio/aac', 'audio/flac', 'audio/x-m4a', 'audio/mp4',
    'audio/webm',
  ];
  const allowedImageTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  ];

  if (file.fieldname === 'audioFile') {
    if (allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`), false);
    }
  } else if (file.fieldname === 'thumbnail' || file.fieldname === 'coverImage' || file.fieldname === 'profileImage' || file.fieldname === 'adImage') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image format: ${file.mimetype}`), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
