import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// helper to sign JWT
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  // validate role
  const allowedRoles = ['user', 'policeman'];
  const assignedRole = allowedRoles.includes(role) ? role : 'user';

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({ name, email, password, role: assignedRole });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }
  });
});

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }
  });
});

// @desc Forgot password - send reset email
// @route POST /api/auth/forgot-password
// @access Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists
    return res.status(200).json({ success: true, message: 'If that email exists, a reset email has been sent' });
  }

  // create reset token (raw token will be sent to user, hashed saved to DB)
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const message = `You requested a password reset. Please make a PUT request to:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message
    });

    res.json({ success: true, message: 'Reset email sent' });
  } catch (err) {
    // clear saved tokens on failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.error(err);
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc Reset password
// @route PUT /api/auth/reset-password/:resetToken
// @access Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Please provide a new password');
  }

  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Optionally log the user in by returning token
  const token = signToken(user._id);

  res.json({ success: true, message: 'Password updated', token });
});

// @desc get current user
// @route GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -resetPasswordToken -resetPasswordExpire');
  
  // Include additional officer details if role is policeman
  if (user.role === 'policeman') {
    res.json({ 
      success: true, 
      data: {
        ...user._doc,
        badgeNumber: user.badgeNumber,
        district: user.district
      }
    });
  } else {
    res.json({ success: true, data: user });
  }
});
