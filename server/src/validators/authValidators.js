const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const registerCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(4),
  newPassword: z.string().min(6),
});

module.exports = {
  loginSchema,
  registerCustomerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
