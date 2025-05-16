const Product = require('../models/Product');
const Seller = require('../models/Seller');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    
    let imageUrl = 'https://via.placeholder.com/150'; 
    if (req.file) {
      const result = await uploadImage(req.file.path);
      imageUrl = result.secure_url;
    }

    const product = new Product({
      name,
      description,
      price,
      image: imageUrl,
      stock: stock || 0,
      seller: req.user.id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('seller', 'name');
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getSellerProducts = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    if (sellerId !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }
    const products = await Product.find({ seller: sellerId }).populate('seller', 'name');
 res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (
      !product.seller ||
      (product.seller.toString() !== String(req.user._id) && req.user.role !== 'admin')
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;

    if (req.file) {
      if (product.photoPublicId) {
        await deleteImage(product.photoPublicId);
      }

      const uploadedImage = await uploadImage(req.file);
      updates.photo = uploadedImage.url;
      updates.photoPublicId = uploadedImage.public_id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({ message: 'Product updated', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};


exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }
    if (product.photoPublicId) {
      await deleteImage(product.photoPublicId);
    }
    await Product.findByIdAndDelete(id);
    await Seller.findByIdAndUpdate(product.seller, {
      $pull: { products: id },
    });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    }).populate('seller', 'name');
    res.json(products);
  } catch (err) {
    next(err);
  }
};