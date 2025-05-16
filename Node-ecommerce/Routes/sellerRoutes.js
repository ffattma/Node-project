const express = require('express');
const router = express.Router();
const {
  createSeller,
  getSellers,
  updateSeller,
  deleteSeller,
} = require('../controllers/sellerController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { sellerSchema } = require('../utils/validation');

router.post('/', auth, role('admin'), validate(sellerSchema), createSeller);

router.get('/', auth, role('admin'), getSellers);

router.put('/:id', auth, validate(sellerSchema), updateSeller);

router.delete('/:id', auth, deleteSeller);

module.exports = router;