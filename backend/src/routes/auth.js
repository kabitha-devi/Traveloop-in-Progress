const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendError, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../validators/schemas');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts. Try again in 15 minutes.' },
});

// POST /auth/register
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, country, location } = req.validatedBody;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return sendError(res, 'Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, phone, country, location },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { user, accessToken }, 201);
}));

// POST /auth/login
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return sendError(res, 'Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return sendError(res, 'Invalid credentials', 401);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, photo: user.photo },
    accessToken,
  });
}));

// POST /auth/logout
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.clearCookie('refreshToken');
  sendSuccess(res, { message: 'Logged out' });
}));

// POST /auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) return sendError(res, 'Refresh token required', 401);

  const decoded = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== token) return sendError(res, 'Invalid refresh token', 401);

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { accessToken });
}));

// POST /auth/forgot
router.post('/forgot', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return sendSuccess(res, { message: 'If the email exists, an OTP has been sent' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetOtp: otp, resetOtpExp: new Date(Date.now() + 10 * 60 * 1000) },
  });

  // TODO: Send email with OTP via Nodemailer when SMTP configured
  console.log(`🔑 OTP for ${email}: ${otp}`);

  sendSuccess(res, { message: 'If the email exists, an OTP has been sent' });
}));

// POST /auth/reset
router.post('/reset', asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetOtp !== otp || !user.resetOtpExp || user.resetOtpExp < new Date()) {
    return sendError(res, 'Invalid or expired OTP', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetOtp: null, resetOtpExp: null, refreshToken: null },
  });

  sendSuccess(res, { message: 'Password reset successful' });
}));

// GET /auth/me
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true,
      photo: true, country: true, bio: true, language: true, role: true, createdAt: true,
      _count: { select: { trips: true, emergencyContacts: true } },
    },
  });
  sendSuccess(res, user);
}));

module.exports = router;
