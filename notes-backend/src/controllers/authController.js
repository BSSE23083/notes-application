const AuthModel = require('../models/AuthModel');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  // Helper to initialize the model with the DynamoDB client
  _getModel(req) {
    const db = req.app.get('db');
    return new AuthModel(db);
  }

  async signup(req, res, next) {
    try {
      const { email, password } = req.body;
      const model = this._getModel(req);

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

      // Check if user exists in DynamoDB
      const existingUser = await model.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'ConflictError',
          message: 'User with this email already exists',
        });
      }

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = uuidv4();
      const user = await model.createUser({ 
        userId, 
        email, 
        password: hashedPassword 
      });

      logger.info(`User created: ${userId} (${email})`);
      const token = _generateToken(userId, email);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: userId,
          email: email,
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
      const model = this._getModel(req);

      if (!email || !password) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Email and password are required',
        });
      }

      // Find user in DynamoDB
      const user = await model.findUserByEmail(email);

      // Compare provided password with hashed password in DB
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          error: 'AuthenticationError',
          message: 'Invalid email or password',
        });
      }

      const token = _generateToken(user.userId, email);
      logger.info(`User logged in: ${user.userId} (${email})`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.userId,
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
      // req.userId comes from your auth middleware
      const model = this._getModel(req);
      const user = await model.findUserByEmail(req.userEmail); // or findByUserId if implemented

      if (!user) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'User not found',
        });
      }

      res.json({
        message: 'Token is valid',
        user: {
          id: user.userId,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error('Verify error', error.message);
      next(error);
    }
  }
}

/**
 * Generates a signed JWT token
 *
 */
function _generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '7d' }
  );
}

module.exports = new AuthController();