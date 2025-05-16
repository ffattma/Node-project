const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  createPaymentSession,
  handleWebhook,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { orderSchema, paymentSchema } = require('../utils/validation');

router.post('/', auth, validate(orderSchema), createOrder);

router.post('/payment', auth, validate(paymentSchema), createPaymentSession);

router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.get('/:userId', auth, getUserOrders);

router.get('/', auth, role('admin'), getAllOrders);

module.exports = router;