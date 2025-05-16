const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Stripe = require('stripe');

require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in .env');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01', 
});

exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    if (!['cash', 'online'].includes(paymentMethod)) {
      const error = new Error('Invalid payment method');
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.products.length) {
      const error = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    const order = new Order({
      user: userId,
      products: cart.products,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'waiting', 
    });

    await order.save();
    await Cart.findOneAndUpdate({ user: userId }, { products: [] });

    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    next(err);
  }
};

exports.createPaymentSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      const error = new Error('Order ID is required');
      error.statusCode = 400;
      throw error;
    }

    const order = await Order.findById(orderId).populate('products.product');
    if (!order || order.user.toString() !== userId) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.paymentMethod !== 'online') {
      const error = new Error('Order does not support online payment');
      error.statusCode = 400;
      throw error;
    }

    if (order.paymentStatus === 'paid') {
      const error = new Error('Order already paid');
      error.statusCode = 400;
      throw error;
    }

    const lineItems = order.products.map(item => {
      const product = item.product;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100, 
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?orderId=${orderId}`,
      metadata: {
        orderId: orderId.toString(),
        userId: userId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    next(err); 
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('Webhook event received:', event.type, event.data.object);
    } catch (err) {
      const error = new Error(`Webhook Error: ${err.message}`);
      error.statusCode = 400;
      throw error;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'completed';
        await order.save();
        console.log('Order updated:', orderId);
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err); 
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }
    const orders = await Order.find({ user: userId }).populate('products.product');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name').populate('products.product');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'canceled'].includes(status)) {
      const error = new Error('Invalid status');
      error.statusCode = 400;
      throw error;
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    next(err);
  }
};
exports.deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};