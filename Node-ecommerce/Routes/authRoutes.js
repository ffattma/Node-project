const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgetPassword,
  resetPassword,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} = require('../utils/validation');
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forget-password', validate(forgetPasswordSchema), forgetPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);
module.exports = router;