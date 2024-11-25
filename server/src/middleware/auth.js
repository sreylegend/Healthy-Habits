const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User no longer exists'
        });
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'User role is not authorized to access this route'
      });
    }
    next();
  };
};
