const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const sendgrid = require('@sendgrid/mail');

// Initialize SendGrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification token'
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with this email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error sending email'
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (email, token) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Email Verification',
    html: `Please click this link to verify your email: ${process.env.APP_URL}/verify-email/${token}`
  };
  await sendgrid.send(msg);
};

// Helper function to send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Password Reset',
    html: `Please click this link to reset your password: ${process.env.APP_URL}/reset-password/${token}`
  };
  await sendgrid.send(msg);
};
