const cloudinary = require('../config/cloudinary');

/**
 * Upload audio file to Cloudinary with format conversion
 * Generates MP3, AAC, and OGG versions automatically
 */
const uploadAudio = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'video', // Cloudinary uses 'video' for audio files
      folder: 'melora/audio',
      format: 'mp3',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else {
          // Generate URLs for different audio formats
          const baseUrl = result.secure_url.replace(/\.[^/.]+$/, '');
          const publicId = result.public_id;

          resolve({
            url: result.secure_url,
            publicId,
            // Generate format-converted URLs via Cloudinary transformations
            formats: {
              mp3: cloudinary.url(publicId, { resource_type: 'video', format: 'mp3' }),
              aac: cloudinary.url(publicId, { resource_type: 'video', format: 'aac' }),
              ogg: cloudinary.url(publicId, { resource_type: 'video', format: 'ogg' }),
            },
            duration: result.duration || 0,
            fileSize: result.bytes,
            bitrate: result.bit_rate ? `${Math.round(result.bit_rate / 1000)}kbps` : '320kbps',
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload image to Cloudinary (thumbnails, covers, profiles)
 */
const uploadImage = async (fileBuffer, folder = 'melora/images', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'image',
      folder,
      transformation: [
        { width: 500, height: 500, crop: 'fill', quality: 'auto' },
      ],
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a resource from Cloudinary
 */
const deleteResource = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = { uploadAudio, uploadImage, deleteResource };
