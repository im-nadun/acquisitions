import logger from '#config/logger.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

// Middleware to verify JWT token from cookies
export const authenticate = (req, res, next) => {
  try {
    // Get token from cookies
    const token = cookies.get(req, 'token');

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwtToken.verify(token);

    // Attach user info to request object
    req.user = decoded;

    // Continue to next middleware/route handler
    next();
  } catch (e) {
    logger.error('Authentication error', e);
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed',
    });
  }
};

// Middleware to check if user has specific role
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated',
      });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions',
      });
    }

    // User has required role
    next();
  };
};
