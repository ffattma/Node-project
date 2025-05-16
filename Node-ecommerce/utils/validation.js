const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'seller', 'admin').optional(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const productSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(10).max(500).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).optional(),
  image: Joi.string().uri().optional(),
  seller: Joi.string().hex().length(24).required()
});

const searchProductsSchema = Joi.object({
  query: Joi.string().min(1).required(),
});

const sellerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
});

const cartSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).required(), 
        quantity: Joi.number().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

const orderSchema = Joi.object({
  paymentMethod: Joi.string().valid('cash', 'online').required(),
});

const paymentSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required(), 
});

module.exports = {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  productSchema,
  searchProductsSchema,
  sellerSchema,
  cartSchema,
  orderSchema,
  paymentSchema,
};