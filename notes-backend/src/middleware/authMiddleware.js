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

    // Mock Cognito Token Verification
    const decodedToken = _decodeAndVerifyToken(token);

    // Attach user info to request
    req.userId = decodedToken.userId;
    req.userEmail = decodedToken.email;
    req.token = token;

    logger.debug(`User authenticated: ${req.userId}`);
    next();
  } catch (error) {
    logger.error('Token verification failed', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

function _decodeAndVerifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      throw new Error('Token expired');
    }

    return decoded;
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
}

module.exports = { verifyToken };
