const Seller = require('../models/Seller');

exports.createSeller = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const existingSeller = await Seller.findOne({ name });
    if (existingSeller) {
      return res.status(400).json({ message: 'Seller already exists' });
    }
    const seller = new Seller({ name });
    await seller.save();
    res.status(201).json({ message: 'Seller created', seller });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().populate('products');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    if (seller._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updates = req.body;
    const updatedSeller = await Seller.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Seller updated', seller: updatedSeller });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    if (seller._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Seller.findByIdAndDelete(id);
    res.json({ message: 'Seller deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};