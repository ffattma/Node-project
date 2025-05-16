const Cart = require('../models/Cart');

exports.createCart = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Products array is required' });
    }
    const cart = new Cart({
      user: req.user.id,
      products,
    });
    await cart.save();
    res.status(201).json({ message: 'Cart created', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    if (cart.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updates = req.body;
    const updatedCart = await Cart.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Cart updated', cart: updatedCart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};