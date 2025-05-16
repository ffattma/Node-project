const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'ecommerce_products',
      use_filename: true,
      unique_filename: false,
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    throw new Error(`Failed to upload image: ${err.message}`);
  }
};

const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    throw new Error(`Failed to delete image: ${err.message}`);
  }
};

module.exports = { uploadImage, deleteImage };