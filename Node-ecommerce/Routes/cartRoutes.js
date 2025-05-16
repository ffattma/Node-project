const express = require('express');
const router = express.Router();
const {
  createCart,
  updateCart,
  getCart,
} = require('../controllers/cartController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { cartSchema } = require('../utils/validation');

router.post('/', auth, validate(cartSchema), createCart);

router.put('/:id', auth, validate(cartSchema), updateCart);

router.get('/:userId', auth, getCart);

module.exports = router;