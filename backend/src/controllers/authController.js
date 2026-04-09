import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildAuthResponse } from '../utils/tokens.js';
import { sendEmail } from '../utils/mailer.js';
import { USER_ROLES } from '../config/constants.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || USER_ROLES.CUSTOMER
  });

  return res.status(201).json({
    success: true,
    ...buildAuthResponse(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.status(200).json({
    success: true,
    ...buildAuthResponse(user)
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, phone } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'email and name are required for Google login' });
  }

  let user = await User.findOne({ email });

  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    user = await User.create({
      name,
      email,
      phone: phone || '0000000000',
      password: randomPassword,
      isVerified: true
    });
  }

  return res.status(200).json({
    success: true,
    ...buildAuthResponse(user)
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a reset link has been sent'
    });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `Reset your password here: ${resetUrl}`,
    html: `<p>Reset your password here: <a href="${resetUrl}">${resetUrl}</a></p>`
  });

  return res.status(200).json({
    success: true,
    message: 'If an account exists, a reset link has been sent'
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  }).select('+password');

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.status(200).json({ success: true, message: 'Password reset successful' });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  return res.status(200).json({ success: true, ...buildAuthResponse(user) });
});
