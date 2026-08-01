const ImageKit = require('imagekit');
const env = require('../config/env');
const fs = require('fs');

let imagekit = null;

if (env.imagekit?.publicKey && env.imagekit?.privateKey && env.imagekit?.urlEndpoint) {
  imagekit = new ImageKit({
    publicKey: env.imagekit.publicKey,
    privateKey: env.imagekit.privateKey,
    urlEndpoint: env.imagekit.urlEndpoint,
  });
}

/**
 * Upload a local file buffer or file path to ImageKit
 * @param {string|Buffer} file - File path or buffer
 * @param {string} fileName - Destination file name
 * @param {string} [folder='/uploads'] - Target folder in ImageKit
 * @returns {Promise<object>} Upload response object containing url, fileId, etc.
 */
const uploadToImageKit = async (file, fileName, folder = '/uploads') => {
  if (!imagekit) {
    throw new Error('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env');
  }

  let fileData = file;
  if (typeof file === 'string' && fs.existsSync(file)) {
    fileData = fs.readFileSync(file).toString('base64');
  } else if (Buffer.isBuffer(file)) {
    fileData = file.toString('base64');
  }

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: fileData,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

/**
 * Delete a file from ImageKit by fileId
 * @param {string} fileId 
 */
const deleteFromImageKit = async (fileId) => {
  if (!imagekit) return;
  return new Promise((resolve, reject) => {
    imagekit.deleteFile(fileId, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  imagekit,
  uploadToImageKit,
  deleteFromImageKit,
};
