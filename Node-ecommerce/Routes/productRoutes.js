const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../utils/multer');
const validate = require('../middleware/validate');
const { productSchema, searchProductsSchema } = require('../utils/validation');
router.post('/', auth, role('seller'), upload.single('photo'), validate(productSchema), createProduct);
router.get('/', getProducts);
router.get('/seller/:sellerId', auth, role('seller'), getSellerProducts);
router.put('/:id', auth, role('seller'), upload.single('photo'), validate(productSchema), updateProduct);
router.delete('/:id', auth, role('seller'), deleteProduct);
router.get('/search', auth, validate(searchProductsSchema), searchProducts);
module.exports = router;