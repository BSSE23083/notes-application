const AuthModel = require('../models/AuthModel');
const logger = require('../utils/logger');

class AuthController {
  async signup(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Email and password are required',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Password must be at least 6 characters',
        });
      }

      if (AuthModel.userExists(email)) {
        return res.status(409).json({
          error: 'ConflictError',
          message: 'User with this email already exists',
        });
      }

      const user = AuthModel.createUser({ email, password });
      logger.info(`User created: ${user.id} (${email})`);
      const token = _generateToken(user.id, email);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      logger.error('Signup error', error.message);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Email and password are required',
        });
      }

      const user = AuthModel.findUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({
          error: 'AuthenticationError',
          message: 'Invalid email or password',
        });
      }

      const token = _generateToken(user.id, email);
      logger.info(`User logged in: ${user.id} (${email})`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      logger.error('Login error', error.message);
      next(error);
    }
  }

  async verify(req, res, next) {
    try {
      const user = AuthModel.findUserById(req.userId);

      if (!user) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'User not found',
        });
      }

      res.json({
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error('Verify error', error.message);
      next(error);
    }
  }
}

function _generateToken(userId, email) {
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  const tokenString = JSON.stringify(payload);
  return Buffer.from(tokenString).toString('base64');
}

module.exports = new AuthController();
