const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing Authorization header',
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid Authorization header format',
      });
    }

    const token = parts[1];

    // Verify JWT Token using the secret key
    const decodedToken = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your_secret_key'
    );

    // Attach user info to request
    req.userId = decodedToken.userId;
    req.userEmail = decodedToken.email;
    req.token = token;

    logger.debug(`User authenticated: ${req.userId}`);
    next();
  } catch (error) {
    logger.error('Token verification failed', error.message);
    
    // Specifically handle expired tokens for better frontend feedback
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: message,
    });
  }
};

module.exports = { verifyToken };